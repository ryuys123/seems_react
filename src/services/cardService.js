import apiClient from '../utils/axios';

// 포춘카드 뽑기 API (Spring Boot)
export const drawFortuneCard = async (userid) => {
  try {
    // console.log('포춘카드 뽑기 요청 데이터:', { userId: userid });
    const response = await apiClient.post('/fortune-card/draw', {
      userId: userid
    });
    // console.log('포춘카드 뽑기 응답:', response.data);
    return response.data;
  } catch (error) {
    // console.error('포춘카드 뽑기 실패:', error);
    // console.error('요청 데이터:', { userId: userid });
    // console.error('에러 상세 정보:', {
    //   status: error.response?.status,
    //   statusText: error.response?.statusText,
    //   data: error.response?.data,
    //   url: error.config?.url,
    //   method: error.config?.method
    // });
    throw error;
  }
};

// 오늘 카드 뽑기 여부 확인
export const checkTodayCardDrawn = async (userid) => {
  try {
    // console.log('=== 포춘카드 API 디버깅 ===');
    // console.log('요청하는 userId:', userid);
    // console.log('요청 URL:', '/fortune-card/today');
    // console.log('요청 파라미터:', { userId: userid });
    // console.log('Axios baseURL:', process.env.REACT_APP_API_BASE_URL || "http://localhost:8888/seems");
    // console.log('전체 요청 URL:', (process.env.REACT_APP_API_BASE_URL || "http://localhost:8888/seems") + '/fortune-card/today');
    
    const response = await apiClient.get('/fortune-card/today', {
      params: { userId: userid }
    });
    // console.log('오늘 카드 뽑기 여부 확인 성공:', response.data);
    return { drawn: true, card: response.data };
  } catch (error) {
    // console.error('=== 포춘카드 API 에러 상세 정보 ===');
    // console.error('에러 타입:', error.name);
    // console.error('에러 메시지:', error.message);
    // console.error('HTTP 상태 코드:', error.response?.status);
    // console.error('HTTP 상태 텍스트:', error.response?.statusText);
    // console.error('응답 데이터:', error.response?.data);
    // console.error('요청 URL:', error.config?.url);
    // console.error('요청 메서드:', error.config?.method);
    // console.error('요청 헤더:', error.config?.headers);
    // console.error('요청 파라미터:', error.config?.params);
    // console.error('BaseURL:', error.config?.baseURL);
    // console.error('전체 요청 URL:', error.config?.baseURL + error.config?.url);
    
    if (error.response && error.response.status === 404) {
      // console.log('오늘 카드를 뽑지 않음 (404 응답)');
      return { drawn: false, card: null };
    }
    // console.error('오늘 카드 뽑기 여부 확인 실패:', error);
    return { drawn: false, card: null };
  }
};

// 사용자 카드 히스토리 조회
export const getUserCardHistory = async (userid, limit = 10) => {
  try {
    const response = await apiClient.get('/fortune-card/history', {
      params: { 
        userId: userid,
        limit: limit
      }
    });
    return response.data;
  } catch (error) {
    // console.error('카드 히스토리 조회 실패:', error);
    throw error;
  }
};

// 카드 읽음 처리
export const markCardAsRead = async (userid, cardId) => {
  try {
    const response = await apiClient.post('/fortune-card/read', null, {
      params: {
        userId: userid,
        cardId: cardId
      }
    });
    return response.data;
  } catch (error) {
    // console.error('카드 읽음 처리 실패:', error);
    throw error;
  }
}; 