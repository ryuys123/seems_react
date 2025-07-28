// src/pages/simulation/SimulationResultPage.js

import React, { useState, useEffect } from "react";
// ✅ useParams 임포트 추가
import { useNavigate, useParams } from "react-router-dom";
import styles from "./SimulationResultPage.module.css";
import apiClient from "../../utils/axios";
import UserHeader from "../../components/common/UserHeader";

console.log("--- SimulationResultPage.js 파일 로드됨 ---");

export default function SimulationResultPage() {
  // const { state } = useLocation(); // ✅ 더 이상 useLocation.state를 사용하지 않음
  const { settingId } = useParams(); // ✅ URL 파라미터에서 settingId 가져오기
  const navigate = useNavigate();

  // ✅ 결과 데이터와 로딩 상태를 위한 새로운 useState 훅
  const [analysisResult, setAnalysisResult] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  console.log("SimulationResultPage 컴포넌트 렌더링 시작");
  console.log("Setting ID from URL parameters:", settingId);

  useEffect(() => {
    // settingId가 없을 경우 또는 유효하지 않을 경우 리다이렉트
    if (!settingId) {
      console.log("settingId가 없습니다. 시뮬레이션 선택 페이지로 리다이렉트");
      navigate("/simulation");
      return;
    }

    const fetchResultDetails = async () => {
      setIsLoading(true);
      try {
        // ✅ 백엔드에서 특정 settingId의 상세 결과 데이터를 가져오는 API 호출
        // 백엔드 SimulationController에 GET /api/simulation/result-details/{settingId} API가 필요합니다.
        const response = await apiClient.get(
          `/api/simulation/result-details/${settingId}`
        );
        setAnalysisResult(response.data);
      } catch (err) {
        console.error("상세 결과 불러오기 실패:", err);
        setError("상세 결과를 불러오는 데 실패했습니다.");
        // 오류 발생 시 시뮬레이션 선택 페이지로 돌아갈 수 있음
        // navigate("/simulation");
      } finally {
        setIsLoading(false);
      }
    };

    fetchResultDetails();
  }, [settingId, navigate]); // settingId가 변경될 때마다 다시 fetch

  if (isLoading) {
    return (
      <div className={styles.loadingMessage}>결과를 불러오는 중입니다...</div>
    );
  }

  if (error) {
    return (
      <div className={styles.errorContainer}>
        <UserHeader />
        <p className={styles.errorMessage}>{error}</p>
        <button
          className={styles.retryButton}
          onClick={() => navigate("/simulation")}
        >
          시뮬레이션 선택 페이지로 돌아가기
        </button>
      </div>
    );
  }

  // 로딩도 아니고 에러도 없는데 analysisResult가 null이면 데이터 없는 경우
  if (!analysisResult) {
    return (
      <div className={styles.loadingMessage}>
        결과 데이터를 찾을 수 없습니다.
        <button
          className={styles.retryButton}
          onClick={() => navigate("/simulation")}
        >
          시뮬레이션 선택 페이지로 돌아가기
        </button>
      </div>
    );
  }

  return (
    <div className={styles.resultContainer}>
      <UserHeader />
      <h2 className={styles.pageTitle}>맞춤형 극복 시뮬레이션 결과 ✨</h2>

      {/* 스트레스 및 우울감 변화 섹션 */}
      <div className={styles.scoreChangeSection}>
        <h3 className={styles.sectionTitle}>당신의 변화 여정</h3>
        <p className={styles.scoreText}>
          <strong>시작 스트레스 지수:</strong>{" "}
          <span className={styles.scoreValue}>
            {analysisResult.initialStressScore}점
          </span>{" "}
          ➡️ <strong>예상 종료 스트레스 지수:</strong>{" "}
          <span className={styles.scoreValue}>
            {analysisResult.estimatedFinalStressScore}점
          </span>
        </p>
        <p className={styles.scoreText}>
          <strong>시작 우울감 지수:</strong>{" "}
          <span className={styles.scoreValue}>
            {analysisResult.initialDepressionScore}점
          </span>{" "}
          ➡️ <strong>예상 종료 우울감 지수:</strong>{" "}
          <span className={styles.scoreValue}>
            {analysisResult.estimatedFinalDepressionScore}점
          </span>
        </p>
        <p className={styles.changeSummary}>
          이 시뮬레이션을 통해 당신의 스트레스는{" "}
          <span className={styles.highlight}>
            {analysisResult.initialStressScore -
              analysisResult.estimatedFinalStressScore}
            점
          </span>
          , 우울감은{" "}
          <span className={styles.highlight}>
            {analysisResult.initialDepressionScore -
              analysisResult.estimatedFinalDepressionScore}
            점
          </span>{" "}
          감소했을 것으로 예상됩니다.
        </p>
      </div>

      {/* 결과 제목 섹션 */}
      {analysisResult.resultTitle && (
        <div className={styles.infoSection}>
          <h3 className={styles.sectionTitle}>AI의 맞춤 제안</h3>
          <p className={styles.resultTitleText}>
            — "{analysisResult.resultTitle}"
          </p>
        </div>
      )}

      {/* 심리 분석 요약 섹션 */}
      <div className={styles.infoSection}>
        <h3 className={styles.sectionTitle}>당신의 시뮬레이션 요약:</h3>
        <p className={styles.summaryText}>{analysisResult.resultSummary}</p>
      </div>

      {/* 긍정적 기여 요인 섹션 */}
      {analysisResult.positiveContributionFactors && (
        <div className={styles.infoSection}>
          <h3 className={styles.sectionTitle}>긍정적 기여 요인:</h3>
          <p className={styles.contributionText}>
            {analysisResult.positiveContributionFactors}
          </p>
        </div>
      )}

      {/* 다시 시뮬레이션하기 버튼 */}
      <button
        className={styles.retryButton}
        onClick={() => navigate("/simulation")}
      >
        돌아가기 🌳
      </button>
    </div>
  );
}
