import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import styles from "./SimulationTestPage.module.css";

// 백엔드 API 주소 (SelectSimulationPage와 동일)
const API_BASE_URL = "http://localhost:8080/api/simulation";

// 이전에 하드코딩된 데이터는 제거합니다. (scenarioFlows, traitFeedback, scenarioResults)

export default function SimulationTestPage() {
  const { state } = useLocation();
  const navigate = useNavigate();

  // SelectSimulationPage에서 전달받은 정보
  // settingId: 백엔드에서 생성된 세션 ID
  // scenario: 시나리오 이름 등 (예: { id: 1, title: '로맨스' })
  // firstQuestion: 시뮬레이션 시작 시 백엔드가 제공한 첫 질문 데이터 (SimulationQuestionDTO)
  const { scenario, settingId, question: initialQuestion } = state || {};

  // 현재 질문 상태 및 세션 정보를 관리합니다.
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showResult, setShowResult] = useState(false);
  // AI 분석 결과를 저장합니다.
  const [analysisResult, setAnalysisResult] = useState(null);
  // 분기형 내러티브는 백엔드에서 제공하는 nextNarrative를 사용합니다.
  const [narrative, setNarrative] = useState(null);

  // 컴포넌트 마운트 시 초기 질문 설정 또는 중간 저장된 세션 로드
  useEffect(() => {
    if (!scenario || !settingId) {
      // 시나리오나 세션 정보가 없으면 홈으로 리다이렉트
      navigate("/simulation");
      return;
    }

    if (initialQuestion) {
      // SelectSimulationPage에서 첫 질문을 받은 경우
      setCurrentQuestion(initialQuestion);
      setIsLoading(false);
    } else {
      // '이어서 진행하기'로 들어온 경우 (settingId만 있음)
      // TODO: 백엔드에서 해당 세션의 현재 질문을 조회하는 API가 필요합니다.
      // 예를 들어, GET /api/simulation/questions?settingId={settingId}
      // 현재 백엔드 서비스에는 이 API가 없으므로 임시로 로딩 상태를 유지합니다.
      console.log(
        "Resuming simulation. Fetching current question from backend..."
      );
      setIsLoading(false); // 임시로 로딩 종료
      // 실제 구현 시 백엔드 API를 호출하여 currentQuestion을 설정해야 합니다.
    }
  }, [scenario, settingId, initialQuestion, navigate]);

  // 사용자가 선택지를 클릭했을 때 호출
  const handleSelect = async (option) => {
    setIsLoading(true);

    try {
      // 1. 선택지 정보를 백엔드에 전송 (POST /api/simulation/progress)
      const response = await fetch(`${API_BASE_URL}/progress`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          settingId: settingId,
          questionNumber: currentQuestion.questionNumber,
          choiceText: option.text,
          selectedTrait: option.trait, // AI 분석을 위해 선택된 성향 특성 전달
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to progress simulation");
      }

      // 2. 백엔드에서 다음 질문 정보를 받아옵니다. (SimulationQuestionDTO)
      const nextData = await response.json();

      // 3. 분기형 내러티브 업데이트
      setNarrative(option.nextNarrative || null);

      // 4. 다음 질문이 null이거나 AI가 종료를 지시하는 경우, 결과 분석 단계로 이동
      // 백엔드에서 '종료' 여부를 알려줄 수 있지만, 현재는 다음 질문이 없으면 종료로 간주합니다.
      if (!nextData || nextData.questionId === null) {
        // 시뮬레이션 종료
        await handleSimulationCompletion();
      } else {
        // 다음 질문으로 업데이트
        setCurrentQuestion(nextData);
      }
    } catch (error) {
      console.error("Error progressing simulation:", error);
      alert("진행 중 오류가 발생했습니다. 다시 시도해 주세요.");
    } finally {
      setIsLoading(false);
    }
  };

  // 시뮬레이션 완료 및 결과 분석 API 호출
  const handleSimulationCompletion = async () => {
    try {
      // POST /api/simulation/complete/{settingId}
      const response = await fetch(`${API_BASE_URL}/complete/${settingId}`, {
        method: "POST",
      });

      if (!response.ok) {
        throw new Error("Failed to complete simulation and get results");
      }

      // 백엔드에서 AI 분석 결과(SimulationResultDTO)를 받아옵니다.
      const resultData = await response.json();
      setAnalysisResult(resultData);
      setShowResult(true);
    } catch (error) {
      console.error("Error completing simulation:", error);
      alert("결과 분석 중 오류가 발생했습니다.");
    }
  };

  // UI 렌더링
  if (!currentQuestion && isLoading) {
    return <div>로딩 중...</div>;
  }

  if (showResult && analysisResult) {
    // 결과 페이지 렌더링
    return (
      <div className={styles.resultContainer}>
        <h2>{analysisResult.resultSummary}</h2> {/* AI 분석 결과 요약 */}
        {narrative && (
          <div
            style={{
              color: "#888",
              fontSize: "1.05rem",
              marginBottom: 16,
              textAlign: "center",
            }}
          >
            {narrative}
          </div>
        )}
        <div style={{ margin: "24px 0 16px 0" }}>
          <b>당신의 성격 유형:</b> {analysisResult.personalityType}
        </div>
        {/* * 백엔드에서 trait별 피드백까지 제공한다면 해당 데이터를 사용합니다.
         * 현재 백엔드 구조(SimulationResultDTO)에는 요약과 성격 유형만 있습니다.
         */}
        <button
          className={styles.retryButton}
          onClick={() => navigate("/simulation")}
        >
          다시 테스트하기
        </button>
      </div>
    );
  }

  if (!currentQuestion) {
    // AI가 질문을 생성하지 못했거나 초기 로딩 실패
    return <div>시뮬레이션 데이터를 불러올 수 없습니다.</div>;
  }

  // 시뮬레이션 진행 페이지 렌더링
  return (
    <div className={styles.container}>
      <h2 className={styles.title}>{scenario.title}</h2>
      {narrative && (
        <div
          style={{
            color: "#888",
            fontSize: "1.05rem",
            marginBottom: 12,
            textAlign: "center",
          }}
        >
          {narrative}
        </div>
      )}
      {isLoading ? (
        <div>다음 질문을 AI가 생성하는 중입니다...</div>
      ) : (
        <>
          {/* currentQuestion.questionText는 AI가 생성한 질문입니다. */}
          <p className={styles.description}>{currentQuestion.questionText}</p>
          <div className={styles.optionsWrapper}>
            {/* currentQuestion.options는 AI가 생성한 선택지 목록입니다. */}
            {currentQuestion.options &&
              currentQuestion.options.map((opt, idx) => (
                <button
                  key={idx}
                  className={styles.optionButton}
                  onClick={() => handleSelect(opt)}
                  disabled={isLoading}
                >
                  <span className={styles.optionIcon}>{opt.icon || ""}</span>
                  {opt.text}
                </button>
              ))}
          </div>
        </>
      )}
    </div>
  );
}
