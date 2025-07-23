import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./SelectSimulationPage.module.css";
import UserHeader from "../../components/common/UserHeader";
import axios from "axios";

// 백엔드 API 기본 주소
const API_BASE_URL = "http://localhost:8888/seems/api/simulation";

export default function SelectSimulationPage() {
  const navigate = useNavigate();

  // 맞춤형 시뮬레이션 관련 상태 (기존 코드 유지)
  const [userProfile, setUserProfile] = useState(null);
  const [loadingProfile, setLoadingProfile] = useState(true);

  // '오늘의 시뮬레이션' 목록을 위한 상태
  const [scenarios, setScenarios] = useState([]); // DB에서 받아온 전체 시나리오 목록
  const [loadingScenarios, setLoadingScenarios] = useState(true); // 시나리오 로딩 상태
  const [error, setError] = useState(null); // 에러 상태

  useEffect(() => {
    // 맞춤형 프로필을 가져오는 로직 (기존 코드 유지)
    const fetchUserProfile = async () => {
      try {
        setLoadingProfile(true);
        // (이 부분은 실제 API가 구현되면 해당 호출로 변경하시면 됩니다)
        setUserProfile({
          summary:
            "최근 심리 검사와 상담챗봇 대화를 종합 분석한 결과, '자기 성찰'에 대한 욕구가 높으며 '대인 관계'에서 약간의 스트레스를 경험하고 있습니다.",
          recommendedTopic: "대인 관계 스트레스 해소",
        });
      } catch (error) {
        console.error("Failed to fetch user profile:", error);
        setUserProfile(null);
      } finally {
        setLoadingProfile(false);
      }
    };

    // 백엔드에서 활성화된 모든 시나리오 목록을 가져오는 함수
    const fetchAllScenarios = async () => {
      try {
        setLoadingScenarios(true);
        const response = await axios.get(`${API_BASE_URL}/list`);
        setScenarios(response.data); // 받아온 데이터로 상태 업데이트
      } catch (err) {
        console.error("시나리오 목록 조회 실패:", err);
        setError("시나리오를 불러오는 데 실패했습니다.");
      } finally {
        setLoadingScenarios(false);
      }
    };

    fetchUserProfile();
    fetchAllScenarios(); // 페이지 로드 시 시나리오 목록을 가져오도록 호출
  }, []); // 최초 1회만 실행

  // 시뮬레이션 시작 처리 함수
  const handleSimulationStart = (scenario) => {
    // 1. localStorage에서 로그인 시 저장했던 사용자 ID를 가져옵니다.
    const loggedInUserId = localStorage.getItem("loggedInUserId");

    // 2. ID가 없으면 (로그인하지 않은 상태) 경고하고 함수를 중단합니다.
    if (!loggedInUserId) {
      alert("로그인이 필요합니다.");
      navigate("/login"); // 로그인 페이지로 이동
      return;
    }

    // 3. 백엔드의 start API를 호출합니다.
    axios
      .post(`${API_BASE_URL}/start`, {
        scenarioId: scenario.scenarioId,
        // 하드코딩된 ID 대신 localStorage에서 가져온 ID를 사용합니다.
        userId: loggedInUserId,
      })
      .then((response) => {
        // 성공 시, 다음 페이지로 state와 함께 이동
        // (실제 사용하는 페이지 경로로 수정해주세요)
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
        alert("시뮬레이션을 시작할 수 없습니다. 잠시 후 다시 시도해주세요.");
      });
  };

  return (
    <div className={styles.container}>
      <UserHeader />

      {/* --- 1. 맞춤형 극복 시뮬레이션 섹션 --- */}
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
              AI가 당신의 상황에 맞춰 특별히 생성한 시나리오를 통해 마음을
              돌보는 시간을 가져보세요.
            </p>
            <button
              className={styles.healingButton}
              onClick={() =>
                alert(
                  `'${userProfile.recommendedTopic}' 극복 시뮬레이션 시작 기능 구현 필요`
                )
              }
            >
              '{userProfile.recommendedTopic}' 극복 시뮬레이션 시작하기
            </button>
          </>
        ) : (
          <p>
            종합 분석 프로필을 불러올 수 없거나, 분석할 데이터(검사 기록, 상담
            내용)가 부족합니다.
          </p>
        )}
      </div>

      <hr className={styles.divider} />

      {/* --- 2. 오늘의 시뮬레이션 섹션 --- */}
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
          // ✅ 백엔드에서 받아온 모든 시나리오를 화면에 표시합니다.
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
