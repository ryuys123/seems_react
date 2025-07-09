// src/pages/test/SelectTestPage.js
import React from "react";
import { useNavigate } from "react-router-dom";
import styles from "./SelectTestPage.module.css"; // CSS Modules 임포트

// 헤더 임포트
import UserHeader from "../../components/common/UserHeader";

const SelectTestPage = () => {
  const navigate = useNavigate();

  const handleStartPsychologyTest = () => {
    navigate("/psychologyTestPage");
  };

  const handleStartPersonalityTest = () => {
    navigate("/personalityTestPage");
  };

  return (
    // 올바른 JSX 반환 부분 (styles 객체를 사용하여 클래스 적용)
    <div className={styles.selectTestContainer}>
      <UserHeader />

      <h1>심리 검사 페이지</h1>

      {/* 심리 검사 섹션 */}
      <div className={styles.testSection}>
        <h2>심리 검사</h2>
        <p>
          자신의 심리 상태를 깊이 이해하고 싶으신가요? 다양한 심리 검사를 통해
          내면을 탐색해 보세요.
        </p>
        <button onClick={handleStartPsychologyTest}>심리 검사 시작하기</button>
      </div>

      {/* 성격 검사 섹션 */}
      <div className={styles.testSection}>
        <h2>성격 검사</h2>
        <p>
          당신은 어떤 성격을 가지고 있나요? 흥미로운 성격 유형 검사를 통해
          자신을 발견해 보세요.
        </p>
        <button onClick={handleStartPersonalityTest}>성격 검사 시작하기</button>
      </div>
    </div>
  );
};

export default SelectTestPage;
