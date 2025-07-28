import React from 'react';
import styles from './NaverLoginPage.module.css';

const NaverLoginPage = () => {
  const handleNaverLogin = () => {
    window.location.href = 'http://localhost:8888/seems/oauth2/authorization/naver';
  };

  return (
    <div className={styles.container}>
      <div className={styles.loginBox}>
        <div className={styles.header}>
          <h1>네이버 로그인</h1>
          <p>네이버 계정으로 간편하게 로그인하세요</p>
        </div>
        <div className={styles.naverLoginSection}>
          <button
            onClick={handleNaverLogin}
            className={styles.naverLoginBtn}
          >
            <div className={styles.naverIcon}>
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path d="M16.273 12.04L7.376 0H0v20h7.727V7.96l8.897 12.04H20V0h-3.727v12.04z" fill="currentColor"/>
              </svg>
            </div>
            <span>네이버로 시작하기</span>
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

export default NaverLoginPage;