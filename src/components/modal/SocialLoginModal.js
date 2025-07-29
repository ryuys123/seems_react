import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../AuthProvider';
import styles from './SocialLoginModal.module.css';

const SocialLoginModal = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const { updateTokens } = useContext(AuthContext);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // postMessage 이벤트 리스너
  useEffect(() => {
    const handleMessage = (event) => {
      console.log('소셜 로그인 postMessage 수신:', event.data);
      
      if (event.data && typeof event.data === 'object') {
        const data = event.data;
        
        if (data.type === 'social-login-success') {
          // 기존 사용자 로그인 성공
          handleLoginSuccess(data);
        } else if (data.type === 'social-signup-needed') {
          // 신규 사용자 회원가입 필요
          handleSignupNeeded(data);
        } else if (data.status === 'error') {
          // 에러 처리
          handleError(data.message);
        }
      }
    };

    if (isOpen) {
      window.addEventListener('message', handleMessage);
      return () => window.removeEventListener('message', handleMessage);
    }
  }, [isOpen]);

  const handleLoginSuccess = (data) => {
    try {
      setIsLoading(true);
      
      // 토큰 저장
      updateTokens(data.token, data.refreshToken || "");
      localStorage.setItem("userName", data.userName || "");
      localStorage.setItem("userId", data.userId || "");
      localStorage.setItem("email", data.email || "");
      
      // 소셜 로그인 타입 저장
      if (data.provider) {
        localStorage.setItem('social-login', data.provider);
      }
      
      console.log('소셜 로그인 성공:', data);
      onClose();
      navigate("/userdashboard");
    } catch (error) {
      console.error('로그인 처리 오류:', error);
      handleError('로그인 처리 중 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignupNeeded = (data) => {
    try {
      // 신규 사용자 - 회원가입 페이지로 이동
      console.log('신규 사용자 - 회원가입 페이지로 이동');
      alert("등록되지 않은 계정입니다. 소셜 회원가입 후 이용해주세요.");
      onClose();
      navigate("/signup");
    } catch (error) {
      console.error('회원가입 페이지 이동 오류:', error);
      handleError('회원가입 페이지 이동 중 오류가 발생했습니다.');
    }
  };

  const handleError = (message) => {
    setError(message);
    setIsLoading(false);
    setTimeout(() => setError(null), 5000);
  };

  const handleSocialLogin = (provider) => {
    setIsLoading(true);
    setError(null);
    
    // 백엔드 OAuth2 엔드포인트로 리다이렉트
    const authUrl = `http://localhost:8888/seems/oauth2/authorization/${provider}`;
    
    // 팝업 창으로 열기
    const popup = window.open(
      authUrl,
      'socialLogin',
      'width=500,height=600,scrollbars=yes,resizable=yes'
    );
    
    // 팝업이 차단된 경우 처리
    if (!popup || popup.closed || typeof popup.closed === 'undefined') {
      handleError('팝업이 차단되었습니다. 팝업 차단을 해제하고 다시 시도해주세요.');
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modal}>
        <div className={styles.modalHeader}>
          <h2>소셜 로그인</h2>
          <button className={styles.closeButton} onClick={onClose}>
            ✕
          </button>
        </div>
        
        <div className={styles.modalContent}>
          {error && (
            <div className={styles.errorMessage}>
              {error}
            </div>
          )}
          
          <div className={styles.socialButtons}>
            <button
              className={`${styles.socialButton} ${styles.googleButton}`}
              onClick={() => handleSocialLogin('google')}
              disabled={isLoading}
            >
              <div className={styles.socialIcon}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                </svg>
              </div>
              <span>Google로 시작하기</span>
            </button>
            
            <button
              className={`${styles.socialButton} ${styles.kakaoButton}`}
              onClick={() => handleSocialLogin('kakao')}
              disabled={isLoading}
            >
              <div className={styles.socialIcon}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <path d="M12 3C6.48 3 2 6.48 2 11c0 4.52 2.29 8.53 5.47 9.59L6.62 23l1.06-1.06c.53.08 1.07.12 1.62.12 5.52 0 10-3.48 10-8s-4.48-8-7-8z" fill="#FEE500"/>
                  <path d="M12 5c-3.31 0-6 2.69-6 6s2.69 6 6 6c.55 0 1.09-.04 1.62-.12L17.38 23l-1.06-1.06C13.71 17.53 12 14.54 12 11s1.71-6.53 4.32-7.59L15.38 3l-1.06 1.06C12.91 4.04 12.45 4 12 4z" fill="#000"/>
                </svg>
              </div>
              <span>Kakao로 시작하기</span>
            </button>
            
            <button
              className={`${styles.socialButton} ${styles.naverButton}`}
              onClick={() => handleSocialLogin('naver')}
              disabled={isLoading}
            >
              <div className={styles.socialIcon}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <path d="M16.273 12.04L7.376 0H0v24h7.727V9.96l8.897 12.04H24V0h-3.727v12.04z" fill="#03C75A"/>
                </svg>
              </div>
              <span>Naver로 시작하기</span>
            </button>
          </div>
          
          {isLoading && (
            <div className={styles.loadingMessage}>
              로그인 처리 중...
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SocialLoginModal; 