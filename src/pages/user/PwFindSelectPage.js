import React from 'react';
import { useNavigate } from 'react-router-dom';
import logoImage from '../../assets/images/logo_2.png';
import styles from './PwFindSelectPage.module.css';

const PwFindSelectPage = () => {
  const navigate = useNavigate();

  const handleIdVerification = () => {
    navigate('/pwfindid');
  };

  const handleEmailVerification = () => {
    navigate('/pwfindemail');
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
      <div className={styles.forgotTitle}>비밀번호 찾기</div>

      <div className={styles.buttonContainer}>
        <button 
          onClick={handleIdVerification} 
          className={styles.verifyBtn}
        >
          아이디로 인증하기
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

export default PwFindSelectPage; 