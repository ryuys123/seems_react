import React, { useState, useEffect } from "react";
import axios from "axios";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import UserHeader from "../../components/common/UserHeader";
import styles from "./PsychologyResultPage.module.css";

function PsychologyResultPage() {
  const { resultId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchResult = async () => {
      try {
        setLoading(true);
        setError(null);

        const params = new URLSearchParams(location.search);
        const type = params.get("type");

        if (!type || type.trim() === "") {
          setError(
            "결과를 불러오기 위한 검사 유형(type) 정보가 URL에 없습니다."
          );
          setLoading(false);
          return;
        }

        const response = await axios.get(
          `/seems/api/psychological-test/result/${resultId}?testType=${type}`
        );

        setResult(response.data);
      } catch (err) {
        console.error("결과를 불러오는데 실패했습니다:", err);
        const errorMessage =
          err.response?.data?.message || "서버 상태를 확인해주세요.";
        setError(`결과를 불러오는 데 실패했습니다: ${errorMessage}`);
      } finally {
        setLoading(false);
      }
    };

    if (resultId) {
      fetchResult();
    }
  }, [resultId, location.search, navigate]);

  if (loading) {
    return (
      <div className={styles.container}>
        <UserHeader />
        <p>결과를 불러오는 중입니다...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.container}>
        <UserHeader />
        <p className={styles.errorText}>오류 발생: {error}</p>
        <button onClick={() => navigate(-1)} className={styles.backButton}>
          뒤로 가기
        </button>
      </div>
    );
  }

  if (!result) {
    return (
      <div className={styles.container}>
        <UserHeader />
        <p>결과 데이터를 찾을 수 없습니다.</p>
      </div>
    );
  }

  // 👇 이 부분을 수정했습니다.
  const isScaleTest = result.testType === "PSYCHOLOGICAL_SCALE";
  const isImageTest = result.testType === "IMAGE_TEST";

  return (
    <>
      <UserHeader />
      <div className={styles.container}>
        <h1 className={styles.title}>심리 검사 결과</h1>
        <div className={styles.resultCard}>
          <p className={styles.subtitle}>검사 ID: {result.resultId}</p>
          <p className={styles.subtitle}>사용자 ID: {result.userId}</p>
          <p className={styles.subtitle}>검사 유형: {result.testType}</p>
          {result.diagnosisCategory && (
            <p className={styles.subtitle}>
              검사 항목: {result.diagnosisCategory}
            </p>
          )}
          <p className={styles.subtitle}>
            검사 일시: {new Date(result.testDateTime).toLocaleString()}
          </p>

          {isScaleTest && (
            <div className={styles.section}>
              <h2>척도 기반 분석 결과</h2>
              <p>
                <strong>총점:</strong> {result.totalScore}
              </p>
              <p>
                <strong>해석:</strong> {result.interpretationText}
              </p>
              <p>
                <strong>위험 수준:</strong> {result.riskLevel}
              </p>
              <p>
                <strong>제안:</strong> {result.suggestions}
              </p>
            </div>
          )}

          {isImageTest && (
            <div className={styles.section}>
              <h2>이미지를 통한 심리 분석 결과</h2>
              <p>
                <strong>AI 감정 분석:</strong> {result.aiSentiment} (
                {result.aiSentimentScore})
              </p>
              <p>
                <strong>AI 창의력 점수:</strong> {result.aiCreativityScore}
              </p>
              <p>
                <strong>AI 핵심 키워드:</strong> {result.aiPerspectiveKeywords}
              </p>
              <p>
                <strong>AI 통찰 요약:</strong> {result.aiInsightSummary}
              </p>
              <p>
                <strong>AI 제안:</strong> {result.suggestions}
              </p>
            </div>
          )}

          {!(isScaleTest || isImageTest) && (
            <p className={styles.warningText}>
              결과를 표시할 수 없는 검사 유형입니다 ({result.testType}).
            </p>
          )}
        </div>
        <button className={styles.backButton} onClick={() => navigate(-1)}>
          뒤로 가기
        </button>
      </div>
    </>
  );
}

export default PsychologyResultPage;
