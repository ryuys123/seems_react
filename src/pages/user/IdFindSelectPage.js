import React from 'react';
import { useNavigate } from 'react-router-dom';
import logoImage from '../../assets/images/logo_2.png';
import styles from './IdFindSelectPage.module.css';

const IdFindSelectPage = () => {
  const navigate = useNavigate();

  const handlePhoneVerification = () => {
    navigate('/idfindphone');
  };

  const handleEmailVerification = () => {
    navigate('/idfindemail');
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

      <div className={styles.buttonContainer}>
        <button 
          onClick={handlePhoneVerification} 
          className={styles.verifyBtn}
        >
          휴대전화로 인증하기
        </button>
        <button 
          onClick={handleEmailVerification} 
          className={styles.verifyBtn}
        >
          이메일로 인증하기
        </button>
      </div>
    </div>
  );
};

export default IdFindSelectPage; 