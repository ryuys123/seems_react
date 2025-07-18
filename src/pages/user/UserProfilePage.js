import React, { useState, useEffect, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import styles from './UserProfilePage.module.css';
import UserHeader from '../../components/common/UserHeader';
import { AuthContext } from '../../AuthProvider';
import apiClient from '../../utils/axios';

const UserProfilePage = () => {
  const { username, userid } = useContext(AuthContext); // userid도 받아오기
  const [userDetail, setUserDetail] = useState(null);
  const [isNotificationOn, setIsNotificationOn] = useState(true);
  const navigate = useNavigate();
  const [userPreferences, setUserPreferences] = useState(null);
  const [simulationSettings, setSimulationSettings] = useState(null);
  const [equippedBadge, setEquippedBadge] = useState(null); // 장착중 뱃지 정보

  // 한글 등급 → 영문 CSS 클래스 매핑
  const rarityToClass = {
    '레어': 'rare',
    '에픽': 'epic',
    '유니크': 'unique',
    '레전더리': 'legendary',
    '플래티넘': 'platinum'
  };

  // 등급별 CSS 클래스 조합 (이제 REWARD_ID별로)
  const badgeClass =
    equippedBadge && equippedBadge.rewardId
      ? `${styles.profileBadge} ${styles['badge' + equippedBadge.rewardId]}`
      : styles.profileBadge;

  useEffect(() => {
    const saved = localStorage.getItem('user-preferences');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setUserPreferences(parsed[0]?.preferences || null);
      } catch {}
    }
  }, []);

  useEffect(() => {
    // 사용자 상세 정보 불러오기
    const fetchUserDetail = async () => {
      try {
        const res = await apiClient.get('/user/info'); // 실제 API 경로로 수정
        setUserDetail(res.data);
      } catch (err) {
        console.error('사용자 정보 불러오기 실패:', err);
      }
    };
    fetchUserDetail();
  }, []);

  useEffect(() => {
    // 장착중인 뱃지 정보 불러오기 (신규 API)
    const fetchEquippedBadge = async () => {
      try {
        const userId = userid || userDetail?.userId || userDetail?.userid;
        if (!userId) return;
        const res = await apiClient.get(`/api/user/equipped-badge?userId=${userId}`);
        setEquippedBadge(res.data); // null 또는 { rewardId, isEquipped, titleReward, imagePath, questName }
      } catch (err) {
        setEquippedBadge(null);
      }
    };
    if (userid || userDetail?.userId || userDetail?.userid) {
      fetchEquippedBadge();
    }
  }, [userid, userDetail]);

  if (!userDetail) return <div>로딩 중...</div>;

  const handleUserFormClick = () => {
    // 프로필 수정 페이지로 이동
    navigate('/userform');
  };

  return (
    <>
      <UserHeader />

      <main className={styles.main}>
        <h1 className={styles.pageTitle}>마이페이지</h1>
        
        <div className={styles.profileSection}>
          <div className={styles.profileAvatar}>🧑</div>
          <div className={styles.profileInfo}>
            <div className={styles.profileHeader}>
              <h2 className={styles.profileName}>{username || userDetail.name}</h2>
              {/* 장착중인 뱃지 노출 */}
              {equippedBadge ? (
                <div
                  className={badgeClass}
                  style={{ display: 'flex', alignItems: 'center', gap: 6 }}
                >
                  <img src={equippedBadge.imagePath} alt="장착 뱃지" style={{ width: 28, height: 28, marginRight: 4, verticalAlign: 'middle' }} />
                  <span>{equippedBadge.titleReward || equippedBadge.questName || '뱃지'}</span>
                </div>
              ) : (
                <div className={styles.profileBadge} style={{ color: '#aaa', background: 'none' }}>
                  현재 장착한 뱃지가 없습니다
                </div>
              )}
            </div>
            <div className={styles.profileEmailSection}>
              <p className={styles.profileEmail}>{userDetail.email}</p>
              <div className={`${styles.socialIcon} ${styles.googleIcon}`}>G</div>
            </div>
            <p className={styles.joinDate}>가입일: {userDetail.joinDate}</p>
            <div className={styles.profileStats}>
              <div className={styles.statItem}>
                <div className={styles.statValue}>{userDetail.recordCount}</div>
                <div className={styles.statLabel}>기록 일수</div>
              </div>
              <div className={styles.statItem}>
                <div className={styles.statValue}>{userDetail.counselCount}</div>
                <div className={styles.statLabel}>상담 횟수</div>
              </div>
              <div className={styles.statItem}>
                <div className={styles.statValue}>{userDetail.activityCount}</div>
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