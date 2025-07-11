// src/pages/PsychologyResultPage.js
import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import styles from "./PsychologyResultPage.module.css"; // CSS 모듈 (스타일링 필요)
import UserHeader from "../../components/common/UserHeader";
function PsychologyResultPage() {
  const { resultId } = useParams(); // URL에서 resultId 파라미터 가져오기
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchResult = async () => {
      try {
        setLoading(true);
        // 백엔드 API로부터 결과 데이터를 가져옵니다.
        const response = await axios.get(
          `/seems/api/psychological-test/result/${resultId}`
        );
        // 응답 데이터 (PsychologicalTestResultResponse DTO)를 상태에 저장합니다.
        setResult(response.data);
        setError(null);
      } catch (err) {
        console.error("결과를 불러오는데 실패했습니다:", err);
        setError("결과를 불러오는 데 실패했습니다. 다시 시도해주세요.");
      } finally {
        setLoading(false);
      }
    };

    if (resultId) {
      fetchResult();
    }
  }, [resultId]);

  if (error) {
    return <div className={styles.container}>{error}</div>;
  }

  // 데이터가 없거나 유효하지 않을 때 표시할 내용
  if (!result || !result.aiInsightSummary) {
    return (
      <div className={styles.container}>
        <UserHeader />
        <div className={styles.resultCard}>
          <h2>당신의 심리 분석 결과</h2>
          <p className={styles.analysisText}>
            분석 결과가 없습니다. (데이터를 찾을 수 없거나 AI 분석 요약이
            비어있습니다.)
          </p>
          <button
            className={styles.backButton}
            onClick={() => (window.location.href = "/psychologyTestPage")}
          >
            다시 테스트하기
          </button>
        </div>
      </div>
    );
  }

  // AI 분석 결과가 있을 때 표시할 내용
  return (
    <>
      <UserHeader />
      <div className={styles.container}>
        <h1 className={styles.title}>심리 분석 결과</h1>

        <div className={styles.resultCard}>
          <h2>이미지를 통한 당신의 심리 분석 결과</h2>

          {/* 수정된 부분: result.aiInsightSummary 사용 */}
          <p className={styles.analysisText}>{result.aiInsightSummary}</p>

          {/* 추가 분석 정보 표시 */}
          <div className={styles.additionalInfo}>
            <h3>상세 분석 및 제안</h3>
            <p>
              <strong>AI 감정 분석:</strong> {result.aiSentiment || "N/A"}
            </p>
            <p>
              <strong>감정 점수:</strong> {result.aiSentimentScore || "N/A"}
            </p>
            <p>
              <strong>창의력 점수:</strong> {result.aiCreativityScore || "N/A"}
            </p>
            <p>
              <strong>핵심 키워드:</strong>{" "}
              {result.aiPerspectiveKeywords || "N/A"}
            </p>
            <p>
              <strong>AI 제안:</strong> {result.suggestions || "제안 없음"}
            </p>
          </div>
        </div>

        <button
          className={styles.backButton}
          onClick={() => (window.location.href = "/SelectTestPage")}
        >
          테스트 페이지로 돌아가기
        </button>
        <button
          className={styles.backButton}
          onClick={() => (window.location.href = "/analysis-dashboard")}
        >
          분석 페이지로 이동
        </button>
      </div>
    </>
  );
}

export default PsychologyResultPage;
