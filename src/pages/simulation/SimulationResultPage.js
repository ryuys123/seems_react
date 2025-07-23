// src/pages/simulation/SimulationResultPage.js

import React, { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import styles from "./SimulationResultPage.module.css";

console.log("--- SimulationResultPage.js 파일 로드됨 ---");

export default function SimulationResultPage() {
  const { state } = useLocation();
  const navigate = useNavigate();

  const analysisResult = state?.analysisResult;
  const scenarioTitle = state?.scenarioTitle;

  console.log("SimulationResultPage 컴포넌트 렌더링 시작");
  console.log("useLocation state (Result Page):", state);
  console.log("Analysis Result:", analysisResult);

  useEffect(() => {
    if (!analysisResult) {
      console.log("분석 결과 데이터 부족, 홈으로 리다이렉트");
      navigate("/simulation");
    }
  }, [analysisResult, navigate]);

  if (!analysisResult) {
    return (
      <div className={styles.loadingMessage}>결과를 불러오는 중입니다...</div>
    );
  }

  return (
    <div className={styles.resultContainer}>
      <h2 className={styles.pageTitle}>
        {scenarioTitle ? `${scenarioTitle} 결과` : "시뮬레이션 결과"} ✨
      </h2>

      {/* 핵심 결과 섹션: Personality Type과 Result Title을 함께 배치 */}
      <div className={styles.mainResultSection}>
        <p className={styles.personalityType}>
          {/* 주요 성격 유형 키워드 */}
          **{analysisResult.personalityType}**
        </p>
        {analysisResult.resultTitle && (
          <h3 className={styles.resultTitleText}>
            — "{analysisResult.resultTitle}" {/* 결과 제목 */}
          </h3>
        )}
      </div>

      {/* 심리 분석 요약 섹션 */}
      <div className={styles.infoSection}>
        <h3 className={styles.sectionTitle}>당신의 심리 분석 요약:</h3>
        <p className={styles.summaryText}>{analysisResult.resultSummary}</p>
      </div>

      {/* AI 분석 결과에 따라 추가 정보 표시 */}
      {analysisResult.aiPerspectiveKeywords && (
        <div className={styles.infoSection}>
          <h3 className={styles.sectionTitle}>주요 관점 키워드:</h3>
          <p className={styles.keywordsText}>
            {analysisResult.aiPerspectiveKeywords}
          </p>
        </div>
      )}
      {analysisResult.suggestions && (
        <div className={styles.infoSection}>
          <h3 className={styles.sectionTitle}>AI의 조언:</h3>
          <p className={styles.suggestionsText}>{analysisResult.suggestions}</p>
        </div>
      )}

      <button
        className={styles.retryButton}
        onClick={() => navigate("/simulation")}
      >
        다시 시뮬레이션하기 🌳
      </button>
    </div>
  );
}
