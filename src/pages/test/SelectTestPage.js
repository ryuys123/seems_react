// src/pages/test/SelectTestPage.js
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios"; // API 호출을 위해 axios 임포트
import styles from "./SelectTestPage.module.css";
import UserHeader from "../../components/common/UserHeader";

const SelectTestPage = () => {
  const navigate = useNavigate();
  // ✨ 1. 결과 데이터와 로딩 상태를 관리할 state 추가
  const [personalityResult, setPersonalityResult] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // ✨ 2. 컴포넌트가 로드될 때 사용자의 최근 결과를 가져오는 로직
  useEffect(() => {
    const fetchLatestResult = async () => {
      // TODO: 실제 로그인된 사용자 ID 정보를 가져와야 합니다.
      const userId = "1";
      const token = localStorage.getItem("accessToken");

      if (!token) {
        // 토큰이 없으면 로그인하지 않은 사용자로 간주, 검사 시작 버튼을 보여줌
        setIsLoading(false);
        return;
      }

      try {
        const response = await axios.get(
          `/seems/api/personality-test/results/${userId}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        // 결과가 있으면 state에 저장
        setPersonalityResult(response.data);
      } catch (error) {
        // 404 에러 등 결과가 없는 경우는 정상적인 상황이므로 에러 처리하지 않음
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

    fetchLatestResult();
  }, []); // 빈 배열을 전달하여 컴포넌트가 처음 마운트될 때 한 번만 실행

  const handleStartPsychologyTest = () => {
    navigate("/psychologyTestPage");
  };

  const handleStartPersonalityTest = () => {
    navigate("/personalityTestPage");
  };

  return (
    <div className={styles.selectTestContainer}>
      <UserHeader />
      <h1>심심하면 검사나 갈기시죠들</h1>

      {/* 심리 검사 섹션 (기존과 동일) */}
      <div className={styles.testSection}>
        <h2>AI 이미지 심리 검사</h2>
        <p>
          당신의 눈이 멈춘 곳에서 숨겨진 마음을 읽어드립니다. <br />
          AI가 분석하는 이미지 기반 심리 검사를 통해 내면의 이야기를 발견해
          보세요.
        </p>
        <button onClick={handleStartPsychologyTest}>내면 탐색 시작하기</button>
      </div>

      {/* ✨ 3. 성격 검사 섹션 (조건부 렌더링) */}
      <div className={styles.testSection}>
        <h2>성격 검사</h2>
        {isLoading ? (
          <p>최근 검사 기록을 불러오는 중입니다...</p>
        ) : personalityResult ? (
          // 결과가 있는 경우
          <div className={styles.resultSummary}>
            <p>최근 검사에서 나온 당신의 유형은...</p>
            <strong className={styles.resultType}>
              {personalityResult.result}
            </strong>
            <div className={styles.buttonGroup}>
              <button onClick={() => navigate(`/personality-test/result/1`)}>
                상세 결과 보기
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
          // 결과가 없는 경우
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
    </div>
  );
};

export default SelectTestPage;
