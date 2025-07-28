import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./SelectTestPage.module.css";
import UserHeader from "../../components/common/UserHeader";
import apiClient from "../../utils/axios";
import WarningModal from "../../components/modal/WarningModal";

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
      <h1>AI 이미지 심리 분석</h1>
      {/* AI 이미지 심리 분석 섹션에 대한 설명 글 추가 */}
      <p className={styles.sectionDescription}>
        인공지능이 여러분의 이미지를 분석하여 심리 상태를 진단해 드립니다.
      </p>

      {/* 1. AI 이미지 심리 검사 섹션 (맨 위 배치) */}
      <div className={styles.testSection}>
        <h2>AI 이미지 심리 검사</h2>
        {isLoading ? (
          <p>기록을 불러오는 중...</p>
        ) : results.image ? (
          <div className={styles.resultSummary}>
            <p>
              <strong>{userName}</strong>님의 최근 분석 결과:
            </p>
            <p>
              감정 점수: <strong>{results.image.aiSentimentScore}점</strong>
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
              AI가 분석하는 **이미지 기반** 심리 검사를 통해 내면의 이야기를
              발견해 보세요.
            </p>
            <button onClick={() => handleStartTest("/psychologyTestPage")}>
              내면 탐색 시작하기
            </button>
          </>
        )}
      </div>

      {/* --- 수평선으로 시각적 구분 추가 --- */}
      <hr />

      {/* '일반 심리 검사' 그룹 시작 */}
      <h1 className={styles.subheading}>일반 심리 검사</h1>
      <p className={styles.sectionDescription}>
        MBTI 성격 유형, 우울감, 스트레스 수준을 파악하는 다양한 심리 검사입니다.
      </p>

      {/* 2. MBTI 성격 검사 섹션 (AI 이미지 검사 바로 밑 배치) */}
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

      {/* --- 수평선으로 시각적 구분 추가 --- */}
      <hr />

      {/* 3. 우울증 & 스트레스 검사 섹션 (가장 아래에 2단 그리드 배치) */}
      <h2 className={styles.subheading}>정신 건강 검사</h2>
      <p className={styles.sectionDescription}>
        자신의 우울감 및 스트레스 수준을 파악해 볼 수 있는 검사입니다.
      </p>

      <div className={styles.bottomGridContainer}>
        {/* 우울증 검사 섹션 (왼쪽 열) */}
        <div className={styles.gridItem}>
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
                <p>자신의 우울감 수준을 설문을 통해 확인해보세요.</p>
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
        </div>

        {/* 스트레스 검사 섹션 (오른쪽 열) */}
        <div className={styles.gridItem}>
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
        </div>
      </div>
      {/* --- 그리드 레이아웃을 사용하는 하단 컨테이너 끝 --- */}

      <WarningModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onConfirm={handleModalConfirm}
      />
    </div>
  );
};

export default SelectTestPage;
