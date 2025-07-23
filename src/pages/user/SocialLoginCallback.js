import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { googleLogin, kakaoLogin, naverLogin } from '../../services/authService';
import styles from './SocialLoginCallback.module.css';

const SocialLoginCallback = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const handleCallback = async () => {
      try {
        const provider = searchParams.get('provider');
        const code = searchParams.get('code');
        const state = searchParams.get('state');
        const error = searchParams.get('error');

        if (error) {
          throw new Error('소셜 로그인에 실패했습니다.');
        }

        if (!provider || !code) {
          throw new Error('필수 파라미터가 누락되었습니다.');
        }

        let result;
        switch (provider) {
          case 'google':
            result = await googleLogin(code);
            break;
          case 'kakao':
            result = await kakaoLogin(code);
            break;
          case 'naver':
            result = await naverLogin(code);
            break;
          default:
            throw new Error('지원하지 않는 소셜 로그인입니다.');
        }

        if (result.success) {
          // 로그인 성공 시 대시보드로 이동
          navigate('/userdashboard');
        } else {
          throw new Error('로그인에 실패했습니다.');
        }
      } catch (error) {
        console.error('소셜 로그인 콜백 에러:', error);
        setError(error.message || '로그인에 실패했습니다.');
      } finally {
        setIsLoading(false);
      }
    };

    handleCallback();
  }, [searchParams, navigate]);

  const handleBackToLogin = () => {
    navigate('/');
  };

  if (isLoading) {
    return (
      <div className={styles.container}>
        <div className={styles.loadingBox}>
          <div className={styles.spinner}></div>
          <p>로그인 처리 중...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.container}>
        <div className={styles.errorBox}>
          <h2>로그인 실패</h2>
          <p>{error}</p>
          <button onClick={handleBackToLogin} className={styles.backBtn}>
            로그인 페이지로 돌아가기
          </button>
        </div>
      </div>
    );
  }

  return null;
};

export default SocialLoginCallback; 