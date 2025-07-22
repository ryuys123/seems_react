import React, { useState, useEffect, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import styles from './UserProfilePage.module.css';
import UserHeader from '../../components/common/UserHeader';
import { AuthContext } from '../../AuthProvider';
import apiClient from '../../utils/axios';
import profileStyles from './UserProfilePage.module.css'; // 헤더와 동일한 스타일 사용을 위해

const UserProfilePage = () => {
  const { username, userid } = useContext(AuthContext); // 전역에서 이름과 userid 받아오기
  const [userDetail, setUserDetail] = useState(null);
  const [equippedBadge, setEquippedBadge] = useState(null); // 장착 뱃지 상태 추가
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  // 뱃지 REWARD_ID별 클래스 (헤더와 동일한 로직)
  const badgeClass =
    equippedBadge && equippedBadge.rewardId
      ? `${profileStyles.profileBadge} ${profileStyles["badge" + equippedBadge.rewardId]}`
      : profileStyles.profileBadge;

  useEffect(() => {
    const fetchUserDetail = async () => {
      try {
        const res = await apiClient.get('/user/info'); // 또는 '/user/me' 서버에 맞게
        setUserDetail(res.data);
        setError(null);
      } catch (err) {
        setError('사용자 정보를 불러오지 못했습니다.');
      }
    };
    
    const fetchEquippedBadge = async () => {
      try {
        if (!userid) return;
        const res = await apiClient.get(
          `/api/user/equipped-badge?userId=${userid}`
        );
        setEquippedBadge(res.data);
      } catch {
        setEquippedBadge(null);
      }
    };
    
    fetchUserDetail();
    if (userid) fetchEquippedBadge();
  }, [userid]);

  if (error) return <div>{error}</div>;
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
          <div className={styles.profileAvatar}>
            {userDetail.profileImage ? (
              <img src={userDetail.profileImage} alt="프로필" style={{ width: 80, height: 80, borderRadius: '50%', objectFit: 'cover' }} />
            ) : (
              <span role="img" aria-label="avatar">🧑</span>
            )}
          </div>
          <div className={styles.profileInfo}>
            <div className={styles.profileHeader}>
              <h2 className={styles.profileName}>{userDetail.userName || username || '이름 없음'}</h2>
              {equippedBadge && (
                <div
                  className={badgeClass}
                  style={{ display: "flex", alignItems: "center", gap: 6 }}
                >
                  <img
                    src={equippedBadge.imagePath}
                    alt="장착 뱃지"
                    style={{
                      width: 24,
                      height: 24,
                      marginRight: 4,
                      verticalAlign: "middle",
                    }}
                  />
                  <span style={{ fontSize: "0.98rem" }}>
                    {equippedBadge.titleReward || equippedBadge.questName || "내면의 탐구자"}
                  </span>
                </div>
              )}
              {!equippedBadge && (
                <div className={profileStyles.profileBadge}>
                  🏅 내면의 탐구자
                </div>
              )}
            </div>
            <div className={styles.profileEmailSection}>
              <div className={`${styles.socialIcon} ${styles.googleIcon}`}>G</div>
            </div>
            <p className={styles.joinDate}>계정 생성일: {userDetail.joinDate}</p>
            <p className={styles.profileStatus}>
              계정 상태: {userDetail.status === 1 ? '활성화' : '비활성화'}
            </p>
            {/* 활동 통계 등은 필요시 추가 */}
          </div>
        </div>
        {/* 계정 설정 카드, 최근 활동 등 기존 폼은 그대로 유지 */}
        <div className={styles.settingsGrid} style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          <div className={styles.settingsCard}>
            <h3>계정 설정</h3>
            <div className={styles.settingsList}>
              {/* 알림 설정 부분 제거 */}
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
    </>
  );
};

export default UserProfilePage; 