// src/utils/axios.js
import axios from "axios";
import { TOKEN_CONFIG } from "../config/config";

// 페이지에서 공통으로 사용할 axios 객체 생성함
const apiClient = axios.create({
  baseURL: process.env.REACT_APP_API_BASE_URL || "http://localhost:8888/seems",
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // 쿠키 포함 여부
});

// 요청 인터셉터 (토큰 처리)
apiClient.interceptors.request.use(
  (config) => {
    // axios 로 요청시 같이 전송보낼 토큰 지정 처리
    // 로그인 성공시 저장해 놓은 localStorage 에서 토큰을 꺼냄
    const accessToken = localStorage.getItem(TOKEN_CONFIG.accessTokenKey);
    const refreshToken = localStorage.getItem(TOKEN_CONFIG.refreshTokenKey);

    if (accessToken && refreshToken) {
      config.headers["Authorization"] = `Bearer ${accessToken}`; //빽틱 사용해야 함
      config.headers["RefreshToken"] = `Bearer ${refreshToken}`; //빽틱 사용해야 함
    }

    console.log("Axios 요청 설정 : ", config);
    console.log("Axios 요청 URL : ", config.baseURL + config.url);
    console.log("Axios 요청 메서드 : ", config.method?.toUpperCase());
    console.log("Axios 요청 헤더 : ", config.headers);
    return config;
  },
  (error) => {
    console.error("Axios 요청 에러 : ", error);
    return Promise.reject(error);
  }
);

// 응답 인터셉터 (에러 처리)
apiClient.interceptors.response.use(
  (response) => {
    // 요청이 성공해서, ok 가 전송왔을 때 공통 처리 내용 작성함
    console.log("Axios 응답 성공 : ", response);
    
    // 응답 헤더에서 새로운 토큰이 있는지 확인
    const newAccessToken = response.headers["authorization"]?.split(" ")[1];
    const newRefreshToken = response.headers["refresh-token"]?.split(" ")[1];
    
    if (newAccessToken) {
      localStorage.setItem("accessToken", newAccessToken);
      console.log("새로운 AccessToken 저장됨:", newAccessToken.substring(0, 20) + "...");
    }
    
    if (newRefreshToken) {
      localStorage.setItem("refreshToken", newRefreshToken);
      console.log("새로운 RefreshToken 저장됨:", newRefreshToken.substring(0, 20) + "...");
    }
    
    return response;
  },
  async (error) => {
    // 요청이 실패해서, fail 코드가 전송왔을 때 공통 처리 내용 작성함
    console.error("Axios 응답 에러 : ", error);
    
    // 401 에러 (인증 실패)인 경우
    if (error.response?.status === 401 && !error.config._retry) {
      error.config._retry = true;
      
      // 토큰 재발급 함수 직접 구현
      const reissued = await reissueToken();
      
      async function reissueToken() {
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
      }
      
      if (reissued) {
        // 새로운 토큰으로 원래 요청 재시도
        const newAccessToken = localStorage.getItem('accessToken');
        error.config.headers.Authorization = `Bearer ${newAccessToken}`;
        return apiClient(error.config);
      }
    }
    
    return Promise.reject(error);
  }
);

export default apiClient;
