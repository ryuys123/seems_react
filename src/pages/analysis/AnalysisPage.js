import React, { useState, useEffect, useContext } from "react"; // useContext 추가
import axios from "axios";
import styles from "./AnalysisPage.module.css";
import UserHeader from "../../components/common/UserHeader";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import { Doughnut } from "react-chartjs-2";
import UserTaskStatusService from "../../services/UserTaskStatusService"; // 새로 추가
import { AuthContext } from "../../AuthProvider"; // AuthContext 추가

ChartJS.register(ArcElement, Tooltip, Legend);

export default function AnalysisPage() {
  const { userid: userId } = useContext(AuthContext); // AuthContext에서 userId 가져오기

  // userId 상태는 더 이상 필요 없으므로 제거합니다.
  // const [userId, setUserId] = useState(null); // 초기값 null로 설정

  // useEffect(() => {
  //   const storedUserId = localStorage.getItem("loggedInUserId");
  //   if (storedUserId) {
  //     setUserId(storedUserId);
  //   } else {
  //     console.warn("로그인된 사용자 ID를 찾을 수 없습니다.");
  //   }
  // }, []); // 컴포넌트 마운트 시 한 번만 실행

  const [latestResult, setLatestResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [taskStatus, setTaskStatus] = useState(null); // 과제 완료 상태 추가
  const [analysisStarted, setAnalysisStarted] = useState(false); // 분석 시작 여부

  // 과제 완료 상태를 불러오는 useEffect
  useEffect(() => {
    const fetchTaskStatusAndResult = async () => {
      if (!userId) return;
      setLoading(true);
      try {
        const status = await UserTaskStatusService.getUserTaskStatus(userId);
        setTaskStatus(status);
        console.log("DEBUG: status.analysisCompleted:", status.analysisCompleted);

        if (status.analysisCompleted === 1) {
          console.log("DEBUG: Calling getFinalAnalysisResult...");
          const finalResult = await UserTaskStatusService.getFinalAnalysisResult(userId);
          console.log("DEBUG: finalResult received:", finalResult);
          setLatestResult(finalResult);
          console.log("DEBUG: latestResult after set:", finalResult);
        } else {
          setLatestResult(null); // 분석이 완료되지 않았다면 결과 초기화
        }
      } catch (err) {
        console.error("과제 상태 또는 최종 분석 결과를 불러오는데 실패했습니다:", err);
        setError("데이터를 불러오는 데 실패했습니다.");
      } finally {
        setLoading(false);
      }
    };
    fetchTaskStatusAndResult();
  }, [userId]);

  // 분석 결과가 갱신될 때마다 latestResult.emotionId를 localStorage에 저장하는 useEffect를 추가합니다.
  useEffect(() => {
    if (latestResult && latestResult.emotionId) {
      localStorage.setItem('latestAnalysisEmotionId', latestResult.emotionId);
    }
  }, [latestResult]);

  // fetchLatestResult 함수는 이제 사용하지 않으므로 제거하거나 주석 처리합니다.
  

  

  // 모든 과제가 완료되었는지 확인하는 헬퍼 함수
  const areAllTasksCompleted = (status) => {
    if (!status) return false;
    return (
      status.counselingCompleted === 1 &&
      status.personalityTestCompleted === 1 &&
      status.psychImageTestCompleted === 1 &&
      status.depressionTestCompleted === 1 &&
      status.stressTestCompleted === 1
    );
  };

  // "분석 시작" 버튼 클릭 핸들러
  const handleStartAnalysis = async () => {
    if (!userId) {
      alert("로그인이 필요합니다.");
      return;
    }
    if (!areAllTasksCompleted(taskStatus)) {
      alert("모든 심리 분석 과제를 완료해야 통합 분석을 시작할 수 있습니다.");
      return;
    }

    setAnalysisStarted(true); // 분석 시작 상태로 변경
    setLoading(true); // 로딩 시작
    setError(null); // 에러 초기화
    setLatestResult(null); // 기존 분석 결과 초기화

    try {
      // Spring Boot의 통합 분석 API 호출
      const updatedTaskStatus = await UserTaskStatusService.startIntegratedAnalysis(userId);
      setTaskStatus(updatedTaskStatus); // 업데이트된 과제 상태 저장

      if (updatedTaskStatus.analysisCompleted === 1) {
        // 분석이 성공적으로 완료되면 최종 분석 결과를 다시 불러옴
        const finalResult = await UserTaskStatusService.getFinalAnalysisResult(userId);
        setLatestResult(finalResult);
        alert("통합 분석이 성공적으로 완료되었습니다.");
      } else {
        alert("통합 분석을 완료하지 못했습니다. 다시 시도해주세요.");
        setLatestResult(null);
      }
    } catch (err) {
      console.error("통합 분석 시작 실패:", err);
      setError("통합 분석을 시작하는 데 실패했습니다.");
      alert("통합 분석 시작에 실패했습니다: " + (err.response?.data?.error || err.message));
    } finally {
      setLoading(false); // 로딩 종료
      setAnalysisStarted(false); // 분석 시작 상태 해제
    }
  };

  const handleNewAnalysis = () => {
    setLatestResult(null);
    setAnalysisStarted(false);
    setLoading(false); // 초기 상태로 돌아갈 때 로딩 상태도 해제
    // analysisCompleted 상태를 0으로 되돌리는 API 호출이 필요할 수 있습니다.
    // 현재는 DB에서 analysisCompleted가 1이면 계속 1로 유지되므로,
    // '새로 분석 시작하기' 버튼은 단순히 화면을 초기화하는 역할만 합니다.
    // 만약 새로운 분석을 시작할 때 기존 분석 결과를 초기화하고 싶다면,
    // Spring Boot에 analysisCompleted를 0으로 설정하는 API를 추가해야 합니다.
  };

  // 로딩 및 오류 상태 처리
  if (loading) {
    return (
      <>
        <UserHeader />
        <div className={styles.container}>
          <div className={styles.resultCard}>
            <p className={styles.analysisText}>
              데이터를 불러오는 중입니다...
            </p>
          </div>
        </div>
      </>
    );
  }

  if (error) {
    return <><UserHeader /><div className={styles.container}>{error}</div></>;
  }

  // 최종 분석 결과가 있을 경우 (latestResult가 null이 아님)
  if (latestResult) {


    // 분석 결과가 있을 때 표시할 내용
    return (
      <>
        <UserHeader />
        <div className={styles.container}>
          <h1 className={styles.title}> 분석 </h1>

          <div className={styles.resultCard}>
            <h2>최종 심리 분석 결과</h2>

            {/* 개별 검사 결과 표시 */}
            {latestResult.individualResults && latestResult.individualResults.length > 0 && (
              <>
                <h3>개별 심리 검사 결과</h3>
                <div className={styles.individualResults}>
                  {latestResult.individualResults.map((result, index) => {
                    // 각 결과 객체는 하나의 키-값 쌍을 가짐 (예: latestCounselingSummary, latestPersonalityResult 등)
                    const resultType = Object.keys(result)[0];
                    const resultData = result[resultType];

                    switch (resultType) {
                      case 'latestCounselingSummary':
                        return (
                          <div key={index} className={styles.individualResultItem}>
                            <h4>상담 내역 요약</h4>
                            <p><strong>내용:</strong> {resultData.summaryContent}</p>
                            {/* <p><strong>주제:</strong> {resultData.topic}</p>
                            <p><strong>방식:</strong> {resultData.method}</p> */}
                            {/* <p><strong>시간:</strong> {new Date(resultData.startTime).toLocaleString()} ~ {new Date(resultData.endTime).toLocaleString()}</p> */}
                          </div>
                        );
                      case 'latestPersonalityResult':
                        return (
                          <div key={index} className={styles.individualResultItem}>
                            <h4>성격 검사 결과 (MBTI)</h4>
                            <p><strong>유형:</strong> {resultData.result}</p>
                            <p><strong>설명:</strong> {resultData.description}</p>
                          </div>
                        );
                      case 'latestImageResult':
                        return (
                          <div key={index} className={styles.individualResultItem}>
                            <h4>이미지 심리 분석 결과</h4>
                            <p><strong>감정:</strong> {resultData.aiSentiment} (점수: {resultData.aiSentimentScore})</p>
                            <p><strong>창의력 점수:</strong> {resultData.aiCreativityScore}</p>
                            <p><strong>핵심 키워드:</strong> {resultData.aiPerspectiveKeywords}</p>
                            <p><strong>통찰 요약:</strong> {resultData.aiInsightSummary}</p>
                            {/* <p><strong>제안:</strong> {resultData.suggestions}</p> */}
                          </div>
                        );
                      case 'latestDepressionResult':
                        return (
                          <div key={index} className={styles.individualResultItem}>
                            <h4>우울증 척도 검사 결과</h4>
                            <p><strong>총점:</strong> {resultData.totalScore}점</p>
                            <p><strong>해석:</strong> {resultData.interpretation}</p>
                            <p><strong>위험 수준:</strong> {resultData.riskLevel}</p>
                          </div>
                        );
                      case 'latestStressResult':
                        return (
                          <div key={index} className={styles.individualResultItem}>
                            <h4>스트레스 척도 검사 결과</h4>
                            <p><strong>총점:</strong> {resultData.totalScore}점</p>
                            <p><strong>해석:</strong> {resultData.interpretation}</p>
                            <p><strong>위험 수준:</strong> {resultData.riskLevel}</p>
                          </div>
                        );
                      default:
                        return null;
                    }
                  })}
                </div>
              </>
            )}

            <div className={styles.overallAnalysis}>
              <h3>AI 종합 분석</h3>
              <p className={styles.analysisText}>{latestResult.analysisComment}</p>
              {latestResult.dominantEmotion && (
                <div className={styles.aiSuggestion}>
                  <strong>주요 감정:</strong> {latestResult.dominantEmotion}
                </div>
              )}
              {latestResult.suggestions && (
                <div className={styles.aiSuggestion}>
                  <strong>AI 제안:</strong> {latestResult.suggestions}
                </div>
              )}
              {latestResult.dominantEmotion && (
                <p className={styles.highlightBox}>
                  AI가 분석한 당신의 주요 감정! 이 감정을 극복하고 싶다면<br /> 맞춤형 퀘스트, 시뮬레이션, 콘텐츠를 활용해보세요.
                </p>
              )}
              {/* <p>
                <strong>분석 일시:</strong>
                {new Date(latestResult.lastUpdated).toLocaleString()}
              </p> */}
            </div>
          </div>
          <div className={styles.buttonContainer}>
            <button
              onClick={handleNewAnalysis}
              className={styles.startButton}
            >
              새로 분석 시작하기
            </button>
            {/* 맞춤 콘텐츠 추천 바로가기 버튼 제거 */}
          </div>
        </div>
      </>
    );
  }

  // 최종 분석 결과가 없을 경우 (latestResult가 null이고 taskStatus가 로드됨)
  return (
    <>
      <UserHeader />
      <div className={styles.container}>
        <div className={styles.resultCard}>
          <p className={styles.analysisText}>
            {taskStatus && areAllTasksCompleted(taskStatus)
              ? "분석 시작 버튼을 눌러 통합 분석을 진행해주세요."
              : "아직 분석 결과가 없습니다. 모든 심리 테스트에 참여해주세요."}
          </p>
          <div className={styles.taskStatus}>
            <h3>과제 완료 상태:</h3>
            <ul>
              <li>상담: {taskStatus?.counselingCompleted ? "✅" : "❌"}</li>
              <li>성격 검사: {taskStatus?.personalityTestCompleted ? "✅" : "❌"}</li>
              <li>이미지 심리 검사: {taskStatus?.psychImageTestCompleted ? "✅" : "❌"}</li>
              <li>우울증 검사: {taskStatus?.depressionTestCompleted ? "✅" : "❌"}</li>
              <li>스트레스 검사: {taskStatus?.stressTestCompleted ? "✅" : "❌"}</li>
            </ul>
            <button
              onClick={handleStartAnalysis}
              disabled={!taskStatus || !areAllTasksCompleted(taskStatus) || analysisStarted}
              className={styles.startButton}
            >
              {analysisStarted ? "분석 진행 중..." : "분석 시작"}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}