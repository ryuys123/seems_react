import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import styles from "./SimulationTestPage.module.css";
import apiClient from "../../utils/axios"; // axios 대신 apiClient 사용
import UserHeader from "../../components/common/UserHeader";

export default function SimulationTestPage() {
  const { state } = useLocation();
  const navigate = useNavigate();

  // ✨ 1. state에서 데이터를 먼저 추출합니다.
  const { scenario, settingId, question: initialQuestion } = state || {};

  // ✨ 2. 추출한 scenario 객체에서 isCustom 플래그를 확인합니다.
  const isCustom = scenario?.isCustom || false;

  const [currentStep, setCurrentStep] = useState(initialQuestion);
  const [history, setHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isEnded, setIsEnded] = useState(false);
  const [finalResult, setFinalResult] = useState(null);

  useEffect(() => {
    console.log("--- SimulationTestPage Mount/Update ---");
    console.log("State received:", state); // 초기 state 확인
    console.log("Is Custom (from state):", isCustom); // isCustom 값 확인
    console.log("Current Step State:", currentStep); // currentStep의 전체 내용 확인

    if (!scenario || !settingId || !currentStep) {
      alert("시뮬레이션 정보가 올바르지 않습니다. 선택 페이지로 돌아갑니다.");
      navigate("/SelectSimulationPage"); // 올바른 선택 페이지 경로로 수정
    }
  }, [scenario, settingId, currentStep, navigate]);

  // ✨ 3. 사용자가 선택지를 클릭했을 때 호출되는 핵심 함수 (로직 통합)
  const handleSelect = async (option) => {
    setIsLoading(true);
    const newHistoryEntry = {
      // narrative 또는 questionText가 없을 경우 대체 텍스트를 사용 (디버깅용)
      narrative:
        currentStep.narrative || currentStep.questionText || "내용 없음",
      userChoice: option.text,
    };
    const updatedHistory = [...history, newHistoryEntry];
    setHistory(updatedHistory);

    try {
      let response;
      if (isCustom) {
        // '극복 시뮬레이션'의 다음 단계 API 호출
        response = await apiClient.post("/api/simulation/continue/coping", {
          history: updatedHistory,
          choiceText: option.text,
        });
      } else {
        // '일반 시뮬레이션'의 다음 단계 API 호출
        response = await apiClient.post(`/api/simulation/progress`, {
          settingId: settingId,
          questionNumber: currentStep.questionNumber,
          choiceText: option.text,
          selectedTrait: option.trait,
        });
      }

      const nextStepData = response.data;

      if (nextStepData.isSimulationEnded) {
        endSimulation(updatedHistory);
      } else {
        setCurrentStep(nextStepData);
      }
    } catch (error) {
      console.error("Error progressing simulation:", error);
      alert("진행 중 오류가 발생했습니다.");
    } finally {
      setIsLoading(false);
    }
  };

  // 시뮬레이션 완료 및 결과 분석 API 호출
  const endSimulation = async (finalHistory) => {
    setIsLoading(true);
    try {
      const endpoint = isCustom
        ? "/api/simulation/end/coping"
        : `/api/simulation/result/${settingId}`;
      const payload = isCustom ? { history: finalHistory } : {};
      const response = await apiClient.post(endpoint, payload);

      setFinalResult(response.data);
      setIsEnded(true);
    } catch (error) {
      console.error("최종 결과 분석 중 오류:", error);
      alert("최종 결과를 분석하는 데 실패했습니다.");
    } finally {
      setIsLoading(false);
    }
  };

  if (!currentStep) {
    return (
      <div className={styles.container}>
        <UserHeader />
        <p>시뮬레이션을 불러오는 중...</p>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <UserHeader />
      <div className={styles.simulationCard}>
        <h1 className={styles.title}>{scenario.title}</h1>

        {isLoading && (
          <div className={styles.loadingOverlay}>
            {/* 로딩 스피너 등 */}
            <p>AI가 다음 상황을 생성 중입니다...</p>
          </div>
        )}

        {isEnded ? (
          <div className={styles.finalResult}>
            <h2>시뮬레이션 완료</h2>
            <p>
              <strong>종합 분석:</strong> {finalResult?.resultSummary}
            </p>
            <p>
              <strong>최종 제안:</strong>{" "}
              {finalResult?.finalSuggestion || finalResult?.resultTitle}
            </p>
            <button onClick={() => navigate("/SelectSimulationPage")}>
              다른 시뮬레이션 하기
            </button>
          </div>
        ) : (
          <>
            {/* ✨ 4. isCustom 플래그에 따라 다른 UI 렌더링 */}
            {isCustom ? (
              // '극복 시뮬레이션'용 UI
              <div className={styles.narrativeSection}>
                {/* narrative가 있으면 표시, 없으면 경고 메시지 (디버깅용) */}
                <p className={styles.narrative}>
                  {currentStep.narrative || "ERROR: narrative 데이터 없음"}
                </p>
                {currentStep.internalThought && (
                  <p className={styles.internalThought}>
                    "{currentStep.internalThought}"
                  </p>
                )}
              </div>
            ) : (
              // '일반 시뮬레이션'용 UI
              // questionText가 없으면 경고 메시지 (디버깅용)
              <p className={styles.questionText}>
                {currentStep.questionText || "ERROR: questionText 데이터 없음"}
              </p>
            )}

            <div className={styles.optionsWrapper}>
              {currentStep.options?.map((opt, idx) => (
                <button
                  key={idx}
                  className={styles.optionButton}
                  onClick={() => handleSelect(opt)}
                  disabled={isLoading}
                >
                  {opt.text}
                </button>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
