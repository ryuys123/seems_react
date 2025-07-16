// SelectSimulationPage.js

import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./SelectSimulationPage.module.css";
import UserHeader from "../../components/common/UserHeader";

// 백엔드 API 주소 (프록시 설정을 고려한 상대 경로)
const API_BASE_URL = "/seems/api/simulation";

export default function SelectSimulationPage() {
  const navigate = useNavigate();
  const [scenarios, setScenarios] = useState([]);
  const [recentSetting, setRecentSetting] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [loggedInUserId, setLoggedInUserId] = useState(null);

  useEffect(() => {
    const storedUserId = localStorage.getItem("loggedInUserId");
    if (storedUserId) {
      setLoggedInUserId(storedUserId);
    } else {
      console.warn(
        "로그인된 사용자 ID를 찾을 수 없습니다. 시뮬레이션 기능에 제한이 있을 수 있습니다."
      );
      setLoggedInUserId("default_guest");
    }

    const fetchScenarios = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/scenarios`);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        setScenarios(data);
      } catch (error) {
        console.error("Error fetching scenarios:", error);
        setError("시나리오를 불러오는 데 실패했습니다.");
      }
    };

    const fetchRecentProgress = async (userId) => {
      if (!userId || userId === "default_guest") {
        setRecentSetting(null);
        setLoading(false);
        return;
      }
      try {
        const response = await fetch(`${API_BASE_URL}/resume?userId=${userId}`);
        if (response.ok) {
          const data = await response.json();
          setRecentSetting(data);
        } else if (response.status === 404) {
          setRecentSetting(null);
        } else {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
      } catch (error) {
        console.error("Error fetching recent progress:", error);
      } finally {
        setLoading(false);
      }
    };

    if (storedUserId) {
      fetchScenarios();
      fetchRecentProgress(storedUserId);
    } else {
      fetchScenarios();
      setLoading(false);
    }
  }, []);

  const handleSelect = async (scenario) => {
    if (!loggedInUserId || loggedInUserId === "default_guest") {
      alert("시뮬레이션을 시작하려면 로그인해야 합니다.");
      return;
    }

    try {
      // ✅ 추가된 디버깅용 로그 시작점
      console.log(
        "시뮬레이션 시작 요청 보냄. 시나리오:",
        scenario.scenarioName,
        "사용자 ID:",
        loggedInUserId
      );

      const response = await fetch(`${API_BASE_URL}/start`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          scenarioId: scenario.scenarioId,
          userId: loggedInUserId,
        }),
      });

      if (!response.ok) {
        // ✅ 수정된 부분: 에러 응답을 JSON으로 파싱 시도 (백엔드에서 JSON 에러 보낼 경우)
        let errorMessage = `HTTP error! status: ${response.status}`;
        try {
          const errorData = await response.json();
          if (errorData && errorData.error) {
            errorMessage += ` - ${errorData.error}`;
          } else if (errorData) {
            errorMessage += ` - ${JSON.stringify(errorData)}`;
          }
          console.error("백엔드 에러 응답 데이터:", errorData); // 에러 데이터 로깅
        } catch (jsonError) {
          // JSON이 아닌 일반 텍스트 에러일 경우
          const textError = await response.text();
          errorMessage += ` - ${textError}`;
          console.error("백엔드 에러 응답 텍스트:", textError); // 에러 텍스트 로깅
        }
        throw new Error(errorMessage); // 에러 메시지와 함께 예외 발생
      }

      const firstQuestionData = await response.json();
      // ✅ 추가된 디버깅용 로그
      console.log("백엔드로부터 첫 질문 데이터 받음:", firstQuestionData);

      navigate("/simulation/test", {
        state: {
          scenario: { id: scenario.scenarioId, title: scenario.scenarioName },
          settingId: firstQuestionData.settingId,
          question: firstQuestionData,
        },
      });
      // ✅ 추가된 디버깅용 로그
      console.log("페이지 이동 명령 실행 완료.");
    } catch (error) {
      console.error("시뮬레이션 시작 중 오류 발생:", error);
      // ✅ 수정된 부분: 사용자에게 상세 에러 메시지 표시
      alert(
        "시뮬레이션 시작에 실패했습니다. 다시 시도해 주세요: " + error.message
      );
    }
  };

  const handleResume = () => {
    if (recentSetting) {
      navigate("/simulation/test", {
        state: {
          settingId: recentSetting.settingId,
          scenario: {
            id: recentSetting.scenarioId,
            title: recentSetting.scenarioName,
          },
        },
      });
    }
  };

  if (loading) {
    return <div>시나리오를 불러오는 중입니다...</div>;
  }

  if (error) {
    return (
      <div className={styles.container}>
        <p className={styles.errorText}>{error}</p>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <UserHeader />

      <h2 className={styles.title}>게임 테마를 선택하세요</h2>
      {recentSetting && (
        <div style={{ marginBottom: 24, textAlign: "center" }}>
          <b>최근에 진행한 시나리오:</b> {recentSetting.scenarioName}
          <button style={{ marginLeft: 12 }} onClick={handleResume}>
            이어서 진행하기
          </button>
        </div>
      )}
      <div className={styles.cardsWrapper}>
        {scenarios.length > 0 ? (
          scenarios.map((s) => (
            <div
              key={s.scenarioId}
              className={styles.card}
              onClick={() => handleSelect(s)}
            >
              <div className={styles.cardIcon}>🎮</div>
              <div className={styles.cardTitle}>{s.scenarioName}</div>
              <div className={styles.cardDesc}>{s.description}</div>
            </div>
          ))
        ) : (
          <p>불러올 시나리오가 없습니다.</p>
        )}
      </div>
    </div>
  );
}
