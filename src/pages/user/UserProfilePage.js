import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import styles from './UserProfilePage.module.css';

const UserProfilePage = () => {
  const [isNotificationOn, setIsNotificationOn] = useState(true);
  const navigate = useNavigate();
  const [userPreferences, setUserPreferences] = useState(null);
  const [simulationSettings, setSimulationSettings] = useState(null);

  useEffect(() => {
    const saved = localStorage.getItem('user-preferences');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setUserPreferences(parsed[0]?.preferences || null);
      } catch {}
    }
  }, []);

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

        <div className={styles.settingsGrid} style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
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
                <button className={styles.deleteButton} onClick={() => navigate('/user/delete')}>회원 탈퇴</button>
              </div>
            </div>
          </div>
          {/* 기호/성향 카드 */}
          <div className={styles.settingsCard}>
            <h3>기호/성향</h3>
            <div style={{ marginBottom: 12, minHeight: 40 }}>
              {userPreferences ? (
                <ul style={{ paddingLeft: 18, margin: 0, fontSize: 15 }}>
                  {userPreferences.선택 && userPreferences.선택.length > 0 && (
                    <li><b>선택:</b> {userPreferences.선택.join(', ')}</li>
                  )}
                  {userPreferences.운동_종류 && userPreferences.운동_종류.length > 0 && (
                    <li><b>운동 종류:</b> {userPreferences.운동_종류.join(', ')}</li>
                  )}
                  {userPreferences.기타_입력 && Object.keys(userPreferences.기타_입력).length > 0 && (
                    <li><b>기타 입력:</b> {Object.entries(userPreferences.기타_입력).map(([k,v]) => `${k}: ${v}`).join(', ')}</li>
                  )}
                  {userPreferences.성향_점수 && Object.keys(userPreferences.성향_점수).length > 0 && (
                    <li><b>성향 점수:</b> {Object.entries(userPreferences.성향_점수).map(([k,v]) => `${k}: ${v}점`).join(', ')}</li>
                  )}
                  {userPreferences.온라인_상담_방식 && userPreferences.온라인_상담_방식.length > 0 && (
                    <li><b>온라인 상담 방식:</b> {userPreferences.온라인_상담_방식.join(', ')}</li>
                  )}
                </ul>
              ) : (
                <span style={{ color: '#888' }}>아직 입력된 성향 정보가 없습니다.</span>
              )}
            </div>
            <button className={styles.editButton} style={{ background: '#4b94d0', color: '#fff' }} onClick={() => navigate('/user/preferences')}>
              성향 입력/수정
            </button>
          </div>
          {/* 시뮬레이션 설정 카드 */}
          <div className={styles.settingsCard}>
            <h3>시뮬레이션 설정</h3>
            <div style={{ marginBottom: 12, minHeight: 40 }}>
              {simulationSettings ? (
                <ul style={{ paddingLeft: 18, margin: 0, fontSize: 15 }}>
                  {simulationSettings.botType && (
                    <li><b>챗봇 성격:</b> {simulationSettings.botType}</li>
                  )}
                  {simulationSettings.scenario && (
                    <li><b>시나리오:</b> {simulationSettings.scenario}</li>
                  )}
                </ul>
              ) : (
                <span style={{ color: '#888' }}>아직 설정된 시뮬레이션 정보가 없습니다.</span>
              )}
            </div>
            <button className={styles.editButton} style={{ background: '#4b94d0', color: '#fff' }} onClick={() => navigate('/user/simulation-settings')}>
              시뮬레이션 설정
            </button>
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
      {/* Removed modal related code */}
    </>
  );
};

export default UserProfilePage; 