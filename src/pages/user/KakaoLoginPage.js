import React from 'react';
import styles from './KakaoLoginPage.module.css';

const KakaoLoginPage = () => {
  const handleKakaoLogin = () => {
    window.location.href = 'http://localhost:8080/auth/kakao/login';
  };

  return (
    <div className={styles.container}>
      <div className={styles.loginBox}>
        <div className={styles.header}>
          <h1>카카오 로그인</h1>
          <p>카카오 계정으로 간편하게 로그인하세요</p>
        </div>
        <div className={styles.kakaoLoginSection}>
          <button
            onClick={handleKakaoLogin}
            className={styles.kakaoLoginBtn}
          >
            <div className={styles.kakaoIcon}>
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path d="M10 1C4.48 1 0 4.58 0 9C0 11.55 1.25 13.85 3.25 15.45L2.5 18.5C2.4 18.9 2.8 19.2 3.15 19L6.5 17C7.5 17.35 8.7 17.5 10 17.5C15.52 17.5 20 13.92 20 9C20 4.08 15.52 1 10 1Z" fill="currentColor"/>
              </svg>
            </div>
            <span>카카오로 시작하기</span>
          </button>
        </div>
        <div className={styles.backButton}>
          <button 
            type="button" 
            onClick={() => window.location.href = '/'}
            className={styles.backBtn}
          >
            다른 방법으로 로그인
          </button>
        </div>
      </div>
    </div>
  );
};

export default KakaoLoginPage;
