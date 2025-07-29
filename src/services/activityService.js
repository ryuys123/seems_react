import apiClient from '../utils/axios';

// 사용자 최근 활동 조회
export const getRecentActivities = async (userid, limit = 10) => {
  try {
    const response = await apiClient.get('/user/activity/recent', {
      params: {
        userId: userid,
        limit: limit
      }
    });
    return response.data;
  } catch (error) {
    // console.error('최근 활동 조회 실패:', error);
    // 404 에러는 활동이 없는 것으로 처리
    if (error.response && error.response.status === 404) {
      return { list: [], total: 0 };
    }
    throw error;
  }
};

// 활동 타입별 아이콘 매핑
export const getActivityIcon = (activityType) => {
  const iconMap = {
    'COUNSELING': '💬',
    'PSYCHOLOGICAL_TEST': '🧠',
    'PERSONALITY_TEST': '📊',
    'EMOTION_LOG': '😊',
    'QUEST': '📋',
    'FAQ': '❓',
    'FORTUNE_CARD': '🔮',
    'BADGE_EARNED': '🏆',
    'POINT_EARNED': '💰',
    'FACE_LOGIN': '📱',
    'PROFILE_UPDATE': '👤',
    'SETTINGS_CHANGE': '⚙️',
    'CONTENT_WATCH': '📺',
    'ANALYSIS_VIEW': '📈',
    'SIMULATION_COMPLETE': '🤖'
  };
  return iconMap[activityType] || '📝';
};

// 활동 타입별 한글명 매핑
export const getActivityName = (activityType) => {
  const nameMap = {
    'COUNSELING': '상담 세션 완료',
    'PSYCHOLOGICAL_TEST': '심리검사 완료',
    'EMOTION_RECORD': '감정 기록 작성',
    'PERSONALITY_TEST': '성격검사 완료',
    'DEPRESSION_TEST': '우울증검사 완료',
    'STRESS_TEST': '스트레스검사 완료',
    'FORTUNE_CARD': '포춘카드 뽑기',
    'QUEST': '퀘스트 수행',
    'BADGE_EARNED': '뱃지 획득',
    'POINT_EARNED': '포인트 획득',
    'FACE_LOGIN': '페이스 로그인',
    'PROFILE_UPDATE': '프로필 수정',
    'SETTINGS_CHANGE': '설정 변경',
    'FAQ_WRITE': '문의사항 작성',
    'CONTENT_WATCH': '콘텐츠 시청',
    'ANALYSIS_VIEW': '심리 분석 확인',
    'SIMULATION_COMPLETE': '시뮬레이션 완료',
    'EMOTION_ANALYSIS': '감정 분석 확인'
  };
  return nameMap[activityType] || '활동';
};

// 활동 데이터 포맷팅
export const formatActivityData = (data) => {
  return data.map(item => ({
    id: item.id || item.activityId,
    type: item.activityType,
    title: item.title || getActivityName(item.activityType),
    description: item.description || '',
    createdAt: item.createdAt || item.activityDate,
    icon: getActivityIcon(item.activityType)
  }));
}; 