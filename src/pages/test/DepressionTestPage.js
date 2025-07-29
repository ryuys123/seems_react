import React, { useState, useEffect, useRef, useContext } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import UserHeader from "../../components/common/UserHeader";
import styles from "./DepressionTestPage.module.css";
import { AuthContext } from "../../AuthProvider";

// 우울증 검사용 답변 선택지 (0~3점 척도)
const answerOptions = [
  { label: "전혀 그렇지 않다", value: 0 },
  { label: "가끔 그렇다", value: 1 },
  { label: "자주 그렇다", value: 2 },
  { label: "거의 항상 그렇다", value: 3 },
];

function DepressionTestPage() {
  const navigate = useNavigate();
  const { userid, isLoggedIn, logoutAndRedirect } = useContext(AuthContext);
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [currentPage, setCurrentPage] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const topOfPageRef = useRef(null);
  const questionsPerPage = 5;
  const testCategory = "DEPRESSION_SCALE";

  useEffect(() => {
    // 로그인 상태 확인
    if (!isLoggedIn || !userid) {
      alert("로그인이 필요합니다.");
      navigate("/login");
      return;
    }

    const fetchQuestions = async () => {
      setIsLoading(true);
      try {
        const response = await axios.get(
          `/seems/api/psychological-test/questions/by-category?category=${testCategory}`
        );
        setQuestions(response.data);
      } catch (error) {
        console.error("우울증 검사 문항을 불러오는 데 실패했습니다.", error);
        if (error.response?.status === 401) {
          alert("로그인이 만료되었습니다. 다시 로그인해주세요.");
          logoutAndRedirect();
          return;
        }
        setError("문항을 불러오는 데 실패했습니다.");
      } finally {
        setIsLoading(false);
      }
    };
    fetchQuestions();
  }, [testCategory, isLoggedIn, userid, navigate, logoutAndRedirect]);

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
    // 로그인 상태 재확인
    if (!isLoggedIn || !userid) {
      alert("로그인이 만료되었습니다. 다시 로그인해주세요.");
      logoutAndRedirect();
      return;
    }

    const submissionData = {
      userId: userid, // AuthContext에서 가져온 userid 사용
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
      if (err.response?.status === 401) {
        alert("로그인이 만료되었습니다. 다시 로그인해주세요.");
        logoutAndRedirect();
        return;
      }
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
          <h1 className={styles.title}>마음 건강 체크</h1>
          <p className={styles.description}>
            최근 2주간의 경험에 가장 가깝다고 생각하는 답변을 선택해주세요.
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

export default DepressionTestPage;
