import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import logoSeems from '../../assets/images/logo_seems.png';
import styles from './IdFindPhonePage.module.css';
import apiClient from '../../utils/axios'; // axios 인스턴스 추가
import axios from 'axios'; // 직접 axios 사용을 위해 추가

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
      // 재전송 시 사용자 확인 (타이머가 남아있을 때만)
      if (isCodeSent && timer > 0) {
        const confirmResend = window.confirm(
          `아직 ${Math.floor(timer / 60)}분 ${timer % 60}초가 남아있습니다.\n새로운 인증번호를 재전송하시겠습니까?`
        );
        if (!confirmResend) {
          return; // 사용자가 취소하면 함수 종료
        }
      }
      
      setIsLoading(true);
      setResultMessage('');
      
      // 재전송 시 기존 인증번호 입력값과 인증 상태 초기화
      if (isCodeSent) {
        console.log('인증번호 재전송 - 기존 데이터 초기화');
        setFormData(prev => ({ ...prev, verifyCode: '' })); // 입력된 인증번호 초기화
        setIsVerified(false); // 인증 상태 초기화
      }
      
      try {
        // 인증번호 요청은 토큰이 필요없는 공개 API이므로 직접 axios 사용
        const response = await axios.post('http://localhost:8888/seems/api/user/verification', { 
          verificationType: 'SMS_SEND', 
          name: formData.name,  // 이름 추가
          phone: formData.phone 
        }, {
          headers: {
            'Content-Type': 'application/json'
          }
        });
        
        if (response.data.success) {
          setShowSuccessMessage(true);
          setShowErrorMessage(false);
          setIsCodeSent(true);
          setIsVerified(false);
          setTimer(180); // 3분
          
          // 재전송 여부에 따른 메시지 차별화
          const isResend = isCodeSent;
          const defaultMessage = isResend ? 
            '새로운 인증번호가 재전송되었습니다.' : 
            '인증번호가 문자로 전송되었습니다.';
          setResultMessage(response.data.message || defaultMessage);
          
          console.log(isResend ? '인증번호 재전송 완료' : '인증번호 최초 전송 완료');
          
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
      // 인증번호 확인도 토큰이 필요없는 공개 API이므로 직접 axios 사용
      const response = await axios.post('http://localhost:8888/seems/api/user/verification', {
        verificationType: 'SMS_VERIFY',
        phone: formData.phone,
        verificationCode: formData.verifyCode
      }, {
        headers: {
          'Content-Type': 'application/json'
        }
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
      // 아이디 찾기도 토큰이 필요없는 공개 API이므로 직접 axios 사용
      const response = await axios.post('http://localhost:8888/seems/api/user/verification', {
        verificationType: 'FIND_ID',
        name: formData.name, // 이름 필드 추가
        phone: formData.phone
      }, {
        headers: {
          'Content-Type': 'application/json'
        }
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
              disabled={isLoading}
            >
              {isCodeSent ? 
                (timer > 0 ? `재전송 (${timer}s)` : '재전송') : 
                '인증번호 받기'
              }
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