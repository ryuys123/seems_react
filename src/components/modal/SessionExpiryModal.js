import React from 'react';
import styles from './SessionExpiryModal.module.css';

const SessionExpiryModal = ({ isOpen, onExtend, onClose, remainingTime }) => {
  if (!isOpen) return null;

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modalContent}>
        <div className={styles.modalHeader}>
          <h3>세션 만료 알림</h3>
        </div>
        
        <div className={styles.modalBody}>
          <div className={styles.warningIcon}>⚠️</div>
          <p className={styles.message}>
            세션이 곧 만료됩니다.
          </p>
          <p className={styles.remainingTime}>
            남은 시간: <strong>{formatTime(remainingTime)}</strong>
          </p>
          <p className={styles.subMessage}>
            계속 사용하시려면 세션을 연장해주세요.
          </p>
        </div>
        
        <div className={styles.modalFooter}>
          <button 
            className={styles.extendButton}
            onClick={onExtend}
          >
            세션 연장
          </button>
          <button 
            className={styles.closeButton}
            onClick={onClose}
          >
            닫기
          </button>
        </div>
      </div>
    </div>
  );
};

export default SessionExpiryModal; 