// src/utils/axios.js
import axios from "axios";
import { TOKEN_CONFIG } from "../config/config";

// 페이지에서 공통으로 사용할 axios 객체 생성함
const apiClient = axios.create({
  baseURL: process.env.REACT_APP_API_BASE_URL || "http://localhost:8888/seems",
  headers: {
    // 데이터타입 문제로 주석처리함. 대신  authprovider에서 json일때는 명시해주게 해서 문제없음
    // "Content-Type": "application/json",
  },
  withCredentials: true, // 쿠키 포함 여부
});

// 요청 인터셉터 (토큰 처리)
apiClient.interceptors.request.use(
  (config) => {
    // axios 로 요청시 같이 전송보낼 토큰 지정 처리
    // 로그인 성공시 저장해 놓은 localStorage 에서 토큰을 꺼냄
    const accessToken = localStorage.getItem("accessToken");
    const refreshToken = localStorage.getItem("refreshToken");

    // 토큰이 유효한 경우에만 헤더에 추가
    if (accessToken && refreshToken && 
        accessToken !== 'undefined' && accessToken.trim() !== '' &&
        refreshToken !== 'undefined' && refreshToken.trim() !== '') {
      config.headers["Authorization"] = `Bearer ${accessToken}`; //빽틱 사용해야 함
      config.headers["RefreshToken"] = `Bearer ${refreshToken}`; //빽틱 사용해야 함
    } else {
      // 유효하지 않은 토큰이 있는 경우 제거
      if (accessToken === 'undefined' || refreshToken === 'undefined') {
        console.warn('유효하지 않은 토큰 감지, localStorage 정리');
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
      }
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
    // console.log("Axios 응답 성공 : ", response); // 로그 제거

    // 응답 헤더에서 새로운 토큰이 있는지 확인
    const newAccessToken = response.headers["authorization"]?.split(" ")[1];
    const newRefreshToken = response.headers["refresh-token"]?.split(" ")[1];

    if (newAccessToken) {
      localStorage.setItem("accessToken", newAccessToken);
      console.log(
        "새로운 AccessToken 저장됨:",
        newAccessToken.substring(0, 20) + "..."
      );
    }

    if (newRefreshToken) {
      localStorage.setItem("refreshToken", newRefreshToken);
      console.log(
        "새로운 RefreshToken 저장됨:",
        newRefreshToken.substring(0, 20) + "..."
      );
    }

    return response;
  },
  async (error) => {
    // 요청이 실패해서, fail 코드가 전송왔을 때 공통 처리 내용 작성함
    console.error("Axios 응답 에러 : ", error);

    // 401 에러 (인증 실패)인 경우
    if (error.response?.status === 401 && !error.config._retry) {
      error.config._retry = true;
      
      // 현재 페이지가 로그인 페이지인지 확인
      const currentPath = window.location.pathname;
      const isLoginPage = currentPath === '/' || currentPath === '/login';
      
      // 로그인 페이지에서는 토큰 재발급 시도하지 않음
      if (isLoginPage) {
        console.log("로그인 페이지에서 401 에러 - 토큰 재발급 시도 안함");
        return Promise.reject(error);
      }

      // 토큰 재발급 함수 직접 구현
      const reissued = await reissueToken();

      async function reissueToken() {
        try {
          const accessToken = localStorage.getItem("accessToken");
          const refreshToken = localStorage.getItem("refreshToken");

          // 토큰 유효성 검증
          if (!accessToken || !refreshToken || 
              accessToken === 'undefined' || refreshToken === 'undefined' ||
              accessToken.trim() === '' || refreshToken.trim() === '') {
            console.error('유효하지 않은 토큰으로 재발급 요청 불가');
            throw new Error('Invalid tokens');
          }

          const response = await axios.post(
            "http://localhost:8888/seems/api/reissue",
            {},
            {
              headers: {
                Authorization: `Bearer ${accessToken}`,
                RefreshToken: `Bearer ${refreshToken}`,
              },
            }
          );

          // 새로운 토큰을 헤더에서 추출
          const newAccessToken = response.headers["authorization"];
          const newRefreshToken = response.headers["refresh-token"];

          if (newAccessToken) {
            localStorage.setItem(
              "accessToken",
              newAccessToken.replace("Bearer ", "")
            );
          }
          if (newRefreshToken) {
            localStorage.setItem(
              "refreshToken",
              newRefreshToken.replace("Bearer ", "")
            );
          }

          return true;
        } catch (error) {
          console.error("토큰 재발급 실패:", error);
          
          // 현재 페이지가 로그인 페이지인지 확인
          const currentPath = window.location.pathname;
          const isLoginPage = currentPath === '/' || currentPath === '/login';
          
          // 로그인 페이지가 아닌 경우에만 세션 만료 알림 표시
          if (!isLoginPage) {
            const shouldExtendSession = window.confirm(
              "세션이 만료되었습니다.\n\n세션을 연장하시겠습니까?\n\n확인: 다시 로그인\n취소: 현재 페이지 유지"
            );
            
            if (shouldExtendSession) {
              // 사용자가 세션 연장을 원하는 경우
              localStorage.clear();
              window.location.href = "/";
            } else {
              // 사용자가 세션 연장을 원하지 않는 경우
              console.log("사용자가 세션 연장을 거부했습니다.");
              localStorage.clear();
            }
          } else {
            // 로그인 페이지에서는 조용히 처리
            console.log("로그인 페이지에서 토큰 재발급 실패 - 알림창 표시 안함");
            localStorage.clear();
          }
          
          return false;
        }
      }

      if (reissued) {
        // 새로운 토큰으로 원래 요청 재시도
        const newAccessToken = localStorage.getItem("accessToken");
        error.config.headers.Authorization = `Bearer ${newAccessToken}`;
        return apiClient(error.config);
      }
    }

    return Promise.reject(error);
  }
);

export default apiClient;
