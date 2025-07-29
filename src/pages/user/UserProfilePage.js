import React, { useState, useEffect, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import styles from './UserProfilePage.module.css';
import UserHeader from '../../components/common/UserHeader';
import { AuthContext } from '../../AuthProvider';
import apiClient from '../../utils/axios';
import { getRecentActivities, getActivityIcon, getActivityName } from '../../services/activityService';
import profileStyles from './UserProfilePage.module.css'; // 헤더와 동일한 스타일 사용을 위해

const UserProfilePage = () => {
  const { username, userid } = useContext(AuthContext); // 전역에서 이름과 userid 받아오기
  const [userDetail, setUserDetail] = useState(null);
  const [equippedBadge, setEquippedBadge] = useState(null); // 장착 뱃지 상태 추가
  const [error, setError] = useState(null);
  const [isFaceLinked, setIsFaceLinked] = useState(false); // 페이스 연동 상태
  const [recentActivities, setRecentActivities] = useState([]); // 최근 활동 상태
  const [activitiesLoading, setActivitiesLoading] = useState(false); // 활동 로딩 상태
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
        console.log('사용자 정보 응답:', res.data);
        console.log('프로필 이미지 데이터:', res.data.profileImage ? res.data.profileImage.substring(0, 50) + '...' : '없음');
        console.log('프로필 이미지 타입:', typeof res.data.profileImage);
        setUserDetail(res.data);
        
        // 사용자 정보에서 페이스 연동 상태 확인
        console.log('사용자 정보 전체 응답:', res.data);
        console.log('사용자 정보 키 목록:', Object.keys(res.data));
        
        // 다양한 페이스 상태 필드 확인
        const faceStatus = res.data.faceLinked || res.data.faceEnabled || res.data.faceActive || res.data.faceLoginEnabled || res.data.faceLogin || false;
        console.log('사용자 정보에서 페이스 연동 상태:', faceStatus);
        console.log('faceLinked:', res.data.faceLinked);
        console.log('faceEnabled:', res.data.faceEnabled);
        console.log('faceActive:', res.data.faceActive);
        console.log('faceLoginEnabled:', res.data.faceLoginEnabled);
        console.log('faceLogin:', res.data.faceLogin);
        
        setIsFaceLinked(faceStatus);
        
        setError(null);
      } catch (err) {
        console.error('사용자 정보 조회 실패:', err);
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
    
    // 페이스 연동 상태 조회 함수 (500 에러로 인해 비활성화)
    const fetchFaceLinkStatus = async () => {
      try {
        const currentUserId = userid || localStorage.getItem('userId') || localStorage.getItem('loggedInUserId');
        if (!currentUserId) {
          console.log('페이스 연동 상태 조회 - userId 없음');
          return;
        }
        
        console.log('페이스 연동 상태 조회 - 500 에러로 인해 비활성화됨');
        console.log('사용자 정보에서 페이스 연동 상태를 확인합니다.');
        
        // 500 에러로 인해 별도 API 호출 대신 사용자 정보에서 상태 확인
        // setIsFaceLinked는 fetchUserDetail에서 처리됨
      } catch (error) {
        console.error('페이스 연동 상태 조회 실패:', error);
        console.log('페이스 연동 상태 기본값 false로 설정');
        setIsFaceLinked(false);
      }
    };
    
    // 최근 활동 조회 함수
    const fetchRecentActivities = async () => {
      if (!userid) return;
      
      try {
        setActivitiesLoading(true);
        const response = await getRecentActivities(userid, 10);
        setRecentActivities(response.activities || []);
        // console.log('최근 활동 조회 성공:', response);
      } catch (error) {
        // console.error('최근 활동 조회 실패:', error);
        // 활동이 없는 경우 빈 배열로 설정
        setRecentActivities([]);
      } finally {
        setActivitiesLoading(false);
      }
    };
    
    fetchUserDetail();
    if (userid) {
      fetchEquippedBadge();
      fetchFaceLinkStatus(); // 페이스 연동 상태 조회 추가
      fetchRecentActivities(); // 최근 활동 조회 추가
    }
  }, [userid]);

  if (error) return <div>{error}</div>;
  if (!userDetail) return <div>로딩 중...</div>;

  const handleUserFormClick = () => {
    // 프로필 수정 페이지로 이동
    navigate('/userform');
  };

  // 날짜 포맷팅 함수
  const formatActivityDate = (dateString) => {
    if (!dateString) return '';
    
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = now - date;
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) {
      return `오늘 ${date.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })}`;
    } else if (diffDays === 1) {
      return `어제 ${date.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })}`;
    } else if (diffDays < 7) {
      return `${diffDays}일 전`;
    } else {
      return date.toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' });
    }
  };

  // 페이스 연동 버튼 클릭 핸들러
  const handleFaceLinkClick = () => {
    console.log('페이스 연동 클릭 - userid:', userid);
    console.log('페이스 연동 클릭 - userDetail:', userDetail);
    
    // userid가 없으면 localStorage에서 가져오기
    const currentUserId = userid || localStorage.getItem('userId') || localStorage.getItem('loggedInUserId');
    console.log('최종 사용할 userId:', currentUserId);
    
    // 페이스 등록 페이지로 이동 (기존 사용자 정보 전달)
    const stateData = {
      userId: currentUserId,
      userName: userDetail.userName,
      phone: userDetail.phone
    };
    
    console.log('전달할 state 데이터:', stateData);
    
    navigate('/facesignup', { state: stateData });
  };

  // 페이스 연동 해제 버튼 클릭 핸들러
  const handleFaceUnlinkClick = async () => {
    if (window.confirm('페이스 로그인 연동을 해제하시겠습니까?')) {
      try {
        const currentUserId = userid || localStorage.getItem('userId') || localStorage.getItem('loggedInUserId');
        const faceName = userDetail?.userName || 'default';
        
        console.log('페이스 연동 해제 시작 - userId:', currentUserId, 'faceName:', faceName);
        
        // 다른 엔드포인트 시도
        const response = await apiClient.delete(`/api/face/user/unlink?userId=${currentUserId}&faceName=${faceName}`);
        if (response.status === 200) {
          alert('페이스 로그인 연동이 해제되었습니다.');
          setIsFaceLinked(false);
          console.log('페이스 연동 해제 완료 - 상태 업데이트됨');
        } else {
          alert('페이스 연동 해제에 실패했습니다.');
        }
      } catch (error) {
        console.error('페이스 연동 해제 실패:', error);
        alert('페이스 연동 해제 중 오류가 발생했습니다.');
      }
    }
  };

  return (
    <>
      <UserHeader />
      <main className={styles.main}>
        <h1 className={styles.pageTitle}>마이페이지</h1>
        <div className={styles.profileSection}>
          <div className={styles.profileAvatar}>
            {userDetail.profileImage ? (
              <img 
                src={userDetail.profileImage} 
                alt="프로필" 
                style={{ width: 80, height: 80, borderRadius: '50%', objectFit: 'cover' }}
                onLoad={() => {
                  console.log('프로필 이미지 로드 성공');
                }}
                onError={(e) => {
                  console.error('프로필 이미지 로드 실패:', e.target.src);
                  console.error('프로필 이미지 데이터:', userDetail.profileImage ? userDetail.profileImage.substring(0, 100) + '...' : '없음');
                  // 이미지 로드 실패 시 기본 아바타로 대체
                  e.target.style.display = 'none';
                  e.target.nextSibling.style.display = 'inline';
                }}
              />
            ) : null}
            <span role="img" aria-label="avatar" style={{ display: userDetail.profileImage ? 'none' : 'inline' }}>🧑</span>
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
                {console.log('페이스 연동 버튼 렌더링 - isFaceLinked:', isFaceLinked)}
                {isFaceLinked ? (
                  <button 
                    className={styles.faceUnlinkButton} 
                    onClick={handleFaceUnlinkClick}
                    style={{ background: '#ff6b6b', color: 'white' }}
                  >
                    페이스 연동 해제
                  </button>
                ) : (
                  <button 
                    className={styles.faceLinkButton} 
                    onClick={handleFaceLinkClick}
                    style={{ background: '#ef770c', color: 'white' }}
                  >
                    페이스 연동
                  </button>
                )}
                <button className={styles.deleteButton} onClick={() => navigate('/user/delete')}>회원 탈퇴</button>
              </div>
            </div>
          </div>
        </div>
        <div className={styles.activityHistory}>
          <h3>최근 활동</h3>
          <div className={styles.historyList}>
            {activitiesLoading ? (
              <div style={{ textAlign: 'center', padding: '20px', color: '#666' }}>
                활동 내역을 불러오는 중...
              </div>
            ) : recentActivities.length > 0 ? (
              recentActivities.map((activity, index) => (
                <div key={index} className={styles.historyItem}>
                  <div className={styles.historyLeft}>
                    <div className={styles.historyIcon}>{getActivityIcon(activity.activityType)}</div>
                    <div className={styles.historyContent}>
                      <div className={styles.historyTitle}>
                        {activity.title}
                      </div>
                    </div>
                  </div>
                  <div className={styles.historyTime}>
                    {formatActivityDate(activity.activityDate)}
                  </div>
                </div>
              ))
            ) : (
              <div style={{ textAlign: 'center', padding: '20px', color: '#666' }}>
                아직 활동 내역이 없습니다
              </div>
            )}
          </div>
        </div>
      </main>
    </>
  );
};

export default UserProfilePage; 