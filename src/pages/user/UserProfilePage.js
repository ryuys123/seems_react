import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import styles from './UserProfilePage.module.css';

const UserProfilePage = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isNotificationOn, setIsNotificationOn] = useState(true);
  const navigate = useNavigate();

  const openDeleteModal = () => {
    setIsModalOpen(true);
  };

  const closeDeleteModal = () => {
    setIsModalOpen(false);
  };

  const confirmDelete = () => {
    // 회원 탈퇴 처리 로직
    alert('회원 탈퇴가 완료되었습니다.');
    closeDeleteModal();
    // 여기에 실제 탈퇴 처리 로직 추가
  };

  const handleModalClick = (e) => {
    if (e.target === e.currentTarget) {
      closeDeleteModal();
    }
  };

  const handleUserFormClick = () => {
    // 프로필 수정 페이지로 이동
    navigate('/userform');
  };

  return (
    <>
      <header className={styles.header}>
        <div className={styles.headerInner}>
          <Link to="/" style={{ textDecoration: 'none' }}>
            <div className={styles.logoWrap}>
              <span className={styles.logoText}>
                <span style={{ color: '#4b94d0', fontWeight: 900, fontSize: '2rem', letterSpacing: '-1px' }}>SEE</span>
                <span style={{ color: '#3d3833', fontWeight: 900, fontSize: '2rem', letterSpacing: '-1px' }}>MS</span>
              </span>
              <img 
                src="/logo_seems.png" 
                alt="SEE MS 로고" 
                className={styles.logoImg}
              />
            </div>
          </Link>
          <nav className={styles.nav}>
            <Link to="/">홈</Link>
            <Link to="/counseling">상담</Link>
            <Link to="/record">기록</Link>
            <Link to="/test">심리 검사</Link>
            <Link to="/analysis">분석</Link>
            <Link to="/activity">활동</Link>
            <Link to="/simulation">시뮬레이션</Link>
            <Link to="/faq">FAQ</Link>
            <Link to="/mypage">마이페이지</Link>
            <Link to="/login" style={{ color: 'var(--main-accent)', fontWeight: 900 }}>로그인/회원가입</Link>
          </nav>
        </div>
      </header>

      <main className={styles.main}>
        <h1 className={styles.pageTitle}>마이페이지</h1>
        
        <div className={styles.profileSection}>
          <div className={styles.profileAvatar}>👤</div>
          <div className={styles.profileInfo}>
            <div className={styles.profileHeader}>
              <h2 className={styles.profileName}>김마음</h2>
              <div className={`${styles.profileBadge} ${styles.mentalHealthMaster}`}>👑 정신 건강 마스터</div>
            </div>
            <div className={styles.profileEmailSection}>
              <p className={styles.profileEmail}>mind@example.com</p>
              <div className={`${styles.socialIcon} ${styles.googleIcon}`}>G</div>
            </div>
            <p className={styles.joinDate}>가입일: 2024.03.15</p>
            <div className={styles.profileStats}>
              <div className={styles.statItem}>
                <div className={styles.statValue}>15</div>
                <div className={styles.statLabel}>기록 일수</div>
              </div>
              <div className={styles.statItem}>
                <div className={styles.statValue}>8</div>
                <div className={styles.statLabel}>상담 횟수</div>
              </div>
              <div className={styles.statItem}>
                <div className={styles.statValue}>12</div>
                <div className={styles.statLabel}>활동 참여</div>
              </div>
            </div>
          </div>
        </div>

        <div className={styles.settingsGrid}>
          <div className={styles.settingsCard}>
            <h3>계정 설정</h3>
            <div className={styles.settingsList}>
              <div className={styles.settingsItem}>
                <span className={styles.settingsLabel}>알림</span>
                <label className={styles.toggleSwitch}>
                  <input 
                    type="checkbox" 
                    checked={isNotificationOn}
                    onChange={(e) => setIsNotificationOn(e.target.checked)}
                  />
                  <span className={styles.toggleSlider}></span>
                </label>
              </div>
              <div className={styles.buttonGroup}>
                <button className={styles.editButton} onClick={handleUserFormClick}>프로필 수정</button>
                {/* <Link to="/face-register" className={styles.editButton} style={{ background: '#ef770c' }}>페이스 등록</Link> */}
                <button className={styles.deleteButton} onClick={openDeleteModal}>회원 탈퇴</button>
              </div>
            </div>
          </div>
        </div>

        <div className={styles.activityHistory}>
          <h3>최근 활동</h3>
          <div className={styles.historyList}>
            <div className={styles.historyItem}>
              <div className={styles.historyIcon}>🧘‍♀️</div>
              <div className={styles.historyContent}>
                <div className={styles.historyTitle}>아침 명상 완료</div>
                <div className={styles.historyTime}>오늘 08:30</div>
              </div>
            </div>
            <div className={styles.historyItem}>
              <div className={styles.historyIcon}>💭</div>
              <div className={styles.historyContent}>
                <div className={styles.historyTitle}>감정 기록 작성</div>
                <div className={styles.historyTime}>어제 21:15</div>
              </div>
            </div>
            <div className={styles.historyItem}>
              <div className={styles.historyIcon}>🏃‍♂️</div>
              <div className={styles.historyContent}>
                <div className={styles.historyTitle}>스트레스 해소 운동</div>
                <div className={styles.historyTime}>어제 18:00</div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* 회원 탈퇴 모달 */}
      {isModalOpen && (
        <div className={styles.modal} onClick={handleModalClick}>
          <div className={styles.modalContent}>
            <h3 className={styles.modalTitle}>회원 탈퇴</h3>
            <p className={styles.modalMessage}>
              정말로 회원 탈퇴를 하시겠습니까?<br />
              탈퇴 시 모든 데이터가 영구적으로 삭제되며 복구할 수 없습니다.
            </p>
            <div className={styles.modalButtons}>
              <button className={`${styles.modalButton} ${styles.modalCancel}`} onClick={closeDeleteModal}>
                취소
              </button>
              <button className={`${styles.modalButton} ${styles.modalConfirm}`} onClick={confirmDelete}>
                탈퇴하기
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default UserProfilePage; 