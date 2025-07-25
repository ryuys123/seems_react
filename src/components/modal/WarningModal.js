import React from "react";
import styles from "./WarningModal.module.css";

function WarningModal({ isOpen, onClose, onConfirm }) {
  // isOpen이 false이면 아무것도 렌더링하지 않음
  if (!isOpen) {
    return null;
  }

  return (
    // 모달 배경 (어두운 오버레이)
    <div className={styles.modalOverlay}>
      {/* 모달 창 */}
      <div className={styles.modalContent}>
        <h2>⚠️ 중요 안내</h2>
        <p>
          본 검사는 전문적인 심리 진단 도구가 아닙니다. 결과는 자기 이해를 돕기
          위한 참고 자료로만 활용해주세요.
        </p>
        <p>
          심리적 어려움이 지속되거나 심각하다고 느껴진다면, 혼자 고민하기보다
          정신건강의학과 의사나 심리상담사와 같은 전문가의 도움을 받는 것이 매우
          중요합니다.
        </p>
        <p>위 내용에 동의하십니까?</p>
        <div className={styles.buttonContainer}>
          <button onClick={onClose} className={styles.cancelButton}>
            취소
          </button>
          <button onClick={onConfirm} className={styles.confirmButton}>
            동의하고 시작하기
          </button>
        </div>
      </div>
    </div>
  );
}

export default WarningModal;
