import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import apiClient from '../../utils/axios';
import styles from './QuestStorePage.module.css';

const QuestStorePage = () => {
  const [currentPoints, setCurrentPoints] = useState(0);
  const [ownedItems, setOwnedItems] = useState([]);
  const [activeFilter, setActiveFilter] = useState('all');
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [questRewards, setQuestRewards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userStats, setUserStats] = useState({
    level: 0,
    completedQuests: 0,
    totalQuests: 0,
    ownedTitles: 0,
    totalTitles: 0
  });

  // 퀘스트 보상 데이터 로딩
  const loadQuestRewards = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get('/api/quest-rewards');
      console.log('퀘스트 보상 데이터:', response.data);
      setQuestRewards(response.data);
    } catch (error) {
      console.error('퀘스트 보상 로딩 실패:', error);
      // 임시 데이터로 폴백
      setQuestRewards([
        {
          rewardId: 1,
          questName: '첫 마음 다짐',
          requiredPoints: 100,
          rewardType: '레어',
          titleReward: '마음의 첫걸음',
          description: '내면으로 한 걸음 내딛은 당신에게'
        },
        {
          rewardId: 2,
          questName: '감정 일기',
          requiredPoints: 200,
          rewardType: '레어',
          titleReward: '감정 기록자',
          description: '자신의 감정을 기록하는 따뜻한 마음'
        },
        {
          rewardId: 3,
          questName: '자기 이해',
          requiredPoints: 300,
          rewardType: '에픽',
          titleReward: '내면 탐구자',
          description: '자신의 내면을 깊이 탐구한 자에게'
        },
        {
          rewardId: 4,
          questName: '스트레스 관리',
          requiredPoints: 400,
          rewardType: '에픽',
          titleReward: '평온의 수호자',
          description: '마음의 평온을 지키는 강인한 영혼'
        },
        {
          rewardId: 5,
          questName: '깊은 대화',
          requiredPoints: 600,
          rewardType: '유니크',
          titleReward: '마음의 동반자',
          description: '진정한 대화로 마음을 나누는 자에게'
        },
        {
          rewardId: 6,
          questName: '긍정의 습관',
          requiredPoints: 700,
          rewardType: '유니크',
          titleReward: '희망의 전파자',
          description: '긍정의 에너지를 퍼뜨리는 빛나는 존재'
        },
        {
          rewardId: 7,
          questName: '자아 성장',
          requiredPoints: 800,
          rewardType: '레전더리',
          titleReward: '성장의 별',
          description: '끊임없는 성장으로 빛나는 별과 같은 당신'
        },
        {
          rewardId: 8,
          questName: '마음의 여정',
          requiredPoints: 1000,
          rewardType: '레전더리',
          titleReward: '영혼의 길잡이',
          description: '마음의 여정을 이끄는 위대한 길잡이'
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  // 사용자 정보 및 포인트 로딩
  const loadUserInfo = async () => {
    try {
      const response = await apiClient.get('/api/user/points');
      console.log('사용자 포인트 정보:', response.data);
      setCurrentPoints(response.data.points || 0);
    } catch (error) {
      console.error('사용자 포인트 로딩 실패:', error);
      setCurrentPoints(2450); // 기본값
    }
  };

  // 사용자 통계 로딩
  const loadUserStats = async () => {
    try {
      const response = await apiClient.get('/api/user/stats');
      console.log('사용자 통계:', response.data);
      setUserStats(response.data);
    } catch (error) {
      console.error('사용자 통계 로딩 실패:', error);
      // 기본값 설정
      setUserStats({
        level: 5,
        completedQuests: 12,
        totalQuests: 20,
        ownedTitles: 8,
        totalTitles: 25
      });
    }
  };

  // 보유한 칭호 목록 로딩
  const loadOwnedTitles = async () => {
    try {
      const response = await apiClient.get('/api/user/owned-titles');
      console.log('보유한 칭호:', response.data);
      const ownedTitleIds = response.data.map(title => title.rewardId);
      setOwnedItems(ownedTitleIds);
    } catch (error) {
      console.error('보유한 칭호 로딩 실패:', error);
      setOwnedItems([]);
    }
  };

  // 컴포넌트 마운트 시 데이터 로딩
  useEffect(() => {
    const loadData = async () => {
      await Promise.all([
        loadQuestRewards(),
        loadUserInfo(),
        loadUserStats(),
        loadOwnedTitles()
      ]);
    };
    
    loadData();
  }, []);

  const filterItems = (rarity) => {
    setActiveFilter(rarity);
  };

  const purchaseReward = async (reward) => {
    if (currentPoints >= reward.requiredPoints) {
      try {
        const response = await apiClient.post('/api/quest-rewards/purchase', {
          rewardId: reward.rewardId
        });
        
        console.log('칭호 구매 성공:', response.data);
        
        // 포인트 차감
        setCurrentPoints(prev => prev - reward.requiredPoints);
        
        // 보유 목록에 추가
        setOwnedItems(prev => [...prev, reward.rewardId]);
        
        // 사용자 통계 업데이트
        setUserStats(prev => ({
          ...prev,
          ownedTitles: prev.ownedTitles + 1
        }));
        
        showToastMessage(`${reward.titleReward} 칭호 획득!`);
      } catch (error) {
        console.error('칭호 구매 실패:', error);
        if (error.response?.status === 400) {
          showToastMessage('포인트가 부족합니다!');
        } else if (error.response?.status === 409) {
          showToastMessage('이미 보유한 칭호입니다!');
        } else {
          showToastMessage('구매 중 오류가 발생했습니다.');
        }
      }
    } else {
      showToastMessage('포인트가 부족합니다!');
    }
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
      default: return '';
    }
  };

  const getRarityIcon = (rarity) => {
    switch (rarity) {
      case '레어': return '🔵';
      case '에픽': return '🟣';
      case '유니크': return '🟡';
      case '레전더리': return '🟢';
      default: return '⚪';
    }
  };

  const filteredRewards = activeFilter === 'all' 
    ? questRewards 
    : questRewards.filter(reward => reward.rewardType === activeFilter);

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.loadingSpinner}>로딩 중...</div>
      </div>
    );
  }

  return (
    <div>
      <header className={styles.header}>
        <div className={styles.headerInner}>
          <Link to="/" style={{ textDecoration: 'none' }}>
            <div className={styles.logoWrap}>
              <span className={styles.logoText}>
                <span style={{ color: '#4b94d0', fontWeight: 900, fontSize: '2rem', letterSpacing: '-1px' }}>SEE</span>
                <span style={{ color: '#3d3833', fontWeight: 900, fontSize: '2rem', letterSpacing: '-1px' }}>MS</span>
              </span>
              <img 
                src="/logo.png" 
                alt="SEE MS 로고" 
                style={{ marginLeft: '-5px', width: '54px', height: '54px', borderRadius: 0, background: 'none', boxShadow: 'none' }}
              />
            </div>
          </Link>
          <nav className={styles.nav}>
            <Link to="/">홈</Link>
            <Link to="/counseling">상담</Link>
            <Link to="/record">기록</Link>
            <Link to="/test">심리 검사</Link>
            <Link to="/analysis">분석</Link>
            <Link to="/quest">활동</Link>
            <Link to="/simulation">시뮬레이션</Link>
            <Link to="/mypage">마이페이지</Link>
            <Link to="/login" style={{ color: 'var(--main-accent)', fontWeight: 900 }}>로그인/회원가입</Link>
          </nav>
        </div>
      </header>

      <main className={styles.main}>
        <h1 className={styles.pageTitle}>퀘스트 보상 스토어</h1>
        
        {/* 사용자 통계 */}
        <div className={styles.userStats}>
          <div className={styles.statCard}>
            <div className={styles.statLabel}>현재 레벨</div>
            <div className={styles.statValue}>{userStats.level}</div>
            <div className={styles.statLabel}>다음 레벨까지 200XP</div>
          </div>
          <div className={styles.statCard}>
            <div className={styles.statLabel}>완료한 퀘스트</div>
            <div className={styles.statValue}>{userStats.completedQuests}</div>
            <div className={styles.statLabel}>총 {userStats.totalQuests}개 중</div>
          </div>
          <div className={styles.statCard}>
            <div className={styles.statLabel}>획득한 칭호</div>
            <div className={styles.statValue}>{userStats.ownedTitles}</div>
            <div className={styles.statLabel}>총 {userStats.totalTitles}개 중</div>
          </div>
        </div>

        {/* 포인트 표시 */}
        <div className={styles.pointsDisplay}>
          <div className={styles.pointsLabel}>현재 포인트</div>
          <div className={styles.pointsValue}>{currentPoints.toLocaleString()}</div>
          <div className={styles.pointsLabel}>퀘스트 완료로 포인트를 획득하세요!</div>
        </div>

        {/* 스토어 섹션 */}
        <div className={styles.storeSection}>
          <div className={styles.storeHeader}>
            <h2 className={styles.storeTitle}>칭호 스토어</h2>
            <div className={styles.filterTabs}>
              <button 
                className={`${styles.filterTab} ${activeFilter === 'all' ? styles.active : ''}`}
                onClick={() => filterItems('all')}
              >
                전체
              </button>
              <button 
                className={`${styles.filterTab} ${activeFilter === '레어' ? styles.active : ''}`}
                onClick={() => filterItems('레어')}
              >
                🔵 레어
              </button>
              <button 
                className={`${styles.filterTab} ${activeFilter === '에픽' ? styles.active : ''}`}
                onClick={() => filterItems('에픽')}
              >
                🟣 에픽
              </button>
              <button 
                className={`${styles.filterTab} ${activeFilter === '유니크' ? styles.active : ''}`}
                onClick={() => filterItems('유니크')}
              >
                🟡 유니크
              </button>
              <button 
                className={`${styles.filterTab} ${activeFilter === '레전더리' ? styles.active : ''}`}
                onClick={() => filterItems('레전더리')}
              >
                🟢 레전더리
              </button>
            </div>
          </div>
          <div className={styles.storeGrid}>
            {filteredRewards.map(reward => (
              <div 
                key={reward.rewardId} 
                className={`${styles.storeItem} ${ownedItems.includes(reward.rewardId) ? styles.owned : ''}`}
              >
                <div className={`${styles.itemRarity} ${getRarityClass(reward.rewardType)}`}>
                  {getRarityIcon(reward.rewardType)} {reward.rewardType}
                </div>
                <div className={styles.itemIcon}>
                  👑
                </div>
                <h3 className={styles.itemTitle}>{reward.questName}</h3>
                <p className={styles.itemDescription}>{reward.description}</p>
                <div className={styles.rewardInfo}>
                  <div className={styles.titleReward}>
                    <span className={styles.rewardLabel}>칭호:</span>
                    <span className={styles.rewardValue}>{reward.titleReward}</span>
                  </div>
                </div>
                <div className={styles.itemPrice}>
                  {reward.requiredPoints.toLocaleString()} 포인트
                </div>
                <button 
                  className={`${styles.purchaseBtn} ${
                    ownedItems.includes(reward.rewardId) ? styles.owned : 
                    currentPoints < reward.requiredPoints ? styles.insufficient : ''
                  }`}
                  onClick={() => purchaseReward(reward)}
                  disabled={ownedItems.includes(reward.rewardId) || currentPoints < reward.requiredPoints}
                >
                  {ownedItems.includes(reward.rewardId) ? '획득 완료' : '획득하기'}
                </button>
              </div>
            ))}
          </div>
        </div>
      </main>

      {showToast && (
        <div className={styles.toast} style={{ display: 'block' }}>
          {toastMessage}
        </div>
      )}
    </div>
  );
};

export default QuestStorePage;
