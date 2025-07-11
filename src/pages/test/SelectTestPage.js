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

      <h1>심심하면 검사나 갈기시죠들</h1>

      {/* 심리 검사 섹션 */}
      <div className={styles.testSection}>
        <h2>AI 이미지 심리 검사</h2>
        <p>
          당신의 눈이 멈춘 곳에서 숨겨진 마음을 읽어드립니다. <br />
          AI가 분석하는 이미지 기반 심리 검사를 통해 내면의 이야기를 발견해
          보세요.
        </p>
        <button onClick={handleStartPsychologyTest}>내면 탐색 시작하기</button>
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
