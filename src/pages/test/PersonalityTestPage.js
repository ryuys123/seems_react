import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import UserHeader from "../../components/common/UserHeader";
import styles from "./PersonalityTestPage.module.css";

const PersonalityTestPage = () => {
  const navigate = useNavigate();
  const topOfTestRef = useRef(null); // ✨ 1. 스크롤 기준점으로 사용할 ref 생성

  // --- 상태(State) 관리 ---
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [currentPage, setCurrentPage] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const questionsPerPage = 5;

  const answerLabels = {
    1: "전혀 그렇지 않다",
    2: "그렇지 않다",
    3: "보통이다",
    4: "그렇다",
    5: "매우 그렇다",
  };

  // --- 데이터 요청 (Side Effect) ---
  // 처음 로드될 때 질문 목록을 가져옵니다.
  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const response = await axios.get(
          "/seems/api/personality-test/questions"
        );
        setQuestions(response.data);
      } catch (err) {
        console.error("문항을 불러오는데 실패했습니다:", err);
        setError(
          "문항을 불러오는데 실패했습니다. 서버가 실행 중인지 확인해주세요."
        );
      } finally {
        setIsLoading(false);
      }
    };
    fetchQuestions();
  }, []);

  // ✨ 2. 페이지(currentPage)가 바뀔 때마다 스크롤을 맨 위로 올리는 효과
  useEffect(() => {
    if (topOfTestRef.current) {
      topOfTestRef.current.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }
  }, [currentPage]);

  // --- 이벤트 핸들러 함수 ---
  const handleAnswerChange = (questionId, value) => {
    setAnswers((prevAnswers) => ({
      ...prevAnswers,
      [questionId]: value,
    }));
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

    const currentUserId = "1"; // TODO: 실제 로그인된 사용자 ID로 변경
    const submissionData = Object.keys(answers).map((questionId) => ({
      userId: currentUserId,
      questionId: parseInt(questionId, 10),
      answerValue: answers[questionId],
    }));

    try {
      const token = localStorage.getItem("accessToken");
      const response = await axios.post(
        "/seems/api/personality-test/submit-answers",
        submissionData,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      console.log("검사 제출 성공:", response.data);
      alert("성격 검사가 완료되었습니다! 결과를 확인해주세요.");
      navigate(`/personality-test/result/${currentUserId}`);
    } catch (err) {
      console.error(
        "검사 제출 실패:",
        err.response ? err.response.data : err.message
      );
      setError("검사 제출 중 오류가 발생했습니다.");
    }
  };

  // --- 렌더링 로직 ---
  if (isLoading)
    return (
      <div>
        <UserHeader />
        <p>로딩 중...</p>
      </div>
    );
  if (error)
    return (
      <div>
        <UserHeader />
        <p>{error}</p>
      </div>
    );
  if (questions.length === 0)
    return (
      <div>
        <UserHeader />
        <p>표시할 문항이 없습니다.</p>
      </div>
    );

  const totalPages = Math.ceil(questions.length / questionsPerPage);
  const startIndex = currentPage * questionsPerPage;
  const endIndex = startIndex + questionsPerPage;
  const currentQuestions = questions.slice(startIndex, endIndex);

  return (
    <div className={styles.container}>
      <UserHeader />
      {/* ✨ 3. 스크롤의 기준점이 될 요소에 ref를 연결합니다. */}
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
    </div>
  );
};

export default PersonalityTestPage;
