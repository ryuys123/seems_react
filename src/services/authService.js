import apiClient from '../utils/axios';
import { TOKEN_CONFIG, STORAGE_KEYS } from '../config/config';

// 소셜 로그인 SDK 초기화
export const initializeSocialSDK = () => {
  try {
    // 카카오 SDK 초기화
    if (typeof window !== 'undefined' && window.Kakao && !window.Kakao.isInitialized()) {
      const kakaoAppKey = process.env.REACT_APP_KAKAO_APP_KEY;
      if (kakaoAppKey) {
        window.Kakao.init(kakaoAppKey);
        console.log('카카오 SDK 초기화 완료');
      } else {
        console.warn('카카오 앱 키가 설정되지 않았습니다.');
      }
    }
    
    // 네이버 SDK 초기화
    if (typeof window !== 'undefined' && window.naver && window.naver.LoginButton) {
      try {
        window.naver.LoginButton.initialize();
        console.log('네이버 SDK 초기화 완료');
      } catch (error) {
        console.warn('네이버 SDK 초기화 실패:', error);
      }
    }
    
    // 구글 SDK 초기화
    if (typeof window !== 'undefined' && window.gapi) {
      try {
        window.gapi.load('auth2', () => {
          const googleClientId = process.env.REACT_APP_GOOGLE_CLIENT_ID;
          if (googleClientId) {
            window.gapi.auth2.init({
              client_id: googleClientId
            });
            console.log('구글 SDK 초기화 완료');
          } else {
            console.warn('구글 클라이언트 ID가 설정되지 않았습니다.');
          }
        });
      } catch (error) {
        console.warn('구글 SDK 초기화 실패:', error);
      }
    }
  } catch (error) {
    console.warn('소셜 로그인 SDK 초기화 중 오류 발생:', error);
  }
};

// 카카오 로그인
export const kakaoLogin = async () => {
  try {
    if (!window.Kakao) {
      throw new Error('카카오 SDK가 로드되지 않았습니다.');
    }

    const response = await new Promise((resolve, reject) => {
      window.Kakao.Auth.login({
        success: (authObj) => {
          resolve(authObj);
        },
        fail: (err) => {
          reject(err);
        }
      });
    });

    // 서버에 카카오 토큰 전송하여 로그인 처리
    const loginResponse = await apiClient.post('/auth/kakao/login', {
      accessToken: response.access_token
    });

    if (loginResponse.data.success) {
      const { accessToken, refreshToken, userInfo } = loginResponse.data;
      
      // 토큰 저장
      localStorage.setItem(TOKEN_CONFIG.accessTokenKey, accessToken);
      localStorage.setItem(TOKEN_CONFIG.refreshTokenKey, refreshToken);
      localStorage.setItem(STORAGE_KEYS.USER_INFO, JSON.stringify(userInfo));
      localStorage.setItem('social-login', 'kakao');
      
      return { success: true, userInfo };
    }
    
    throw new Error(loginResponse.data.message || '카카오 로그인에 실패했습니다.');
  } catch (error) {
    console.error('카카오 로그인 에러:', error);
    throw error;
  }
};

// 네이버 로그인
export const naverLogin = async () => {
  try {
    if (!window.naver) {
      throw new Error('네이버 SDK가 로드되지 않았습니다.');
    }

    const response = await new Promise((resolve, reject) => {
      window.naver.Login.login((status) => {
        if (status) {
          resolve(window.naver.Login.getAccessToken());
        } else {
          reject(new Error('네이버 로그인에 실패했습니다.'));
        }
      });
    });

    // 서버에 네이버 토큰 전송하여 로그인 처리
    const loginResponse = await apiClient.post('/auth/naver/login', {
      accessToken: response
    });

    if (loginResponse.data.success) {
      const { accessToken, refreshToken, userInfo } = loginResponse.data;
      
      // 토큰 저장
      localStorage.setItem(TOKEN_CONFIG.accessTokenKey, accessToken);
      localStorage.setItem(TOKEN_CONFIG.refreshTokenKey, refreshToken);
      localStorage.setItem(STORAGE_KEYS.USER_INFO, JSON.stringify(userInfo));
      localStorage.setItem('social-login', 'naver');
      
      return { success: true, userInfo };
    }
    
    throw new Error(loginResponse.data.message || '네이버 로그인에 실패했습니다.');
  } catch (error) {
    console.error('네이버 로그인 에러:', error);
    throw error;
  }
};

// 구글 로그인
export const googleLogin = async (credential) => {
  try {
    // 서버에 구글 토큰 전송하여 로그인 처리
    const loginResponse = await apiClient.post('/auth/google/login', {
      idToken: credential
    });

    if (loginResponse.data.success) {
      const { accessToken, refreshToken, userInfo } = loginResponse.data;
      
      // 토큰 저장
      localStorage.setItem(TOKEN_CONFIG.accessTokenKey, accessToken);
      localStorage.setItem(TOKEN_CONFIG.refreshTokenKey, refreshToken);
      localStorage.setItem(STORAGE_KEYS.USER_INFO, JSON.stringify(userInfo));
      localStorage.setItem('social-login', 'google');
      
      return { success: true, userInfo };
    }
    
    throw new Error(loginResponse.data.message || '구글 로그인에 실패했습니다.');
  } catch (error) {
    console.error('구글 로그인 에러:', error);
    throw error;
  }
};

// 비밀번호 확인 (일반 로그인 회원)
export const verifyPassword = async (password) => {
  try {
    const response = await apiClient.post('/auth/verify-password', {
      password: password
    });
    
    return response.data.success;
  } catch (error) {
    console.error('비밀번호 확인 에러:', error);
    throw error;
  }
};

// 회원 탈퇴
export const deleteAccount = async (authType, authData = null) => {
  try {
    let endpoint = '/user/delete';
    let requestData = {};

    if (authType === 'social') {
      // 소셜 로그인 회원 탈퇴
      endpoint = '/user/delete/social';
      requestData = {
        socialType: localStorage.getItem('social-login'),
        ...authData
      };
    } else {
      // 일반 로그인 회원 탈퇴
      endpoint = '/user/delete/normal';
      requestData = {
        password: authData.password
      };
    }

    const response = await apiClient.post(endpoint, requestData);
    
    if (response.data.success) {
      // 로컬 스토리지 정리
      localStorage.removeItem(TOKEN_CONFIG.accessTokenKey);
      localStorage.removeItem(TOKEN_CONFIG.refreshTokenKey);
      localStorage.removeItem(STORAGE_KEYS.USER_INFO);
      localStorage.removeItem('social-login');
      
      return { success: true };
    }
    
    throw new Error(response.data.message || '회원 탈퇴에 실패했습니다.');
  } catch (error) {
    console.error('회원 탈퇴 에러:', error);
    throw error;
  }
};

// 사용자 정보 조회
export const getUserInfo = async () => {
  try {
    const response = await apiClient.get('/user/info');
    return response.data;
  } catch (error) {
    console.error('사용자 정보 조회 에러:', error);
    throw error;
  }
};

// 페이스 로그인
export const faceLogin = async (faceImageData) => {
  try {
    const response = await apiClient.post('/auth/face-login', {
      faceImageData: faceImageData
    });

    if (response.data.success) {
      const { accessToken, refreshToken, userInfo } = response.data;
      
      // 토큰 저장
      localStorage.setItem(TOKEN_CONFIG.accessTokenKey, accessToken);
      localStorage.setItem(TOKEN_CONFIG.refreshTokenKey, refreshToken);
      localStorage.setItem(STORAGE_KEYS.USER_INFO, JSON.stringify(userInfo));
      localStorage.setItem('login-type', 'face');
      
      return { success: true, userInfo };
    }
    
    throw new Error(response.data.message || '페이스 로그인에 실패했습니다.');
  } catch (error) {
    console.error('페이스 로그인 에러:', error);
    throw error;
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
