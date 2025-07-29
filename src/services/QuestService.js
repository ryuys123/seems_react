import apiClient from '../utils/axios';
import axios from 'axios';

// 토큰 재발급 함수
export const reissueToken = async () => {
  try {
    const accessToken = localStorage.getItem('accessToken');
    const refreshToken = localStorage.getItem('refreshToken');
    
    const response = await axios.post('http://localhost:8888/seems/api/reissue', {}, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'RefreshToken': `Bearer ${refreshToken}`
      }
    });
    
    // 새로운 토큰을 헤더에서 추출
    const newAccessToken = response.headers['authorization'];
    const newRefreshToken = response.headers['refresh-token'];
    
    if (newAccessToken) {
      localStorage.setItem('accessToken', newAccessToken.replace('Bearer ', ''));
    }
    if (newRefreshToken) {
      localStorage.setItem('refreshToken', newRefreshToken.replace('Bearer ', ''));
    }
    
    return true;
  } catch (error) {
    console.error('토큰 재발급 실패:', error);
    // 재발급 실패 시 로그인 페이지로 리다이렉트
    localStorage.clear();
    window.location.href = '/login';
    return false;
  }
};

// 사용자 퀘스트 통계 조회
export const getUserQuestStats = async (userId) => {
  try {
    const requestUrl = `/api/quests/user/${userId}/stats`;
    console.log('getUserQuestStats 요청 URL:', requestUrl);
    
    const response = await apiClient.get(requestUrl);
    
    console.log('getUserQuestStats 응답:', response.data);
    return response.data;
  } catch (error) {
    console.error('사용자 퀘스트 통계 조회 에러:', error);
    console.error('사용자 퀘스트 통계 조회 에러 응답:', error.response);
    throw error;
  }
};

// 사용자 포인트 조회
export const getUserPoints = async (userId) => {
  try {
    const requestUrl = `/api/user/points?userId=${userId}`;
    console.log('getUserPoints 요청 URL:', requestUrl);
    
    const response = await apiClient.get(requestUrl);
    
    console.log('getUserPoints 응답:', response.data);
    return response.data;
  } catch (error) {
    console.error('사용자 포인트 조회 에러:', error);
    console.error('사용자 포인트 조회 에러 응답:', error.response);
    throw error;
  }
};

// 포인트 관리 함수들
export const addUserPoints = async (userId, points) => {
  try {
    const response = await apiClient.post('/api/user/points/add', {
      userId: userId,
      points: points
    });
    return response.data;
  } catch (error) {
    console.error('포인트 추가 실패:', error);
    throw error;
  }
};

export const deductUserPoints = async (userId, points) => {
  try {
    const response = await apiClient.post('/api/user/points/deduct', {
      userId: userId,
      points: points
    });
    return response.data;
  } catch (error) {
    console.error('포인트 차감 실패:', error);
    throw error;
  }
};

export const updateUserPoints = async (userId, points) => {
  try {
    const response = await apiClient.put('/api/user/points', {
      userId: userId,
      points: points
    });
    return response.data;
  } catch (error) {
    console.error('포인트 업데이트 실패:', error);
    throw error;
  }
};

// 사용자의 퀘스트 목록 조회
export const getUserQuests = async (userId) => {
  try {
    const response = await apiClient.get(`/api/quests/user/${userId}`);
    return response.data;
  } catch (error) {
    console.error('사용자 퀘스트 목록 조회 에러:', error);
    throw error;
  }
};

// 퀘스트 완료 처리
export const completeQuest = async (questId) => {
  try {
    const response = await apiClient.post(`/api/quests/${questId}/complete`);
    return response.data;
  } catch (error) {
    console.error('퀘스트 완료 처리 에러:', error);
    throw error;
  }
};

// 퀘스트 단계 완료 처리
export const completeQuestStep = async (questId, stepId, completed, userId) => {
  try {
    // 쿼리 파라미터로 completed 값도 포함
    const requestUrl = `/api/quests/${questId}/steps/${stepId}/complete?userId=${encodeURIComponent(userId)}&completed=${completed}`;
    const requestData = { completed }; // POST Body에도 포함 (백엔드가 두 가지 방식 모두 지원)
    
    console.log('completeQuestStep 요청 URL:', requestUrl);
    console.log('completeQuestStep 요청 데이터:', requestData);
    console.log('completeQuestStep 파라미터:', { questId, stepId, completed, userId });
    
    const response = await apiClient.post(requestUrl, requestData);
    
    console.log('completeQuestStep 응답:', response.data);
    return response.data;
  } catch (error) {
    console.error('퀘스트 단계 완료 처리 에러:', error);
    console.error('퀘스트 단계 완료 처리 에러 응답:', error.response);
    throw error;
  }
};

// 새 퀘스트 생성
export const createQuest = async (questData) => {
  try {
    const { userId, questName, questPoints, isCompleted, date } = questData;
    // 쿼리 파라미터 문자열 생성
    const params = new URLSearchParams({
      userId, // encodeURIComponent 제거
      questName, // encodeURIComponent 제거
      questPoints: String(questPoints),
      isCompleted: String(isCompleted),
      date
    }).toString();
    const response = await apiClient.post(`/api/quests/create?${params}`);
    return response.data;
  } catch (error) {
    console.error('퀘스트 생성 에러:', error);
    throw error;
  }
};

// 퀘스트 수정
export const updateQuest = async (questId, questData, userId) => {
  try {
    const { questName, questPoints } = questData;
    const params = new URLSearchParams({
      userId,
      questName,
      questPoints: String(questPoints || 5)
    }).toString();
    
    const requestUrl = `/api/quests/${questId}?${params}`;
    console.log('퀘스트 수정 요청 URL:', requestUrl);
    console.log('퀘스트 수정 요청 데이터:', { questId, questData, userId });
    
    const response = await apiClient.put(requestUrl);
    return response.data;
  } catch (error) {
    console.error('퀘스트 수정 에러:', error);
    console.error('퀘스트 수정 에러 응답:', error.response);
    
    // 401 에러인 경우 토큰 재발급 후 재시도
    if (error.response?.status === 401) {
      console.log('토큰 만료로 인한 퀘스트 수정 실패, 재시도 중...');
      // axios 인터셉터에서 자동으로 토큰 재발급 후 재시도하므로
      // 여기서는 에러를 다시 던져서 상위에서 처리하도록 함
    }
    
    throw error;
  }
};

// 퀘스트 삭제
export const deleteQuest = async (questId, userId) => {
  try {
    const requestUrl = `/api/quests/${questId}?userId=${userId}`;
    console.log('퀘스트 삭제 요청 URL:', requestUrl);
    console.log('퀘스트 삭제 요청 데이터:', { questId, userId });
    
    const response = await apiClient.delete(requestUrl);
    return response.data;
  } catch (error) {
    console.error('퀘스트 삭제 에러:', error);
    console.error('퀘스트 삭제 에러 응답:', error.response);
    
    // 401 에러인 경우 토큰 재발급 후 재시도
    if (error.response?.status === 401) {
      console.log('토큰 만료로 인한 퀘스트 삭제 실패, 재시도 중...');
      // axios 인터셉터에서 자동으로 토큰 재발급 후 재시도하므로
      // 여기서는 에러를 다시 던져서 상위에서 처리하도록 함
    }
    
    throw error;
  }
}; 

// 맞춤형 추천 퀘스트 조회 (userId 또는 emotionId 기반)
export const getRecommendedQuests = async (userId, emotionId) => {
  try {
    let response;
    if (emotionId) {
      response = await apiClient.get(`/api/quest-recommendations?emotionId=${emotionId}`);
    } else {
      response = await apiClient.get(`/api/quest-recommendations?userId=${userId}`);
    }
    return response.data;
  } catch (error) {
    console.error('추천 퀘스트 조회 에러:', error);
    throw error;
  }
};

// 오늘의 감정 조회
export const getTodayEmotion = async (userId) => {
  try {
    const response = await apiClient.get(`/api/emotion-logs/${userId}/today`);
    return response.data;
  } catch (error) {
    console.error('오늘의 감정 조회 에러:', error);
    throw error;
  }
}; 