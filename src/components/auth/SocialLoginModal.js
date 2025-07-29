import React from 'react';
import styles from './SocialLoginModal.module.css';

// 임시 더미 SocialLoginModal
const SocialLoginModal = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modal}>
        <div className={styles.modalHeader}>
          <h2>소셜 로그인</h2>
          <button className={styles.closeButton} onClick={onClose}>
            ✕
          </button>
        </div>
        <div className={styles.modalContent}>
          <p>소셜 로그인 기능이 임시로 비활성화되었습니다.</p>
        </div>
      </div>
    </div>
  );
};

export default SocialLoginModal; 