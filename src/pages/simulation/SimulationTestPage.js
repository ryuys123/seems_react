// src/pages/simulation/SimulationTestPage.js

import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import styles from "./SimulationTestPage.module.css";
import apiClient from "../../utils/axios";
import UserHeader from "../../components/common/UserHeader";

console.log("--- SimulationTestPage.js 파일 로드됨 ---");

export default function SimulationTestPage() {
  const { state } = useLocation();
  const navigate = useNavigate();

  const { scenario, settingId, question: initialQuestion } = state || {};

  const [currentStep, setCurrentStep] = useState(initialQuestion);
  const [history, setHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isEnded, setIsEnded] = useState(false);
  const [finalResult, setFinalResult] = useState(null); // 이 상태는 이제 SimulationResultPage로 넘겨줄 예정이므로, 여기서는 직접 사용하지 않을 수 있습니다.

  useEffect(() => {
    console.log("--- SimulationTestPage Mount/Update ---");
    console.log("State received:", state);
    console.log("Current Step State:", currentStep);
    console.log("Setting ID (from state):", settingId);

    if (!scenario || !settingId || !currentStep) {
      alert("시뮬레이션 정보가 올바르지 않습니다. 선택 페이지로 돌아갑니다.");
      navigate("/simulation");
    }
  }, [scenario, settingId, currentStep, navigate]);

  // 사용자가 선택지를 클릭했을 때 호출되는 핵심 함수
  const handleSelect = async (option) => {
    setIsLoading(true);
    const newHistoryEntry = {
      narrative: currentStep.questionText || "내용 없음",
      userChoice: option.text,
    };
    const updatedHistory = [...history, newHistoryEntry];
    setHistory(updatedHistory);

    try {
      const response = await apiClient.post("/api/simulation/continue", {
        settingId: settingId,
        history: updatedHistory,
        choiceText: option.text,
      });

      const responseData = response.data;

      if (responseData.isSimulationEnded) {
        // ✅ 시뮬레이션이 종료되면 SimulationResultPage로 이동
        // settingId는 이미 가지고 있으므로, 이 ID를 가지고 결과 페이지로 이동합니다.
        navigate(`/simulation/result-details/${settingId}`); // ✅ 변경된 부분
        // setFinalResult(responseData.result); // 이 부분은 이제 필요 없습니다.
        // setIsEnded(true); // 이 상태도 이제 필요 없습니다.
      } else {
        setCurrentStep(responseData.nextQuestion);
      }
    } catch (error) {
      console.error("Error progressing simulation:", error);
      alert("진행 중 오류가 발생했습니다.");
    } finally {
      setIsLoading(false);
    }
  };

  // endSimulation 함수는 handleSelect에서 isSimulationEnded가 true일 때 자동으로 처리되므로,
  // 이 함수는 사실상 더 이상 사용되지 않습니다.
  const endSimulation = async (finalHistory) => {
    // 이 함수 로직은 이제 /api/simulation/continue 응답에서 isSimulationEnded가 true일 때 처리되므로,
    // 이 함수 자체를 호출할 필요가 없어집니다.
    console.log("endSimulation 함수는 더 이상 직접 호출되지 않을 수 있습니다.");
    // 이 함수를 제거하거나, 주석 처리하거나, 다른 목적으로 재사용할 수 있습니다.
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
            <p>AI가 다음 상황을 생성 중입니다...</p>
          </div>
        )}

        {/* ✅ isEnded 관련 UI 로직을 제거합니다. */}
        {/* 시뮬레이션이 종료되면 이 컴포넌트가 언마운트되고 SimulationResultPage로 이동합니다. */}
        <>
          <div className={styles.narrativeSection}>
            <p className={styles.narrative}>
              {currentStep.questionText ||
                "ERROR: 질문 데이터를 불러올 수 없습니다."}
            </p>
            {currentStep.internalThought && (
              <p className={styles.internalThought}>
                "{currentStep.internalThought}"
              </p>
            )}
          </div>

          <div className={styles.optionsWrapper}>
            {Array.isArray(currentStep.options) &&
            currentStep.options.length > 0 ? (
              currentStep.options.map((opt, idx) => (
                <button
                  key={idx}
                  className={styles.optionButton}
                  onClick={() => handleSelect(opt)}
                  disabled={isLoading}
                >
                  {opt.text}
                </button>
              ))
            ) : (
              <p>
                다음 단계로 넘어갈 선택지가 없습니다. 시뮬레이션이 곧
                종료됩니다.
              </p>
            )}
          </div>
        </>
      </div>
    </div>
  );
}
