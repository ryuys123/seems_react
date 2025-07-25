import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import UserHeader from "../../components/common/UserHeader";
import styles from "./StressTestPage.module.css"; // StressTestPage용 CSS

// 스트레스 검사용 답변 선택지 (0~4점 척도)
const answerOptions = [
  { label: "전혀 없음", value: 0 },
  { label: "거의 없음", value: 1 },
  { label: "때때로 있음", value: 2 },
  { label: "자주 있음", value: 3 },
  { label: "매우 자주 있음", value: 4 },
];

function StressTestPage() {
  const navigate = useNavigate();
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [currentPage, setCurrentPage] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const topOfPageRef = useRef(null);
  const questionsPerPage = 5;
  const testCategory = "STRESS_SCALE";

  useEffect(() => {
    const fetchQuestions = async () => {
      setIsLoading(true);
      try {
        const response = await axios.get(
          `/seems/api/psychological-test/questions/by-category?category=${testCategory}`
        );
        setQuestions(response.data);
      } catch (error) {
        console.error("스트레스 검사 문항을 불러오는 데 실패했습니다.", error);
        setError("문항을 불러오는 데 실패했습니다.");
      } finally {
        setIsLoading(false);
      }
    };
    fetchQuestions();
  }, [testCategory]);

  useEffect(() => {
    if (topOfPageRef.current) {
      topOfPageRef.current.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }
  }, [currentPage]);

  const handleAnswerChange = (questionId, value) => {
    setAnswers((prev) => ({ ...prev, [questionId]: value }));
  };

  const handleNextPage = () => {
    const startIndex = currentPage * questionsPerPage;
    const currentQuestions = questions.slice(
      startIndex,
      startIndex + questionsPerPage
    );
    const allAnswered = currentQuestions.every(
      (q) => answers[q.questionId] !== undefined
    );

    if (!allAnswered) {
      alert("현재 페이지의 모든 문항에 답변해주세요.");
      return;
    }

    const totalPages = Math.ceil(questions.length / questionsPerPage);
    if (currentPage < totalPages - 1) {
      setCurrentPage((prev) => prev + 1);
    } else {
      handleSubmitTest();
    }
  };

  const handlePreviousPage = () => {
    if (currentPage > 0) {
      setCurrentPage((prev) => prev - 1);
    }
  };

  const handleSubmitTest = async () => {
    const currentUserId = localStorage.getItem("loggedInUserId");
    if (!currentUserId) {
      alert("로그인 정보가 없습니다.");
      return;
    }

    const submissionData = {
      userId: currentUserId,
      testCategory: testCategory,
      answers: Object.keys(answers).map((questionId) => ({
        questionId: parseInt(questionId, 10),
        answerValue: answers[questionId],
      })),
    };

    try {
      const token = localStorage.getItem("accessToken");
      const response = await axios.post(
        "/seems/api/psychological-test/scale",
        submissionData,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      alert("검사가 완료되었습니다.");
      const resultId = response.data.resultId;
      navigate(`/psychological-test/result/${resultId}?type=${testCategory}`);
    } catch (err) {
      console.error("검사 제출 실패:", err);
      setError("검사 제출 중 오류가 발생했습니다.");
    }
  };

  if (isLoading)
    return (
      <div className={styles.container}>
        <UserHeader />
        <p>로딩 중...</p>
      </div>
    );
  if (error)
    return (
      <div className={styles.container}>
        <UserHeader />
        <p className={styles.errorText}>{error}</p>
      </div>
    );
  if (questions.length === 0)
    return (
      <div className={styles.container}>
        <UserHeader />
        <p>표시할 문항이 없습니다.</p>
      </div>
    );

  const totalPages = Math.ceil(questions.length / questionsPerPage);
  const startIndex = currentPage * questionsPerPage;
  const currentQuestions = questions.slice(
    startIndex,
    startIndex + questionsPerPage
  );

  return (
    <div className={styles.container} ref={topOfPageRef}>
      <UserHeader />
      <div className={styles.testCard}>
        <div>
          <h1 className={styles.title}>스트레스 체크</h1>
          <p className={styles.description}>
            최근 한 달간의 경험에 가장 가깝다고 생각하는 답변을 선택해주세요.
          </p>
          <div className={styles.progress}>
            Page {currentPage + 1} / {totalPages}
          </div>
          {currentQuestions.map((q, index) => (
            <div key={q.questionId} className={styles.questionBlock}>
              <p className={styles.questionText}>
                {startIndex + index + 1}. {q.questionText}
              </p>
              <div className={styles.answerOptions}>
                {answerOptions.map((opt) => (
                  <label
                    key={opt.value}
                    className={`${styles.answerOption} ${answers[q.questionId] === opt.value ? styles.active : ""}`}
                  >
                    <input
                      type="radio"
                      name={`question_${q.questionId}`}
                      value={opt.value}
                      checked={answers[q.questionId] === opt.value}
                      onChange={() =>
                        handleAnswerChange(q.questionId, opt.value)
                      }
                    />
                    <span>{opt.label}</span>
                  </label>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className={styles.navigationButtons}>
          <button
            onClick={handlePreviousPage}
            disabled={currentPage === 0}
            className={styles.navButton}
          >
            이전
          </button>
          <button onClick={handleNextPage} className={styles.navButton}>
            {currentPage === totalPages - 1 ? "결과 보기" : "다음"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default StressTestPage;
