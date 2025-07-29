import apiClient from '../utils/axios';

// 사용자 키워드 상태 조회
export const getUserKeywordsStatus = async (userId) => {
  try {
    console.log('사용자 키워드 상태 조회 요청 - userId:', userId);
    const response = await apiClient.get(`/api/fortune/user-keywords/${userId}`);
    console.log('사용자 키워드 상태 조회 응답:', response.data);
    console.log('선택된 키워드 타입:', typeof response.data?.selectedKeywords);
    console.log('선택된 키워드 길이:', response.data?.selectedKeywords?.length || 0);
    
    if (response.data?.selectedKeywords) {
      response.data.selectedKeywords.forEach((keyword, index) => {
        console.log(`선택된 키워드 ${index}:`, keyword, '타입:', typeof keyword);
      });
    }
    
    return response.data;
  } catch (error) {
    console.error('키워드 상태 조회 실패:', error);
    // 404 에러 시 기본 상태 반환
    if (error.response?.status === 404) {
      return { 
        success: true, 
        selectedKeywords: [], 
        selectedCount: 0 
      };
    }
    throw error;
  }
};

// 키워드 선택/해제 업데이트
export const updateUserKeywords = async (userId, keywords) => {
  try {
    const response = await apiClient.post('/api/fortune/update-keywords', {
      userId: userId,
      selectedKeywords: keywords
    });
    return response.data;
  } catch (error) {
    console.error('키워드 업데이트 실패:', error);
    throw error;
  }
};

// 사용 가능한 키워드 목록 조회
export const getAvailableKeywords = async () => {
  try {
    console.log('키워드 목록 조회 요청 시작');
    const response = await apiClient.get('/api/fortune/keywords');
    console.log('키워드 목록 조회 응답:', response.data);
    console.log('키워드 목록 타입:', typeof response.data);
    console.log('키워드 목록 길이:', response.data?.keywords?.length || 0);
    
    if (response.data?.keywords) {
      response.data.keywords.forEach((keyword, index) => {
        console.log(`키워드 ${index}:`, keyword, '타입:', typeof keyword);
      });
    }
    
    return response.data;
  } catch (error) {
    console.error('키워드 목록 조회 실패:', error);
    throw error;
  }
};

// 오늘의 행운 메시지 조회
export const getTodayMessage = async (userId) => {
  try {
    const response = await apiClient.get(`/api/fortune/today-message/${userId}`);
    return response.data;
  } catch (error) {
    console.error('오늘의 행운 메시지 조회 실패:', error);
    throw error;
  }
};

// 일일 행운 메시지 생성 (AI 서비스 호출)
export const generateDailyMessage = async (keyword, model = 'gpt-3.5-turbo') => {
  try {
    const response = await apiClient.post('/api/emotion/daily-message', {
      keyword: keyword,
      model: model
    });
    return response.data;
  } catch (error) {
    console.error('일일 메시지 생성 실패:', error);
    throw error;
  }
};

// 메시지 히스토리 조회
export const getMessageHistory = async (userId) => {
  try {
    const response = await apiClient.get('/api/fortune/message-history', {
      params: { userId: userId }
    });
    return response.data;
  } catch (error) {
    console.error('메시지 히스토리 조회 실패:', error);
    throw error;
  }
}; 