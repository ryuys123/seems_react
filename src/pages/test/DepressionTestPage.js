import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import UserHeader from "../../components/common/UserHeader";
import styles from "./DepressionTestPage.module.css";

function DepressionTestPage() {
  const navigate = useNavigate();
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});

  // --- ✨ 1. 페이지 상태 관리로 변경 ---
  const [currentPage, setCurrentPage] = useState(0); // 현재 페이지 번호 (0부터 시작)
  const questionsPerPage = 5; // 한 페이지에 보여줄 질문 수
  // ---

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
        // 백엔드에서 해당 카테고리의 모든 질문을 가져옵니다 (총 30개)
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

  // --- ✨ 2. 페이지 이동 함수로 변경 ---
  const handleNextPage = () => {
    // 현재 페이지의 모든 질문에 답했는지 확인
    const currentQuestions = questions.slice(
      currentPage * questionsPerPage,
      (currentPage + 1) * questionsPerPage
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
      setCurrentPage((prevPage) => prevPage + 1);
    } else {
      // 마지막 페이지라면 검사 제출
      handleSubmitTest();
    }
  };

  const handlePrevPage = () => {
    setCurrentPage((prevPage) => prevPage - 1);
  };
  // ---

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
      testType: q.testType,
    }));

    try {
      setLoading(true);
      const response = await axios.post(
        "/seems/api/psychological-test/submit-depression-test",
        submissionData
      );
      const resultId = response.data.resultId;

      alert("우울증 검사가 완료되었습니다! 결과를 확인합니다.");
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

  // --- ✨ 3. 현재 페이지에 해당하는 질문들만 잘라서 사용 ---
  const totalPages = Math.ceil(questions.length / questionsPerPage);
  const currentQuestions = questions.slice(
    currentPage * questionsPerPage,
    (currentPage + 1) * questionsPerPage
  );
  // ---

  if (questions.length === 0) {
    return (
      <div className={styles.container}>
        <UserHeader />
        <p>표시할 우울증 검사 문항이 없습니다.</p>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <UserHeader />
      <div className={styles.testCard}>
        <h1 className={styles.title}>우울증 검사</h1>
        <p className={styles.description}>
          아래 문항을 읽고 지난 2주간의 경험에 가장 가깝다고 생각하는 답변을
          선택해주세요.
        </p>

        {/* 페이지 진행 상황 표시 */}
        <div className={styles.questionCounter}>
          페이지 {currentPage + 1} / {totalPages}
        </div>

        {/* ✨ 4. map 함수가 전체 questions가 아닌 currentQuestions를 순회하도록 변경 */}
        {currentQuestions.map((question, index) => (
          <div key={question.questionId} className={styles.questionItem}>
            <p className={styles.questionText}>
              {currentPage * questionsPerPage + index + 1}.{" "}
              {question.questionText}
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
        {/* --- */}

        <div className={styles.navigationButtons}>
          <button
            onClick={handlePrevPage}
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
    </div>
  );
}

export default DepressionTestPage;
