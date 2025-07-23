import apiClient from '../utils/axios';

/**
 * 척도 기반 심리검사(우울증, 스트레스 등) 결과를 서버에 제출합니다.
 * @param {object} submissionData - 제출할 데이터
 * @param {string} submissionData.userId - 사용자 ID
 * @param {string} submissionData.testCategory - 검사 카테고리 (e.g., "DEPRESSION_SCALE")
 * @param {Array<object>} submissionData.answers - 답변 목록
 * @param {number} submissionData.answers.questionId - 질문 ID
 * @param {number} submissionData.answers.answerValue - 답변 값
 * @returns {Promise<object>} 서버로부터 받은 결과 데이터
 */
export const submitScaleTest = async (submissionData) => {
  try {
    const response = await apiClient.post('/api/psychological-test/scale', submissionData);
    return response.data;
  } catch (error) {
    console.error('척도 검사 제출 중 오류 발생:', error);
    throw error;
  }
};

/**
 * MBTI 성격검사 결과를 서버에 제출합니다.
 * @param {object} submissionData - 제출할 데이터
 * @param {string} submissionData.userId - 사용자 ID
 * @param {Array<object>} submissionData.answers - 답변 목록
 * @param {number} submissionData.answers.questionId - 질문 ID
 * @param {number} submissionData.answers.answerValue - 답변 값 (1-5)
 * @param {string} submissionData.answers.scoreDirection - 점수 방향 (E, I, S, N, T, F, J, P)
 * @returns {Promise<object>} 서버로부터 받은 결과 데이터
 */
export const submitPersonalityTest = async (submissionData) => {
  try {
    const response = await apiClient.post('/api/personality-test/submit', submissionData);
    return response.data;
  } catch (error) {
    console.error('MBTI 검사 제출 중 오류 발생:', error);
    throw error;
  }
};

/**
 * 이미지 심리검사 답변을 서버에 제출합니다.
 * @param {object} answerData - 제출할 답변 데이터
 * @returns {Promise<object>} 서버로부터 받은 결과 데이터 (마지막 단계일 경우)
 */
export const submitPsychologicalAnswer = async (answerData) => {
  try {
    const response = await apiClient.post("/api/psychological-test/submit-answer", answerData);
    console.log("DEBUG: TestService submitPsychologicalAnswer raw response:", response);
    if (response.data === undefined) {
      return response; // response.data가 undefined이면 response 객체 자체를 반환
    }
    return response.data;
  } catch (error) {
    console.error("이미지 심리검사 답변 제출 중 오류 발생:", error);
    throw error;
  }
};

/**
 * 특정 검사 결과를 ID로 조회합니다.
 * @param {string} resultId - 결과 ID
 * @param {string} testType - 검사 유형 (e.g., "IMAGE_TEST", "DEPRESSION_SCALE")
 * @returns {Promise<object>} 검사 결과 데이터
 */
export const getPsychologicalTestResult = async (resultId, testType) => {
  try {
    const response = await apiClient.get(`/api/psychological-test/result/${resultId}?testType=${testType}`);
    return response.data;
  } catch (error) {
    console.error(`검사 결과(ID: ${resultId}, 타입: ${testType}) 조회 중 오류 발생:`, error);
    throw error;
  }
};

/**
 * 특정 사용자의 최신 이미지 심리 검사 결과를 조회합니다.
 * @param {string} userId - 사용자 ID
 * @returns {Promise<object>} 최신 이미지 심리 검사 결과 데이터
 */
export const getLatestPsychologicalImageResult = async (userId) => {
  try {
    const response = await apiClient.get(`/api/psychological-test/latest-image-result/${userId}`);
    return response.data;
  } catch (error) {
    if (error.response && error.response.status === 404) {
      return null; // 결과가 없을 경우 null 반환
    }
    console.error("최신 이미지 심리 검사 결과 조회 중 오류 발생:", error);
    throw error;
  }
};

/**
 * 특정 사용자의 최신 척도 검사 결과를 조회합니다.
 * @param {string} userId - 사용자 ID
 * @param {string} testCategory - 검사 카테고리 (e.g., "DEPRESSION_SCALE", "STRESS_SCALE")
 * @returns {Promise<object>} 최신 척도 검사 결과 데이터
 */
export const getLatestScaleResult = async (userId, testCategory) => {
  try {
    const response = await apiClient.get(`/api/psychological-test/latest-scale-result/${userId}/${testCategory}`);
    return response.data;
  } catch (error) {
    if (error.response && error.response.status === 404) {
      return null; // 결과가 없을 경우 null 반환
    }
    console.error(`최신 ${testCategory} 척도 검사 결과 조회 중 오류 발생:`, error);
    throw error;
  }
};
