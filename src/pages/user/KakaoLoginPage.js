import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { kakaoLogin } from '../../services/authService';
import styles from './KakaoLoginPage.module.css';

const KakaoLoginPage = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    // 카카오 SDK 로드
    const loadKakaoSDK = () => {
      if (window.Kakao) {
        if (!window.Kakao.isInitialized()) {
          const kakaoAppKey = process.env.REACT_APP_KAKAO_APP_KEY || 'your_kakao_app_key';
          window.Kakao.init(kakaoAppKey);
        }
      } else {
        // 카카오 SDK가 로드되지 않은 경우 동적으로 로드
        const script = document.createElement('script');
        script.src = 'https://developers.kakao.com/sdk/js/kakao.js';
        script.onload = () => {
          const kakaoAppKey = process.env.REACT_APP_KAKAO_APP_KEY || 'your_kakao_app_key';
          window.Kakao.init(kakaoAppKey);
        };
        document.head.appendChild(script);
      }
    };

    loadKakaoSDK();
  }, []);

  const handleKakaoLogin = async () => {
    setIsLoading(true);
    setError('');
    
    try {
      if (!window.Kakao) {
        throw new Error('카카오 SDK가 로드되지 않았습니다.');
      }

      const result = await kakaoLogin();
      
      if (result.success) {
        // 로그인 성공 시 메인 페이지로 이동
        navigate('/dashboard');
      }
    } catch (error) {
      console.error('카카오 로그인 에러:', error);
      setError('로그인에 실패했습니다. 다시 시도해주세요.');
      navigate('/');
    } finally {
      setIsLoading(false);
    }
  };

  const handleBackToLogin = () => {
    navigate('/');
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
            disabled={isLoading}
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

        {error && (
          <div className={styles.errorMessage}>
            {error}
          </div>
        )}

        {isLoading && (
          <div className={styles.loadingMessage}>
            로그인 중...
          </div>
        )}

        <div className={styles.backButton}>
          <button 
            type="button" 
            onClick={() => navigate('/')}
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
