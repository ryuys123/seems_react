import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import apiClient from '../../utils/axios'; // axios 대신 apiClient 사용
import styles from './QuestStorePage.module.css';
import { AuthContext } from '../../AuthProvider'; // 실제 AuthProvider 경로에 맞게 수정
import UserHeader from '../../components/common/UserHeader';

const QuestStorePage = () => {
  const { authInfo } = useContext(AuthContext);
  const userId = authInfo?.userid || 'user002'; // 백엔드에서 확인된 user002 사용

  const [currentPoints, setCurrentPoints] = useState(0);
  const [ownedItems, setOwnedItems] = useState([]);
  const [activeFilter, setActiveFilter] = useState('all');
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [selectedReward, setSelectedReward] = useState(null);
  const [questRewards, setQuestRewards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userStats, setUserStats] = useState({
    level: 0,
    completedQuests: 0,
    totalQuests: 0,
    ownedTitles: 0,
    totalTitles: 0
  });
  const [displayedPoints, setDisplayedPoints] = useState(0);

  // API 연동 함수 - Spring 백엔드 경로에 맞게 수정
  const fetchRewards = async () => {
    const res = await apiClient.get('/api/quest-rewards');
    console.log('API 응답 데이터:', res.data); // 디버깅용 로그 추가
    console.log('첫 번째 아이템의 모든 키:', res.data[0] ? Object.keys(res.data[0]) : '데이터 없음'); // 모든 필드명 확인
    console.log('첫 번째 아이템 전체:', res.data[0]); // 첫 번째 아이템 전체 데이터 확인
    
    // DB 컬럼명과 프론트엔드 필드명 매핑
    const mappedData = res.data.map(item => {
      console.log('매핑 전 아이템:', item); // 각 아이템의 원본 데이터 확인
      console.log('아이템의 모든 키:', Object.keys(item)); // 각 아이템의 모든 키 확인
      
      const mapped = {
        rewardId: item.rewardId ?? item.REWARD_ID ?? item.reward_id,
        questName: item.questName ?? item.QUEST_NAME ?? item.quest_name,
        requiredPoints: item.requiredPoints ?? item.REQUIRED_POINTS ?? item.required_points,
        rewardRarity: item.rewardType ?? item.rewardRarity ?? item.REWARD_RARITY ?? item.reward_rarity ?? item.rarity ?? item.RARITY ?? item.grade ?? item.GRADE,
        titleReward: item.titleReward ?? item.TITLE_REWARD ?? item.title_reward,
        description: item.description ?? item.DESCRIPTION,
        imagePath: item.imagePath ?? item.IMAGE_PATH ?? item.image_path
      };
      console.log('매핑된 아이템:', mapped); // 디버깅용 로그 추가
      return mapped;
    });
    
    console.log('최종 매핑된 데이터:', mappedData); // 디버깅용 로그 추가
    return mappedData;
  };
  const fetchPoints = async () => {
    const res = await apiClient.get(`/api/user/points?userId=${userId}`);
    return res.data.points;
  };
  const fetchOwnedBadges = async () => {
    const res = await apiClient.get(`/api/user/owned-titles?userId=${userId}`);
    return res.data;
  };
  const fetchUserStats = async () => {
    const res = await apiClient.get(`/api/user/stats?userId=${userId}`);
    return res.data;
  };
  const purchaseBadge = async (rewardId) => {
    const res = await apiClient.post(`/api/quest-rewards/purchase?userId=${userId}`, { rewardId });
    return res.data;
  };

  // 데이터 로딩
  useEffect(() => {
    if (!userId) return; // userId가 없으면 호출하지 않음
    const loadData = async () => {
      setLoading(true);
      try {
        const [rewards, points, owned, stats] = await Promise.all([
          fetchRewards(),
          fetchPoints(),
          fetchOwnedBadges(),
          fetchUserStats()
        ]);
        setQuestRewards(rewards);
        setCurrentPoints(points);
        setOwnedItems(owned);
        setUserStats(stats);
      } catch (e) {
        setToastMessage('데이터 로딩 실패');
        setShowToast(true);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [userId]); // userId가 바뀔 때마다 실행

  useEffect(() => {
    let start = displayedPoints;
    let end = currentPoints;
    if (start === end) return;
    let duration = 800;
    let startTime = null;
    function animatePoints(ts) {
      if (!startTime) startTime = ts;
      const progress = Math.min((ts - startTime) / duration, 1);
      const value = Math.floor(start + (end - start) * progress);
      setDisplayedPoints(value);
      if (progress < 1) {
        requestAnimationFrame(animatePoints);
      }
    }
    requestAnimationFrame(animatePoints);
    // eslint-disable-next-line
  }, [currentPoints]);

  const filterItems = (rarity) => {
    setActiveFilter(rarity);
  };

  const handlePurchase = async (reward) => {
    if (currentPoints >= reward.requiredPoints) {
      setSelectedReward(reward);
      setShowConfirmModal(true);
    } else {
      showToastMessage('포인트가 부족합니다!');
    }
  };

  const confirmPurchase = async () => {
    if (!selectedReward) return;
    
    try {
      await purchaseBadge(selectedReward.rewardId);
      setCurrentPoints(prev => prev - selectedReward.requiredPoints);
      setOwnedItems(prev => [...prev, selectedReward.rewardId]);
      setUserStats(prev => ({
        ...prev,
        ownedTitles: prev.ownedTitles + 1   }));
      showToastMessage(`${selectedReward.titleReward} 뱃지 획득!`);
      setShowConfirmModal(false);
      setSelectedReward(null);
    } catch (e) {
      showToastMessage('구매 실패: ' + (e.response?.data || '오류'));
      setShowConfirmModal(false);
      setSelectedReward(null);
    }
  };

  const cancelPurchase = () => {
    setShowConfirmModal(false);
    setSelectedReward(null);
  };

  const showToastMessage = (message) => {
    setToastMessage(message);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 2000);
  };

  const getRarityClass = (rarity) => {
    switch (rarity) {
      case '레어': return styles.rarityRare;
      case '에픽': return styles.rarityEpic;
      case '유니크': return styles.rarityUnique;
      case '레전더리': return styles.rarityLegendary;
      case '플래티넘': return styles.rarityPlatinum;
      default: return '';
    }
  };

  // 필터링 시 rewardType이 아니라 rewardRarity로 필터링
  const filteredRewards = activeFilter === 'all' 
    ? questRewards 
    : questRewards.filter(reward => reward.rewardRarity === activeFilter);

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.loadingSpinner}>로딩 중...</div>
      </div>
    );
  }

  return (
    <div>
      <UserHeader/>

      <main className={styles.main}>
        <h1 className={styles.pageTitle}>뱃지 상점</h1>
        {/* 사용자 통계 */}
        <div className={styles.userStats}>
          <div className={styles.statCard}>
            <div className={styles.statLabel}>완료한 퀘스트</div>
            <div className={styles.statValue}>{userStats.completedQuests}</div>
            <div className={styles.statLabel}>총 {userStats.totalQuests}개 중</div>
          </div>
          <div className={styles.statCard}>
            <div className={styles.statLabel}>획득한 뱃지</div>
            <div className={styles.statValue}>{userStats.ownedTitles}</div>
            <div className={styles.statLabel}>총 {userStats.totalTitles}개 중</div>
          </div>
        </div>
        {/* 포인트 표시 */}
        <div className={styles.pointsDisplay}>
          <div className={styles.pointsLabel}>현재 포인트</div>
          <div className={styles.pointsValue}>
            {displayedPoints.toLocaleString()}
          </div>
          <div className={styles.pointsLabel}>퀘스트 완료로 포인트를 획득하세요!</div>
          <Link to="/quest" className={styles.pointsQuestBtn}>
            퀘스트 바로가기
          </Link>
        </div>
        {/* 스토어 섹션 */}
        <div className={styles.storeSection}>
          <div className={styles.storeHeader}>
            <h1 className={styles.pageTitle}>뱃지 상점</h1>
            <div className={styles.filterTabs}>
              <button 
                className={`${styles.filterTab} ${styles.filterTabAll} ${activeFilter === 'all' ? styles.active : ''}`}
                onClick={() => filterItems('all')}
              >
                전체
              </button>
              <button 
                className={`${styles.filterTab} ${styles.rarityRare} ${activeFilter === '레어' ? styles.active : ''}`}
                onClick={() => filterItems('레어')}
              >
                레어
              </button>
              <button 
                className={`${styles.filterTab} ${styles.rarityEpic} ${activeFilter === '에픽' ? styles.active : ''}`}
                onClick={() => filterItems('에픽')}
              >
                에픽
              </button>
              <button 
                className={`${styles.filterTab} ${styles.rarityUnique} ${activeFilter === '유니크' ? styles.active : ''}`}
                onClick={() => filterItems('유니크')}
              >
                유니크
              </button>
              <button 
                className={`${styles.filterTab} ${styles.rarityLegendary} ${activeFilter === '레전더리' ? styles.active : ''}`}
                onClick={() => filterItems('레전더리')}
              >
                레전더리
              </button>
              <button 
                className={`${styles.filterTab} ${styles.rarityPlatinum} ${activeFilter === '플래티넘' ? styles.active : ''}`}
                onClick={() => filterItems('플래티넘')}
              >
                플래티넘
              </button>
            </div>
          </div>
          <div className={styles.storeGrid}>
            {filteredRewards.map(reward => {
              console.log('렌더링할 뱃지:', reward); // 디버깅용 로그 추가
              return (
                <div 
                  key={reward.rewardId} 
                  className={
                    `${styles.storeItem} ${ownedItems.includes(reward.rewardId) ? styles.owned : ''} ${getRarityClass(reward.rewardRarity)}`
                  }
                >
                  <div className={`${styles.itemRarity} ${getRarityClass(reward.rewardRarity)}`}>
                    {reward.rewardRarity || '등급 없음'} {/* fallback 추가 */}
                  </div>
                  <div className={`${styles.itemIcon} ${getRarityClass(reward.rewardRarity)}`}>
                    <img
                      src={reward.imagePath || `/images/badge/badge_${reward.rewardId}.png`}
                      alt="뱃지 아이콘"
                      style={{ width: 48, height: 48, objectFit: 'contain' }}
                    />
                  </div>
                  <h3 className={styles.itemTitle}>{reward.questName}</h3>
                  <p className={styles.itemDescription}>{reward.description}</p>
                  <div className={styles.itemPrice}>
                    {reward.requiredPoints.toLocaleString()} 포인트
                  </div>
                  <button 
                    className={`${styles.purchaseBtn} ${
                      ownedItems.includes(reward.rewardId) ? styles.owned : 
                      currentPoints < reward.requiredPoints ? styles.insufficient : ''
                    } ${ownedItems.includes(reward.rewardId) ? 'owned' : ''}`}
                    onClick={() => handlePurchase(reward)}
                    disabled={ownedItems.includes(reward.rewardId) || currentPoints < reward.requiredPoints}
                  >
                    {ownedItems.includes(reward.rewardId) ? '획득 완료' : '획득하기'}
                  </button>
                  {(!ownedItems.includes(reward.rewardId) && currentPoints < reward.requiredPoints) && (
                    <div className={styles.pointsShortMsg}>
                      {reward.requiredPoints - currentPoints}포인트만 더 모으면 구매 가능!
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </main>
      {showToast && (
        <div className={styles.toast} style={{ display: 'block' }}>
          {toastMessage}
        </div>
      )}
      {showConfirmModal && selectedReward && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalContent}>
            <h2>뱃지 획득 확인</h2>
            <p>{selectedReward.titleReward} 뱃지를 획득하시겠습니까?</p>
            <div className={styles.modalButtons}>
              <button onClick={confirmPurchase} className={styles.confirmBtn}>확인</button>
              <button onClick={cancelPurchase} className={styles.cancelBtn}>취소</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default QuestStorePage;
