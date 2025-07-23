import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import styles from "./SimulationTestPage.module.css";
import axios from "axios"; // 간결한 API 호출을 위해 axios 사용

const API_BASE_URL = "http://localhost:8888/seems/api/simulation"; // 백엔드 주소

export default function SimulationTestPage() {
  const { state } = useLocation();
  const navigate = useNavigate();

  // SelectSimulationPage에서 전달받은 초기 데이터
  const { scenario, settingId, question: initialQuestion } = state || {};

  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // 1. 페이지 시작 시, 초기 데이터 설정
  useEffect(() => {
    if (!scenario || !settingId || !initialQuestion) {
      alert("시뮬레이션 정보가 올바르지 않습니다. 메인 페이지로 돌아갑니다.");
      navigate("/simulation"); // SelectSimulationPage의 경로로 수정
      return;
    }
    setCurrentQuestion(initialQuestion);
    setIsLoading(false);
  }, [scenario, settingId, initialQuestion, navigate]);

  // 2. 사용자가 선택지를 클릭했을 때 호출되는 핵심 함수
  const handleSelect = async (option) => {
    console.log("선택한 옵션:", option); // 여기 추가
    setIsLoading(true);

    try {
      // 2-1. /progress API 호출하여 사용자의 선택을 백엔드에 전송
      const response = await axios.post(`${API_BASE_URL}/progress`, {
        settingId: settingId,
        questionNumber: currentQuestion.questionNumber,
        choiceText: option.text,
        selectedTrait: option.trait,
      });

      const nextStep = response.data;

      // 2-2. 백엔드로부터 받은 종료 신호 확인 (isSimulationEnded)
      if (nextStep && nextStep.isSimulationEnded) {
        // 2-3. 시뮬레이션이 끝났으면, 최종 결과 요청
        handleSimulationCompletion();
      } else {
        // 2-4. 다음 질문이 있으면 상태 업데이트
        setCurrentQuestion(nextStep);
      }
    } catch (error) {
      console.error("Error progressing simulation:", error);
      alert("진행 중 오류가 발생했습니다. 다시 시도해 주세요.");
    } finally {
      setIsLoading(false);
    }
  };

  // 3. 시뮬레이션 완료 및 결과 분석 API 호출
  const handleSimulationCompletion = async () => {
    try {
      const response = await axios.post(
        `${API_BASE_URL}/complete/${settingId}`
      );
      const resultData = response.data;

      // 3-1. 최종 결과를 받아 결과 페이지로 이동
      navigate("/simulation/result", {
        state: { analysisResult: resultData, scenarioTitle: scenario.title },
      });
    } catch (error) {
      console.error("Error completing simulation:", error);
      alert("결과 분석 중 오류가 발생했습니다.");
    }
  };

  // 로딩 중이거나 질문 데이터가 없으면 로딩 화면 표시
  if (isLoading || !currentQuestion) {
    return (
      <div className={styles.loadingContainer}>시뮬레이션을 불러오는 중...</div>
    );
  }

  // 메인 UI 렌더링
  return (
    <div className={styles.container}>
      <h2 className={styles.title}>{scenario.title}</h2>

      <p className={styles.questionText}>{currentQuestion.questionText}</p>

      <div className={styles.optionsWrapper}>
        {currentQuestion.options?.map((opt, idx) => (
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
    </div>
  );
}
