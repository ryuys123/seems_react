import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./SelectTestPage.module.css";
import UserHeader from "../../components/common/UserHeader";
import apiClient from "../../utils/axios";
import WarningModal from "../../components/modal/WarningModal";

// ✨ 1. 이미지 검사 결과의 aiSentiment를 위험도로 변환하는 함수 추가
const getImageTestRiskLevel = (sentiment) => {
  switch (sentiment) {
    case "매우 긍정적":
    case "긍정적":
      return "안정적인 상태";
    case "중립":
      return "보통";
    case "부정적":
      return "주의 필요";
    case "매우 부정적":
      return "높은 주의 필요";
    default:
      return "분석 중";
  }
};

const SelectTestPage = () => {
  const navigate = useNavigate();
  const [results, setResults] = useState({
    personality: null,
    depression: null,
    stress: null,
    image: null,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [targetTestPath, setTargetTestPath] = useState(null);

  const userName = localStorage.getItem("userName") || "사용자";
  const loggedInUserId = localStorage.getItem("loggedInUserId");

  useEffect(() => {
    const fetchAllLatestResults = async () => {
      if (!loggedInUserId) {
        setIsLoading(false);
        return;
      }
      setIsLoading(true);

      // ✨ 2. 여러 API를 동시에 병렬로 요청하여 로딩 속도를 개선합니다.
      const promises = [
        apiClient
          .get(`/api/personality-test/results/${loggedInUserId}`)
          .catch(() => null),
        apiClient
          .get(
            `/api/psychological-test/latest-scale-result/${loggedInUserId}/DEPRESSION_SCALE`
          )
          .catch(() => null),
        apiClient
          .get(
            `/api/psychological-test/latest-scale-result/${loggedInUserId}/STRESS_SCALE`
          )
          .catch(() => null),
        apiClient
          .get(`/api/psychological-test/latest-image-result/${loggedInUserId}`)
          .catch(() => null),
      ];

      const [mbtiRes, depressionRes, stressRes, imageRes] =
        await Promise.allSettled(promises);

      setResults({
        personality:
          mbtiRes.status === "fulfilled" ? mbtiRes.value?.data : null,
        depression:
          depressionRes.status === "fulfilled"
            ? depressionRes.value?.data
            : null,
        stress: stressRes.status === "fulfilled" ? stressRes.value?.data : null,
        image: imageRes.status === "fulfilled" ? imageRes.value?.data : null,
      });

      setIsLoading(false);
    };

    fetchAllLatestResults();
    window.addEventListener("focus", fetchAllLatestResults);
    return () => window.removeEventListener("focus", fetchAllLatestResults);
  }, [loggedInUserId]);

  const handleStartTest = (path) => navigate(path);

  const handleStartSensitiveTest = (path) => {
    setTargetTestPath(path);
    setIsModalOpen(true);
  };

  const handleModalConfirm = () => {
    if (targetTestPath) navigate(targetTestPath);
    setIsModalOpen(false);
  };

  return (
    <div className={styles.selectTestContainer}>
      <UserHeader />
      <h1>AI 심리 분석</h1>

      {/* AI 이미지 심리 검사 섹션 */}
      <div className={styles.testSection}>
        <h2>AI 이미지 심리 검사</h2>
        {isLoading ? (
          <p>기록을 불러오는 중...</p>
        ) : results.image ? (
          <div className={styles.resultSummary}>
            {/* ✨ 3. 이미지 심리 검사 요약에 점수와 위험도를 추가합니다. */}
            <p>
              <strong>{userName}</strong>님의 최근 분석 결과:
            </p>
            <p>
              감정 점수: <strong>{results.image.aiSentimentScore}점</strong>
            </p>
            <p>
              감정 상태:{" "}
              <strong>
                {getImageTestRiskLevel(results.image.aiSentiment)}
              </strong>
            </p>
            <div className={styles.buttonGroup}>
              <button
                onClick={() =>
                  navigate(
                    `/psychological-test/result/${results.image.resultId}?type=IMAGE_TEST`
                  )
                }
              >
                상세 보기
              </button>
              <button
                onClick={() => handleStartTest("/psychologyTestPage")}
                className={styles.secondaryButton}
              >
                다시 검사
              </button>
            </div>
          </div>
        ) : (
          <>
            <p>
              AI가 분석하는 이미지 기반 심리 검사를 통해 내면의 이야기를 발견해
              보세요.
            </p>
            <button onClick={() => handleStartTest("/psychologyTestPage")}>
              내면 탐색 시작하기
            </button>
          </>
        )}
      </div>

      {/* MBTI 성격 검사 섹션 */}
      <div className={styles.testSection}>
        <h2>MBTI 성격 검사</h2>
        {isLoading ? (
          <p>기록을 불러오는 중...</p>
        ) : results.personality ? (
          <div className={styles.resultSummary}>
            <p>
              <strong>{userName}</strong>님의 최근 유형: <br></br>
              <strong className={styles.resultType}>
                {results.personality.result}
              </strong>
            </p>
            <p className={styles.mbtiTitle}>{results.personality.mbtiTitle}</p>
            <div className={styles.buttonGroup}>
              <button
                onClick={() =>
                  navigate(`/personality-test/result/${loggedInUserId}`)
                }
              >
                상세 보기
              </button>
              <button
                onClick={() =>
                  navigate(`/personality-test/history/${loggedInUserId}`)
                }
              >
                기록 보기
              </button>
              <button
                onClick={() => handleStartTest("/personality-test/1")}
                className={styles.secondaryButton}
              >
                다시 검사
              </button>
            </div>
          </div>
        ) : (
          <>
            <p>흥미로운 성격 유형 검사를 통해 자신을 발견해 보세요.</p>
            <button onClick={() => handleStartTest("/personality-test/1")}>
              성격 검사 시작하기
            </button>
          </>
        )}
      </div>

      {/* 우울증 검사 섹션 */}
      <div className={styles.testSection}>
        <h2>우울증 검사</h2>
        {isLoading ? (
          <p>기록을 불러오는 중...</p>
        ) : results.depression ? (
          <div className={styles.resultSummary}>
            <p>
              <strong>{userName}</strong>님의 최근 우울증 검사 결과:
            </p>
            <p>
              총점: <strong>{results.depression.totalScore}점</strong>
            </p>
            <p>
              위험도: <strong>{results.depression.riskLevel}</strong>
            </p>
            <div className={styles.buttonGroup}>
              <button
                onClick={() =>
                  navigate(
                    `/psychological-test/result/${results.depression.resultId}?type=DEPRESSION_SCALE`
                  )
                }
              >
                상세 보기
              </button>
              <button
                onClick={() =>
                  handleStartSensitiveTest("/psychological-test/depression")
                }
                className={styles.secondaryButton}
              >
                다시 검사
              </button>
            </div>
          </div>
        ) : (
          <>
            <p>자신의 우울감 수준을 간단한 설문을 통해 확인해보세요.</p>
            <button
              onClick={() =>
                handleStartSensitiveTest("/psychological-test/depression")
              }
            >
              검사 시작하기
            </button>
          </>
        )}
      </div>

      {/* 스트레스 검사 섹션 */}
      <div className={styles.testSection}>
        <h2>스트레스 검사</h2>
        {isLoading ? (
          <p>기록을 불러오는 중...</p>
        ) : results.stress ? (
          <div className={styles.resultSummary}>
            <p>
              <strong>{userName}</strong>님의 최근 스트레스 검사 결과:
            </p>
            <p>
              총점: <strong>{results.stress.totalScore}점</strong>
            </p>
            <p>
              위험도: <strong>{results.stress.riskLevel}</strong>
            </p>
            <div className={styles.buttonGroup}>
              <button
                onClick={() =>
                  navigate(
                    `/psychological-test/result/${results.stress.resultId}?type=STRESS_SCALE`
                  )
                }
              >
                상세 보기
              </button>
              <button
                onClick={() =>
                  handleStartSensitiveTest("/psychological-test/stress")
                }
                className={styles.secondaryButton}
              >
                다시 검사
              </button>
            </div>
          </div>
        ) : (
          <>
            <p>일상생활에서 느끼는 스트레스 수준을 측정합니다.</p>
            <button
              onClick={() =>
                handleStartSensitiveTest("/psychological-test/stress")
              }
            >
              검사 시작하기
            </button>
          </>
        )}
      </div>

      <WarningModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onConfirm={handleModalConfirm}
      />
    </div>
  );
};

export default SelectTestPage;
