import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import styles from "./PersonalityResultPage.module.css";

// ✨ 1. mbtiTitles 객체를 여기서 완전히 삭제합니다.

function PersonalityResultPage() {
  const [resultData, setResultData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { userId } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchResult = async () => {
      if (!userId) {
        setError("사용자 ID가 없습니다.");
        setLoading(false);
        return;
      }

      try {
        const token = localStorage.getItem("accessToken");
        if (!token) {
          throw new Error("인증 토큰이 없습니다. 로그인이 필요합니다.");
        }

        const response = await fetch(
          `/seems/api/personality-test/results/${userId}`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!response.ok) {
          throw new Error(`서버 응답 오류: ${response.status}`);
        }

        const data = await response.json();
        setResultData(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchResult();
  }, [userId]);

  // 로딩 및 에러 처리 UI
  if (loading) {
    return (
      <div className={styles.resultContainer}>
        <h2>로딩 중...</h2>
      </div>
    );
  }
  if (error) {
    return (
      <div className={styles.resultContainer}>
        <h2>오류</h2>
        <p>{error}</p>
      </div>
    );
  }

  // 최종 결과 UI
  return (
    <div className={styles.resultContainer}>
      <div className={styles.header}>
        <h1>당신의 성격 유형은?</h1>
      </div>
      {resultData && (
        <>
          <div className={styles.resultBox}>
            <h2 className={styles.resultType}>{resultData.result}</h2>
            <p className={styles.resultDescription}>{resultData.description}</p>
          </div>
          <div className={styles.titleBox}>
            {/* ✨ 2. 복잡한 조회 로직 대신, 백엔드가 준 mbtiTitle을 바로 사용합니다. */}
            <h3 className={styles.titleText}>{resultData.mbtiTitle}</h3>
          </div>
        </>
      )}
      <button className={styles.homeButton} onClick={() => navigate("/")}>
        처음으로
      </button>
    </div>
  );
}

export default PersonalityResultPage;
