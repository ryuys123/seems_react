import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./SelectSimulationPage.module.css";
import UserHeader from "../../components/common/UserHeader";
import apiClient from "../../utils/axios";
import WarningModal from "../../components/modal/WarningModal";

export default function SelectSimulationPage() {
  const navigate = useNavigate();
  const [userProfile, setUserProfile] = useState(null);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [scenarios, setScenarios] = useState([]);
  const [loadingScenarios, setLoadingScenarios] = useState(true);
  const [error, setError] = useState(null);

  const loggedInUserId = localStorage.getItem("loggedInUserId");
  const userName = localStorage.getItem("userName") || "사용자";

  useEffect(() => {
    const fetchPageData = async () => {
      if (!loggedInUserId) {
        setLoadingProfile(false);
        setLoadingScenarios(false);
        return;
      }

      // --- 맞춤형 프로필 가져오기 ---
      try {
        const profileResponse = await apiClient.get(
          `/api/analysis/final-result/${loggedInUserId}`
        );
        const summaryData = profileResponse.data;
        if (summaryData) {
          let recommendedTopic = "나의 강점 발견하기";
          const depressionResult = summaryData.individualResults?.find(
            (r) => r.latestDepressionResult
          )?.latestDepressionResult;
          if (depressionResult && depressionResult.riskLevel.includes("심각")) {
            recommendedTopic = "우울감 다루기";
          }
          setUserProfile({
            summary: summaryData.analysisComment,
            recommendedTopic: recommendedTopic,
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

      // --- 일반 시나리오 목록 가져오기 ---
      try {
        const scenariosResponse = await apiClient.get(`/api/simulation/list`);
        setScenarios(scenariosResponse.data);
      } catch (err) {
        console.error("시나리오 목록 조회 실패:", err);
        setError("시나리오를 불러오는 데 실패했습니다.");
      } finally {
        setLoadingScenarios(false);
      }
    };

    fetchPageData();
  }, [loggedInUserId]);

  // ✨ 1. '맞춤형 시뮬레이션 시작' 핸들러
  const handleStartCustomSimulation = async () => {
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
      const response = await apiClient.post("/api/simulation/start/coping", {
        userId: loggedInUserId,
      });

      navigate("/simulation/test", {
        state: {
          scenario: { title: userProfile.recommendedTopic, isCustom: true },
          question: response.data,
          settingId: response.data.settingId,
        },
      });
    } catch (error) {
      console.error("맞춤형 시뮬레이션 시작에 실패했습니다.", error);
      alert("시뮬레이션을 시작하는 중 오류가 발생했습니다.");
    } finally {
      setLoadingProfile(false);
    }
  };

  // 일반 시나리오 시작 핸들러
  const handleSimulationStart = (scenario) => {
    if (!loggedInUserId) {
      alert("로그인이 필요합니다.");
      return;
    }

    apiClient
      .post(`/api/simulation/start`, {
        scenarioId: scenario.scenarioId,
        userId: loggedInUserId,
      })
      .then((response) => {
        navigate("/simulation/test", {
          state: {
            scenario: { id: scenario.scenarioId, title: scenario.scenarioName },
            settingId: response.data.settingId,
            question: response.data,
          },
        });
      })
      .catch((err) => {
        console.error("시뮬레이션 시작 실패:", err);
        alert("시뮬레이션을 시작할 수 없습니다.");
      });
  };

  return (
    <div className={styles.container}>
      <UserHeader />
      <h2 className={styles.title}>맞춤형 극복 시뮬레이션</h2>
      <div className={`${styles.card} ${styles.healingCard}`}>
        {loadingProfile ? (
          <p>종합 분석 데이터를 불러오는 중입니다...</p>
        ) : userProfile ? (
          <>
            <div className={styles.cardIcon}>💖</div>
            <div className={styles.cardTitle}>나를 위한 시나리오</div>
            <p className={styles.cardDesc}>
              <strong>종합 분석 요약:</strong> {userProfile.summary}
            </p>
            <p className={styles.healingPrompt}>
              AI가 당신의 상황에 맞춰 생성한 시나리오를 통해 마음을 돌보는
              시간을 가져보세요.
            </p>
            <button
              className={styles.healingButton}
              onClick={handleStartCustomSimulation}
            >
              '{userProfile.recommendedTopic}' 극복 시뮬레이션 시작하기
            </button>
          </>
        ) : (
          <p>
            모든 심리 검사를 완료하면, 당신만을 위한 맞춤형 극복 시뮬레이션이
            제공됩니다.
          </p>
        )}
      </div>

      <hr className={styles.divider} />

      <h2 className={styles.title}>오늘의 시뮬레이션</h2>
      <p className={styles.sectionIntro}>
        매일 다른 시나리오를 통해 당신의 무의식적인 선택과 성향을 발견해 보세요.
      </p>
      <div className={styles.cardsWrapper}>
        {loadingScenarios ? (
          <p>오늘의 시뮬레이션을 불러오는 중입니다...</p>
        ) : error ? (
          <p style={{ color: "red" }}>{error}</p>
        ) : scenarios.length > 0 ? (
          scenarios.map((scenario) => (
            <div
              key={scenario.scenarioId}
              className={`${styles.card} ${styles.themedCard}`}
              onClick={() => handleSimulationStart(scenario)}
            >
              <div className={styles.cardContent}>
                <div className={styles.cardTitle}>{scenario.scenarioName}</div>
                <div className={styles.cardDesc}>{scenario.description}</div>
              </div>
            </div>
          ))
        ) : (
          <p>오늘 진행 가능한 시뮬레이션 정보가 없습니다.</p>
        )}
      </div>
    </div>
  );
}
