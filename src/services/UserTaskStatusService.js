import axios from 'axios';

const API_BASE_URL = 'http://localhost:8888/seems/api/analysis'; // Spring Boot 백엔드 API 기본 URL
const PSYCH_TEST_API_BASE_URL = '/api/psychological-test'; // 심리 검사 API 기본 URL
const PYTHON_AI_SERVER_URL = 'http://localhost:5000'; // Python AI 서버 URL

// Axios 인스턴스 생성 (인증 토큰을 헤더에 추가하기 위함)
const axiosInstance = axios.create({
    baseURL: API_BASE_URL,
});

// 요청 인터셉터를 사용하여 모든 요청에 토큰 추가
axiosInstance.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('accessToken'); // 또는 sessionStorage
        if (token) {
            config.headers['Authorization'] = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

const UserTaskStatusService = {
    // 사용자의 과제 완료 상태 조회
    getUserTaskStatus: async (userId) => {
        try {
            // 기존 axios.get 대신 axiosInstance.get 사용
            const response = await axiosInstance.get(`/status/${userId}`);
            return response.data;
        } catch (error) {
            console.error('Error fetching user task status:', error);
            throw error;
        }
    },

    // 상담 완료 처리
    completeCounseling: async (userId) => {
        try {
            const response = await axiosInstance.post(`/counseling/complete/${userId}`);
            return response.data;
        } catch (error) {
            console.error('Error completing counseling:', error);
            throw error;
        }
    },

    // 심리검사 완료 처리 (testType: personality, psychImage, depression, stress)
    completePsychTest: async (testType, userId) => {
        try {
            const response = await axiosInstance.post(`/psych-test/${testType}/complete/${userId}`);
            return response.data;
        } catch (error) {
            console.error(`Error completing ${testType} test:`, error);
            throw error;
        }
    },

    // 통합 분석 시작 (Spring Boot 백엔드 호출)
    startIntegratedAnalysis: async (userId) => {
        try {
            const response = await axiosInstance.post(`/integrated/${userId}`);
            return response.data; // Spring Boot에서 반환하는 UserTaskStatus 객체
        } catch (error) {
            console.error('Error starting integrated analysis:', error);
            throw error;
        }
    },

    // 최종 분석 결과 조회 (Spring Boot 백엔드 호출)
    getFinalAnalysisResult: async (userId) => {
        try {
            const response = await axiosInstance.get(`/final-result/${userId}`);
            return response.data;
        } catch (error) {
            console.error('Error fetching final analysis result:', error);
            throw error;
        }
    }
};

export default UserTaskStatusService;