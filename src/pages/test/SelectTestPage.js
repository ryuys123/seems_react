import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./SelectTestPage.module.css";
import UserHeader from "../../components/common/UserHeader";
import { getLatestPsychologicalImageResult, getLatestScaleResult } from "../../services/TestService";
import apiClient from "../../utils/axios";

const SelectTestPage = () => {
  const navigate = useNavigate();
  const [personalityResult, setPersonalityResult] = useState(null);
  const [depressionResult, setDepressionResult] = useState(null);
  const [stressResult, setStressResult] = useState(null);
  const [imageTestResult, setImageTestResult] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const userName = localStorage.getItem("userName") || "사용자";
  const loggedInUserId = localStorage.getItem("loggedInUserId");

  const fetchAllLatestResults = async () => {
    if (!loggedInUserId) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    try {
      // Fetch MBTI result
      const mbtiResponse = await apiClient.get(`/api/personality-test/results/${loggedInUserId}`);
      setPersonalityResult(mbtiResponse.data);
    } catch (error) {
      if (error.response && error.response.status === 404) {
        setPersonalityResult(null);
      } else {
        console.error("MBTI 결과를 불러오는 중 오류 발생:", error);
      }
    }

    try {
      // Fetch Depression result
      const depressionResponse = await getLatestScaleResult(loggedInUserId, "DEPRESSION_SCALE");
      setDepressionResult(depressionResponse);
    } catch (error) {
      console.error("우울증 검사 결과를 불러오는 중 오류 발생:", error);
    }

    try {
      // Fetch Stress result
      const stressResponse = await getLatestScaleResult(loggedInUserId, "STRESS_SCALE");
      setStressResult(stressResponse);
    } catch (error) {
      console.error("스트레스 검사 결과를 불러오는 중 오류 발생:", error);
    }

    try {
      // Fetch Image Test result
      const imageResponse = await getLatestPsychologicalImageResult(loggedInUserId);
      setImageTestResult(imageResponse);
    } catch (error) {
      console.error("이미지 심리 검사 결과를 불러오는 중 오류 발생:", error);
    }

    setIsLoading(false);
  };

  useEffect(() => {
    fetchAllLatestResults();
    window.addEventListener("focus", fetchAllLatestResults);
    return () => {
      window.removeEventListener("focus", fetchAllLatestResults);
    };
  }, [loggedInUserId]);

  const handleStartPsychologyTest = () => {
    navigate("/psychologyTestPage");
  };

  const handleStartPersonalityTest = () => {
    navigate("/personality-test/1");
  };

  const handleStartDepressionTest = () => {
    navigate("/psychological-test/depression");
  };

  const handleStartStressTest = () => {
    navigate("/psychological-test/stress");
  };

  const handleRestartTest = async (testType) => {
    // In a real application, you might want to clear the previous test results from DB
    // For now, we just clear the state and allow starting a new test.
    if (testType === "MBTI") {
      setPersonalityResult(null);
      navigate("/personality-test/1");
    } else if (testType === "DEPRESSION") {
      setDepressionResult(null);
      navigate("/psychological-test/depression");
    } else if (testType === "STRESS") {
      setStressResult(null);
      navigate("/psychological-test/stress");
    } else if (testType === "IMAGE") {
      setImageTestResult(null);
      navigate("/psychologyTestPage");
    }
  };

  return (
    <div className={styles.selectTestContainer}>
      <UserHeader />
      <h1>AI 심리 분석</h1>

      {/* AI 이미지 심리 검사 섹션 */}
      <div className={styles.testSection}>
        <h2>AI 이미지 심리 검사</h2>
        {isLoading ? (
          <p>최근 검사 기록을 불러오는 중입니다...</p>
        ) : imageTestResult ? (
          <div className={styles.resultSummary}>
            <p>
              <strong>{userName}</strong>님의 최근 이미지 심리 검사 결과:
            </p>
            <p>주요 감정: {imageTestResult.aiSentiment} (점수: {imageTestResult.aiSentimentScore})</p>
            <p>통찰 요약: {imageTestResult.aiInsightSummary.substring(0, Math.min(imageTestResult.aiInsightSummary.length, 100))}...</p>
            <div className={styles.buttonGroup}>
              <button onClick={() => navigate(`/psychology-result/${imageTestResult.resultId}?type=IMAGE_TEST`)}>
                상세 결과 보기
              </button>
              <button onClick={() => handleRestartTest("IMAGE")}>
                다시 검사하기
              </button>
            </div>
          </div>
        ) : (
          <>
            <p>
              당신의 눈이 멈춘 곳에서 숨겨진 마음을 읽어드립니다. <br />
              AI가 분석하는 이미지 기반 심리 검사를 통해 내면의 이야기를 발견해
              보세요.
            </p>
            <button onClick={handleStartPsychologyTest}>내면 탐색 시작하기</button>
          </>
        )}
      </div>

      {/* MBTI 성격 검사 섹션 */}
      <div className={styles.testSection}>
        <h2>MBTI 성격 검사</h2>
        {isLoading ? (
          <p>최근 검사 기록을 불러오는 중입니다...</p>
        ) : personalityResult ? (
          <div className={styles.resultSummary}>
            <p>
              <strong>{userName}</strong>님의 최근 검사에서 나온 유형은...
            </p>
            <strong className={styles.resultType}>
              {personalityResult.result}
            </strong>
            <p className={styles.mbtiTitle}>{personalityResult.mbtiTitle}</p>
            <div className={styles.buttonGroup}>
              <button
                onClick={() =>
                  navigate(`/personality-test/result/${loggedInUserId}`)
                }
              >
                상세 결과 보기
              </button>
              <button
                onClick={() =>
                  navigate(`/personality-test/history/${loggedInUserId}`)
                }
              >
                나의 검사 기록
              </button>
              <button
                onClick={() => handleRestartTest("MBTI")}
                className={styles.secondaryButton}
              >
                다시 검사하기
              </button>
            </div>
          </div>
        ) : (
          <>
            <p>
              당신은 어떤 성격을 가지고 있나요? 흥미로운 성격 유형 검사를 통해
              자신을 발견해 보세요.
            </p>
            <button onClick={handleStartPersonalityTest}>
              성격 검사 시작하기
            </button>
          </>
        )}
      </div>

      {/* 우울증 검사 섹션 */}
      <div className={styles.testSection}>
        <h2>우울증 검사</h2>
        {isLoading ? (
          <p>최근 검사 기록을 불러오는 중입니다...</p>
        ) : depressionResult ? (
          <div className={styles.resultSummary}>
            <p>
              <strong>{userName}</strong>님의 최근 우울증 검사 결과:
            </p>
            <p>총점: {depressionResult.totalScore}점</p>
            <p>위험도: {depressionResult.riskLevel}</p>
            <div className={styles.buttonGroup}>
              <button onClick={() => navigate(`/psychology-result/${depressionResult.resultId}?type=DEPRESSION_SCALE`)}>
                상세 결과 보기
              </button>
              <button onClick={() => handleRestartTest("DEPRESSION")}>
                다시 검사하기
              </button>
            </div>
          </div>
        ) : (
          <>
            <p>자신의 우울감 수준을 간단한 설문을 통해 확인해보세요.</p>
            <button onClick={handleStartDepressionTest}>검사 시작하기</button>
          </>
        )}
      </div>

      {/* 스트레스 검사 섹션 */}
      <div className={styles.testSection}>
        <h2>스트레스 검사</h2>
        {isLoading ? (
          <p>최근 검사 기록을 불러오는 중입니다...</p>
        ) : stressResult ? (
          <div className={styles.resultSummary}>
            <p>
              <strong>{userName}</strong>님의 최근 스트레스 검사 결과:
            </p>
            <p>총점: {stressResult.totalScore}점</p>
            <p>위험도: {stressResult.riskLevel}</p>
            <div className={styles.buttonGroup}>
              <button onClick={() => navigate(`/psychology-result/${stressResult.resultId}?type=STRESS_SCALE`)}>
                상세 결과 보기
              </button>
              <button onClick={() => handleRestartTest("STRESS")}>
                다시 검사하기
              </button>
            </div>
          </div>
        ) : (
          <>
            <p>일상생활에서 느끼는 스트레스 수준을 측정합니다.</p>
            <button onClick={handleStartStressTest}>검사 시작하기</button>
          </>
        )}
      </div>
    </div>
  );
};

export default SelectTestPage;

