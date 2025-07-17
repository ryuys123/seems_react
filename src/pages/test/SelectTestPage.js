import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import styles from "./SelectTestPage.module.css";
import UserHeader from "../../components/common/UserHeader";

const SelectTestPage = () => {
  const navigate = useNavigate();
  const [personalityResult, setPersonalityResult] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // ✨ 1. localStorage에서 사용하는 키와 사용자 정보를 하나의 변수로 정리합니다.
  const userName = localStorage.getItem("userName") || "사용자";
  const loggedInUserId = localStorage.getItem("loggedInUserId");

  // ✨ 2. useEffect 로직을 수정하여 페이지에 다시 돌아올 때마다 데이터를 갱신합니다.
  useEffect(() => {
    const fetchLatestResult = async () => {
      const token = localStorage.getItem("accessToken");

      if (!token || !loggedInUserId) {
        setIsLoading(false);
        return;
      }

      try {
        // 로딩 상태를 true로 설정하여 사용자에게 피드백을 줍니다.
        setIsLoading(true);
        const response = await axios.get(
          `/seems/api/personality-test/results/${loggedInUserId}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        setPersonalityResult(response.data);
      } catch (error) {
        if (error.response && error.response.status === 404) {
          console.log("이전 성격 검사 결과가 없습니다.");
          setPersonalityResult(null);
        } else {
          console.error("결과를 불러오는 중 오류 발생:", error);
        }
      } finally {
        setIsLoading(false);
      }
    };

    // 페이지가 처음 로드될 때 즉시 데이터를 가져옵니다.
    fetchLatestResult();

    // 다른 탭이나 창에 갔다가 다시 돌아왔을 때(focus) 데이터를 새로고침합니다.
    window.addEventListener("focus", fetchLatestResult);

    // 컴포넌트가 사라질 때 등록했던 이벤트 리스너를 깨끗하게 제거합니다. (메모리 누수 방지)
    return () => {
      window.removeEventListener("focus", fetchLatestResult);
    };
  }, [loggedInUserId]); // loggedInUserId가 바뀔 때만 이 effect 설정을 다시 실행합니다.

  const handleStartPsychologyTest = () => {
    navigate("/psychologyTestPage"); // 이 부분은 이전 그대로 유지합니다.
  };

  const handleStartPersonalityTest = () => {
    navigate("/personality-test/1"); // 이 부분은 이전 그대로 유지합니다.
  };

  // <<-- 우울증 검사 시작 버튼 핸들러 (새로 추가되는 부분)
  const handleStartDepressionTest = () => {
    navigate("/psychological-test/depression"); // 우울증 검사 페이지로 이동
  };

  // <<-- 스트레스 검사 시작 버튼 핸들러 (새로 추가되는 부분)
  const handleStartStressTest = () => {
    navigate("/psychological-test/stress"); // 스트레스 검사 페이지로 이동
  };

  return (
    <div className={styles.selectTestContainer}>
      <UserHeader />
      <h1>AI 심리 분석</h1>

      <div className={styles.testSection}>
        <h2>AI 이미지 심리 검사</h2>
        <p>
          당신의 눈이 멈춘 곳에서 숨겨진 마음을 읽어드립니다. <br />
          AI가 분석하는 이미지 기반 심리 검사를 통해 내면의 이야기를 발견해
          보세요.
        </p>
        <button onClick={handleStartPsychologyTest}>내면 탐색 시작하기</button>
      </div>

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
                onClick={handleStartPersonalityTest}
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

      {/* <<-- 우울증 검사 섹션 추가 (새로 추가되는 부분) */}
      <div className={styles.testSection}>
        <h2>우울증 검사</h2>
        <p>자신의 우울감 수준을 간단한 설문을 통해 확인해보세요.</p>
        <button onClick={handleStartDepressionTest}>검사 시작하기</button>
      </div>

      {/* <<-- 스트레스 검사 섹션 추가 (새로 추가되는 부분) */}
      <div className={styles.testSection}>
        <h2>스트레스 검사</h2>
        <p>일상생활에서 느끼는 스트레스 수준을 측정합니다.</p>
        <button onClick={handleStartStressTest}>검사 시작하기</button>
      </div>
    </div>
  );
};

export default SelectTestPage;
