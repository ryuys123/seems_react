import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import UserHeader from "../../components/common/UserHeader";
import styles from "./PersonalityTestPage.module.css";
import { submitPersonalityTest } from "../../services/TestService";
import apiClient from "../../utils/axios";

const PersonalityTestPage = () => {
  const navigate = useNavigate();
  const topOfTestRef = useRef(null);

  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [currentPage, setCurrentPage] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [testResult, setTestResult] = useState(null); // To store the result
  const questionsPerPage = 5;

  const answerLabels = {
    1: "전혀 그렇지 않다",
    2: "그렇지 않다",
    3: "보통이다",
    4: "그렇다",
    5: "매우 그렇다",
  };

  useEffect(() => {
    fetchQuestions();
  }, []);

  const fetchQuestions = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await apiClient.get("/api/personality-test/questions");
      setQuestions(response.data);
    } catch (err) {
      console.error("문항을 불러오는데 실패했습니다:", err);
      setError("문항을 불러오는데 실패했습니다. 서버가 실행 중인지 확인해주세요.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (topOfTestRef.current) {
      topOfTestRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [currentPage]);

  const handleAnswerChange = (questionId, value) => {
    setAnswers((prevAnswers) => ({ ...prevAnswers, [questionId]: value }));
  };

  const handleNextPage = () => {
    const startIndex = currentPage * questionsPerPage;
    const endIndex = startIndex + questionsPerPage;
    const currentQuestionsOnPage = questions.slice(startIndex, endIndex);
    const allAnswered = currentQuestionsOnPage.every(
      (q) => answers[q.questionId] !== undefined
    );

    if (!allAnswered) {
      alert("현재 페이지의 모든 문항에 답변을 선택해주세요.");
      return;
    }

    const totalPages = Math.ceil(questions.length / questionsPerPage);
    if (currentPage < totalPages - 1) {
      setCurrentPage((prevPage) => prevPage + 1);
    } else {
      handleSubmitTest();
    }
  };

  const handlePreviousPage = () => {
    if (currentPage > 0) {
      setCurrentPage((prevPage) => prevPage - 1);
    }
  };

  const handleSubmitTest = async () => {
    if (Object.keys(answers).length !== questions.length) {
      alert("아직 모든 문항에 답변하지 않았습니다. 다시 확인해주세요.");
      return;
    }

    const currentUserId = localStorage.getItem("loggedInUserId");
    if (!currentUserId) {
      alert("사용자 정보가 없습니다. 다시 로그인해주세요.");
      navigate("/login");
      return;
    }

    const submissionData = {
      userId: currentUserId,
      answers: questions.map((q) => ({
        questionId: q.questionId,
        answerValue: answers[q.questionId],
        scoreDirection: q.scoreDirection,
      })),
    };

    try {
      setIsLoading(true);
      const result = await submitPersonalityTest(submissionData);
      alert("성격 검사가 완료되었습니다!");
      navigate(`/personality-test/result/${currentUserId}`);
    } catch (err) {
      console.error(
        "검사 제출 실패:",
        err.response ? err.response.data : err.message
      );
      setError("검사 제출 중 오류가 발생했습니다.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleRestartTest = () => {
    setAnswers({});
    setCurrentPage(0);
    setTestResult(null);
    setError(null);
    fetchQuestions();
  };

  const renderTest = () => {
    const totalPages = Math.ceil(questions.length / questionsPerPage);
    const startIndex = currentPage * questionsPerPage;
    const currentQuestions = questions.slice(
      startIndex,
      startIndex + questionsPerPage
    );

    return (
      <div className={styles.testCard} ref={topOfTestRef}>
        <div className={styles.questionCounter}>
          Page {currentPage + 1} / {totalPages}
        </div>
        {currentQuestions.map((question, index) => (
          <div key={question.questionId} className={styles.questionBlock}>
            <p className={styles.questionText}>
              {startIndex + index + 1}. {question.questionText}
            </p>
            <div className={styles.answerOptions}>
              {[1, 2, 3, 4, 5].map((value) => (
                <label key={value} className={styles.answerOption}>
                  <input
                    type="radio"
                    name={`question_${question.questionId}`}
                    value={value}
                    checked={answers[question.questionId] === value}
                    onChange={() =>
                      handleAnswerChange(question.questionId, value)
                    }
                  />
                  <span>{answerLabels[value]}</span>
                </label>
              ))}
            </div>
          </div>
        ))}
        <div className={styles.navigationButtons}>
          <button
            onClick={handlePreviousPage}
            disabled={currentPage === 0}
            className={styles.navButton}
          >
            이전
          </button>
          <button onClick={handleNextPage} className={styles.navButton}>
            {currentPage === totalPages - 1 ? "검사 완료" : "다음"}
          </button>
        </div>
      </div>
    );
  };

  const renderResult = () => {
    return (
      <div className={styles.resultCard}>
        <h1 className={styles.title}>MBTI 성격유형검사 결과</h1>
        <div className={styles.resultSection}>
          <h2>{testResult.mbtiTitle}</h2>
          <p className={styles.mbtiType}>{testResult.mbtiType}</p>
        </div>
        <div className={styles.resultSection}>
          <h2>유형 설명</h2>
          <p>{testResult.description}</p>
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
      {isLoading ? (
        <p>로딩 중...</p>
      ) : error ? (
        <p>{error}</p>
      ) : testResult ? (
        renderResult()
      ) : questions.length > 0 ? (
        renderTest()
      ) : (
        <p>표시할 문항이 없습니다.</p>
      )}
    </div>
  );
};

export default PersonalityTestPage;

