import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import logoImage from '../../assets/images/logo_2.png';
import styles from './IdFindPhonePage.module.css';

const IdFindPhone = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    verifyCode: ''
  });
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [showErrorMessage, setShowErrorMessage] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSendVerificationCode = () => {
    // 휴대폰 인증번호 전송 로직
    if (formData.name && formData.phone) {
      setShowSuccessMessage(true);
      setShowErrorMessage(false);
      // 실제로는 API 호출
    } else {
      setShowErrorMessage(true);
      setShowSuccessMessage(false);
    }
  };

  const handleVerifyCode = () => {
    // 인증번호 확인 로직
    if (formData.verifyCode) {
      // 인증 성공 시 처리
      console.log('인증 성공');
    }
  };

  const handleLoginClick = () => {
    navigate('/');
  };

  return (
    <div className={styles.forgotContainer}>
      <div className={styles.logoWrap}>
        <span className={styles.logoText}>
          <span style={{color: '#4b94d0', fontWeight: 900, fontSize: '2rem', letterSpacing: '-1px'}}>SEE</span>
          <span style={{color: '#3d3833', fontWeight: 900, fontSize: '2rem', letterSpacing: '-1px'}}>MS</span>
        </span>
        <img 
          src={logoImage} 
          alt="SEE MS 로고" 
          style={{marginLeft: '8px', width: '54px', height: '54px', borderRadius: 0, background: 'none', boxShadow: 'none'}}
        />
      </div>
      
      <div className={styles.forgotTitle}>아이디 찾기</div>
      <div className={styles.forgotDesc}>
        가입하신 휴대폰번호를 입력하시면<br />
        인증번호를 보내드립니다.
      </div>
      
      <form className={styles.forgotForm} onSubmit={(e) => e.preventDefault()}>
        <div className={styles.formGroup}>
          <label htmlFor="name">이름</label>
          <div className={styles.verifyGroup}>
            <input 
              type="text" 
              id="name" 
              name="name" 
              value={formData.name}
              onChange={handleInputChange}
              placeholder="이름을 입력하세요" 
              required 
            />
          </div>
        </div>
        
        <div className={styles.formGroup}>
          <label htmlFor="phone">휴대폰번호</label>
          <div className={styles.verifyGroup}>
            <input 
              type="tel" 
              id="phone" 
              name="phone" 
              value={formData.phone}
              onChange={handleInputChange}
              placeholder="휴대폰번호를 입력하세요" 
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
              value={formData.verifyCode}
              onChange={handleInputChange}
              placeholder="인증번호 6자리를 입력하세요" 
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
        
        {showSuccessMessage && (
          <div className={styles.successMessage} style={{display: 'block'}}>
            인증번호가 문자로 전송되었습니다.<br />
            문자를 확인해주세요.
          </div>
        )}
        
        {showErrorMessage && (
          <div className={styles.errorMessage} style={{display: 'block'}}>
            입력하신 휴대폰번호를 찾을 수 없습니다.<br />
            다시 확인해주세요.
          </div>
        )}
      </form>
      
      <div className={styles.loginLink}>
        아이디를 기억하셨나요?
        <span 
          onClick={handleLoginClick}
          style={{cursor: 'pointer', color: '#4b94d0', fontWeight: 900, textDecoration: 'none', marginLeft: '4px'}}
        >
          로그인
        </span>
      </div>
    </div>
  );
};

export default IdFindPhone;