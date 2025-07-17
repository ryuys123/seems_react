import apiClient from '../utils/axios';

// 사용자 퀘스트 통계 조회
export const getUserQuestStats = async (userId) => {
  try {
    const response = await apiClient.get(`/api/quest-store/${userId}`);
    return response.data;
  } catch (error) {
    console.error('사용자 퀘스트 통계 조회 에러:', error);
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
    // userId를 쿼리 파라미터로 전달
    const response = await apiClient.post(
      `/api/quests/${questId}/steps/${stepId}/complete?userId=${encodeURIComponent(userId)}`,
      { completed }
    );
    return response.data;
  } catch (error) {
    console.error('퀘스트 단계 완료 처리 에러:', error);
    throw error;
  }
};

// 새 퀘스트 생성
export const createQuest = async (questData) => {
  try {
    const { userId, questName, questPoints, isCompleted, date } = questData;
    // 쿼리 파라미터 문자열 생성
    const params = new URLSearchParams({
      userId,
      questName,
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
export const updateQuest = async (questId, questData) => {
  try {
    const response = await apiClient.put(`/api/quests/${questId}`, questData);
    return response.data;
  } catch (error) {
    console.error('퀘스트 수정 에러:', error);
    throw error;
  }
};

// 퀘스트 삭제
export const deleteQuest = async (questId) => {
  try {
    const response = await apiClient.delete(`/api/quests/${questId}`);
    return response.data;
  } catch (error) {
    console.error('퀘스트 삭제 에러:', error);
    throw error;
  }
}; 