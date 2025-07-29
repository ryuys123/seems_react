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
    console.log('비밀번호 확인 요청:', { password: password ? '입력됨' : '입력안됨' });
    
    // 토큰 상태 확인
    const accessToken = localStorage.getItem('accessToken');
    const refreshToken = localStorage.getItem('refreshToken');
    console.log('토큰 상태:', {
      accessToken: accessToken ? '존재' : '없음',
      refreshToken: refreshToken ? '존재' : '없음'
    });
    
    const response = await apiClient.post('/user/verify-password', {
      password: password
    });
    console.log('비밀번호 확인 응답:', response.data);
    console.log('응답 타입:', typeof response.data);
    
    // 서버 응답 구조에 따라 성공 여부 판단
    let result = false;
    
    if (typeof response.data === 'string') {
      // 문자열 응답인 경우
      if (response.data.includes('완료')) {
        result = true;
        console.log('문자열 응답에서 완료 메시지 감지:', result);
      } else {
        result = false;
        console.log('문자열 응답에서 완료 메시지 없음:', result);
      }
    } else if (response.data.success !== undefined) {
      // 객체 응답이고 success 필드가 있는 경우
      result = response.data.success;
      console.log('success 필드 사용:', result);
    } else if (response.data.message && response.data.message.includes('완료')) {
      // 객체 응답이고 message 필드에 완료가 포함된 경우
      result = true;
      console.log('message 필드 사용:', result);
    } else {
      result = false;
      console.log('기본값 사용:', result);
    }
    
    console.log('최종 결과:', result);
    return result;
  } catch (error) {
    console.error('비밀번호 확인 에러:', error);
    console.error('에러 응답:', error.response?.data);
    return false;
  }
};

// 회원 탈퇴
export const deleteAccount = async (userType, authData = {}) => {
  try {
    console.log('회원탈퇴 요청:', { userType, authData });
    
    // UserDeleteRequest 객체 생성
    const requestData = {
      userType: userType, // 'normal' 또는 'social'
      ...authData // password 등 추가 인증 데이터
    };
    
    console.log('전송할 데이터:', requestData);
    
    const response = await apiClient.delete('/user/account', {
      data: requestData // DELETE 요청의 body에 데이터 포함
    });
    
    console.log('회원탈퇴 응답:', response.data);
    return response.data;
  } catch (error) {
    console.error('회원 탈퇴 에러:', error);
    console.error('에러 응답:', error.response?.data);
    throw error;
  }
};
