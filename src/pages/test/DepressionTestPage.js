import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import UserHeader from "../../components/common/UserHeader";
import styles from "./DepressionTestPage.module.css";

function DepressionTestPage() {
  const navigate = useNavigate();
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const testCategory = "DEPRESSION_SCALE";

  const answerLabels = {
    1: "전혀 아님",
    2: "약간",
    3: "보통",
    4: "상당히",
    5: "매우 심함",
  };

  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await axios.get(
          `/seems/api/psychological-test/questions/${testCategory}`
        );
        setQuestions(response.data);
      } catch (err) {
        console.error(`Failed to fetch ${testCategory} questions:`, err);
        setError("문항을 불러오는 데 실패했습니다. 서버 상태를 확인해주세요.");
      } finally {
        setLoading(false);
      }
    };
    fetchQuestions();
  }, [testCategory]);

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

    const submissionData = questions.map((q) => ({
      userId: currentUserId,
      questionId: q.questionId,
      answerValue: answers[q.questionId],
      testType: q.testType, // ✨ 1. testType 추가
    }));

    const requestBody = submissionData;

    try {
      setLoading(true);
      const response = await axios.post(
        "/seems/api/psychological-test/submit-depression-test",
        requestBody
      );
      const resultId = response.data.resultId;
      const resultTestType = response.data.testType;

      alert("우울증 검사가 완료되었습니다! 결과를 확인합니다.");

      // ✨ 2. URL 파라미터 수정
      navigate(
        `/psychological-test/result/${resultId}?type=PSYCHOLOGICAL_SCALE`
      );
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

  if (loading) {
    return (
      <div className={styles.container}>
        <UserHeader />
        <p>문항을 불러오는 중입니다...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.container}>
        <UserHeader />
        <p className={styles.errorText}>오류 발생: {error}</p>
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <div className={styles.container}>
        <UserHeader />
        <p>표시할 우울증 검사 문항이 없습니다. 관리자에게 문의하세요.</p>
      </div>
    );
  }

  const currentQuestion = questions[currentQuestionIndex];

  return (
    <div className={styles.container}>
      <UserHeader />
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
    </div>
  );
}

export default DepressionTestPage;
