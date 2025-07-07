import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './SignupPage.module.css';
import logoSeems from '../../assets/images/logo_seems.png';
import naverIcon from '../../assets/images/naver.png';
import kakaoIcon from '../../assets/images/kakao.png';
import faceioIcon from '../../assets/images/faceio.png';

const SignupPage = () => {
  const navigate = useNavigate(); // 페이지 이동을 위한 useNavigate 훅 사용

  const [formData, setFormData] = useState({
    name: '',
    nickname: '',
    email: '',
    password: '',
    passwordConfirm: '',
    phone: ''
  });

  const [terms, setTerms] = useState({
    allTerms: false,
    serviceTerms: false,
    privacyTerms: false,
    marketingTerms: false
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleTermsChange = (e) => {
    const { name, checked } = e.target;
    
    if (name === 'allTerms') {
      setTerms({
        allTerms: checked,
        serviceTerms: checked,
        privacyTerms: checked,
        marketingTerms: checked
      });
    } else {
      const newTerms = {
        ...terms,
        [name]: checked
      };
      
      // 모든 필수 약관이 체크되었는지 확인
      const allRequiredChecked = newTerms.serviceTerms && newTerms.privacyTerms;
      
      setTerms({
        ...newTerms,
        allTerms: allRequiredChecked && newTerms.marketingTerms
      });
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // 비밀번호 확인
    if (formData.password !== formData.passwordConfirm) {
      alert('비밀번호가 일치하지 않습니다.');
      return;
    }
    
    // 필수 약관 동의 확인
    if (!terms.serviceTerms || !terms.privacyTerms) {
      alert('필수 약관에 동의해주세요.');
      return;
    }
    
    // 회원가입 로직 구현
    console.log('회원가입 시도:', formData, terms);
  };

  const handleSocialSignup = (provider) => {
    // 소셜 회원가입 로직 구현
    console.log(`${provider} 회원가입 시도`);
  };

  const handleLoginClick = () => {
    // 로그인 페이지로 이동
    console.log('로그인 페이지로 이동');
    navigate('/');
  };

  return (
    <div className={styles.signupContainer}>
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
      
      <div className={styles.signupTitle}>회원가입</div>
      
      <form className={styles.signupForm} onSubmit={handleSubmit}>
        <div className={styles.formRow}>
          <div className={styles.formGroup}>
            <label htmlFor="name">이름</label>
            <input
              type="text"
              id="name"
              name="name"
              placeholder="이름을 입력하세요"
              value={formData.name}
              onChange={handleChange}
              required
            />
          </div>
          <div className={styles.formGroup}>
            <label htmlFor="nickname">닉네임</label>
            <input
              type="text"
              id="nickname"
              name="nickname"
              placeholder="닉네임을 입력하세요"
              value={formData.nickname}
              onChange={handleChange}
              required
            />
          </div>
        </div>
        
        <div className={styles.formGroup}>
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
        </div>
        
        <div className={styles.formGroup}>
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
        </div>
        
        <div className={styles.formGroup}>
          <label htmlFor="passwordConfirm">비밀번호 확인</label>
          <input
            type="password"
            id="passwordConfirm"
            name="passwordConfirm"
            placeholder="비밀번호를 다시 입력하세요"
            value={formData.passwordConfirm}
            onChange={handleChange}
            required
          />
        </div>
        
        <div className={styles.formGroup}>
          <label htmlFor="phone">휴대폰 번호</label>
          <input
            type="tel"
            id="phone"
            name="phone"
            placeholder="휴대폰 번호를 입력하세요"
            value={formData.phone}
            onChange={handleChange}
            required
          />
        </div>
        
        <div className={styles.termsGroup}>
          <label>
            <input
              type="checkbox"
              name="allTerms"
              checked={terms.allTerms}
              onChange={handleTermsChange}
            />
            <span>모든 약관에 동의합니다</span>
          </label>
          <div className={styles.termsSubGroup}>
            <label>
              <input
                type="checkbox"
                name="serviceTerms"
                checked={terms.serviceTerms}
                onChange={handleTermsChange}
                required
              />
              <span>서비스 이용약관 (필수)</span>
            </label>
            <label>
              <input
                type="checkbox"
                name="privacyTerms"
                checked={terms.privacyTerms}
                onChange={handleTermsChange}
                required
              />
              <span>개인정보 처리방침 (필수)</span>
            </label>
            <label>
              <input
                type="checkbox"
                name="marketingTerms"
                checked={terms.marketingTerms}
                onChange={handleTermsChange}
              />
              <span>마케팅 정보 수신 동의 (선택)</span>
            </label>
          </div>
        </div>
        
        <button type="submit" className={styles.signupBtn}>
          회원가입
        </button>
      </form>
      
      <div className={styles.loginLink}>
        이미 계정이 있으신가요?
        <span 
          onClick={() => handleLoginClick()} 
          style={{ cursor: 'pointer', color: '#4b94d0', fontWeight: '900', textDecoration: 'none' }}
        >{'  '}로그인
        </span>
      </div>
      
      <div className={styles.divider}>
        <hr />
        <span>또는</span>
        <hr />
      </div>
      
      <div className={styles.socialSignup}>
        <button 
          className={`${styles.socialBtn} ${styles.google}`}
          onClick={() => handleSocialSignup('google')}
        >
          <img 
            src="https://img.icons8.com/color/24/000000/google-logo.png" 
            alt="구글 로고"
            className={styles.socialIcon}
          />
          구글 회원가입
        </button>
        
        <button 
          className={`${styles.socialBtn} ${styles.naver}`}
          onClick={() => handleSocialSignup('naver')}
        >
          <img 
            src={naverIcon} 
            alt="네이버 로고"
            className={styles.socialIcon}
          />
          네이버 회원가입
        </button>
        
        <button 
          className={`${styles.socialBtn} ${styles.kakao}`}
          onClick={() => handleSocialSignup('kakao')}
        >
          <img 
            src={kakaoIcon} 
            alt="카카오 로고"
            className={styles.socialIcon}
          />
          카카오 회원가입
        </button>
        
        <button 
          className={`${styles.socialBtn} ${styles.faceio}`}
          onClick={() => handleSocialSignup('faceio')}
        >
          <img 
            src={faceioIcon} 
            alt="페이스 아이콘"
            className={styles.socialIcon}
          />
          페이스 회원가입
        </button>
      </div>
    </div>
  );
};

export default SignupPage; 