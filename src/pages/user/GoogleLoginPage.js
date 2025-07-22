import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { GoogleLogin } from '@react-oauth/google';
import { googleLogin } from '../../services/authService';
import styles from './GoogleLogin.module.css';

const GoogleLoginPage = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  // Google 클라이언트 ID가 유효한지 확인
  const googleClientId = process.env.REACT_APP_GOOGLE_CLIENT_ID;
  const isValidGoogleClientId = googleClientId && googleClientId !== 'your_google_client_id';

  const handleGoogleSuccess = async (credentialResponse) => {
    setIsLoading(true);
    setError('');
    
    try {
      const result = await googleLogin(credentialResponse.credential);
      
      if (result.success) {
        // 로그인 성공 시 메인 페이지로 이동
        navigate('/dashboard');
      }
    } catch (error) {
      console.error('Google 로그인 에러:', error);
      setError('로그인에 실패했습니다. 다시 시도해주세요.');
      navigate('/');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleError = () => {
    setError('Google 로그인에 실패했습니다. 다시 시도해주세요.');
  };

  const handleBackToLogin = () => {
    navigate('/login');
  };

  // Google 클라이언트 ID가 설정되지 않은 경우
  if (!isValidGoogleClientId) {
    return (
      <div className={styles.container}>
        <div className={styles.loginBox}>
          <div className={styles.header}>
            <h1>Google 로그인</h1>
            <p>Google 로그인 설정이 필요합니다</p>
          </div>
          
          <div className={styles.errorMessage}>
            Google OAuth 클라이언트 ID가 설정되지 않았습니다.<br />
            .env 파일에 REACT_APP_GOOGLE_CLIENT_ID를 설정해주세요.
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

  return (
    <div className={styles.container}>
      <div className={styles.loginBox}>
        <div className={styles.header}>
          <h1>Google 로그인</h1>
          <p>Google 계정으로 간편하게 로그인하세요</p>
        </div>

        <div className={styles.googleLoginSection}>
          <GoogleLogin
            onSuccess={handleGoogleSuccess}
            onError={handleGoogleError}
            useOneTap
            theme="filled_blue"
            size="large"
            text="continue_with"
            shape="rectangular"
            width="100%"
            disabled={isLoading}
          />
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
            style={{marginTop: 24}}
          >
            다른 방법으로 로그인
          </button>
        </div>
      </div>
    </div>
  );
};

export default GoogleLoginPage;
