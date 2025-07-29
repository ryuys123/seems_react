import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import apiClient from '../../utils/axios'; // axios 대신 apiClient 사용
import styles from './QuestStorePage.module.css';
import { AuthContext } from '../../AuthProvider'; // 실제 AuthProvider 경로에 맞게 수정
import UserHeader from '../../components/common/UserHeader';

const QuestStorePage = () => {
  const { userid } = useContext(AuthContext);
  const userId = userid;

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
    console.log('API 호출 시작: /api/quest-rewards');
    const res = await apiClient.get('/api/quest-rewards');
    console.log('API 응답 데이터: /api/quest-rewards', res.data);
    
    const mappedData = res.data.map(item => {
      const mapped = {
        rewardId: item.rewardId ?? item.REWARD_ID ?? item.reward_id,
        questName: item.questName ?? item.QUEST_NAME ?? item.quest_name,
        requiredPoints: item.requiredPoints ?? item.REQUIRED_POINTS ?? item.required_points,
        rewardRarity: item.rewardType ?? item.rewardRarity ?? item.REWARD_RARITY ?? item.reward_rarity ?? item.rarity ?? item.RARITY ?? item.grade ?? item.GRADE,
        titleReward: item.titleReward ?? item.TITLE_REWARD ?? item.title_reward,
        description: item.description ?? item.DESCRIPTION,
        imagePath: item.imagePath ?? item.IMAGE_PATH ?? item.image_path
      };
      return mapped;
    });
    
    console.log('최종 매핑된 데이터: /api/quest-rewards', mappedData);
    return mappedData;
  };
  const fetchPoints = async () => {
    console.log('API 호출 시작: /api/user/points');
    const res = await apiClient.get(`/api/user/points?userId=${userId}`);
    console.log('API 응답 데이터: /api/user/points', res.data);
    return res.data.points;
  };
  const fetchOwnedBadges = async () => {
    console.log('API 호출 시작: /api/user/owned-titles');
    const res = await apiClient.get(`/api/user/owned-titles?userId=${userId}`);
    console.log('API 응답 데이터: /api/user/owned-titles', res.data);
    return res.data;
  };
  const fetchUserStats = async () => {
    console.log('API 호출 시작: /api/user/stats');
    const res = await apiClient.get(`/api/user/stats?userId=${userId}`);
    console.log('API 응답 데이터: /api/user/stats', res.data);
    return res.data;
  };
  const purchaseBadge = async (rewardId) => {
    console.log('API 호출 시작: /api/quest-rewards/purchase');
    const res = await apiClient.post(`/api/quest-rewards/purchase?userId=${userId}`, { rewardId });
    console.log('API 응답 데이터: /api/quest-rewards/purchase', res.data);
    return res.data;
  };
  const equipBadge = async (rewardId, isCurrentlyEquipped) => {
    try {
      let res;
      if (isCurrentlyEquipped) {
        // 장착 해제 요청
        console.log('API 호출 시작: /api/user/unequip-badge');
        res = await apiClient.post(`/api/user/unequip-badge?userId=${userId}`, { rewardId });
        showToastMessage('뱃지가 해제되었습니다!');
      } else {
        // 장착 요청
        console.log('API 호출 시작: /api/user/equip-badge');
        res = await apiClient.post(`/api/user/equip-badge?userId=${userId}`, { rewardId });
        showToastMessage('뱃지가 장착되었습니다!');
      }
      console.log('API 응답 데이터 (장착/해제 후): ', res.data);
      setOwnedItems(res.data); // 최신 ownedItems 목록으로 갱신
      console.log('setOwnedItems 호출 완료.');
      // UserHeader의 뱃지 업데이트를 트리거
      if (window.triggerBadgeUpdate) {
        window.triggerBadgeUpdate();
      }
    } catch (e) {
      console.error('장착/해제 실패: ' + (e.response?.data || '오류'), e);
      showToastMessage('장착/해제 실패: ' + (e.response?.data?.error || e.response?.data || '오류'));
    }
  };

  // ownedItems 상태 변화를 추적하는 useEffect
  useEffect(() => {
    console.log('ownedItems 상태 변경됨:', ownedItems);
  }, [ownedItems]);

  // 데이터 로딩
  useEffect(() => {
    console.log('useEffect 실행 - 현재 userId:', userId); // useEffect 실행 시점 로그
    if (!userId) {
      console.log('userId가 없어 API 호출을 건너뜁니다.');
      return;
    }
    const loadData = async () => {
      console.log('loadData 함수 실행 시작 (userId: ', userId, ')'); // loadData 함수 실행 확인 로그
      setLoading(true);
      try {
        console.log('Promise.all로 API 호출 시작...'); // Promise.all 직전 로그
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
        console.log('모든 API 호출 성공 및 데이터 설정 완료.');
      } catch (e) {
        console.error('데이터 로딩 중 오류 발생:', e); // 상세 오류 로깅
        if (e.response) {
          // 서버 응답이 있는 경우 (AxiosError)
          console.error('응답 데이터:', e.response.data);
          console.error('응답 상태:', e.response.status);
          console.error('응답 헤더:', e.response.headers);
          setToastMessage(`데이터 로딩 실패: ${e.response.status} - ${e.response.data?.message || e.response.statusText}`);
        } else if (e.request) {
          // 요청이 전송되었지만 응답을 받지 못한 경우
          console.error('요청 데이터:', e.request);
          setToastMessage('데이터 로딩 실패: 서버 응답 없음');
        } else {
          // 그 외 오류
          setToastMessage('데이터 로딩 실패: ' + (e.message || '알 수 없는 오류'));
        }
        setShowToast(true);
      } finally {
        setLoading(false);
        console.log('로딩 상태 해제.');
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
      const result = await purchaseBadge(selectedReward.rewardId);
      
      // 포인트 정보를 다시 불러와서 상태를 업데이트합니다.
      const updatedPoints = await fetchPoints();
      setCurrentPoints(updatedPoints);

      setOwnedItems(prev => [...prev, result]);
      setUserStats(prev => ({
        ...prev,
        ownedTitles: prev.ownedTitles + 1
      }));
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
              const ownedObj = ownedItems.find(item => item.rewardId === reward.rewardId);
              const isOwned = !!ownedObj;
              const isEquipped = ownedObj?.isEquipped;
              return (
                <div 
                  key={reward.rewardId} 
                  className={
                    `${styles.storeItem} ${isOwned ? styles.owned : ''} ${getRarityClass(reward.rewardRarity)}`
                  }
                >
                  <div className={`${styles.itemRarity} ${getRarityClass(reward.rewardRarity)}`}>{reward.rewardRarity || '등급 없음'}</div>
                  <div className={`${styles.itemIcon} ${getRarityClass(reward.rewardRarity)}`}>
                    <img
                      src={reward.imagePath || `/images/badge/badge_${reward.rewardId}.png`}
                      alt="뱃지 아이콘"
                      style={{ width: 48, height: 48, objectFit: 'contain' }}
                      loading="lazy"
                    />
                  </div>
                  <h3 className={styles.itemTitle}>{reward.titleReward || reward.questName}</h3>
                  <p className={styles.itemDescription}>{reward.description}</p>
                  <div className={styles.itemPrice}>{reward.requiredPoints.toLocaleString()} 포인트</div>
                  {/* 구매/획득 버튼 */}
                  <button 
                    className={`${styles.purchaseBtn} ${isOwned ? styles.owned : currentPoints < reward.requiredPoints ? styles.insufficient : ''} ${isOwned ? 'owned' : ''}`}
                    onClick={() => handlePurchase(reward)}
                    disabled={isOwned || currentPoints < reward.requiredPoints}
                  >
                    {isOwned ? '획득 완료' : '획득하기'}
                  </button>
                  {/* 장착 버튼 */}
                  {isOwned && (
                    <button
                      className={`${styles.equipBtn} ${isEquipped ? styles.equipped : ''}`}
                      disabled={false} // 장착/해제 모두 가능하도록 disabled 제거
                      onClick={() => equipBadge(reward.rewardId, isEquipped)}
                      style={{ marginTop: 8 }}
                    >
                      {isEquipped ? '장착 해제' : '장착하기'}
                    </button>
                  )}
                  {/* 포인트 부족 안내 */}
                  {(!isOwned && currentPoints < reward.requiredPoints) && (
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
