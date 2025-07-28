import apiClient from '../utils/axios';
import { TOKEN_CONFIG, STORAGE_KEYS } from '../config/config';

// 소셜 로그인 SDK 초기화 (OAuth2 방식으로 단순화)
export const initializeSocialSDK = () => {
  console.log('소셜 로그인 SDK 초기화 완료 (OAuth2 방식 사용)');
};

// 사용자 정보 조회
export const getUserInfo = async () => {
  try {
    const response = await apiClient.get('/user/info');
    return response.data;
  } catch (error) {
    console.error('사용자 정보 조회 실패:', error);
    throw error;
  }
};

// 카카오 로그인 (OAuth2 방식)
export const kakaoLogin = async () => {
  try {
    window.location.href = 'http://localhost:8888/seems/oauth2/authorization/kakao';
    return { success: true };
  } catch (error) {
    console.error('카카오 로그인 실패:', error);
    return { success: false, error: error.message };
  }
};

// 네이버 로그인 (OAuth2 방식)
export const naverLogin = async () => {
  try {
    window.location.href = 'http://localhost:8888/seems/oauth2/authorization/naver';
    return { success: true };
  } catch (error) {
    console.error('네이버 로그인 실패:', error);
    return { success: false, error: error.message };
  }
};

// 구글 로그인 (OAuth2 방식)
export const googleLogin = async () => {
  try {
    window.location.href = 'http://localhost:8888/seems/oauth2/authorization/google';
    return { success: true };
  } catch (error) {
    console.error('구글 로그인 실패:', error);
    return { success: false, error: error.message };
  }
};

// 로그아웃
export const logout = async () => {
  try {
    await apiClient.post('/auth/logout');
  } catch (error) {
    console.error('로그아웃 에러:', error);
  } finally {
    // 로컬 스토리지 정리
    localStorage.removeItem(TOKEN_CONFIG.accessTokenKey);
    localStorage.removeItem(TOKEN_CONFIG.refreshTokenKey);
    localStorage.removeItem(STORAGE_KEYS.USER_INFO);
    localStorage.removeItem('social-login');
    localStorage.removeItem('login-type');
  }
};

// 비밀번호 확인
export const verifyPassword = async (password) => {
  try {
    const response = await apiClient.post('/user/verify-password', {
      password: password
    });
    return response.data.success;
  } catch (error) {
    console.error('비밀번호 확인 에러:', error);
    return false;
  }
};

// 회원 탈퇴
export const deleteAccount = async () => {
  try {
    const response = await apiClient.delete('/user/delete');
    return response.data.success;
  } catch (error) {
    console.error('회원 탈퇴 에러:', error);
    throw error;
  }
};
