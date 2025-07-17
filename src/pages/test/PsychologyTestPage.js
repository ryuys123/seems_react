import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import styles from "./PsychologyTestPage.module.css";
import UserHeader from "../../components/common/UserHeader";

function PsychologyTestPage() {
  const [questions, setQuestions] = useState([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [userResponse, setUserResponse] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const BASE_IMAGE_URL = "http://localhost:8888/seems/images/";

  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await axios.get(
          "/seems/api/psychological-test/questions?count=3"
        );
        if (response.data && response.data.length > 0) {
          setQuestions(response.data);
        } else {
          setError("질문을 불러올 수 없습니다.");
        }
      } catch (err) {
        console.error("문항 목록을 불러오는데 실패했습니다:", err);
        setError("문항을 불러오는 데 실패했습니다. 서버 상태를 확인해주세요.");
      } finally {
        setLoading(false);
      }
    };

    fetchQuestions();
  }, []);

  const handleResponseChange = (e) => {
    setUserResponse(e.target.value);
  };

  // 👇 모든 수정 사항이 반영된 handleSubmit 함수입니다.
  const handleSubmit = async () => {
    if (!userResponse.trim()) {
      alert("느낀 점을 입력해주세요.");
      return;
    }

    const currentQuestion = questions[currentStep];
    const userId = localStorage.getItem("loggedInUserId");

    if (!userId) {
      alert("로그인 정보가 올바르지 않습니다. 다시 로그인해주세요.");
      navigate("/login");
      return;
    }

    // ✨ 1. answerData 객체에 testType을 추가합니다.
    const answerData = {
      userId: userId,
      questionId: currentQuestion.questionId,
      userResponseText: userResponse,
      currentStep: currentStep + 1,
      totalSteps: questions.length,
      testType: currentQuestion.testType, // 서버로 현재 질문의 testType을 보냅니다.
    };

    setLoading(true);
    try {
      const response = await axios.post(
        "/seems/api/psychological-test/submit-answer",
        answerData
      );

      if (response.status === 204) {
        setCurrentStep((prevStep) => prevStep + 1);
        setUserResponse("");
      } else if (response.status === 200) {
        const resultId = response.data.resultId;
        // 백엔드 응답에서 testType을 받아옵니다.
        const testTypeForResult = response.data.testType;

        // ✨ 2. navigate 함수의 URL 파라미터를 'type'으로 수정합니다.
        navigate(
          `/psychological-test/result/${resultId}?type=${
            testTypeForResult || "image"
          }`
        );
      }
    } catch (err) {
      console.error("답변 제출 실패:", err);
      setError("답변 제출 중 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  };

  const currentQuestion = questions[currentStep];

  if (loading && questions.length === 0) {
    return (
      <>
        <UserHeader />
        <div className={styles.loadingOverlay}>
          <div className={styles.spinner}></div>
          <p>질문을 불러오는 중입니다...</p>
        </div>
      </>
    );
  }

  if (error) {
    return (
      <>
        <UserHeader />
        <div className={styles.container}>
          <p className={styles.error}>{error}</p>
        </div>
      </>
    );
  }

  if (!currentQuestion) {
    return (
      <div className={styles.container}>
        <UserHeader />
        <p>테스트가 완료되었거나 표시할 문항이 없습니다.</p>
      </div>
    );
  }

  const imageUrlToDisplay = `${BASE_IMAGE_URL}${currentQuestion.imageUrl}`;
  const isLastStep = currentStep === questions.length - 1;

  return (
    <div className={styles.container}>
      <UserHeader />
      <h1 className={styles.title}>
        이미지를 통한 심리 검사 ({currentStep + 1} / {questions.length})
      </h1>
      <p className={styles.description}>
        제시된 이미지를 보고 떠오르는 생각이나 느낀 점을 자유롭게 작성해주세요.
      </p>

      {loading && (
        <div className={styles.loadingOverlay}>
          <div className={styles.spinner}></div>
          <p>ai가 당신의 텍스트를 분석하고 있습니다. 잠시만 기다려주세요!</p>
        </div>
      )}

      <div className={styles.questionCard}>
        <img
          src={imageUrlToDisplay}
          alt="심리 검사 이미지"
          className={styles.questionImage}
        />
        <p className={styles.questionText}>{currentQuestion.questionText}</p>
      </div>

      <textarea
        className={styles.responseArea}
        placeholder="여기에 느낀 점을 자유롭게 작성해주세요..."
        value={userResponse}
        onChange={handleResponseChange}
        rows="10"
      ></textarea>

      <button
        className={styles.submitButton}
        onClick={handleSubmit}
        disabled={loading}
      >
        {loading ? "처리 중..." : isLastStep ? "최종 결과 보기" : "다음"}
      </button>
    </div>
  );
}

export default PsychologyTestPage;
