import axios from 'axios';
import { getApiConfig, TOKEN_CONFIG } from '../config/config';

// Spring Boot 서버 기본 URL 설정
const API_BASE_URL = getApiConfig().baseURL;

// axios 인스턴스 생성
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 요청 인터셉터 (토큰 추가)
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem(TOKEN_CONFIG.accessTokenKey);
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 응답 인터셉터 (토큰 만료 처리)
api.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    if (error.response?.status === 401) {
      // 토큰이 만료된 경우 refresh token으로 갱신 시도
      const refreshToken = localStorage.getItem(TOKEN_CONFIG.refreshTokenKey);
      if (refreshToken) {
        try {
          const response = await axios.post(`${API_BASE_URL}/reissue`, {
            refreshToken: refreshToken
          });
          
          if (response.data.accessToken) {
            localStorage.setItem(TOKEN_CONFIG.accessTokenKey, response.data.accessToken);
            // 원래 요청 재시도
            error.config.headers.Authorization = `Bearer ${response.data.accessToken}`;
            return api.request(error.config);
          }
        } catch (refreshError) {
          // refresh token도 만료된 경우 로그아웃
          localStorage.removeItem(TOKEN_CONFIG.accessTokenKey);
          localStorage.removeItem(TOKEN_CONFIG.refreshTokenKey);
          window.location.href = '/login';
        }
      }
    }
    return Promise.reject(error);
  }
);

export default api;
