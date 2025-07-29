import React, {useState, useEffect} from 'react';
// BrowserRouter 관련 import 제거
import "./App.css";

// 사용할 컴포넌트 불러오기 : 모든 페이지에 적용됨
import Footer from "./components/common/Footer";

// 별도로 작성된 라우터 등록 설정 파일을 불러오기함
import AppRouter from "./routers/router";
import NoticeListPage from "./pages/notice/NoticeListPage";

// Google OAuth Provider
import { GoogleOAuthProvider } from '@react-oauth/google';

// 소셜 로그인 SDK 초기화
import { initializeSocialSDK } from './services/authService';

// 세션 관리
import { SessionProvider, useSession } from './contexts/SessionContext';
import SessionExpiredModal from './components/common/SessionExpiredModal';
import { setSessionExpiredHandler } from './utils/axios';

// 세션 만료 모달 래퍼 컴포넌트
const SessionExpiredModalWrapper = () => {
  const { showSessionExpiredModal, showSessionExpired, handleSessionExpiredConfirm } = useSession();
  
  React.useEffect(() => {
    setSessionExpiredHandler(showSessionExpired);
  }, [showSessionExpired]);
  
  return (
    <SessionExpiredModal 
      isOpen={showSessionExpiredModal} 
      onConfirm={handleSessionExpiredConfirm}
    />
  );
};

function App() {
  useEffect(() => {
    // 소셜 로그인 SDK 초기화를 안전하게 처리
    // 환경 변수가 설정되지 않은 경우 임시로 비활성화
    const initSDK = async () => {
      try {
        // 환경 변수 확인
        const hasKakaoKey = process.env.REACT_APP_KAKAO_APP_KEY;
        const hasNaverKey = process.env.REACT_APP_NAVER_CLIENT_ID;
        const hasGoogleKey = process.env.REACT_APP_GOOGLE_CLIENT_ID;
        
        if (hasKakaoKey || hasNaverKey || hasGoogleKey) {
          // SDK 스크립트가 로드될 때까지 잠시 대기
          await new Promise(resolve => setTimeout(resolve, 1000));
          initializeSocialSDK();
        } else {
          console.log('소셜 로그인 환경 변수가 설정되지 않아 SDK 초기화를 건너뜁니다.');
        }
      } catch (error) {
        console.warn('소셜 로그인 SDK 초기화 실패:', error);
      }
    };

    initSDK();
  }, []);

  // Google 클라이언트 ID가 유효한지 확인
  const googleClientId = process.env.REACT_APP_GOOGLE_CLIENT_ID;
  const isValidGoogleClientId = googleClientId && googleClientId !== 'your_google_client_id';

  return (
    <SessionProvider>
      {isValidGoogleClientId ? (
        <GoogleOAuthProvider clientId={googleClientId}>
          <AppRouter />
          <Footer />
          <SessionExpiredModalWrapper />
        </GoogleOAuthProvider>
      ) : (
        <>
          <AppRouter />
          <Footer />
          <SessionExpiredModalWrapper />
        </>
      )}
    </SessionProvider>
  );
}

export default App;
