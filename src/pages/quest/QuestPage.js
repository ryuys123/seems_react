import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import styles from './QuestPage.module.css';
import UserHeader from '../../components/common/UserHeader';
import { 
  getUserQuestStats, 
  getUserQuests, 
  completeQuest, 
  completeQuestStep,
  createQuest, 
  updateQuest, 
  deleteQuest 
} from '../../services/QuestService';

const QuestPage = () => {
  // 사용자 정보 (실제로는 로그인된 사용자 정보를 사용)
  const [userId] = useState(() => {
    // 1. userInfo에서 사용자 ID 가져오기
    const userInfo = localStorage.getItem('userInfo');
    if (userInfo) {
      try {
        const parsed = JSON.parse(userInfo);
        if (parsed.userId) {
          console.log('userInfo에서 userId 추출:', parsed.userId);
          return parsed.userId;
        }
      } catch (error) {
        console.error('userInfo 파싱 에러:', error);
      }
    }
    
    // 2. JWT 토큰에서 사용자 ID 추출 시도
    const accessToken = localStorage.getItem('accessToken');
    if (accessToken) {
      try {
        const payload = JSON.parse(atob(accessToken.split('.')[1]));
        console.log('JWT 토큰 페이로드:', payload);
        
        // 다양한 필드명으로 userId 찾기
        const extractedUserId = payload.userId || payload.sub || payload.user_id || payload.userid;
        if (extractedUserId) {
          console.log('JWT에서 userId 추출:', extractedUserId);
          return extractedUserId;
        }
      } catch (error) {
        console.error('JWT 토큰 파싱 에러:', error);
      }
    }
    
    // 3. localStorage에서 직접 userId 확인
    const loggedInUserId = localStorage.getItem('loggedInUserId');
    if (loggedInUserId) {
      console.log('localStorage에서 userId 추출:', loggedInUserId);
      return loggedInUserId;
    }
    
    // 4. 기본값 반환
    console.log('기본 userId 사용:', 'user001');
    return 'user001';
  });
  
  const [ongoingActivities, setOngoingActivities] = useState([]);
  const [recommendations] = useState([
    {
      id: 1,
      title: '스트레스 해소 명상',
      duration: '10분',
      reward: '포인트 +20',
      description: '오늘의 감정 기록을 분석한 결과, 스트레스 수준이 높습니다. 명상을 통해 마음의 평화를 찾아보세요.',
      added: false
    },
    {
      id: 2,
      title: '기분 전환 산책',
      duration: '20분',
      reward: '포인트 +15',
      description: '최근 우울감이 증가하는 추세입니다. 가벼운 산책을 통해 기분을 전환해보세요.',
      added: false
    },
    {
      id: 3,
      title: '감사 일기 작성',
      duration: '5분',
      reward: '포인트 +10',
      description: '오늘 하루 감사한 일들을 기록하며 긍정적인 마인드를 키워보세요.',
      added: false
    }
  ]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [editingStep, setEditingStep] = useState(null); // 편집 중인 step 추적
  const [editValue, setEditValue] = useState(''); // 편집 중인 텍스트 값
  const [showQuestConfirmModal, setShowQuestConfirmModal] = useState(false);
  const [selectedRecommendation, setSelectedRecommendation] = useState(null);

  const showToastMessage = (message) => {
    setToastMessage(message);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 2000);
  };

  // 데이터 로딩 함수
  const loadUserData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('Loading data for userId:', userId);
      
      // 사용자 통계와 퀘스트 목록을 병렬로 로드
      const [statsResponse, questsResponse] = await Promise.all([
        getUserQuestStats(userId),
        getUserQuests(userId)
      ]);
      
      console.log('Stats Response:', statsResponse);
      console.log('Quests Response:', questsResponse);
      
      // 통계 데이터 설정 (기본값 포함)
      setUserStats({
        currentPoints: statsResponse?.data?.currentPoints || statsResponse?.currentPoints || 0,
        completedQuests: statsResponse?.data?.completedQuests || statsResponse?.completedQuests || 0,
        totalQuests: statsResponse?.data?.totalQuests || statsResponse?.totalQuests || 20,
        streakDays: statsResponse?.data?.streakDays || statsResponse?.streakDays || 0,
        maxStreakDays: statsResponse?.data?.maxStreakDays || statsResponse?.maxStreakDays || 0
      });
      
      // 퀘스트 데이터 설정 (배열이 아니면 빈 배열로 설정)
      const questsData = Array.isArray(questsResponse?.data) ? questsResponse.data : 
                        Array.isArray(questsResponse) ? questsResponse : [];
      
      // 데이터 구조 검증 및 안전한 매핑
      const validatedQuests = questsData.map((quest, index) => {
        console.log('원본 퀘스트 데이터:', quest); // 디버깅용
        
        // 퀘스트 완료 상태 확인
        const isQuestCompleted = quest.isCompleted === 1 || quest.isCompleted === true || quest.completed === 1 || quest.completed === true;
        
        return {
          id: quest.id || quest.questId || `quest-${index}`,
          date: quest.date || quest.createdAt || new Date().toISOString().slice(0,10),
          title: quest.title || quest.questName || `퀘스트 ${index + 1}`,
          progress: quest.progress || 0,
          completed: isQuestCompleted ? 1 : 0,
          total: quest.total || 1,
          steps: Array.isArray(quest.steps) ? quest.steps.map((step, stepIndex) => ({
            id: step.id || step.stepId || `step-${index}-${stepIndex}`,
            text: step.text || step.stepName || `단계 ${stepIndex + 1}`,
            completed: step.completed === 1 || step.completed === true || false,
            current: step.current || false,
            point: step.point || 5
          })) : [
            // 임시 테스트 데이터 - steps가 없을 경우 기본 단계 추가
            {
              id: `default-step-${index}-1`,
              text: quest.title || quest.questName || `새 퀘스트 ${index + 1}`,
              completed: isQuestCompleted, // 퀘스트 완료 상태를 단계 완료 상태로 반영
              current: !isQuestCompleted,
              point: 5
            }
          ]
        };
      });
      
      console.log('Validated Quests:', validatedQuests);
      setOngoingActivities(validatedQuests);
      
    } catch (error) {
      console.error('데이터 로딩 에러:', error);
      
      // 401 에러 (인증 실패)인 경우
      if (error.response?.status === 401) {
        setError('로그인이 만료되었습니다. 다시 로그인해주세요.');
        showToastMessage('로그인이 만료되었습니다.');
        
        // 3초 후 로그인 페이지로 리다이렉트
        setTimeout(() => {
          window.location.href = '/login';
        }, 3000);
      } else {
        setError('데이터를 불러오는 중 오류가 발생했습니다.');
        showToastMessage('데이터 로딩에 실패했습니다.');
      }
      
      // 에러 시 기본값 설정
      setUserStats({
        currentPoints: 0,
        completedQuests: 0,
        totalQuests: 20,
        streakDays: 0,
        maxStreakDays: 0
      });
      setOngoingActivities([]);
    } finally {
      setLoading(false);
    }
  };

  // 컴포넌트 마운트 시 데이터 로드
  useEffect(() => {
    // 로그인 상태 확인
    const accessToken = localStorage.getItem('accessToken');
    const refreshToken = localStorage.getItem('refreshToken');
    
    if (!accessToken || !refreshToken) {
      setError('로그인이 필요합니다.');
      showToastMessage('로그인이 필요합니다.');
      setTimeout(() => {
        window.location.href = '/login';
      }, 2000);
      return;
    }
    
    loadUserData();
  }, [userId]);

  // 인라인 편집 시작
  const startEditing = (activityId, stepId, currentText) => {
    setEditingStep({ activityId, stepId });
    setEditValue(currentText);
  };

  // 인라인 편집 완료
  const finishEditing = () => {
    if (editingStep && editValue.trim()) {
      editStepText(editingStep.activityId, editingStep.stepId, editValue.trim());
    }
    setEditingStep(null);
    setEditValue('');
  };

  // 인라인 편집 취소
  const cancelEditing = () => {
    setEditingStep(null);
    setEditValue('');
  };

  // 엔터키로 저장, ESC키로 취소
  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      finishEditing();
    } else if (e.key === 'Escape') {
      cancelEditing();
    }
  };

  const addActivity = (recommendation) => {
    setSelectedRecommendation(recommendation);
    setShowQuestConfirmModal(true);
  };

  const confirmQuestStart = async () => {
    if (!selectedRecommendation) return;
    
    try {
      const newQuestData = {
        userId: userId,
        questName: selectedRecommendation.title,
        questPoints: 5,
        isCompleted: 0
      };
      
      const response = await createQuest(newQuestData);
      
      const newActivity = {
        id: response.questId || Date.now(),
        date: new Date().toISOString().slice(0,10),
        title: selectedRecommendation.title,
        progress: 0,
        completed: 0,
        total: 1,
        steps: [
          {
            id: 1,
            text: `${selectedRecommendation.title} (${selectedRecommendation.duration})`,
            completed: false,
            current: true,
            point: 5
          }
        ],
        reward: `${selectedRecommendation.reward}`
      };

      setOngoingActivities(prev => [newActivity, ...prev]);
      showToastMessage('활동이 추가되었습니다!');
      setShowQuestConfirmModal(false);
      setSelectedRecommendation(null);
      
    } catch (error) {
      console.error('퀘스트 시작 에러:', error);
      showToastMessage('퀘스트 시작에 실패했습니다.');
    }
  };

  const cancelQuestStart = () => {
    setShowQuestConfirmModal(false);
    setSelectedRecommendation(null);
  };

  const completeStep = async (activityId, stepId) => {
    try {
      console.log('완료 시도:', { activityId, stepId });
      
      // 현재 단계의 완료 상태 확인
      const currentActivity = ongoingActivities.find(activity => activity.id === activityId);
      const currentStep = currentActivity?.steps?.find(step => step.id === stepId);
      const newCompletedState = !currentStep?.completed;
      
      console.log('단계 상태 변경:', { 
        currentCompleted: currentStep?.completed, 
        newCompleted: newCompletedState 
      });
      
      // 먼저 로컬 상태 업데이트 (즉시 반응성 제공)
      setOngoingActivities(prev => prev.map(activity => {
        if (activity.id === activityId) {
          const updatedSteps = (activity.steps || []).map(step => {
            if (step.id === stepId) {
              return { ...step, completed: newCompletedState, current: !newCompletedState };
            }
            return step;
          });

          const completedCount = updatedSteps.filter(step => step.completed).length;
          const progress = (updatedSteps.length > 0 ? (completedCount / updatedSteps.length) * 100 : 0);

          return {
            ...activity,
            steps: updatedSteps,
            completed: completedCount,
            progress: progress
          };
        }
        return activity;
      }));
      
      // 백엔드 API 호출하여 DB에 반영
      try {
        await completeQuestStep(activityId, stepId, newCompletedState, userId);
        console.log('DB에 단계 완료 상태 반영됨:', { activityId, stepId, completed: newCompletedState, userId });
        
        // 포인트 업데이트를 위해 사용자 통계 새로고침
        await loadUserData();
        
      } catch (apiError) {
        console.error('백엔드 API 호출 실패:', apiError);
        showToastMessage('DB 저장에 실패했습니다. 다시 시도해주세요.');
        
        // API 실패 시 로컬 상태를 원래대로 되돌리기
        setOngoingActivities(prev => prev.map(activity => {
          if (activity.id === activityId) {
            const revertedSteps = (activity.steps || []).map(step => {
              if (step.id === stepId) {
                return { ...step, completed: currentStep?.completed || false, current: currentStep?.completed ? false : true };
              }
              return step;
            });

            const completedCount = revertedSteps.filter(step => step.completed).length;
            const progress = (revertedSteps.length > 0 ? (completedCount / revertedSteps.length) * 100 : 0);

            return {
              ...activity,
              steps: revertedSteps,
              completed: completedCount,
              progress: progress
            };
          }
          return activity;
        }));
        return;
      }
      
      showToastMessage(newCompletedState ? '단계가 완료되었습니다!' : '단계가 미완료로 변경되었습니다!');
      
    } catch (error) {
      console.error('단계 완료 에러:', error);
      showToastMessage('단계 완료에 실패했습니다.');
    }
  };

  const editStepText = (activityId, stepId, newText) => {
    setOngoingActivities(prev => prev.map(activity => {
      if (activity.id === activityId) {
        const updatedSteps = (activity.steps || []).map(step => {
          if (step.id === stepId) {
            return { ...step, text: newText };
          }
          return step;
        });
        return { ...activity, steps: updatedSteps };
      }
      return activity;
    }));
  };

  // deleteStep 함수 수정
  const deleteStep = (activityId, stepId) => {
    setOngoingActivities(prev => prev.map(activity => {
      if (activity.id === activityId) {
        const updatedSteps = (activity.steps || []).filter(step => step.id !== stepId);
        const completedCount = updatedSteps.filter(step => step.completed).length;
        const progress = updatedSteps.length > 0 ? (completedCount / updatedSteps.length) * 100 : 0;
        return {
          ...activity,
          steps: updatedSteps,
          completed: completedCount,
          total: updatedSteps.length,
          progress: progress
        };
      }
      return activity;
    }));
  };

  // addStep 함수 수정: DB에 새 퀘스트 생성
  const addStep = async (date) => {
    const newQuestData = {
      userId,
      questName: '새 항목',
      questPoints: 5,
      isCompleted: 0,
      date
    };
    try {
      const response = await createQuest(newQuestData);
      // 응답에서 필요한 필드 추출 (id, questName, createdAt 등)
      const newQuest = {
        id: response.id || response.questId || Date.now(),
        date: response.date || response.createdAt || date,
        title: response.questName || '새 항목',
        progress: 0,
        completed: 0,
        total: 1,
        steps: [], // steps는 그룹핑 구조에서 사용하지 않으므로 빈 배열
        ...response
      };
      // 날짜별 그룹핑 구조에 맞게 해당 날짜 카드 하단에 추가
      setOngoingActivities(prev => [...prev, newQuest]);
      showToastMessage('새 항목이 추가되었습니다!');
    } catch (error) {
      showToastMessage('퀘스트 생성에 실패했습니다.');
    }
  };

  const addQuestCard = async () => {
    try {
      const newQuestData = {
        userId: userId,
        questName: '새 활동',
        questPoints: 5,
        isCompleted: 0
      };
      
      const response = await createQuest(newQuestData);
      
      // 성공 시 로컬 상태 업데이트
      const newCard = {
        id: response.questId || Date.now(),
        date: new Date().toISOString().slice(0, 10),
        title: '새 활동',
        progress: 0,
        completed: 0,
        total: 1,
        steps: [
          {
            id: 1,
            text: '새 항목',
            completed: false,
            point: 5
          }
        ],
        reward: '보상: 직접 입력'
      };
      
      setOngoingActivities(prev => [newCard, ...prev]);
      showToastMessage('새 퀘스트가 생성되었습니다!');
      
    } catch (error) {
      console.error('퀘스트 생성 에러:', error);
      showToastMessage('퀘스트 생성에 실패했습니다.');
    }
  };

  // editCardTitle 함수 수정: DB에 제목 변경 반영
  const editCardTitle = async (activityId, newTitle) => {
    setOngoingActivities(prev => prev.map(activity => {
      if (activity.id === activityId) {
        return { ...activity, title: newTitle };
      }
      return activity;
    }));
    try {
      await updateQuest(activityId, { questName: newTitle });
      showToastMessage('퀘스트명이 변경되었습니다!');
    } catch (error) {
      console.error('퀘스트명 변경 에러:', error);
      showToastMessage('퀘스트명 변경에 실패했습니다.');
    }
  };

  // 상단 + 퀘스트 추가 버튼 핸들러
  const handleAddQuestToday = async () => {
    const today = new Date().toISOString().slice(0, 10);
    await addQuest(today, '새 항목');
  };

  // 날짜별 퀘스트 추가 함수 (상단/카드 하단 + 버튼 공통)
  const addQuest = async (date, questName = '새 항목') => {
    const newQuestData = {
      userId,
      questName,
      questPoints: 5,
      isCompleted: 0,
      date
    };
    try {
      const response = await createQuest(newQuestData);
      const newQuest = {
        id: response.id || response.questId || Date.now(),
        date: response.date || response.createdAt || date,
        title: response.questName || questName,
        progress: 0,
        completed: 0,
        total: 1,
        ...response
      };
      setOngoingActivities(prev => [...prev, newQuest]);
      showToastMessage('새 항목이 추가되었습니다!');
    } catch (error) {
      showToastMessage('퀘스트 생성에 실패했습니다.');
    }
  };

  // 사용자 통계 상태
  const [userStats, setUserStats] = useState({
    currentPoints: 0,
    completedQuests: 0,
    totalQuests: 20,
    streakDays: 0,
    maxStreakDays: 0
  });
  const [displayedPoints, setDisplayedPoints] = useState(0);

  // 포인트 카운트업 애니메이션
  useEffect(() => {
    let start = displayedPoints;
    let end = userStats.currentPoints;
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
  }, [userStats.currentPoints]);

  // 카운트업 애니메이션용 상태 추가
  const [displayedLevel, setDisplayedLevel] = useState(0);
  const [displayedCompleted, setDisplayedCompleted] = useState(0);

  // 완료된 퀘스트 수 카운트업 애니메이션
  useEffect(() => {
    let start = displayedCompleted;
    let end = userStats.completedQuests;
    if (start === end) return;
    let duration = 800;
    let startTime = null;
    function animateCompleted(ts) {
      if (!startTime) startTime = ts;
      const progress = Math.min((ts - startTime) / duration, 1);
      const value = Math.floor(start + (end - start) * progress);
      setDisplayedCompleted(value);
      if (progress < 1) {
        requestAnimationFrame(animateCompleted);
      }
    }
    requestAnimationFrame(animateCompleted);
  }, [userStats.completedQuests]);

  return (
    <div>
      <UserHeader/>

      <main className={styles.main}>
        <div className={styles.pageHeader}>
          <h1 className={styles.pageTitle}>퀘스트</h1>
          <button className={styles.storeBtn} onClick={() => window.location.href = '/quest-store'}>
            뱃지 상점
          </button>
        </div>

        {/* 로딩 상태 */}
        {loading && (
          <div style={{ 
            textAlign: 'center', 
            padding: '50px', 
            fontSize: '1.2rem', 
            color: '#666',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '20px'
          }}>
            <div style={{ 
              width: '40px', 
              height: '40px', 
              border: '4px solid #f3f3f3', 
              borderTop: '4px solid #3498db', 
              borderRadius: '50%', 
              animation: 'spin 1s linear infinite' 
            }}></div>
            <div>데이터를 불러오는 중...</div>
            <style>{`
              @keyframes spin {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
              }
            `}</style>
          </div>
        )}

        {/* 에러 상태 */}
        {error && (
          <div style={{ 
            textAlign: 'center', 
            padding: '50px', 
            color: '#e74c3c',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '20px'
          }}>
            <div style={{ fontSize: '3rem' }}>⚠️</div>
            <p style={{ fontSize: '1.1rem', margin: '0' }}>{error}</p>
            <button 
              onClick={loadUserData}
              style={{
                background: '#3498db',
                color: 'white',
                border: 'none',
                padding: '12px 24px',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '1rem',
                fontWeight: '600',
                transition: 'background 0.2s'
              }}
              onMouseOver={(e) => e.target.style.background = '#2980b9'}
              onMouseOut={(e) => e.target.style.background = '#3498db'}
            >
              다시 시도
            </button>
          </div>
        )}

        {/* 데이터가 로드되었을 때만 표시 */}
        {!loading && !error && (
          <>
            {/* 사용자 통계 */}
            <div className={styles.userStats}>
              <div className={styles.statCard}>
                <div className={styles.statLabel}>현재 포인트</div>
                <div className={styles.statValue}>{displayedPoints.toLocaleString()}</div>
                <div className={styles.statLabel}>퀘스트 완료로 포인트를 획득하세요!</div>
              </div>
              <div className={styles.statCard}>
                <div className={styles.statLabel}>완료한 퀘스트</div>
                <div className={styles.statValue}>{displayedCompleted}</div>
                <div className={styles.statLabel}>총 {userStats.totalQuests}개 중</div>
              </div>
              <div className={styles.statCard}>
                <div className={styles.statLabel}>연속 달성</div>
                <div className={styles.statValue}>{userStats.streakDays}일</div>
                <div className={styles.statLabel}>최고 기록: {userStats.maxStreakDays}일</div>
              </div>
            </div>

        {/* 맞춤형 퀘스트 추천 */}
        <div className={styles.recommendationSection}>
          <div className={styles.recommendationHeader}>
            <h2 className={styles.recommendationTitle}>맞춤형 퀘스트 추천</h2>
          </div>
          <div className={styles.recommendationGrid}>
            {recommendations && recommendations.length > 0 ? recommendations.map((recommendation, index) => (
              <div key={recommendation.id || `recommendation-${index}`} className={styles.recommendationCard}>
                <h3>{recommendation.title}</h3>
                <div className={styles.recommendationMeta}>
                  <span>{recommendation.duration}</span>
                  <span className={styles.recommendationReward}>{recommendation.reward}</span>
                </div>
                <p>{recommendation.description}</p>
                <button 
                  className={`${styles.activityButton} ${recommendation.added ? styles.added : ''}`}
                  onClick={() => addActivity(recommendation)}
                  disabled={recommendation.added}
                >
                  {recommendation.added ? '추가됨' : '퀘스트 시작'}
                </button>
              </div>
            )) : (
              <div 
                key="no-recommendations"
                style={{ 
                  gridColumn: '1 / -1', 
                  textAlign: 'center', 
                  padding: '30px', 
                  color: '#666',
                  fontSize: '1rem'
                }}
              >
                추천 퀘스트가 없습니다.
              </div>
            )}
          </div>
        </div>

        {/* 진행 중인 퀘스트 */}
        <div className={styles.questSection}>
          <button className={styles.addCardBtn} onClick={handleAddQuestToday}>
            + 퀘스트 추가
          </button>
          <div className={styles.questHeader}>
            <h2 className={styles.questTitle}>진행 중인 퀘스트</h2>
          </div>
          <div className={styles.questGrid}>
            {ongoingActivities && ongoingActivities.length > 0 ? (() => {
              // 날짜별로 퀘스트 그룹화
              const groupedByDate = ongoingActivities.reduce((groups, activity) => {
                const date = activity.date || new Date().toISOString().slice(0, 10);
                if (!groups[date]) {
                  groups[date] = [];
                }
                groups[date].push(activity);
                return groups;
              }, {});

              // 날짜별로 정렬 (최신 날짜가 위로)
              const sortedDates = Object.keys(groupedByDate).sort((a, b) => new Date(b) - new Date(a));

              return sortedDates.map((date, dateIndex) => {
                const activitiesForDate = groupedByDate[date];
                // 모든 step을 한 배열로 합침
                const allSteps = activitiesForDate.flatMap(activity => activity.steps || []);
                const isAllCompleted = allSteps.length > 0 && allSteps.every(step => step.completed);
                const totalCompleted = allSteps.filter(step => step.completed).length;
                const totalSteps = allSteps.length;
                const progress = totalSteps > 0 ? (totalCompleted / totalSteps) * 100 : 0;

                return (
                  <div 
                    key={`date-${date}`} 
                    className={`${styles.questCard} ${isAllCompleted ? styles.disabled : ''}`}
                  >
                    {isAllCompleted && (
                      <div className={styles.completeBadge}>완료!</div>
                    )}
                    <span className={styles.questDate}>
                      {new Date(date).toLocaleDateString('ko-KR', { 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric' 
                      })}
                    </span>
                    <div className={styles.questProgress}>
                      <div className={styles.progressBar}>
                        <div 
                          className={styles.progress} 
                          style={{ width: `${progress}%` }}
                        ></div>
                      </div>
                      <div className={styles.progressText}>{totalCompleted}/{totalSteps} 완료</div>
                    </div>
                    <div className={styles.questSteps}>
                      {activitiesForDate.map((activity, activityIndex) => {
                        return (
                          <div key={`activity-${activity.id}`} className={styles.activityGroup}>
                            {activitiesForDate.length > 1 && (
                              <div className={styles.activityTitle}>{activity.title}</div>
                            )}
                            {(activity.steps && activity.steps.length > 0) ? (
                              activity.steps.map((step, stepIndex) => (
                                <div 
                                  key={`${activity.id}-${step.id || stepIndex}`} 
                                  className={`${styles.step} ${step.completed ? 'completed' : step.current ? 'current' : 'pending'}`}
                                >
                                  <label className={styles.customCheckbox}>
                                    <input 
                                      type="checkbox" 
                                      checked={step.completed}
                                      onChange={() => completeStep(activity.id, step.id)}
                                      disabled={isAllCompleted}
                                    />
                                    <span className={styles.checkmark}></span>
                                  </label>
                                  <span 
                                    className="step-text" 
                                    onDoubleClick={() => startEditing(activity.id, step.id, step.text)}
                                  >
                                    {editingStep?.activityId === activity.id && editingStep?.stepId === step.id ? (
                                      <input
                                        type="text"
                                        value={editValue}
                                        onChange={(e) => setEditValue(e.target.value)}
                                        onBlur={finishEditing}
                                        onKeyDown={handleKeyDown}
                                        autoFocus
                                        className={styles.editInput}
                                      />
                                    ) : (
                                      <>
                                        {step.text}
                                        <span className={styles.stepPoint}>+{step.point}P</span>
                                      </>
                                    )}
                                  </span>
                                  {!step.completed && (
                                    <button 
                                      className={styles.deleteBtn} 
                                      onClick={() => deleteStep(activity.id, step.id)}
                                    >
                                      <img src="/images/bean.png" alt="삭제" style={{ width: 20, height: 20, objectFit: 'contain', verticalAlign: 'middle' }} />
                                    </button>
                                  )}
                                </div>
                              ))
                            ) : (
                              <div className={styles.emptyStepMsg}>퀘스트를 추가하세요</div>
                            )}
                          </div>
                        );
                      })}
                      <button className={styles.addStepBtn} onClick={() => addQuest(date)}>
                        +
                      </button>
                    </div>
                    <div className={styles.questRewards}>
                      {isAllCompleted && (
                        <span className={styles.bonusPoint}>
                          보너스 포인트 +{totalSteps * 2}P
                        </span>
                      )}
                    </div>
                  </div>
                );
              });
            })() : (
              <div 
                key="no-ongoing-activities"
                style={{ 
                  gridColumn: '1 / -1', 
                  textAlign: 'center', 
                  padding: '50px', 
                  color: '#666',
                  fontSize: '1.1rem'
                }}
              >
                진행 중인 퀘스트가 없습니다.<br />
                새로운 퀘스트를 추가해보세요!
              </div>
            )}
          </div>
        </div>
          </>
        )}
      </main>

      {showToast && (
        <div className={styles.toast} style={{ display: 'block' }}>
          {toastMessage}
        </div>
      )}

      {showQuestConfirmModal && selectedRecommendation && (
        <div className={styles.confirmModal}>
          <div className={styles.confirmContent}>
            <h2>퀘스트 시작 확인</h2>
            <p>{selectedRecommendation.description}</p>
            <div className={styles.confirmActions}>
              <button className={styles.confirmBtn} onClick={confirmQuestStart}>확인</button>
              <button className={styles.cancelBtn} onClick={cancelQuestStart}>취소</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default QuestPage;
