// src/main/frontend/src/pages/PsychologyTestPage.js

import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import styles from "./PsychologyTestPage.module.css";
import UserHeader from "../../components/common/UserHeader";

function PsychologyTestPage() {
  const [question, setQuestion] = useState({
    imageUrl: null,
    questionText: null,
    questionId: null,
  });
  const [userResponse, setUserResponse] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isImageLoaded, setIsImageLoaded] = useState(false);
  const navigate = useNavigate();

  // <<-- 이미지 로딩을 위한 기본 URL 정의 (이 부분이 중요합니다!)
  // Spring Boot 백엔드 서버의 기본 URL (포트 8888)과 컨텍스트 패스 (/seems)를 포함합니다.
  // 그리고 정적 파일이 서빙되는 경로 (/images/)를 추가합니다.
  const BASE_IMAGE_URL = "http://localhost:8888/seems/images/"; // <<-- 이 경로를 정확히 확인하고 사용합니다.

  useEffect(() => {
    const fetchQuestion = async () => {
      try {
        setLoading(true);
        setError(null);
        // 백엔드 API 호출 URL (package.json의 proxy 설정에 따라 상대 경로 사용)
        const response = await axios.get(
          "/seems/api/psychological-test/image-question"
        );
        setQuestion(response.data);
      } catch (err) {
        console.error("문항을 불러오는데 실패했습니다:", err);
        setError("문항을 불러오는 데 실패했습니다. 서버 상태를 확인해주세요.");
      } finally {
        setLoading(false);
        setIsImageLoaded(false); // ⭐️ 새로운 질문을 불러올 때 이미지 로딩 상태 초기화
      }
    };

    // ⭐️ 컴포넌트 마운트 시 세션 저장소에서 문항 ID 확인
    const storedQuestionId = sessionStorage.getItem("currentTestQuestionId");
    if (storedQuestionId) {
      fetchQuestion(storedQuestionId);
    } else {
      fetchQuestion(); // 세션에 문항 ID가 없으면 무작위 문항을 가져옴
    }
  }, []);

  const handleResponseChange = (e) => {
    setUserResponse(e.target.value);
  };

  const handleSubmit = async () => {
    if (!userResponse.trim()) {
      alert("느낀 점을 입력해주세요.");
      return;
    }
    if (!question || !question.questionId) {
      alert("문항 정보가 없습니다. 페이지를 새로고침 해주세요.");
      return;
    }

    const userId = "testUser123";

    const answerData = {
      userId: userId,
      questionId: question.questionId,
      userResponseText: userResponse,
    };

    try {
      setLoading(true);
      const response = await axios.post(
        "/seems/api/psychological-test/submit-answer", // 경로 수정
        answerData
      );
      const resultId = response.data.resultId;

      navigate(`/psychological-test/result/${resultId}`);
    } catch (err) {
      console.error("답변 제출 실패:", err);
      setError("답변 제출 중 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    // 이미지 URL이 준비되었는지 확인합니다.
    const imageUrlToDisplay = question
      ? `${BASE_IMAGE_URL}${question.imageUrl}`
      : null;

    return (
      <>
        <UserHeader />

        <div className={styles.loadingOverlay}>
          <div className={styles.spinner}></div>
          <p>ai가 당신의 텍스트를 분석하고 있습니다. 잠시만 기다려주세요!</p>
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

  if (!question) {
    return (
      <div className={styles.container}>
        <p>표시할 문항이 없습니다.</p>
      </div>
    );
  }

  // <<-- 이미지가 실제로 로드될 URL을 조합합니다.
  // question.imageUrl은 DB에서 가져온 이미지 파일명입니다 (예: "psych_image_1.png").
  const imageUrlToDisplay = `${BASE_IMAGE_URL}${question.imageUrl}`;

  return (
    <div className={styles.container}>
      <UserHeader />
      <h1 className={styles.title}>이미지를 통한 심리 검사</h1>
      <p className={styles.description}>
        제시된 이미지를 보고 떠오르는 생각이나 느낀 점을 자유롭게 작성해주세요.
      </p>

      <div className={styles.questionCard}>
        {question.imageUrl && (
          // <<-- src 속성에 조합된 완전한 URL을 사용합니다.
          <img
            src={imageUrlToDisplay} // <<-- 이 부분이 변경되었습니다.
            alt="심리 검사 이미지"
            className={styles.questionImage}
          />
        )}
        {question.questionText && (
          <p className={styles.questionText}>{question.questionText}</p>
        )}
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
        {loading ? "제출 중..." : "답변 제출"}
      </button>
    </div>
  );
}

export default PsychologyTestPage;
