import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./PsychologyTestPage.module.css";
import UserHeader from "../../components/common/UserHeader";
import { submitPsychologicalAnswer } from "../../services/TestService";
import apiClient from "../../utils/axios";

function PsychologyTestPage() {
  const [questions, setQuestions] = useState([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [userResponse, setUserResponse] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  // 이미지가 저장된 백엔드 서버의 기본 URL
  const BASE_IMAGE_URL = "http://localhost:8888/seems/images/";

  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await apiClient.get(
          "/api/psychological-test/questions?count=3&testType=PSYCHOLOGICAL_IMAGE"
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

    const answerData = {
      userId: userId,
      questionId: currentQuestion.questionId,
      userResponseText: userResponse,
      currentStep: currentStep + 1,
      totalSteps: questions.length,
      testType: currentQuestion.testType,
    };

    setLoading(true);
    try {
      // submitPsychologicalAnswer는 axios 호출을 포함하는 서비스 함수라고 가정
      const response = await apiClient.post(
        "/api/psychological-test/submit-answer",
        answerData
      );

      if (currentStep < questions.length - 1) {
        setCurrentStep((prevStep) => prevStep + 1);
        setUserResponse("");
      } else {
        alert("검사가 완료되었습니다! AI가 분석한 최종 결과를 보여드릴게요.");

        // ✨ 서버 응답 데이터는 response.data 안에 있습니다.
        const resultId = response.data.resultId;
        if (resultId) {
          // ✨ 경로 오타 수정 및 response.data에서 가져온 resultId를 사용합니다.
          navigate(
            `/psychological-test/result/${resultId}?type=PSYCHOLOGICAL_IMAGE`
          );
        } else {
          throw new Error("서버 응답에서 결과 ID를 찾을 수 없습니다.");
        }
      }
    } catch (err) {
      console.error("답변 제출 실패:", err);
      setError("답변 제출 중 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  };

  if (loading && questions.length === 0) {
    return (
      <>
        {" "}
        <UserHeader />{" "}
        <div className={styles.loadingOverlay}>
          {" "}
          <div className={styles.spinner}></div>{" "}
          <p>질문을 불러오는 중입니다...</p>{" "}
        </div>{" "}
      </>
    );
  }
  if (error) {
    return (
      <>
        {" "}
        <UserHeader />{" "}
        <div className={styles.container}>
          {" "}
          <p className={styles.error}>{error}</p>{" "}
        </div>{" "}
      </>
    );
  }

  const currentQuestion = questions[currentStep];
  if (!currentQuestion) {
    return (
      <div className={styles.container}>
        {" "}
        <UserHeader /> <p>표시할 문항이 없습니다.</p>{" "}
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
          <p>AI가 당신의 텍스트를 분석하고 있습니다. 잠시만 기다려주세요!</p>
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
