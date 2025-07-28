import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./SelectSimulationPage.module.css";
import UserHeader from "../../components/common/UserHeader";
import apiClient from "../../utils/axios";
// WarningModal은 계속 사용될 수 있으므로 유지
import WarningModal from "../../components/modal/WarningModal";

export default function SelectSimulationPage() {
  const navigate = useNavigate();
  const [userProfile, setUserProfile] = useState(null);
  const [loadingProfile, setLoadingProfile] = useState(true);

  // ✅ scenarios 관련 상태 제거
  // const [scenarios, setScenarios] = useState([]);
  // const [loadingScenarios, setLoadingScenarios] = useState(true);

  const [error, setError] = useState(null); // 에러 상태는 유지 (다른 API 오류에도 사용될 수 있음)

  // ✨ 1. 새로운 상태 변수 추가: 최근 시뮬레이션 요약 결과
  const [recentSimulationSummary, setRecentSimulationSummary] = useState(null);
  const [loadingRecentSummary, setLoadingRecentSummary] = useState(true);

  const loggedInUserId = localStorage.getItem("loggedInUserId");
  const userName = localStorage.getItem("userName") || "사용자";

  useEffect(() => {
    const fetchPageData = async () => {
      if (!loggedInUserId) {
        setLoadingProfile(false);
        // ✅ setLoadingScenarios 제거
        // setLoadingScenarios(false);
        setLoadingRecentSummary(false);
        return;
      }

      // --- 맞춤형 프로필 (종합 분석 결과) 가져오기 ---
      try {
        const profileResponse = await apiClient.get(
          `/api/analysis/final-result/${loggedInUserId}`
        );
        const summaryData = profileResponse.data;
        if (summaryData) {
          let recommendedTopic = "나의 강점 발견하기";
          const depressionResultEntry = summaryData.individualResults?.find(
            (r) => r.latestDepressionResult
          );
          const depressionResult =
            depressionResultEntry?.latestDepressionResult;

          if (
            depressionResult &&
            depressionResult.riskLevel &&
            depressionResult.riskLevel.includes("심각")
          ) {
            recommendedTopic = "극복 시뮬레이션";
          }
          setUserProfile({
            summary: summaryData.analysisComment,
            recommendedTopic: recommendedTopic,
            initialStressScore: summaryData.stressScore,
            initialDepressionScore: summaryData.depressionScore,
          });
        }
      } catch (error) {
        if (error.response && error.response.status === 404)
          console.log("종합 분석 결과가 아직 없습니다.");
        else console.error("Failed to fetch user profile:", error);
        setUserProfile(null);
      } finally {
        setLoadingProfile(false);
      }

      // --- 최근 극복 시뮬레이션 요약 결과 가져오기 ---
      // 백엔드 API 경로가 '/api/simulation/latest-result/{userId}'로 변경되었음을 반영
      try {
        const recentCopingResponse = await apiClient.get(
          `/api/simulation/latest-result/${loggedInUserId}` // ✅ API 경로 변경
        );
        setRecentSimulationSummary(recentCopingResponse.data);
      } catch (err) {
        if (err.response && err.response.status === 404) {
          console.log("최근 극복 시뮬레이션 결과가 없습니다.");
          setRecentSimulationSummary(null);
        } else {
          console.error("최근 시뮬레이션 요약 조회 실패:", err);
        }
      } finally {
        setLoadingRecentSummary(false);
      }
    };

    fetchPageData();
  }, [loggedInUserId]);

  // '맞춤형 시뮬레이션 시작' 핸들러 (API 경로 변경)
  const handleStartSimulation = async () => {
    // ✅ 함수명 변경 (handleStartCustomSimulation -> handleStartSimulation)
    if (!loggedInUserId) {
      alert("로그인이 필요합니다.");
      return;
    }
    if (!userProfile) {
      alert("시뮬레이션을 생성할 종합 분석 데이터가 없습니다.");
      return;
    }

    try {
      setLoadingProfile(true);
      // API 경로가 '/api/simulation/start'로 변경되었음을 반영
      const response = await apiClient.post("/api/simulation/start", {
        // ✅ API 경로 변경
        userId: loggedInUserId,
      });

      // 백엔드에서 받은 첫 질문과 settingId를 SimulationTestPage로 전달
      navigate("/simulation/test", {
        state: {
          scenario: { title: userProfile.recommendedTopic, isCustom: true }, // isCustom은 임시로 유지 (SimulationTestPage에서 제거 예정)
          question: response.data,
          settingId: response.data.settingId,
        },
      });
    } catch (error) {
      console.error("시뮬레이션 시작에 실패했습니다.", error);
      alert("시뮬레이션을 시작하는 중 오류가 발생했습니다.");
    } finally {
      setLoadingProfile(false);
    }
  };

  // '맞춤형 시뮬레이션 다시 하기' 핸들러 (API 경로 변경)
  const handleRetrySimulation = async () => {
    // ✅ 함수명 변경 (handleRetryCustomSimulation -> handleRetrySimulation)
    if (!loggedInUserId) {
      alert("로그인이 필요합니다.");
      return;
    }
    try {
      setLoadingRecentSummary(true);
      // API 경로가 '/api/simulation/start'로 변경되었음을 반영
      const response = await apiClient.post("/api/simulation/start", {
        // ✅ API 경로 변경
        userId: loggedInUserId,
      });

      navigate("/simulation/test", {
        state: {
          scenario: { title: userProfile.recommendedTopic, isCustom: true }, // isCustom은 임시로 유지
          question: response.data,
          settingId: response.data.settingId,
        },
      });
    } catch (error) {
      console.error("시뮬레이션 다시 시작 실패:", error);
      alert("시뮬레이션을 다시 시작하는 중 오류가 발생했습니다.");
    } finally {
      setLoadingRecentSummary(false);
    }
  };

  const handleViewResultDetails = (settingId) => {
    // ✅ 상세 결과 페이지로 이동 (URL 파라미터로 settingId 전달)
    navigate(`/simulation/result-details/${settingId}`);
  };

  // ✅ 일반 시나리오 시작 핸들러 제거
  // const handleSimulationStart = (scenario) => { ... };

  return (
    <div className={styles.container}>
      <UserHeader />
      <h2 className={styles.title}>맞춤형 극복 시뮬레이션</h2>
      <div className={`${styles.card} ${styles.healingCard}`}>
        {/* 모든 로딩 상태 통합 */}
        {loadingProfile || loadingRecentSummary ? ( // ✅ 로딩 상태 통합
          <p>데이터를 불러오는 중입니다...</p>
        ) : userProfile ? (
          <>
            <div className={styles.cardTitle}>나를 위한 시나리오</div>
            {/* 최근 시뮬레이션 요약 결과 표시 */}
            {recentSimulationSummary ? (
              <div className={styles.recentSummarySection}>
                <h3>최근 시뮬레이션 요약</h3>
                <p>
                  <strong>시작 스트레스:</strong>{" "}
                  {recentSimulationSummary.initialStressScore}점
                  <br />
                  <strong>종료 예상 스트레스:</strong>{" "}
                  {recentSimulationSummary.estimatedFinalStressScore}점
                </p>
                <p className={styles.summaryText}>
                  {recentSimulationSummary.resultSummary}
                </p>
                <div className={styles.summaryActions}>
                  <button
                    className={styles.healingButton}
                    onClick={() =>
                      handleViewResultDetails(recentSimulationSummary.settingId)
                    }
                  >
                    결과 상세 보기
                  </button>
                  <button
                    className={`${styles.healingButton} ${styles.retryButton}`}
                    onClick={handleRetrySimulation} // ✅ 함수명 변경
                  >
                    다시 하기
                  </button>
                </div>
              </div>
            ) : (
              // 최근 결과가 없을 경우 보여주는 UI
              <>
                <p className={styles.cardDesc}>
                  <strong>종합 분석 요약:</strong> {userProfile.summary}
                </p>
                <p className={styles.healingPrompt}>
                  AI가 당신의 상황에 맞춰 생성한 시나리오를 통해 마음을 돌보는
                  시간을 가져보세요.
                </p>
                <button
                  className={styles.healingButton}
                  onClick={handleStartSimulation} // ✅ 함수명 변경
                >
                  '{userProfile.recommendedTopic}' 극복 시뮬레이션 시작하기
                </button>
              </>
            )}
          </>
        ) : (
          <p>
            모든 심리 검사를 완료하면, 당신만을 위한 맞춤형 극복 시뮬레이션이
            제공됩니다.
          </p>
        )}
      </div>
    </div>
  );
}
