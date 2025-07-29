import apiClient from './axios';

// 활동 기록 함수
export const logActivity = async (userid, activityType, title, description = '') => {
  try {
    const activityData = {
      userid: userid,
      activityType: activityType,
      title: title,
      description: description,
      createdAt: new Date().toISOString()
    };

    const response = await apiClient.post('/api/user/activities', activityData);
    console.log('활동 기록 완료:', activityType, title);
    return response.data;
  } catch (error) {
    console.error('활동 기록 실패:', error);
    // 백엔드 API가 없어도 에러를 던지지 않음 (선택적 기능)
    return null;
  }
};

// 상담 활동 기록
export const logCounselingActivity = async (userid, counselorName = '') => {
  return await logActivity(
    userid,
    'COUNSELING',
    '상담 세션 완료',
    counselorName ? `${counselorName} 상담사와의 상담 세션을 완료했습니다.` : 'AI 상담 세션을 완료했습니다.'
  );
};

// 심리검사 활동 기록
export const logPsychologicalTestActivity = async (userid, testType) => {
  const testNames = {
    'PERSONALITY': '성격검사',
    'DEPRESSION': '우울증검사',
    'STRESS': '스트레스검사',
    'PSYCHOLOGICAL_IMAGE': '이미지심리검사'
  };
  
  const testName = testNames[testType] || '심리검사';
  
  return await logActivity(
    userid,
    'PSYCHOLOGICAL_TEST',
    `${testName} 완료`,
    `${testName}를 완료했습니다.`
  );
};

// 감정기록 활동 기록
export const logEmotionRecordActivity = async (userid, emotion) => {
  return await logActivity(
    userid,
    'EMOTION_LOG',
    '감정 기록',
    `감정 상태 기록: ${emotion}`
  );
};



// 퀘스트 활동 기록
export const logQuestActivity = async (userid, questTitle, points = 0) => {
  const description = points > 0 ? `${questTitle} 퀘스트를 수행하여 ${points}포인트를 획득했습니다.` : `${questTitle} 퀘스트를 수행했습니다.`;
  
  return await logActivity(
    userid,
    'QUEST',
    '퀘스트 수행',
    description
  );
};

// FAQ 활동 기록
export const logFaqActivity = async (userid, faqTitle) => {
  return await logActivity(
    userid,
    'FAQ',
    '문의사항 작성',
    `문의사항 작성: ${faqTitle}`
  );
};

// 콘텐츠 시청 활동 기록
export const logContentWatchActivity = async (userid, contentTitle) => {
  return await logActivity(
    userid,
    'CONTENT_WATCH',
    '콘텐츠 시청',
    `추천 콘텐츠를 시청했습니다: ${contentTitle}`
  );
};

// 심리 분석 확인 활동 기록
export const logAnalysisViewActivity = async (userid) => {
  return await logActivity(
    userid,
    'ANALYSIS_VIEW',
    '심리 분석 확인',
    '심리 분석 결과를 확인했습니다.'
  );
};

// 시뮬레이션 완료 활동 기록
export const logSimulationCompleteActivity = async (userid, simulationType) => {
  return await logActivity(
    userid,
    'SIMULATION_COMPLETE',
    '시뮬레이션 완료',
    `${simulationType} 시뮬레이션을 완료했습니다.`
  );
}; 