import React, { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import UserHeader from "../../components/common/UserHeader";
import styles from "./PsychologyResultPage.module.css";
import { getPsychologicalTestResult } from "../../services/TestService";

function PsychologyResultPage() {
  const { resultId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    console.log(`PsychologyResultPage: useEffect 실행 - resultId: ${resultId}, location.search: ${location.search}`);
    const fetchResult = async () => {
      if (!resultId) {
        setError("결과 ID가 제공되지 않았습니다.");
        setLoading(false);
        return;
      }

      // URL 쿼리 파라미터에서 testType을 가져옵니다.
      const queryParams = new URLSearchParams(location.search);
      const testType = queryParams.get('type');

      console.log(`PsychologyResultPage: testType 추출됨 - ${testType}`);

      if (!testType) {
        setError("검사 유형(testType)이 제공되지 않았습니다.");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const data = await getPsychologicalTestResult(resultId, testType);
        setResult(data);
      } catch (err) {
        setError("결과를 불러오는 데 실패했습니다.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchResult();
  }, [resultId, location.search]);

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
        <button onClick={() => navigate("/SelectTestPage")} className={styles.backButton}>
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

  const isScaleTest = result.testType === "PSYCHOLOGICAL_SCALE";
  const isImageTest = result.testType === "PSYCHOLOGICAL_IMAGE" || result.testType === "IMAGE_TEST";

  return (
    <>
      <UserHeader />
      <div className={styles.container}>
        <h1 className={styles.title}>심리 검사 결과</h1>
        <div className={styles.resultCard}>
          {isScaleTest && (
            <div className={styles.section}>
              <h2>{result.diagnosisCategory} 검사 결과</h2>
              <p>
                <strong>총점:</strong> {result.totalScore}점
              </p>
              <p>
                <strong>위험 수준:</strong> {result.riskLevel}
              </p>
              <p>
                <strong>결과 해석:</strong> {result.interpretation}
              </p>
              <p>
                <strong>제안:</strong> {result.suggestions}
              </p>
            </div>
          )}

          {isImageTest && (
            <div className={styles.section}>
              <h2>이미지 심리 분석 결과</h2>
              <p>
                <strong>AI 감정 분석:</strong> {result.aiSentiment} (점수:{" "}
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
        <button className={styles.backButton} onClick={() => navigate("/SelectTestPage")}>
          뒤로 가기
        </button>
      </div>
    </>
  );
}

export default PsychologyResultPage;
