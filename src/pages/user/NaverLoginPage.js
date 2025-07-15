import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { naverLogin } from '../../services/AuthService'; // 이 import는 필요함
import styles from './NaverLoginPage.module.css';

const NaverLoginPage = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [sdkLoaded, setSdkLoaded] = useState(false);
  const navigate = useNavigate();

  // 네이버 클라이언트 ID가 유효한지 확인 (수정됨)
  const naverClientId = process.env.REACT_APP_NAVER_CLIENT_ID;
  const isValidNaverClientId = naverClientId && naverClientId !== 'your_naver_client_id';

  // 네이버 SDK 초기화 함수
  const initializeNaverSDK = () => {
    if (window.naver && window.naver.LoginWithNaverId) {
      try {
        const naverLoginInstance = new window.naver.LoginWithNaverId({
          clientId: naverClientId,
          callbackUrl: `${window.location.origin}/auth/naver/callback`,
          isPopup: false,
          loginButton: { color: "green", type: 3, height: 60 }
        });
        
        naverLoginInstance.init();
        setSdkLoaded(true);
        console.log('네이버 SDK 초기화 완료');
      } catch (error) {
        console.error('네이버 SDK 초기화 실패:', error);
        setError('네이버 로그인 초기화에 실패했습니다.');
      }
    }
  };

  useEffect(() => {
    const loadNaverSDK = () => {
      if (window.naver) {
        initializeNaverSDK();
        return;
      }

      const existingScript = document.querySelector('script[src*="naveridlogin_js_sdk"]');
      if (existingScript) {
        const checkSDK = setInterval(() => {
          if (window.naver) {
            clearInterval(checkSDK);
            initializeNaverSDK();
          }
        }, 100);
        return;
      }

      const script = document.createElement('script');
      script.src = 'https://static.nid.naver.com/js/naveridlogin_js_sdk_2.0.2.js';
      
      script.onload = () => {
        console.log('네이버 SDK 로드 완료');
        initializeNaverSDK();
      };
      
      script.onerror = (error) => {
        console.error('네이버 SDK 로드 실패:', error);
        setError('네이버 로그인 서비스를 불러올 수 없습니다.');
      };
      
      document.head.appendChild(script);
    };

    if (isValidNaverClientId) {
      loadNaverSDK();
    }
  }, [isValidNaverClientId, naverClientId]);

  const handleNaverLogin = async () => {
    if (!sdkLoaded || !window.naver) {
      setError('네이버 로그인 서비스를 불러올 수 없습니다.');
      return;
    }

    setIsLoading(true);
    setError('');
    
    try {
      // 방법 1: 직접 SDK 사용 (리다이렉트)
      const naverLoginInstance = new window.naver.LoginWithNaverId({
        clientId: naverClientId,
        callbackUrl: `${window.location.origin}/auth/naver/callback`,
        isPopup: false
      });
      
      naverLoginInstance.authorize();
      
      // 방법 2: AuthService 사용 (팝업 방식)
      // const result = await naverLogin();
      // if (result.success) {
      //   navigate('/dashboard');
      // }
      
    } catch (error) {
      console.error('네이버 로그인 에러:', error);
      setError('로그인에 실패했습니다. 다시 시도해주세요.');
      setIsLoading(false);
    }
  };

  const handleBackToLogin = () => {
    navigate('/');
  };

  // 네이버 클라이언트 ID가 설정되지 않은 경우
  if (!isValidNaverClientId) {
    return (
      <div className={styles.container}>
        <div className={styles.loginBox}>
          <div className={styles.header}>
            <h1>네이버 로그인</h1>
            <p>네이버 로그인 설정이 필요합니다</p>
          </div>
          
          <div className={styles.errorMessage}>
            네이버 OAuth 클라이언트 ID가 설정되지 않았습니다.<br />
            .env 파일에 REACT_APP_NAVER_CLIENT_ID를 설정해주세요.
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
  }

  // SDK가 로드되지 않은 경우 로딩 상태 표시
  if (!sdkLoaded) {
    return (
      <div className={styles.container}>
        <div className={styles.loginBox}>
          <div className={styles.header}>
            <h1>네이버 로그인</h1>
            <p>네이버 로그인 서비스를 불러오는 중...</p>
          </div>
          <div className={styles.loadingMessage}>
            로딩 중...
          </div>
        </div>
      </div>
    );
  }

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
            disabled={isLoading}
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
            onClick={handleBackToLogin}
            className={styles.backBtn}
            style={{marginTop: 24}}
          >
            다른 방법으로 로그인
          </button>
        </div>
      </div>
    </div>
  );
};

export default NaverLoginPage;