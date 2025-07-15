import React from "react";
import styles from "./FaceModal.module.css";

const FaceModal = ({ open, onRegister, onSkip, onClose }) => {
  if (!open) return null;
  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modalContent}>
        <h3>페이스 등록 안내</h3>
        <p>
          페이스로그인 기능을 사용하려면 얼굴을 등록해야 합니다.<br />
          등록하시겠습니까?
        </p>
        <div className={styles.buttonGroup}>
          <button onClick={onRegister}>등록하기</button>
          <button onClick={onSkip}>건너뛰기</button>
          <button onClick={onClose}>닫기</button>
        </div>
      </div>
    </div>
  );
};

export default FaceModal; 