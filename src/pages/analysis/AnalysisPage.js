// src/pages/AnalysisPage.js
import React, { useState, useEffect } from "react";
import axios from "axios";
import styles from "./AnalysisPage.module.css"; // PsychologyResultPage.module.css의 스타일 재사용
import UserHeader from "../../components/common/UserHeader";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import { Doughnut } from "react-chartjs-2";

ChartJS.register(ArcElement, Tooltip, Legend);

function AnalysisPage() {
  // ⭐️ 임시 userId 설정. 실제 앱에서는 로그인 세션에서 가져와야 합니다.
  const userId = "testUser123";

  const [latestResult, setLatestResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchLatestResult = async () => {
      if (!userId) {
        // userId가 없을 경우 (로그인 안 된 상태)
        setLoading(false);
        setError("로그인 정보가 없습니다.");
        return;
      }

      try {
        setLoading(true);
        // ⭐️ 백엔드의 새로운 엔드포인트 호출: /latest-result/{userId}
        const response = await axios.get(
          `/seems/api/psychological-test/latest-result/${userId}`
        );

        setLatestResult(response.data);
        setError(null);
      } catch (err) {
        console.error("최신 분석 결과를 불러오는데 실패했습니다:", err);
        // 404 Not Found (결과 없음) 상태 처리
        if (err.response && err.response.status === 404) {
          setLatestResult(null);
        } else {
          setError("최신 분석 결과를 불러오는 데 실패했습니다.");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchLatestResult();
  }, [userId]);

  // 로딩 및 오류 상태 처리
  if (loading) {
    return (
      <div className={styles.container}>최신 분석 결과를 불러오는 중...</div>
    );
  }

  if (error) {
    return <div className={styles.container}>{error}</div>;
  }

  // 결과가 없을 경우 (사용자가 분석을 한 적이 없는 경우)
  if (!latestResult) {
    return (
      <div className={styles.container}>
        <UserHeader />
        <div className={styles.resultCard}>
          <h2>최신 심리 분석 결과</h2>
          <p className={styles.analysisText}>
            아직 분석 결과가 없습니다. 심리 테스트에 참여해주세요.
          </p>
        </div>
      </div>
    );
  } // ⭐️ 게이지 차트 데이터 준비 및 정규화

  const sentimentScore = latestResult.aiSentimentScore || 0;
  const creativityScore = latestResult.aiCreativityScore || 0; // 창의력 점수 데이터 (Doughnut 차트용)

  const creativityData = {
    labels: ["점수", "잔여"],
    datasets: [
      {
        data: [creativityScore, 100 - creativityScore], // 점수와 잔여 점수
        backgroundColor: ["#42a5f5", "#e0e0e0"], // 파란색과 회색
        hoverBackgroundColor: ["#1e88e5", "#bdbdbd"],
        borderColor: ["#42a5f5", "#e0e0e0"],
        borderWidth: 1,
      },
    ],
  };

  // 창의력 점수 옵션 (반원 게이지)
  const creativityOptions = {
    cutout: "80%", // 도넛 두께
    circumference: 180, // 반원 (180도)
    rotation: -90, // 상단 중앙 시작
    plugins: {
      legend: { display: false },
      tooltip: { enabled: true },
    },
    maintainAspectRatio: false,
  };

  // 분석 결과가 있을 때 표시할 내용
  return (
    <div className={styles.container}>
      <UserHeader />
      <h1 className={styles.title}> 분석 </h1>

      <div className={styles.resultCard}>
        <h2>최근 이미지 심리 분석 결과</h2>
        <p className={styles.analysisText}>{latestResult.aiInsightSummary}</p>
        {/* 게이지 차트 섹션 */}
        <div className={styles.gaugeContainer}>
          <h3>분석 점수 시각화</h3>

          <div className={styles.gaugeItem}>
            <h4>감정 점수 ({latestResult.aiSentiment})</h4>
            {/* 감정 점수 (텍스트만 표시) */}
            <p
              style={{
                fontSize: "2em",
                fontWeight: "bold",
                color: sentimentScore >= 0 ? "#2ecc71" : "#e74c3c",
              }}
            >
              {sentimentScore.toFixed(2)}
            </p>

            <p style={{ fontSize: "0.9em", color: "#666", marginTop: "5px" }}>
              (최소: -1.0, 최대: 1.0)
            </p>
          </div>

          <div className={styles.gaugeItem}>
            <h4>창의력 점수</h4>
            {/* ⭐️ Doughnut 차트 렌더링 추가 */}
            <div
              style={{
                position: "relative",
                width: 150,
                height: 150,
                margin: "0 auto",
              }}
            >
              <Doughnut data={creativityData} options={creativityOptions} />
              {/* 점수를 차트 중앙에 표시 */}
              <div
                style={{
                  position: "absolute",
                  top: "70%",
                  left: "50%",
                  transform: "translate(-50%, -50%)",
                  textAlign: "center",
                  fontWeight: "bold",
                  fontSize: "1.5em",
                }}
              >
                {creativityScore.toFixed(0)}점
              </div>
            </div>
          </div>
        </div>
        {/* ⭐️ 추가 분석 정보 표시 - 클래스 적용 */}
        <div className={styles.additionalInfo}>
          <h3>상세 분석 및 제안</h3>
          {/* ⭐️ 핵심 키워드에 .keywords 클래스 적용 */}
          <p className={styles.keywords}>
            <strong>핵심 키워드:</strong>
            {latestResult.aiPerspectiveKeywords || "N/A"}
          </p>
          {/* ⭐️ AI 제안에 .aiSuggestion 클래스 적용 */}
          <div className={styles.aiSuggestion}>
            <strong>AI 제안:</strong> {latestResult.suggestions || "제안 없음"}
          </div>
          <p>
            <strong>테스트 일시:</strong>
            {new Date(latestResult.testDateTime).toLocaleString()}
          </p>
        </div>
      </div>
    </div>
  );
}

export default AnalysisPage;
