import React, { useEffect, useState } from "react"; // useEffect, useState 다시 필요함
import { useNavigate } from "react-router-dom";
import styles from "./SelectSimulationPage.module.css";
import UserHeader from "../../components/common/UserHeader";

// 백엔드 API 주소 (PsychologyTestPage.js에서처럼 프록시 설정을 고려한 상대 경로)
// package.json에 "proxy": "http://localhost:8888" 설정이 되어 있다면 이렇게 사용합니다.
const API_BASE_URL = "/seems/api/simulation";

// 로그인된 사용자 ID (임시: 실제 사용자 인증 시스템에 맞게 수정 필요)
const USER_ID = "user_12345";

export default function SelectSimulationPage() {
  const navigate = useNavigate();
  // 백엔드에서 불러온 시나리오 목록을 저장합니다.
  const [scenarios, setScenarios] = useState([]);
  // 최근 진행 상황을 저장합니다. (백엔드에서 가져옴)
  const [recentSetting, setRecentSetting] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null); // 에러 상태 추가

  useEffect(() => {
    // 1. 시나리오 목록 가져오기 (GET /api/simulation/scenarios)
    const fetchScenarios = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/scenarios`);
        if (!response.ok) {
          // HTTP 응답이 200 OK가 아니면 에러 처리
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        setScenarios(data);
      } catch (error) {
        console.error("Error fetching scenarios:", error);
        setError("시나리오를 불러오는 데 실패했습니다.");
      }
    };

    // 2. 최근 진행 상황 불러오기 (GET /api/simulation/resume?userId=...)
    const fetchRecentProgress = async () => {
      try {
        const response = await fetch(
          `${API_BASE_URL}/resume?userId=${USER_ID}`
        );

        if (response.ok) {
          const data = await response.json();
          setRecentSetting(data);
        } else if (response.status === 404) {
          // 저장된 진행 상황이 없을 경우 404가 올 수 있으며, 이는 정상적인 상황으로 간주
          setRecentSetting(null);
        } else {
          // 그 외의 HTTP 에러는 예외 처리
          throw new Error(`HTTP error! status: ${response.status}`);
        }
      } catch (error) {
        console.error("Error fetching recent progress:", error);
        // setError("최근 진행 상황을 불러오는 데 실패했습니다."); // 이 에러는 UI에 표시하지 않고 콘솔에만 남길 수도 있음
      } finally {
        // 모든 데이터 로딩이 끝나면 로딩 상태 해제
        setLoading(false);
      }
    };

    // 컴포넌트 마운트 시 두 API 호출을 동시에 시작
    fetchScenarios();
    fetchRecentProgress();
  }, []); // 빈 배열을 넣어 컴포넌트가 처음 렌더링될 때만 실행되도록 함

  // 시나리오 선택 시 백엔드 API를 호출하여 시뮬레이션 시작
  const handleSelect = async (scenario) => {
    try {
      // POST /api/simulation/start 요청
      const response = await fetch(`${API_BASE_URL}/start`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        // 백엔드에 scenarioId와 userId를 전송합니다.
        body: JSON.stringify({
          scenarioId: scenario.scenarioId, // 백엔드에서 받은 시나리오 객체의 ID 필드 사용
          userId: USER_ID,
        }),
      });

      if (!response.ok) {
        throw new Error("시뮬레이션 시작에 실패했습니다.");
      }

      // 백엔드는 첫 질문 정보를 포함한 DTO를 반환합니다.
      const firstQuestionData = await response.json();

      // 시뮬레이션 테스트 페이지로 이동하면서 세션 정보와 첫 질문을 전달합니다.
      navigate("/simulation/test", {
        state: {
          scenario: { id: scenario.scenarioId, title: scenario.scenarioName }, // 시나리오 정보
          settingId: firstQuestionData.settingId, // 백엔드에서 받은 세션 ID
          question: firstQuestionData, // 첫 질문 데이터
        },
      });
    } catch (error) {
      console.error("Error starting simulation:", error);
      alert("시뮬레이션 시작에 실패했습니다. 다시 시도해 주세요.");
    }
  };

  // '이어서 진행하기' 기능 (백엔드 세션 정보를 활용)
  const handleResume = () => {
    if (recentSetting) {
      // 이어서 진행할 때는 settingId를 사용하여 다음 질문 정보를 요청해야 합니다.
      // 여기서는 단순히 세션 정보를 전달하고, SimulationTestPage에서 다음 질문을 로드하도록 구현할 수 있습니다.
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

  // 로딩 중 표시
  if (loading) {
    return <div>시나리오를 불러오는 중입니다...</div>;
  }

  // 에러 발생 시 표시
  if (error) {
    return (
      <div className={styles.container}>
        <p className={styles.errorText}>{error}</p>
      </div>
    );
  }

  // 기존 프런트엔드 UI 렌더링
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
          // 시나리오가 있을 경우에만 맵핑하여 표시
          scenarios.map((s) => (
            // 백엔드에서 받은 데이터 필드명에 맞게 key, title, description 등을 사용합니다.
            <div
              key={s.scenarioId} // 백엔드에서 넘어오는 고유 ID를 key로 사용
              className={styles.card}
              onClick={() => handleSelect(s)}
            >
              <div className={styles.cardIcon}>🎮</div> {/* 임시 아이콘 */}
              <div className={styles.cardTitle}>{s.scenarioName}</div>
              <div className={styles.cardDesc}>{s.description}</div>
            </div>
          ))
        ) : (
          // 불러올 시나리오가 없을 경우 메시지 표시
          <p>불러올 시나리오가 없습니다.</p>
        )}
      </div>
    </div>
  );
}
