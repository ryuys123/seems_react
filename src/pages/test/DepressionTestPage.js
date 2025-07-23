import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import UserHeader from "../../components/common/UserHeader";
import styles from "./DepressionTestPage.module.css";
import { submitScaleTest } from "../../services/TestService";
import apiClient from "../../utils/axios";

function DepressionTestPage() {
  const navigate = useNavigate();
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [testResult, setTestResult] = useState(null); // State to hold the test result

  const testCategory = "DEPRESSION_SCALE";

  const answerLabels = {
    1: "전혀 아님",
    2: "약간",
    3: "보통",
    4: "상당히",
    5: "매우 심함",
  };

  useEffect(() => {
    fetchQuestions();
  }, []);

  const fetchQuestions = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiClient.get(
        `/api/psychological-test/questions?count=10&testType=${testCategory}`
      );
      setQuestions(response.data);
    } catch (err) {
      console.error(`Failed to fetch ${testCategory} questions:`, err);
      setError("문항을 불러오는 데 실패했습니다. 서버 상태를 확인해주세요.");
    } finally {
      setLoading(false);
    }
  };

  const handleAnswerChange = (questionId, value) => {
    setAnswers((prevAnswers) => ({
      ...prevAnswers,
      [questionId]: value,
    }));
  };

  const handleNextQuestion = () => {
    if (answers[questions[currentQuestionIndex].questionId] === undefined) {
      alert("현재 문항에 답변을 선택해주세요.");
      return;
    }

    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex((prevIndex) => prevIndex + 1);
    } else {
      handleSubmitTest();
    }
  };

  const handleSubmitTest = async () => {
    if (Object.keys(answers).length !== questions.length) {
      alert("모든 문항에 답변해주세요!");
      return;
    }

    const currentUserId = localStorage.getItem("loggedInUserId");
    if (!currentUserId) {
      alert("로그인 정보가 없습니다. 다시 로그인해주세요.");
      navigate("/login");
      return;
    }

    const submissionData = {
      userId: currentUserId,
      testCategory: testCategory,
      answers: questions.map((q) => ({
        questionId: q.questionId,
        answerValue: answers[q.questionId],
      })),
    };

    try {
      setLoading(true);
      const result = await submitScaleTest(submissionData);
      alert("우울증 검사가 완료되었습니다!");
      navigate(`/psychology-result/${result.resultId}?type=${testCategory}`);
    } catch (err) {
      console.error(
        "검사 제출 실패:",
        err.response ? err.response.data : err.message
      );
      setError("검사 제출 중 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  };

  const handleRestartTest = () => {
    setAnswers({});
    setCurrentQuestionIndex(0);
    setTestResult(null);
    setError(null);
    fetchQuestions(); // Refetch questions if needed
  };

  const renderTest = () => {
    if (questions.length === 0) {
      return <p>표시할 우울증 검사 문항이 없습니다. 관리자에게 문의하세요.</p>;
    }

    const currentQuestion = questions[currentQuestionIndex];

    return (
      <div className={styles.testCard}>
        <h1 className={styles.title}>우울증 검사</h1>
        <p className={styles.description}>
          아래 문항을 읽고 지난 2주간의 경험에 가장 가깝다고 생각하는 답변을
          선택해주세요.
        </p>

        <div className={styles.questionCounter}>
          {currentQuestionIndex + 1} / {questions.length}
        </div>
        <p className={styles.questionText}>{currentQuestion.questionText}</p>

        <div className={styles.answerOptions}>
          {[1, 2, 3, 4, 5].map((value) => (
            <label key={value} className={styles.answerOption}>
              <input
                type="radio"
                name={`question_${currentQuestion.questionId}`}
                value={value}
                checked={answers[currentQuestion.questionId] === value}
                onChange={() =>
                  handleAnswerChange(currentQuestion.questionId, value)
                }
              />
              <span>{answerLabels[value]}</span>
            </label>
          ))}
        </div>

        <div className={styles.navigationButtons}>
          <button
            onClick={() => setCurrentQuestionIndex((prev) => prev - 1)}
            disabled={currentQuestionIndex === 0}
            className={styles.navButton}
          >
            이전
          </button>
          <button onClick={handleNextQuestion} className={styles.navButton}>
            {currentQuestionIndex === questions.length - 1
              ? "검사 완료"
              : "다음"}
          </button>
        </div>
      </div>
    );
  };

  const renderResult = () => {
    return (
      <div className={styles.resultCard}>
        <h1 className={styles.title}>우울증 검사 결과</h1>
        <div className={styles.resultSection}>
          <h2>총점</h2>
          <p>{testResult.totalScore}점</p>
        </div>
        <div className={styles.resultSection}>
          <h2>위험도</h2>
          <p>{testResult.riskLevel}</p>
        </div>
        <div className={styles.resultSection}>
          <h2>결과 해석</h2>
          <p>{testResult.interpretation}</p>
        </div>
        <div className={styles.resultSection}>
          <h2>제안</h2>
          <p>{testResult.suggestions}</p>
        </div>
        <button onClick={handleRestartTest} className={styles.restartButton}>
          다시 시작하기
        </button>
      </div>
    );
  };

  return (
    <div className={styles.container}>
      <UserHeader />
      {loading ? (
        <p>처리 중입니다...</p>
      ) : error ? (
        <p className={styles.errorText}>오류 발생: {error}</p>
      ) : testResult ? (
        renderResult()
      ) : (
        renderTest()
      )}
    </div>
  );
}

export default DepressionTestPage;

