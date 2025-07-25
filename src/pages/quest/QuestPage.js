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
  deleteQuest,
  getUserPoints,
  addUserPoints,
  deductUserPoints,
  getRecommendedQuests,
  getTodayEmotion // 추가
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
  const [recommendations, setRecommendations] = useState([]);
  const [recommendLoading, setRecommendLoading] = useState(true);
  const [recommendError, setRecommendError] = useState(null);
  const [todayEmotion, setTodayEmotion] = useState(null);
  const [todayEmotionLoading, setTodayEmotionLoading] = useState(true);
  const [todayEmotionError, setTodayEmotionError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [editingStep, setEditingStep] = useState(null); // 편집 중인 step 추적
  const [editValue, setEditValue] = useState(''); // 편집 중인 텍스트 값
  const [showQuestConfirmModal, setShowQuestConfirmModal] = useState(false);
  const [selectedRecommendation, setSelectedRecommendation] = useState(null);
  const [isProcessingStep, setIsProcessingStep] = useState(false); // 중복 호출 방지용
  const [bonusPointsClaimed, setBonusPointsClaimed] = useState(new Set()); // 보너스 포인트를 받은 날짜들

  // 연속 달성일 수 계산 함수
  const calculateStreakDays = (questsData) => {
    if (!questsData || questsData.length === 0) return { currentStreak: 0, maxStreak: 0 };
    
    // 날짜별로 퀘스트 그룹화하여 완료 여부 확인
    const dateGroups = {};
    
    questsData.forEach(quest => {
      let questDate = quest.date || quest.createdAt;
      if (questDate && questDate.includes('T')) {
        questDate = questDate.split('T')[0];
      } else if (questDate && questDate.includes(' ')) {
        questDate = questDate.split(' ')[0];
      }
      
      if (questDate) {
        if (!dateGroups[questDate]) {
          dateGroups[questDate] = { total: 0, completed: 0 };
        }
        dateGroups[questDate].total += 1;
        
        const isCompleted = quest.isCompleted === 1 || quest.isCompleted === true || quest.completed === 1 || quest.completed === true;
        if (isCompleted) {
          dateGroups[questDate].completed += 1;
        }
      }
    });
    
    // 날짜별로 모든 퀘스트가 완료되었는지 확인
    const completionByDate = {};
    Object.keys(dateGroups).forEach(date => {
      const group = dateGroups[date];
      // 해당 날짜의 모든 퀘스트가 완료되었을 때만 연속일로 인정
      if (group.total > 0 && group.completed === group.total) {
        completionByDate[date] = true;
      }
    });
    
    const today = new Date().toISOString().slice(0, 10);
    
    // 완료된 날짜들을 날짜 순으로 정렬
    const completedDates = Object.keys(completionByDate).sort();
    
    // 연속 달성일 수 계산
    let currentStreak = 0;
    let maxStreak = 0;
    let tempStreak = 0;
    
    // 현재 연속일 수 계산 (오늘부터 과거로)
    let currentDate = new Date(today);
    let daysChecked = 0;
    const maxDaysToCheck = 365; // 1년 전까지만 확인
    
    console.log('=== 현재 연속일 수 계산 ===');
    
    while (daysChecked < maxDaysToCheck) {
      const dateStr = currentDate.toISOString().slice(0, 10);
      
      console.log(`체크 중인 날짜: ${dateStr}, 완료여부: ${completionByDate[dateStr]}, 현재 tempStreak: ${tempStreak}`);
      
      if (completionByDate[dateStr]) {
        tempStreak++;
        console.log(`  -> 완료됨! tempStreak 증가: ${tempStreak}`);
      } else {
        // 연속이 끊어짐
        if (tempStreak > maxStreak) {
          maxStreak = tempStreak;
          console.log(`  -> 연속 끊어짐! maxStreak 업데이트: ${maxStreak}`);
        }
        // 현재 연속일 수는 여기서 설정 (연속이 끊어지기 전의 값)
        if (currentStreak === 0) {
          currentStreak = tempStreak;
          console.log(`  -> 현재 연속일 수 설정: ${currentStreak}`);
        }
        tempStreak = 0;
        console.log(`  -> 연속 끊어짐! tempStreak 리셋: ${tempStreak}`);
      }
      
      // 하루 전으로 이동
      currentDate.setDate(currentDate.getDate() - 1);
      daysChecked++;
      
      // 처음 10일만 로그 출력 (너무 많으면 제한)
      if (daysChecked > 10) break;
    }
    
    // 마지막 tempStreak도 maxStreak와 비교
    if (tempStreak > maxStreak) {
      maxStreak = tempStreak;
    }
    
    // 현재 연속일 수가 아직 설정되지 않았다면 tempStreak 사용
    if (currentStreak === 0) {
      currentStreak = tempStreak;
      console.log(`  -> 최종 현재 연속일 수 설정: ${currentStreak}`);
    }
    
    // 최고 기록 계산 (전체 과거 데이터에서 가장 긴 연속일 찾기)
    console.log('=== 최고 기록 계산 ===');
    const allCompletedDates = Object.keys(completionByDate).filter(date => completionByDate[date]).sort();
    console.log('전체 완료된 날짜들 (정렬됨):', allCompletedDates);
    
    let maxStreakOverall = 0;
    let tempMaxStreak = 0;
    
    for (let i = 0; i < allCompletedDates.length; i++) {
      const currentDate = new Date(allCompletedDates[i]);
      tempMaxStreak = 1;
      
      // 현재 날짜부터 연속된 날짜들을 찾기
      for (let j = i + 1; j < allCompletedDates.length; j++) {
        const nextDate = new Date(allCompletedDates[j]);
        const dayDiff = Math.floor((nextDate - currentDate) / (1000 * 60 * 60 * 24));
        
        if (dayDiff === tempMaxStreak) {
          tempMaxStreak++;
        } else {
          break;
        }
      }
      
      if (tempMaxStreak > maxStreakOverall) {
        maxStreakOverall = tempMaxStreak;
        console.log(`  -> 새로운 최고 기록 발견: ${maxStreakOverall}일 (시작일: ${allCompletedDates[i]})`);
      }
    }
    
    // 최고 기록 업데이트
    if (maxStreakOverall > maxStreak) {
      maxStreak = maxStreakOverall;
      console.log(`  -> 최종 최고 기록: ${maxStreak}일`);
    }
    
    console.log('=== 연속 달성일 수 계산 과정 ===');
    console.log('완료된 날짜들:', completedDates);
    console.log('오늘 날짜:', today);
    console.log('tempStreak:', tempStreak);
    console.log('currentStreak:', currentStreak);
    console.log('maxStreak:', maxStreak);
    
    console.log('연속 달성일 수 계산:', { 
      dateGroups,
      completionByDate, 
      currentStreak, 
      maxStreak, 
      today 
    });
    
    // 더 자세한 디버깅을 위한 개별 로그
    console.log('=== dateGroups 상세 내용 ===');
    Object.keys(dateGroups).forEach(date => {
      console.log(`${date}: total=${dateGroups[date].total}, completed=${dateGroups[date].completed}`);
    });
    
    console.log('=== completionByDate 상세 내용 ===');
    Object.keys(completionByDate).forEach(date => {
      console.log(`${date}: ${completionByDate[date]}`);
    });
    
    return { currentStreak, maxStreak };
  };

  const showToastMessage = (message) => {
    setToastMessage(message);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 2000);
  };

  // 보너스 포인트 계산 함수
  const calculateBonusPoints = (questSteps) => {
    const totalPoints = questSteps.reduce((sum, step) => sum + (step.point || 0), 0);
    return Math.floor(totalPoints * 0.4); // 5분의 2 = 0.4
  };

  // 보너스 포인트 자동 적립 함수
  const autoClaimBonusPoints = async (date, questSteps) => {
    try {
      const bonusPoints = calculateBonusPoints(questSteps);
      
      if (bonusPoints <= 0) {
        return;
      }

      // 이미 보너스 포인트를 받았는지 확인
      if (bonusPointsClaimed.has(date)) {
        return;
      }

      // 포인트 적립 API 호출
      await addUserPoints(userId, bonusPoints);
      
      // 보너스 포인트를 받은 날짜로 기록
      setBonusPointsClaimed(prev => new Set([...prev, date]));
      
      // 현재 포인트 업데이트
      setCurrentPoints(prev => prev + bonusPoints);
      
      showToastMessage(`보너스 포인트 ${bonusPoints}P 자동 적립!`);
      
      console.log(`보너스 포인트 자동 적립: ${date} - ${bonusPoints}P`);
      
    } catch (error) {
      console.error('보너스 포인트 자동 적립 실패:', error);
      showToastMessage('보너스 포인트 적립에 실패했습니다.');
    }
  };

  // 데이터 로딩 함수
  const loadUserData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('Loading data for userId:', userId);
      
      // 사용자 통계, 퀘스트 목록, 포인트를 병렬로 로드
      const [statsResponse, questsResponse, pointsResponse] = await Promise.all([
        getUserQuestStats(userId),
        getUserQuests(userId),
        getUserPoints(userId).catch(error => {
          console.error('포인트 조회 실패, 기본값 사용:', error);
          return { points: 0 };
        })
      ]);
      
      console.log('Stats Response:', statsResponse);
      console.log('Quests Response:', questsResponse);
      console.log('Points Response:', pointsResponse);
      
      // 포인트 별도 설정
      const userPoints = pointsResponse?.points || 0;
      setCurrentPoints(userPoints);
      
      // 퀘스트 데이터 설정 (배열이 아니면 빈 배열로 설정)
      const questsData = Array.isArray(questsResponse?.data) ? questsResponse.data : 
                        Array.isArray(questsResponse) ? questsResponse : [];
      
      // 연속 달성일 수 계산
      const { currentStreak, maxStreak } = calculateStreakDays(questsData);
      
      // 통계 데이터 설정 (포인트는 별도로 관리)
      setUserStats({
        currentPoints: userPoints,
        completedQuests: statsResponse?.data?.completedQuests || statsResponse?.completedQuests || 0,
        totalQuests: statsResponse?.data?.totalQuests || statsResponse?.totalQuests || 20,
        streakDays: currentStreak,
        maxStreakDays: maxStreak
      });
      
      // 날짜별로 퀘스트 그룹화
      const groupedByDate = questsData.reduce((groups, quest, index) => {
        console.log('원본 퀘스트 데이터:', quest); // 디버깅용
        
        // 퀘스트 완료 상태 확인
        const isQuestCompleted = quest.isCompleted === 1 || quest.isCompleted === true || quest.completed === 1 || quest.completed === true;
        
        // 날짜 추출 (createdAt이 있으면 날짜만 추출)
        let questDate = quest.date || quest.createdAt;
        if (questDate && questDate.includes('T')) {
          questDate = questDate.split('T')[0];
        } else if (questDate && questDate.includes(' ')) {
          questDate = questDate.split(' ')[0];
        }
        
        if (!questDate) {
          questDate = new Date().toISOString().slice(0, 10);
        }
        
        // 같은 날짜의 퀘스트들을 그룹화
        if (!groups[questDate]) {
          groups[questDate] = {
            id: `date-group-${questDate}`,
            date: questDate,
            title: `퀘스트 그룹`,
            progress: 0,
            completed: 0,
            total: 0,
            steps: []
          };
        }
        
        // 각 퀘스트를 단계로 변환하여 추가
        const questStep = {
          id: quest.id || quest.questId || `quest-${index}`,
          text: quest.title || quest.questName || `새 항목`,
          completed: isQuestCompleted,
          current: !isQuestCompleted,
          point: quest.questPoints || 5,
          questId: quest.id || quest.questId // 원본 퀘스트 ID 보존
        };
        
        groups[questDate].steps.push(questStep);
        groups[questDate].total += 1;
        if (isQuestCompleted) {
          groups[questDate].completed += 1;
        }
        
        return groups;
      }, {});
      
      // 그룹화된 데이터를 배열로 변환하고 진행률 계산
      const validatedQuests = Object.values(groupedByDate).map(group => {
        const progress = group.total > 0 ? (group.completed / group.total) * 100 : 0;
        return {
          ...group,
          progress: progress
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

  // 감정 기반 추천 퀘스트 불러오기 (userId 기반)
  useEffect(() => {
    const fetchRecommendations = async () => {
      setRecommendLoading(true);
      setRecommendError(null);
      try {
        const data = await getRecommendedQuests(userId);
        setRecommendations(data);
      } catch (err) {
        setRecommendError('추천 퀘스트를 불러오지 못했습니다.');
      } finally {
        setRecommendLoading(false);
      }
    };
    fetchRecommendations();
  }, [userId]);

  // 오늘의 감정 불러오기
  useEffect(() => {
    const fetchTodayEmotion = async () => {
      setTodayEmotionLoading(true);
      setTodayEmotionError(null);
      try {
        const data = await getTodayEmotion(userId);
        setTodayEmotion(data);
      } catch (err) {
        setTodayEmotionError('오늘의 감정을 불러오지 못했습니다.');
      } finally {
        setTodayEmotionLoading(false);
      }
    };
    fetchTodayEmotion();
  }, [userId]);

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
  const finishEditing = async () => {
    if (editingStep && editValue.trim()) {
      await editStepText(editingStep.activityId, editingStep.stepId, editValue.trim());
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
  const handleKeyDown = async (e) => {
    if (e.key === 'Enter') {
      await finishEditing();
    } else if (e.key === 'Escape') {
      cancelEditing();
    }
  };

  const addActivity = (recommendation) => {
    // 오늘 날짜의 퀘스트 개수 확인
    const today = new Date().toISOString().slice(0, 10);
    const todayQuests = ongoingActivities.find(activity => activity.date === today);
    const currentQuestCount = todayQuests ? todayQuests.steps.length : 0;
    
    // 하루 최대 8개 제한
    if (currentQuestCount >= 8) {
      showToastMessage('오늘은 더 이상 퀘스트를 추가할 수 없습니다');
      return;
    }
    
    setSelectedRecommendation(recommendation);
    setShowQuestConfirmModal(true);
  };

  const confirmQuestStart = async () => {
    if (!selectedRecommendation) return;
    
    try {
      const today = new Date().toISOString().slice(0, 10);
      
      // 오늘 날짜의 퀘스트 개수 확인
      const todayQuests = ongoingActivities.find(activity => activity.date === today);
      const currentQuestCount = todayQuests ? todayQuests.steps.length : 0;
      
      // 하루 최대 8개 제한
      if (currentQuestCount >= 8) {
        showToastMessage('오늘은 더 이상 퀘스트를 추가할 수 없습니다');
        setShowQuestConfirmModal(false);
        setSelectedRecommendation(null);
        return;
      }
      // 추천 퀘스트의 타이틀과 보상포인트만 사용
      const newQuestData = {
        userId: userId,
        questName: selectedRecommendation.title,
        questPoints: selectedRecommendation.reward, // reward(숫자)
        isCompleted: 0,
        date: today
      };
      const response = await createQuest(newQuestData);
      // 오늘 날짜의 퀘스트가 이미 있는지 확인
      const existingQuestForToday = ongoingActivities.find(activity => 
        activity.date === today
      );
      if (existingQuestForToday) {
        // 오늘 날짜가 있으면 해당 날짜의 기존 퀘스트에 새 단계 추가
        setOngoingActivities(prev => prev.map(activity => {
          if (activity.date === today) {
            const newStep = {
              id: response.questId || response.id || Date.now(),
              text: selectedRecommendation.title,
              completed: false,
              current: true,
              point: selectedRecommendation.reward,
              questId: response.questId || response.id // 원본 퀘스트 ID 보존
            };
            return {
              ...activity,
              steps: [...(activity.steps || []), newStep],
              total: (activity.steps || []).length + 1
            };
          }
          return activity;
        }));
      } else {
        // 오늘 날짜가 없으면 새 퀘스트 추가
        const newActivity = {
          id: `date-group-${today}`,
          date: today,
          title: '퀘스트 그룹',
          progress: 0,
          completed: 0,
          total: 1,
          steps: [
            {
              id: response.questId || response.id || Date.now(),
              text: selectedRecommendation.title,
              completed: false,
              current: true,
              point: selectedRecommendation.reward,
              questId: response.questId || response.id // 원본 퀘스트 ID 보존
            }
          ]
        };
        setOngoingActivities(prev => [newActivity, ...prev]);
      }
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
    // 중복 호출 방지
    if (isProcessingStep) {
      console.log('이미 처리 중인 스텝이 있습니다. 중복 호출 무시.');
      return;
    }
    
    try {
      setIsProcessingStep(true);
      console.log('=== completeStep 함수 시작 ===');
      console.log('완료 시도:', { activityId, stepId });
      console.log('함수 호출 시간:', new Date().toISOString());
      console.log('함수 호출 스택:', new Error().stack);
      
      // 현재 단계의 완료 상태 확인
      const currentActivity = ongoingActivities.find(activity => activity.id === activityId);
      const currentStep = currentActivity?.steps?.find(step => step.id === stepId);
      const newCompletedState = !currentStep?.completed;
      
      console.log('현재 액티비티:', currentActivity);
      console.log('현재 스텝:', currentStep);
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
      
      // 백엔드 API 호출하여 DB에 반영 (stepId는 실제 퀘스트 ID)
      try {
        const actualQuestId = currentStep?.questId || stepId;
        await completeQuestStep(actualQuestId, stepId, newCompletedState, userId);
        console.log('DB에 단계 완료 상태 반영됨:', { questId: actualQuestId, stepId, completed: newCompletedState, userId });
        
        // 포인트 업데이트 (퀘스트 완료/해제에 따라 + 또는 -)
        const stepPoints = currentStep?.point || 5;
        
        // 로컬 상태 먼저 업데이트 (즉시 반응성 제공)
        if (newCompletedState) {
          // 퀘스트 완료 시 포인트 추가
          setCurrentPoints(prev => prev + stepPoints);
          setUserStats(prev => ({
            ...prev,
            currentPoints: prev.currentPoints + stepPoints
          }));
          console.log(`포인트 +${stepPoints} 추가됨. 현재 포인트: ${currentPoints + stepPoints}`);
        } else {
          // 퀘스트 해제 시 포인트 차감
          setCurrentPoints(prev => prev - stepPoints);
          setUserStats(prev => ({
            ...prev,
            currentPoints: prev.currentPoints - stepPoints
          }));
          console.log(`포인트 -${stepPoints} 차감됨. 현재 포인트: ${currentPoints - stepPoints}`);
        }
        
        // 연속 달성일 수 업데이트
        const updatedActivities = ongoingActivities.map(activity => {
          if (activity.id === activityId) {
            const updatedSteps = (activity.steps || []).map(step => {
              if (step.id === stepId) {
                return { ...step, completed: newCompletedState, current: !newCompletedState };
              }
              return step;
            });
            return { ...activity, steps: updatedSteps };
          }
          return activity;
        });
        
        // 모든 퀘스트 데이터를 평면화하여 연속 달성일 수 계산
        const allQuestsData = updatedActivities.flatMap(activity => 
          activity.steps.map(step => ({
            id: step.questId,
            isCompleted: step.completed ? 1 : 0,
            date: activity.date,
            questName: step.text,
            questPoints: step.point
          }))
        );
        
        const { currentStreak, maxStreak } = calculateStreakDays(allQuestsData);
        setUserStats(prev => ({
          ...prev,
          streakDays: currentStreak,
          maxStreakDays: maxStreak
        }));

        // 보너스 포인트 자동 적립 처리
        const currentActivity = updatedActivities.find(activity => activity.id === activityId);
        if (currentActivity) {
          const allStepsCompleted = currentActivity.steps.every(step => step.completed);
          
          if (allStepsCompleted) {
            // 모든 퀘스트가 완료되면 자동으로 보너스 포인트 적립 (비동기 처리)
            setTimeout(() => autoClaimBonusPoints(currentActivity.date, currentActivity.steps), 0);
          } else {
            // 완료 상태가 해제되었고, 이미 보너스 포인트를 받았다면 회수
            if (bonusPointsClaimed.has(currentActivity.date)) {
              const bonusPoints = calculateBonusPoints(currentActivity.steps);
              setBonusPointsClaimed(prev => {
                const newSet = new Set(prev);
                newSet.delete(currentActivity.date);
                return newSet;
              });
              console.log(`보너스 포인트 상태 해제: ${currentActivity.date}`);
            }
          }
        }
        
        // 백엔드에서 퀘스트 완료 시 자동으로 포인트를 추가하므로
        // 프론트엔드에서 별도로 포인트 추가 API를 호출하지 않음
        // 단, 퀘스트 해제 시에는 포인트 차감 API를 호출
        if (!newCompletedState) {
          try {
            await deductUserPoints(userId, stepPoints);
          } catch (pointsError) {
            console.error('포인트 차감 실패:', pointsError);
          }
        }
        
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
    } finally {
      setIsProcessingStep(false);
    }
  };

  const editStepText = async (activityId, stepId, newText) => {
    // 현재 단계 정보 저장 (에러 시 복원용)
    const currentActivity = ongoingActivities.find(activity => activity.id === activityId);
    const currentStep = currentActivity?.steps?.find(step => step.id === stepId);
    
    console.log('editStepText 호출:', { activityId, stepId, newText });
    console.log('currentActivity:', currentActivity);
    console.log('currentStep:', currentStep);
    console.log('questId:', currentStep?.questId);
    
    // 먼저 로컬 상태 업데이트
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
    
    // DB에 제목 변경 반영 (실제 퀘스트 ID 사용)
    if (currentStep?.questId) {
      try {
        console.log('updateQuest 호출:', { questId: currentStep.questId, questName: newText, userId });
        await updateQuest(currentStep.questId, { questName: newText }, userId);
        showToastMessage('퀘스트명이 변경되었습니다!');
      } catch (error) {
        console.error('퀘스트명 변경 에러:', error);
        console.error('퀘스트명 변경 에러 응답:', error.response);
        
        // 401 에러 (토큰 만료)인 경우 - axios 인터셉터에서 자동 재발급 처리
        if (error.response?.status === 401) {
          showToastMessage('토큰이 만료되어 재발급 중입니다...');
          // axios 인터셉터에서 자동으로 토큰 재발급 후 재시도하므로
          // 여기서는 로그인 페이지로 이동하지 않고 재시도 대기
        } else if (error.response?.status === 404) {
          showToastMessage('퀘스트를 찾을 수 없습니다. 새로고침 후 다시 시도해주세요.');
        } else {
          showToastMessage('퀘스트명 변경에 실패했습니다.');
        }
        
        // 에러 시 로컬 상태를 원래대로 되돌리기
        setOngoingActivities(prev => prev.map(activity => {
          if (activity.id === activityId) {
            const revertedSteps = (activity.steps || []).map(step => {
              if (step.id === stepId) {
                return { ...step, text: currentStep.text };
              }
              return step;
            });
            return { ...activity, steps: revertedSteps };
          }
          return activity;
        }));
      }
    } else {
      console.error('questId가 없습니다:', currentStep);
    }
  };

  // deleteStep 함수 수정
  const deleteStep = async (activityId, stepId) => {
    // 현재 단계 정보 저장 (에러 시 복원용)
    const currentActivity = ongoingActivities.find(activity => activity.id === activityId);
    const currentStep = currentActivity?.steps?.find(step => step.id === stepId);
    
    console.log('deleteStep 호출:', { activityId, stepId });
    console.log('currentActivity:', currentActivity);
    console.log('currentStep:', currentStep);
    console.log('questId:', currentStep?.questId);
    
    // 먼저 로컬 상태 업데이트 (즉시 반응성 제공)
    setOngoingActivities(prev => prev.map(activity => {
      if (activity.id === activityId) {
        const updatedSteps = (activity.steps || []).filter(step => step.id !== stepId);
        const completedCount = updatedSteps.filter(step => step.completed).length;
        const progress = updatedSteps.length > 0 ? (completedCount / updatedSteps.length) * 100 : 0;
        
        // 보너스 포인트 상태 재계산
        const allStepsCompleted = updatedSteps.every(step => step.completed);
        
        if (allStepsCompleted) {
          // 모든 퀘스트가 완료되면 자동으로 보너스 포인트 적립 (비동기 처리)
          setTimeout(() => autoClaimBonusPoints(activity.date, updatedSteps), 0);
        } else {
          // 완료 상태가 해제되었고, 이미 보너스 포인트를 받았다면 회수
          if (bonusPointsClaimed.has(activity.date)) {
            setBonusPointsClaimed(prev => {
              const newSet = new Set(prev);
              newSet.delete(activity.date);
              return newSet;
            });
            console.log(`보너스 포인트 상태 해제 (퀘스트 삭제): ${activity.date}`);
          }
        }
        
        // 단계가 모두 삭제되면 해당 날짜 그룹도 삭제
        if (updatedSteps.length === 0) {
          return null;
        }
        
        return {
          ...activity,
          steps: updatedSteps,
          completed: completedCount,
          total: updatedSteps.length,
          progress: progress
        };
      }
      return activity;
    }).filter(activity => activity !== null)); // null인 그룹 제거
    
    // DB에 삭제 반영 (실제 퀘스트 ID 사용)
    if (currentStep?.questId) {
      try {
        console.log('deleteQuest 호출:', { questId: currentStep.questId, userId });
        await deleteQuest(currentStep.questId, userId);
        showToastMessage('퀘스트가 삭제되었습니다!');
      } catch (error) {
        console.error('퀘스트 삭제 에러:', error);
        console.error('퀘스트 삭제 에러 응답:', error.response);
        
        // 401 에러 (토큰 만료)인 경우 - axios 인터셉터에서 자동 재발급 처리
        if (error.response?.status === 401) {
          showToastMessage('토큰이 만료되어 재발급 중입니다...');
          // axios 인터셉터에서 자동으로 토큰 재발급 후 재시도하므로
          // 여기서는 로그인 페이지로 이동하지 않고 재시도 대기
        } else if (error.response?.status === 404) {
          showToastMessage('퀘스트를 찾을 수 없습니다. 새로고침 후 다시 시도해주세요.');
        } else {
          showToastMessage('퀘스트 삭제에 실패했습니다.');
        }
        
        // 에러 시 로컬 상태를 원래대로 되돌리기
        setOngoingActivities(prev => {
          const restored = prev.map(activity => {
            if (activity.id === activityId) {
              return {
                ...activity,
                steps: [...(activity.steps || []), currentStep],
                total: (activity.steps || []).length + 1
              };
            }
            return activity;
          });
          
          // 만약 해당 날짜 그룹이 삭제되었다면 복원
          if (!restored.find(activity => activity.id === activityId)) {
            restored.push(currentActivity);
          }
          
          return restored;
        });
      }
    } else {
      console.error('questId가 없습니다:', currentStep);
    }
  };

  // addStep 함수 수정: DB에 새 퀘스트 생성
  const addStep = async (date) => {
    // 오늘 날짜의 퀘스트 개수 확인
    const todayQuests = ongoingActivities.find(activity => activity.date === date);
    const currentQuestCount = todayQuests ? todayQuests.steps.length : 0;
    
    // 하루 최대 8개 제한
    if (currentQuestCount >= 8) {
      showToastMessage('오늘은 더 이상 퀘스트를 추가할 수 없습니다');
      return;
    }
    
    const newQuestData = {
      userId,
      questName: '새 항목',
      questPoints: 5,
      isCompleted: 0,
      date
    };
    try {
      const response = await createQuest(newQuestData);
      
      // 같은 날짜의 퀘스트가 이미 있는지 확인
      const existingQuestForDate = ongoingActivities.find(activity => 
        activity.date === date
      );
      
      if (existingQuestForDate) {
        // 같은 날짜가 있으면 해당 날짜의 기존 퀘스트에 새 단계 추가
        setOngoingActivities(prev => {
          const updated = prev.map(activity => {
            if (activity.date === date) {
              const newStep = {
                id: response.id || response.questId || Date.now(),
                text: '새 항목',
                completed: false,
                current: true,
                point: 5
              };
              
              // 보너스 포인트 상태 재계산
              const updatedSteps = [...(activity.steps || []), newStep];
              const allStepsCompleted = updatedSteps.every(step => step.completed);
              
              if (allStepsCompleted) {
                // 모든 퀘스트가 완료되면 자동으로 보너스 포인트 적립 (비동기 처리)
                setTimeout(() => autoClaimBonusPoints(date, updatedSteps), 0);
              } else {
                // 완료 상태가 해제되었고, 이미 보너스 포인트를 받았다면 회수
                if (bonusPointsClaimed.has(date)) {
                  setBonusPointsClaimed(prev => {
                    const newSet = new Set(prev);
                    newSet.delete(date);
                    return newSet;
                  });
                  console.log(`보너스 포인트 상태 해제 (새 퀘스트 추가): ${date}`);
                }
              }
              
              return {
                ...activity,
                steps: updatedSteps,
                total: updatedSteps.length
              };
            }
            return activity;
          });
          return updated;
        });
      } else {
        // 같은 날짜가 없으면 새 퀘스트 추가
        const newQuest = {
          id: response.questId || response.id || Date.now(),
          date: response.date || response.createdAt || date,
          title: response.questName || '새 항목',
          progress: 0,
          completed: 0,
          total: 1,
          steps: [
            {
              id: response.id || response.questId || Date.now(),
              text: '새 항목',
              completed: false,
              current: true,
              point: 5
            }
          ],
          reward: '보상: 직접 입력'
        };
        setOngoingActivities(prev => [newQuest, ...prev]);
      }
      
      showToastMessage('새 항목이 추가되었습니다!');
    } catch (error) {
      showToastMessage('퀘스트 생성에 실패했습니다.');
    }
  };

  const addQuestCard = async () => {
    try {
      const today = new Date().toISOString().slice(0, 10);
      const newQuestData = {
        userId: userId,
        questName: '새 활동',
        questPoints: 5,
        isCompleted: 0,
        date: today
      };
      
      const response = await createQuest(newQuestData);
      
      // 오늘 날짜의 퀘스트가 이미 있는지 확인
      const existingQuestForToday = ongoingActivities.find(activity => 
        activity.date === today
      );
      
      if (existingQuestForToday) {
        // 오늘 날짜가 있으면 해당 날짜의 기존 퀘스트에 새 단계 추가
        setOngoingActivities(prev => prev.map(activity => {
          if (activity.date === today) {
            const newStep = {
              id: response.questId || Date.now(),
              text: '새 항목',
              completed: false,
              current: true,
              point: 5
            };
            return {
              ...activity,
              steps: [...(activity.steps || []), newStep],
              total: (activity.steps || []).length + 1
            };
          }
          return activity;
        }));
      } else {
        // 오늘 날짜가 없으면 새 퀘스트 추가
        const newCard = {
          id: response.questId || Date.now(),
          date: today,
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
      }
      
      showToastMessage('새 퀘스트가 생성되었습니다!');
      
    } catch (error) {
      console.error('퀘스트 생성 에러:', error);
      showToastMessage('퀘스트 생성에 실패했습니다.');
    }
  };

  // editCardTitle 함수는 그룹화된 구조에서는 사용하지 않음
  // 개별 퀘스트 제목 편집은 editStepText 함수를 통해 처리됨

  // 상단 + 퀘스트 추가 버튼 핸들러
  const handleAddQuestToday = async () => {
    const today = new Date().toISOString().slice(0, 10);
    await addQuest(today, '새 항목');
  };

  // 날짜별 퀘스트 추가 함수 (상단/카드 하단 + 버튼 공통)
  const addQuest = async (date, questName = '새 항목') => {
    // 오늘 날짜의 퀘스트 개수 확인
    const todayQuests = ongoingActivities.find(activity => activity.date === date);
    const currentQuestCount = todayQuests ? todayQuests.steps.length : 0;
    
    // 하루 최대 8개 제한
    if (currentQuestCount >= 8) {
      showToastMessage('오늘은 더 이상 퀘스트를 추가할 수 없습니다');
      return;
    }
    
    const newQuestData = {
      userId,
      questName,
      questPoints: 5,
      isCompleted: 0,
      date
    };
    try {
      const response = await createQuest(newQuestData);
      
      console.log('addQuest 응답:', response);
      console.log('요청한 날짜:', date);
      console.log('현재 ongoingActivities:', ongoingActivities);
      
      // 같은 날짜의 퀘스트가 이미 있는지 확인 (더 정확한 비교)
      const existingQuestForDate = ongoingActivities.find(activity => {
        const activityDate = activity.date;
        const requestDate = date;
        console.log('날짜 비교:', { activityDate, requestDate, isMatch: activityDate === requestDate });
        return activityDate === requestDate;
      });
      
      console.log('기존 퀘스트 찾음:', existingQuestForDate);
      
      if (existingQuestForDate) {
        // 같은 날짜가 있으면 해당 날짜의 기존 퀘스트에 새 단계 추가
        setOngoingActivities(prev => prev.map(activity => {
          if (activity.date === date) {
            const newStep = {
              id: response.questId || response.id || Date.now(),
              text: questName,
              completed: false,
              current: true,
              point: 5,
              questId: response.questId || response.id // 원본 퀘스트 ID 보존
            };
            console.log('기존 카드에 새 단계 추가:', newStep);
            return {
              ...activity,
              steps: [...(activity.steps || []), newStep],
              total: (activity.steps || []).length + 1
            };
          }
          return activity;
        }));
      } else {
        // 같은 날짜가 없으면 새 퀘스트 카드 생성
        const newQuest = {
          id: `date-group-${date}`,
          date: date,
          title: '퀘스트 그룹',
          progress: 0,
          completed: 0,
          total: 1,
          steps: [
            {
              id: response.questId || response.id || Date.now(),
              text: questName,
              completed: false,
              current: true,
              point: 5,
              questId: response.questId || response.id // 원본 퀘스트 ID 보존
            }
          ]
        };
        console.log('새 카드 생성:', newQuest);
        setOngoingActivities(prev => [newQuest, ...prev]);
      }
      
      showToastMessage('새 항목이 추가되었습니다!');
    } catch (error) {
      console.error('퀘스트 생성 에러:', error);
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
  const [currentPoints, setCurrentPoints] = useState(0); // 포인트 상태 별도 관리

  // 포인트 카운트업 애니메이션
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
  }, [currentPoints]);

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
                <div className={styles.statDescription}>
                  당일 할당 퀘스트 모두 완료 시 연속일로 인정
                </div>
              </div>
              <div className={styles.statCard}>
                <div className={styles.statLabel}>오늘의 감정</div>
                {todayEmotionLoading ? (
                  <div className={styles.statValue} style={{ fontSize: '1.2rem' }}>로딩중...</div>
                ) : todayEmotionError ? (
                  <div className={styles.statValue} style={{ fontSize: '1.2rem', color: '#e74c3c' }}>오류</div>
                ) : todayEmotion && todayEmotion.emotion ? (
                  <>
                    <div style={{ 
                      fontSize: '2.5rem', 
                      margin: '12px 0',
                      color: '#4b94d0',
                      fontWeight: '900',
                      animation: 'points-shine 2.5s infinite'
                    }}>
                      {todayEmotion.emotion.emoji || '❓'}
                    </div>
                    <div className={styles.statLabel} style={{ fontSize: '1.1rem', fontWeight: 'bold' }}>
                      {todayEmotion.emotion.emotionName || '감정명 없음'}
                    </div>
                    <div className={styles.statDescription}>
                      {todayEmotion.textContent ? 
                        (todayEmotion.textContent.length > 20 ? 
                          todayEmotion.textContent.substring(0, 20) + '...' : 
                          todayEmotion.textContent
                        ) : 
                        '감정 기록 없음'
                      }
                    </div>
                  </>
                ) : (
                  <>
                    <div style={{ 
                      fontSize: '2rem', 
                      margin: '12px 0',
                      color: '#4b94d0',
                      fontWeight: '900',
                      animation: 'points-shine 2.5s infinite'
                    }}>
                      ❓
                    </div>
                    <div className={styles.statLabel}>감정 기록 없음</div>
                    <div className={styles.statDescription}>
                      감정을 기록해보세요
                    </div>
                  </>
                )}
              </div>
            </div>

        {/* 맞춤형 퀘스트 추천 */}
        <div className={styles.recommendationSection}>
          <div className={styles.recommendationHeader}>
            <h2 className={styles.recommendationTitle}>맞춤형 퀘스트 추천</h2>
          </div>
          <div className={styles.recommendationGrid}>
            {recommendLoading ? (
              <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '30px', color: '#666', fontSize: '1rem' }}>
                추천 퀘스트를 불러오는 중...
              </div>
            ) : recommendError ? (
              <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '30px', color: '#e74c3c', fontSize: '1rem' }}>
                {recommendError}
              </div>
            ) : recommendations && recommendations.length > 0 ? recommendations.map((recommendation, index) => (
              <div key={recommendation.recommendId || `recommendation-${index}`} className={styles.recommendationCard}>
                <h3>{recommendation.title}</h3>
                <div className={styles.recommendationMeta}>
                  <span>{recommendation.duration}분</span>
                  <span className={styles.recommendationReward}>포인트 +{recommendation.reward}</span>
                </div>
                <p>{recommendation.description}</p>
                <button 
                  className={styles.activityButton}
                  onClick={() => addActivity(recommendation)}
                >
                  퀘스트 시작
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
          <button 
            className={styles.addCardBtn} 
            onClick={handleAddQuestToday}
            disabled={(() => {
              const today = new Date().toISOString().slice(0, 10);
              const todayQuests = ongoingActivities.find(activity => activity.date === today);
              return todayQuests ? todayQuests.steps.length >= 8 : false;
            })()}
            title={(() => {
              const today = new Date().toISOString().slice(0, 10);
              const todayQuests = ongoingActivities.find(activity => activity.date === today);
              const count = todayQuests ? todayQuests.steps.length : 0;
              return count >= 8 ? '하루 최대 8개 퀘스트까지 추가 가능합니다' : '새 퀘스트 추가';
            })()}
          >
            + 퀘스트 추가
          </button>
          <div className={styles.questHeader}>
            <h2 className={styles.questTitle}>진행 중인 퀘스트</h2>
          </div>
          <div className={styles.questGrid}>
            {ongoingActivities && ongoingActivities.length > 0 ? (() => {
              // 날짜별로 정렬 (최신 날짜가 위로)
              const sortedActivities = [...ongoingActivities].sort((a, b) => new Date(b.date) - new Date(a.date));

              return sortedActivities.map((activity, index) => {
                const allSteps = activity.steps || [];
                const isAllCompleted = allSteps.length > 0 && allSteps.every(step => step.completed);
                const totalCompleted = allSteps.filter(step => step.completed).length;
                const totalSteps = allSteps.length;
                
                // 오늘 날짜 이전의 미완료 퀘스트인지 확인
                const today = new Date().toISOString().slice(0, 10);
                const isPastIncomplete = activity.date < today && !isAllCompleted;

                return (
                  <div 
                    key={`date-${activity.date}-${index}`} 
                    className={`${styles.questCard} ${isAllCompleted || isPastIncomplete ? styles.disabled : ''}`}
                  >
                    {isAllCompleted && (
                      <div className={styles.completeBadge}>완료!</div>
                    )}
                    {isPastIncomplete && (
                      <div className={styles.expiredBadge}>기한 만료</div>
                    )}
                    <span className={styles.questDate}>
                      {new Date(activity.date).toLocaleDateString('ko-KR', { 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric' 
                      })}
                    </span>
                    <div className={styles.questProgress}>
                      <div className={styles.progressBar}>
                        <div 
                          className={styles.progress} 
                          style={{ width: `${activity.progress}%` }}
                        ></div>
                      </div>
                      <div className={styles.progressText}>{totalCompleted}/{totalSteps} 완료</div>
                    </div>
                    <div className={styles.questSteps}>
                      {allSteps.length > 0 ? (
                        allSteps.map((step, stepIndex) => (
                          <div 
                            key={`${activity.id}-${step.id || stepIndex}`} 
                            className={`${styles.step} ${step.completed ? 'completed' : step.current ? 'current' : 'pending'}`}
                          >
                            <label className={styles.customCheckbox}>
                              <input 
                                type="checkbox" 
                                checked={step.completed}
                                disabled={isPastIncomplete}
                                onChange={() => {
                                  if (isPastIncomplete) return;
                                  console.log('체크박스 클릭됨:', { 
                                    activityId: activity.id, 
                                    stepId: step.id, 
                                    currentCompleted: step.completed,
                                    stepText: step.text,
                                    clickTime: new Date().toISOString()
                                  });
                                  completeStep(activity.id, step.id);
                                }}
                              />
                              <span className={styles.checkmark}></span>
                            </label>
                            <span 
                              className="step-text" 
                              onDoubleClick={() => {
                                if (isPastIncomplete) return;
                                startEditing(activity.id, step.id, step.text);
                              }}
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
                            {!step.completed && !isPastIncomplete && (
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
                      {activity.date === new Date().toISOString().slice(0, 10) && (
                        <button 
                          className={styles.addStepBtn} 
                          onClick={() => addQuest(activity.date)}
                          disabled={allSteps.length >= 8}
                          title={allSteps.length >= 8 ? '하루 최대 8개 퀘스트까지 추가 가능합니다' : '새 퀘스트 추가'}
                        >
                          +
                        </button>
                      )}
                    </div>
                    <div className={styles.questRewards}>
                      {isAllCompleted && (
                        <div className={styles.bonusPoint}>
                          보너스 포인트 +{calculateBonusPoints(allSteps)}P
                        </div>
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
