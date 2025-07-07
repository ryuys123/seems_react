// API 서버 설정
export const API_CONFIG = {
  // 개발 환경
  development: {
    baseURL: 'http://localhost:8888/seems',
    timeout: 10000
  },
  // 프로덕션 환경
  production: {
    baseURL: 'https://your-production-domain.com/seems',
    timeout: 10000
  }
};

// 현재 환경에 따른 설정 반환
export const getApiConfig = () => {
  const env = process.env.NODE_ENV || 'development';
  return API_CONFIG[env];
};

// JWT 토큰 관련 설정
export const TOKEN_CONFIG = {
  accessTokenKey: 'accessToken',
  refreshTokenKey: 'refreshToken',
  tokenExpiryKey: 'tokenExpiry'
};

// 로컬 스토리지 키
export const STORAGE_KEYS = {
  USER_INFO: 'userInfo',
  THEME: 'theme',
  LANGUAGE: 'language'
}; 