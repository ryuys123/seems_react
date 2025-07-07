import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './Login.module.css';
import logoSeems from '../assets/images/logo_seems.png';
import naverIcon from '../assets/images/naver.png';
import kakaoIcon from '../assets/images/kakao.png';
import faceioIcon from '../assets/images/faceio.png';
import ApiTest from '../components/common/ApiTest';


const Login = () => {
  const navigate = useNavigate(); // 페이지 이동을 위한 useNavigate 훅 사용

  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // 로그인 로직 구현
    console.log('로그인 시도:', formData);
  };

  const handleSocialLogin = (provider) => {
    // 소셜 로그인 로직 구현
    console.log(`${provider} 로그인 시도`);
  };

  const handleSignupClick = () => {
    // 회원가입 페이지 이동
    console.log('회원가입 페이지로 이동');
    navigate('/signup');
  };

  const handlePwFindClick = () => {
    // 비밀번호 찾기 페이지 이동
    console.log('비밀번호 찾기 페이지로 이동');
    navigate('/pwfind');
  };

  return (
    <div className={styles.loginContainer}>
      <div className={styles.logoWrap}>
        <div className={styles.logoText}>
          <span>SEE</span>
          <span>MS</span>
        </div>
        <img 
          src={logoSeems} 
          alt="SEE MS 로고" 
          className={styles.logoImage}
        />
      </div>
      
      <div className={styles.loginTitle}>로그인</div>
      
      <form className={styles.loginForm} onSubmit={handleSubmit}>
        <label htmlFor="email">이메일</label>
        <input
          type="email"
          id="email"
          name="email"
          placeholder="이메일을 입력하세요"
          value={formData.email}
          onChange={handleChange}
          required
        />
        
        <label htmlFor="password">비밀번호</label>
        <input
          type="password"
          id="password"
          name="password"
          placeholder="비밀번호를 입력하세요"
          value={formData.password}
          onChange={handleChange}
          required
        />
        
        <div className={styles.forgotPassword}>
          <span 
          onClick={() => handlePwFindClick()} 
          style={{ cursor: 'pointer', color: '#4b94d0', fontWeight: '900', textDecoration: 'none' }}
          >비밀번호를 잊으셨나요?
          </span>
        </div>
        
        <button type="submit" className={styles.loginBtn}>
          로그인
        </button>
      </form>
      
      <div className={styles.signupLink}>
        아직 회원이 아니신가요?
        <span 
          onClick={() => handleSignupClick()} 
          style={{ cursor: 'pointer', color: '#4b94d0', fontWeight: '900', textDecoration: 'none' }}
        >{'  '}
        회원가입
        </span>
      </div>
      
      <div className={styles.divider}>
        <hr />
        <span>또는</span>
        <hr />
      </div>
      
      <div className={styles.socialLogin}>
        <button 
          className={`${styles.socialBtn} ${styles.google}`}
          onClick={() => handleSocialLogin('google')}
        >
          <img 
            src="https://img.icons8.com/color/24/000000/google-logo.png" 
            alt="구글 로고"
            className={styles.socialIcon}
          />
          구글 로그인
        </button>
        
        <button 
          className={`${styles.socialBtn} ${styles.naver}`}
          onClick={() => handleSocialLogin('naver')}
        >
          <img 
            src={naverIcon} 
            alt="네이버 로고"
            className={styles.socialIcon}
          />
          네이버 로그인
        </button>
        
        <button 
          className={`${styles.socialBtn} ${styles.kakao}`}
          onClick={() => handleSocialLogin('kakao')}
        >
          <img 
            src={kakaoIcon} 
            alt="카카오 로고"
            className={styles.socialIcon}
          />
          카카오 로그인
        </button>
        
        <button 
          className={`${styles.socialBtn} ${styles.faceio}`}
          onClick={() => handleSocialLogin('faceio')}
        >
          <img 
            src={faceioIcon} 
            alt="페이스 아이콘"
            className={styles.socialIcon}
          />
          페이스 로그인
        </button>
      </div>
      
      {/* API 연동 테스트 컴포넌트 */}
      <ApiTest />
    </div>
  );
};

export default Login; 