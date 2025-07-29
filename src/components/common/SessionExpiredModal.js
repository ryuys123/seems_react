import React from 'react';
import styles from './SessionExpiredModal.module.css';

const SessionExpiredModal = ({ isOpen, onConfirm }) => {
  if (!isOpen) return null;

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modal}>
        <div className={styles.modalContent}>
          <div className={styles.icon}>⚠️</div>
          <h2 className={styles.title}>세션이 만료되었습니다</h2>
          <p className={styles.message}>다시 로그인해주세요</p>
          <button className={styles.confirmButton} onClick={onConfirm}>
            확인
          </button>
        </div>
      </div>
    </div>
  );
};

export default SessionExpiredModal; 