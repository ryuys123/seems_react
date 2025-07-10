import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './PwFindEmailPage.module.css';
import logoSeems from '../../assets/images/logo_seems.png';

const PwFindEmailPage = () => {
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
        가입하신 이메일 주소를 입력하시면<br />
        비밀번호 재설정 링크를 보내드립니다.
      </div>
      
      <form className={styles.forgotForm} onSubmit={handleSubmit}>
        <div className={styles.formGroup}>
          <label htmlFor="email">이메일</label>
          <div className={styles.verifyGroup}>
            <input
              type="email"
              id="email"
              name="email"
              placeholder="이메일을 입력하세요"
              value={formData.email}
              onChange={handleChange}
              required
            />
            <button 
              type="button" 
              className={styles.verifyBtn}
              onClick={handleSendVerificationCode}
            >
              인증번호 받기
            </button>
          </div>
        </div>
        
        <div className={styles.formGroup}>
          <label htmlFor="verifyCode">인증번호</label>
          <div className={styles.verifyGroup}>
            <input
              type="text"
              id="verifyCode"
              name="verifyCode"
              placeholder="인증번호 6자리를 입력하세요"
              value={formData.verifyCode}
              onChange={handleChange}
              required
            />
            <button 
              type="button" 
              className={styles.verifyBtn}
              onClick={handleVerifyCode}
            >
              확인
            </button>
          </div>
        </div>
        
        {showSuccess && (
          <div className={`${styles.successMessage} ${styles.show}`}>
            인증번호가 이메일로 전송되었습니다.<br />
            이메일을 확인해주세요.
          </div>
        )}
        
        {showError && (
          <div className={`${styles.errorMessage} ${styles.show}`}>
            이메일 주소를 찾을 수 없습니다.<br />
            다시 확인해주세요.
          </div>
        )}
        
        <button type="submit" className={styles.submitBtn}>
          비밀번호 재설정 링크 받기
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

export default PwFindEmailPage; 