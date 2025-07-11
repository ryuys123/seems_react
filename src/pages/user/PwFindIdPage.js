import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './PwFindIdPage.module.css';
import logoSeems from '../../assets/images/logo_seems.png';

const PwFindIdPage = () => {
  const navigate = useNavigate(); // 페이지 이동을 위한 useNavigate 훅 사용

  const [formData, setFormData] = useState({
    email: '',
    verifyCode: ''
  });

  const [showSuccess, setShowSuccess] = useState(false);
  const [showError, setShowError] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSendVerificationCode = () => {
    if (!formData.email) {
      alert('이메일을 입력해주세요.');
      return;
    }
    
    // 인증번호 전송 로직 구현
    console.log('인증번호 전송:', formData.email);
    setShowSuccess(true);
    setShowError(false);
    setIsVerifying(true);
  };

  const handleVerifyCode = () => {
    if (!formData.verifyCode) {
      alert('인증번호를 입력해주세요.');
      return;
    }
    
    // 인증번호 확인 로직 구현
    console.log('인증번호 확인:', formData.verifyCode);
    // 실제로는 서버에서 인증번호를 확인해야 함
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!formData.email || !formData.verifyCode) {
      alert('모든 필드를 입력해주세요.');
      return;
    }
    // 비밀번호 재설정 링크 전송 로직 구현
    console.log('비밀번호 재설정 링크 전송:', formData);
  };

  const handleLoginClick = () => {
    // 로그인 페이지로 이동
    console.log('로그인 페이지로 이동');
    navigate('/');
  };

  return (
    <div className={styles.forgotContainer}>
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
      
      <div className={styles.forgotTitle}>비밀번호 찾기</div>
      
      <div className={styles.forgotDesc}>
        아이디, 이름, 휴대폰번호를 입력해주세요.
      </div>
      
      <form className={styles.forgotForm} onSubmit={handleSubmit}>
        <div className={styles.formGroup}>
        
        <div className={styles.formGroup}>
          <label htmlFor="verifyCode">아이디</label>
          <div className={styles.verifyGroup}>
            <input
              type="text"
              id="verifyCode"
              name="verifyCode"
              placeholder="아이디를 입력하세요"
              value={formData.verifyCode}
              onChange={handleChange}
              required
            />
          </div>
          </div>

          <div className={styles.formGroup}>
          <label htmlFor="name">이름</label>
          <div className={styles.verifyGroup}>
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
          </div>

          <div className={styles.formGroup}>
          <label htmlFor="name">휴대폰번호</label>
          <div className={styles.verifyGroup}>
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

        </div>

        </div>
        
        
        <button type="submit" className={styles.submitBtn}>
          확  인
        </button>
      </form>
      
      <div className={styles.loginLink}>
        비밀번호를 기억하셨나요?
        <span 
          onClick={() => handleLoginClick()} 
          style={{ cursor: 'pointer', color: '#4b94d0', fontWeight: '900', textDecoration: 'none' }}
        >
        로그인
        </span>
      </div>
    </div>
  );
};

export default PwFindIdPage; 