import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import logoImage from '../../assets/images/logo_2.png';
import styles from './IdFindPhonePage.module.css';
import apiClient from '../../utils/axios'; // axios 인스턴스 추가

const IdFindPhone = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    verifyCode: ''
  });
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [showErrorMessage, setShowErrorMessage] = useState(false);
  const [isCodeSent, setIsCodeSent] = useState(false); // 인증번호 발송 여부
  const [isVerified, setIsVerified] = useState(false); // 인증 성공 여부
  const [timer, setTimer] = useState(0); // 타이머(초)
  const [isLoading, setIsLoading] = useState(false); // 로딩 상태
  const [resultMessage, setResultMessage] = useState(''); // 결과/에러 메시지
  const timerRef = useRef(null); // interval ID 관리

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSendVerificationCode = async () => {
    if (formData.name && formData.phone) {
      setIsLoading(true);
      setResultMessage('');
      try {
        const response = await apiClient.post('/api/user/verification', { 
          verificationType: 'SMS_SEND', 
          phone: formData.phone 
        });
        
        if (response.data.success) {
          setShowSuccessMessage(true);
          setShowErrorMessage(false);
          setIsCodeSent(true);
          setIsVerified(false);
          setTimer(180); // 3분
          setResultMessage(response.data.message || '인증번호가 문자로 전송되었습니다.');
          // 타이머 시작
          if (timerRef.current) clearInterval(timerRef.current);
          timerRef.current = setInterval(() => {
            setTimer(prev => prev - 1);
          }, 1000);
        } else {
          setShowErrorMessage(true);
          setShowSuccessMessage(false);
          setResultMessage(response.data.message || '인증번호 발송 실패');
        }
      } catch (err) {
        setShowErrorMessage(true);
        setShowSuccessMessage(false);
        setResultMessage(err.response?.data?.message || '인증번호 발송 실패');
      } finally {
        setIsLoading(false);
      }
    } else {
      setShowErrorMessage(true);
      setShowSuccessMessage(false);
      setResultMessage('이름과 휴대폰번호를 모두 입력하세요.');
    }
  };

  // 타이머 관리 useEffect
  useEffect(() => {
    if (isCodeSent && timer === 0) {
      setIsCodeSent(false);
      setResultMessage('인증 시간이 만료되었습니다. 다시 시도해주세요.');
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }
    // 컴포넌트 언마운트 시 interval 정리
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [isCodeSent, timer]);

  const handleVerifyCode = async () => {
    if (!formData.verifyCode) return;
    setIsLoading(true);
    setResultMessage('');
    try {
      const response = await apiClient.post('/api/user/verification', {
        verificationType: 'SMS_VERIFY',
        phone: formData.phone,
        verificationCode: formData.verifyCode
      });
      
      if (response.data.success) {
        setIsVerified(true);
        setResultMessage(response.data.message || '인증 성공!');
      } else {
        setIsVerified(false);
        setResultMessage(response.data.message || '인증 실패');
      }
    } catch (err) {
      setIsVerified(false);
      setResultMessage(err.response?.data?.message || '인증 실패');
    } finally {
      setIsLoading(false);
    }
  };

  // 아이디 찾기 함수 추가
  const handleFindId = async () => {
    if (!isVerified) return;
    setIsLoading(true);
    setResultMessage('');
    try {
      const response = await apiClient.post('/api/user/verification', {
        verificationType: 'FIND_ID',
        name: formData.name, // 이름 필드 추가
        phone: formData.phone
      });
      
      if (response.data.success) {
        setResultMessage(`아이디: ${response.data.foundUserId}`);
      } else {
        setResultMessage(response.data.message || '아이디 찾기 실패');
      }
    } catch (err) {
      setResultMessage(err.response?.data?.message || '아이디 찾기 실패');
    } finally {
      setIsLoading(false);
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
              disabled={isCodeSent && timer > 0}
            />
            <button 
              type="button" 
              className={styles.verifyBtn}
              onClick={handleSendVerificationCode}
              disabled={isLoading || (isCodeSent && timer > 0)}
            >
              {isCodeSent && timer > 0 ? `재전송(${timer}s)` : '인증번호 받기'}
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
              disabled={!isCodeSent || timer === 0 || isVerified}
            />
            <button 
              type="button" 
              className={styles.verifyBtn}
              onClick={handleVerifyCode}
              disabled={!isCodeSent || timer === 0 || isVerified || isLoading}
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
        {resultMessage && (
          <div style={{textAlign: 'center', color: isVerified ? '#2e7d32' : '#c62828', margin: '12px 0'}}>
            {resultMessage}
          </div>
        )}

        {/* 아이디 찾기 버튼 추가 */}
        {isVerified && (
          <button 
            type="button" 
            className={styles.submitBtn}
            onClick={handleFindId}
            disabled={isLoading}
            style={{marginTop: '16px'}}
          >
            {isLoading ? '처리 중...' : '아이디 찾기'}
          </button>
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