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
    return response;
  },
  (error) => {
    // 요청이 실패해서, fail 코드가 전송왔을 때 공통 처리 내용 작성함
    console.error("Axios 응답 에러 : ", error);
    return Promise.reject(error);
  }
);

export default apiClient;
