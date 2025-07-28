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
    console.log("Setting ID (from state):", settingId); // settingId가 올바르게 넘어오는지 확인

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
        // ✨ 여기에서 settingId를 추가합니다.
        response = await apiClient.post("/api/simulation/continue/coping", {
          settingId: settingId, // ✅ 이전에 저장된 settingId를 전달
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

      // 백엔드 continueCopingSimulation 응답이 Map<String, Object> 형태이므로
      // isSimulationEnded와 nextQuestion/result 필드를 확인합니다.
      const responseData = response.data;

      if (responseData.isSimulationEnded) {
        // 백엔드에서 isSimulationEnded: true와 함께 finalResult DTO를 직접 반환할 때
        setFinalResult(responseData.result); // result 필드에 최종 결과가 담겨 있음
        setIsEnded(true);
      } else {
        // 다음 질문이 오는 경우
        setCurrentStep(responseData.nextQuestion); // nextQuestion 필드에 다음 질문이 담겨 있음
      }
    } catch (error) {
      console.error("Error progressing simulation:", error);
      alert("진행 중 오류가 발생했습니다.");
    } finally {
      setIsLoading(false);
    }
  };

  // 시뮬레이션 완료 및 결과 분석 API 호출 (수정)
  const endSimulation = async (finalHistory) => {
    setIsLoading(true);
    try {
      let response;
      if (isCustom) {
        // 극복 시뮬레이션의 경우, continueCopingSimulation에서 이미 종료 처리가 되므로
        // 이 endSimulation 함수는 호출되지 않거나, 다른 방식으로 처리될 수 있습니다.
        // 현재 로직에서는 continueCopingSimulation에서 isSimulationEnded가 true일 때
        // 이미 최종 결과를 받아서 setFinalResult(responseData.result)로 처리하므로,
        // 이 endSimulation 함수는 (isCustom인 경우) 사실상 호출되지 않습니다.
        // 만약 명시적으로 /api/simulation/end/coping을 호출해야 한다면
        // 다음과 같이 변경해야 합니다.
        response = await apiClient.post("/api/simulation/end/coping", {
          settingId: settingId, // ✅ settingId를 payload에 추가
          history: finalHistory,
        });
        setFinalResult(response.data.result); // 백엔드에서 Map.of("isSimulationEnded": true, "result": finalResult) 형태로 오므로 .result 접근
        setIsEnded(true);
      } else {
        // 일반 시뮬레이션 종료
        response = await apiClient.post(
          `/api/simulation/complete/${settingId}`,
          {}
        ); // /result/{settingId} 대신 /complete/{settingId}
        setFinalResult(response.data); // 일반 시뮬레이션 결과
        setIsEnded(true);
      }
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
            {/* ✨ 5. 최종 결과 표시 로직 강화 */}
            {isCustom && finalResult ? (
              <>
                <p>
                  <strong>시작 스트레스:</strong>{" "}
                  {finalResult.initialStressScore}점
                  <br />
                  <strong>시작 우울감:</strong>{" "}
                  {finalResult.initialDepressionScore}점
                </p>
                <p>
                  <strong>예상 최종 스트레스:</strong>{" "}
                  {finalResult.estimatedFinalStressScore}점
                  <br />
                  <strong>예상 최종 우울감:</strong>{" "}
                  {finalResult.estimatedFinalDepressionScore}점
                </p>
                <p>
                  <strong>시뮬레이션 요약:</strong> {finalResult.resultSummary}
                </p>
                <p>
                  <strong>긍정적 기여 요인:</strong>{" "}
                  {finalResult.positiveContributionFactors}
                </p>
                <p>
                  <strong>결과 제목:</strong> {finalResult.resultTitle}
                </p>
              </>
            ) : (
              // 일반 시뮬레이션 결과 표시 (기존 로직)
              <>
                <p>
                  <strong>종합 분석:</strong> {finalResult?.resultSummary}
                </p>
                <p>
                  <strong>최종 제안:</strong>{" "}
                  {finalResult?.finalSuggestion || finalResult?.resultTitle}
                </p>
              </>
            )}
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
              {/* currentStep.options가 배열인지, 비어있지 않은지 확인 */}
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
                // AI가 마지막 질문에서 options를 비워 반환했을 경우 (선택지 없음)
                // 이 경우 바로 endSimulation이 호출되겠지만, 혹시 모를 상황 대비
                <p>
                  다음 단계로 넘어갈 선택지가 없습니다. 시뮬레이션이 곧
                  종료됩니다.
                </p>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
