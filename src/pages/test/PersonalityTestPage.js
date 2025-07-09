// src/pages/test/PersonalityTestPage.js
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import UserHeader from "../../components/common/UserHeader";
import styles from "./PersonalityTestPage.module.css";

const PersonalityTestPage = () => {
  const navigate = useNavigate();
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // 답변 옵션의 텍스트 라벨을 정의합니다.
  // 라디오 버튼의 value (1~5)에 매핑됩니다.
  const answerLabels = {
    1: "전혀 그렇지 않다",
    2: "그렇지 않다",
    3: "보통이다",
    4: "그렇다",
    5: "매우 그렇다",
  };

  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const response = await axios.get(
          "http://localhost:8888/seems/api/personality-test/questions"
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

  const handlePreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex((prevIndex) => prevIndex - 1);
    }
  };

  const handleSubmitTest = async () => {
    if (Object.keys(answers).length !== questions.length) {
      alert("아직 모든 문항에 답변하지 않았습니다. 다시 확인해주세요.");
      return;
    }

    const submissionData = questions.map((q) => ({
      userId: 1, // TODO: 실제 사용자 ID로 변경
      questionId: q.questionId,
      answerValue: answers[q.questionId],
    }));

    try {
      const response = await axios.post(
        "http://localhost:8888/seems/api/personality-test/submit-answers",
        submissionData
      );
      console.log("검사 제출 성공:", response.data);
      alert("성격 검사가 완료되었습니다! 감사합니다.");
      // navigate('/personality-test-result', { state: { result: response.data } });
    } catch (err) {
      console.error(
        "검사 제출 실패:",
        err.response ? err.response.data : err.message
      );
      setError("검사 제출 중 오류가 발생했습니다.");
    }
  };

  if (isLoading) {
    return (
      <div className={styles.container}>
        <UserHeader />
        <p>성격 검사 문항을 불러오는 중입니다...</p>
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
        <p>표시할 성격 검사 문항이 없습니다. 관리자에게 문의하세요.</p>
      </div>
    );
  }

  const currentQuestion = questions[currentQuestionIndex];

  return (
    <div className={styles.container}>
      <UserHeader />

      <div className={styles.testCard}>
        <div className={styles.questionCounter}>
          {currentQuestionIndex + 1} / {questions.length}
        </div>
        <p className={styles.questionText}>{currentQuestion.questionText}</p>

        {/* 답변 선택 옵션 (1점에서 5점 척도) */}
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
              {/* 여기에 텍스트 라벨을 추가합니다. */}
              <span>{answerLabels[value]}</span>
            </label>
          ))}
        </div>

        {/* 네비게이션 버튼 */}
        <div className={styles.navigationButtons}>
          <button
            onClick={handlePreviousQuestion}
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
};

export default PersonalityTestPage;
