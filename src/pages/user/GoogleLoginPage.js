import React from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './GoogleLogin.module.css';

const GoogleLoginPage = () => {
  const navigate = useNavigate();

  const handleGoogleLogin = () => {
    window.location.href = 'http://localhost:8888/seems/oauth2/authorization/google';
  };

  const handleBackToLogin = () => {
    navigate('/');
  };

  return (
    <div className={styles.container}>
      <div className={styles.loginBox}>
        <div className={styles.header}>
          <h1>구글 로그인</h1>
          <p>구글 계정으로 간편하게 로그인하세요</p>
        </div>
        <div className={styles.googleLoginSection}>
          <button
            onClick={handleGoogleLogin}
            className={styles.googleLoginBtn}
          >
            <div className={styles.googleIcon}>
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path d="M19.8 10.2c0-.6-.1-1.2-.2-1.8H10v3.4h5.5c-.2 1.2-1 2.3-2.1 3v2.5h3.4c2-1.8 3.1-4.5 3.1-7.6z" fill="#4285F4"/>
                <path d="M10 20c2.8 0 5.1-1 6.8-2.6l-3.4-2.5c-.9.6-2.1 1-3.4 1-2.6 0-4.8-1.8-5.6-4.1H1v2.6C2.7 17.9 6.1 20 10 20z" fill="#34A853"/>
                <path d="M4.4 12.7C4.2 12.1 4.1 11.6 4.1 11s.1-1.1.3-1.6V6.8H1C.4 8.2 0 9.6 0 11s.4 2.8 1 4.2l3.4-2.5z" fill="#FBBC04"/>
                <path d="M10 4.4c1.5 0 2.8.5 3.8 1.5l2.8-2.8C14.1 1.3 12.2.5 10 .5 6.1.5 2.7 2.6 1 6.1l3.4 2.5C5.2 6.2 7.4 4.4 10 4.4z" fill="#EA4335"/>
              </svg>
            </div>
            <span>구글로 시작하기</span>
          </button>
        </div>
        <div className={styles.backButton}>
          <button 
            type="button" 
            onClick={handleBackToLogin}
            className={styles.backBtn}
          >
            다른 방법으로 로그인
          </button>
        </div>
      </div>
    </div>
  );
};

export default GoogleLoginPage;
