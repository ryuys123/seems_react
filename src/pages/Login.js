import React, { useState, useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./Login.module.css";
import logoSeems from "../assets/images/logo_seems.png";
import naverIcon from "../assets/images/naver.png";
import kakaoIcon from "../assets/images/kakao.png";
import faceioIcon from "../assets/images/faceio.png";
import { AuthContext } from "../AuthProvider";
import apiClient from "../utils/axios";


function Login({ onLoginSuccess }) {
  const navigate = useNavigate(); // 페이지 이동을 위한 useNavigate 훅 사용

  const [userId, setUserid] = useState("");
  const [userPwd, setUserpwd] = useState("");
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // AutoProvider 에서 가져온 updateTokens 함수 사용 선언함
  const { updateTokens } = useContext(AuthContext);

  // 페이지 로드 시 로그인 상태 확인
  useEffect(() => {
    const accessToken = localStorage.getItem("accessToken");
    const refreshToken = localStorage.getItem("refreshToken");
    
    // 이미 로그인된 상태라면 대시보드로 리다이렉트
    if (accessToken && refreshToken) {
      console.log("이미 로그인된 상태 - 대시보드로 리다이렉트");
      navigate("/userdashboard");
      return;
    }
    
    // 토큰이 없는 상태에서 로그인 페이지에 머물기
    console.log("로그인 페이지 로드 - 토큰 상태:", { 
      hasAccessToken: !!accessToken, 
      hasRefreshToken: !!refreshToken 
    });
    
    // localStorage 클리어 제거 - 로그아웃 시에만 클리어하도록 수정
  }, [navigate]);

  // OAuth2 로그인 성공 후 URL 파라미터에서 토큰 추출 처리
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const accessToken = urlParams.get('accessToken');
    const refreshToken = urlParams.get('refreshToken');
    const userEmail = urlParams.get('userEmail');
    const userRole = urlParams.get('userRole');
    const userId = urlParams.get('userId');

    if (accessToken && refreshToken) {
      console.log("OAuth2 로그인 성공, 토큰 저장 중...");
      
      try {
        // 토큰을 localStorage에 저장
        updateTokens(accessToken, refreshToken);
        localStorage.setItem("loggedInUserId", userId);
        localStorage.setItem("userName", userEmail);
        localStorage.setItem("userRole", userRole);
        
        console.log("OAuth2 로그인 토큰 저장 완료");
        
        // URL 파라미터 제거
        window.history.replaceState({}, document.title, window.location.pathname);
        
        // 역할에 따른 페이지 이동
        setTimeout(() => {
          if (userRole === "ADMIN") {
            console.log("관리자로 OAuth2 로그인, 관리자 대시보드로 이동");
            navigate("/admindashboard");
          } else {
            console.log("일반 사용자로 OAuth2 로그인, 사용자 대시보드로 이동");
            navigate("/userdashboard");
          }
        }, 100);
        
        if (onLoginSuccess) onLoginSuccess();
      } catch (error) {
        console.error("OAuth2 로그인 토큰 처리 실패:", error);
        alert("로그인 처리 중 오류가 발생했습니다.");
      }
    }
  }, [navigate, updateTokens, onLoginSuccess]);

  // 팝업 창에서 소셜 로그인/회원가입 성공 시 메인 창에서 처리
  useEffect(() => {
    const handleMessage = (event) => {
      if (event.data && event.data.type === "social-login-success" && event.data.token) {
        // 기존 사용자인 경우 - 바로 로그인 처리
        if (event.data.isExistingUser) {
          console.log("소셜 로그인 성공 - 기존 사용자");
          console.log("받은 토큰:", event.data.token);
          console.log("받은 refreshToken:", event.data.refreshToken);
          
          // 1. AuthProvider의 updateTokens 함수 호출하여 authInfo 업데이트 (토큰 저장도 함께 처리)
          updateTokens(event.data.token, event.data.refreshToken || "");
          
          // 2. 사용자 정보 저장
          localStorage.setItem("userName", event.data.userName || "");
          localStorage.setItem("userId", event.data.userId || "");
          localStorage.setItem("email", event.data.email || "");
          localStorage.setItem("role", event.data.role || "");
          
          console.log("localStorage에 저장된 accessToken:", localStorage.getItem("accessToken"));
          console.log("localStorage에 저장된 refreshToken:", localStorage.getItem("refreshToken"));
          
          // 3. 대시보드로 이동
          navigate("/userdashboard");
        } else {
          // 신규 사용자인 경우 - 회원가입 페이지로 이동하여 추가 정보 입력
          alert("신규 사용자입니다. 회원가입 페이지에서 추가 정보를 입력해주세요.");
          navigate("/signup");
        }
      }
    };
    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, [navigate]);

  // 소셜 로그인 팝업 열기 함수 (회원가입과 동일)
  const openSocialPopup = (provider) => {
    const popupWidth = 500;
    const popupHeight = 700;
    const left = window.screenX + (window.outerWidth - popupWidth) / 2;
    const top = window.screenY + (window.outerHeight - popupHeight) / 2;
    const popup = window.open(
      `http://localhost:8888/seems/oauth2/authorization/${provider}`,
      `${provider}Login`,
      `width=${popupWidth},height=${popupHeight},left=${left},top=${top},resizable=yes,scrollbars=yes`
    );
    if (!popup) {
      alert("팝업이 차단되었습니다. 팝업 허용 후 다시 시도해주세요.");
    }
  };

  // Base64 디코딩 함수 추가
  const base64DecodeUnicode = (base64Url) => {
    try {
      const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split("")
          .map((c) => `%${("00" + c.charCodeAt(0).toString(16)).slice(-2)}`)
          // 빽틱 (`) 사용할 것
          .join("")
      );
      return JSON.parse(jsonPayload); // 페이로드 문자열을 json 객체로 파싱해서 리턴함
    } catch (error) {
      console.error("JWT 디코딩 실패 : ", error);
      return null;
    }
  };

  // enter 키 누르면 로그인 실행 처리 함수 추가
  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      handleLogin();
    }
  };

  // 로그인 처리 함수 추가
  const handleLogin = async () => {
    console.log("handleLogin 함수 시작"); // 추가
    console.log("요청 데이터:", { userId, userPwd }); // 추가

    // 중복 요청 방지
    if (isLoggedIn) return;

    setIsLoggedIn(true);
    try {
      const response = await apiClient.post("/login", {
        userId: userId,
        userPwd: userPwd,
      });

      console.log("서버 응답 데이터 : ", response);

      // response body 에 있는 정보 추출 (서버측에서 저장한 이름(key)과 일치시킴)
      const {
        accessToken,
        refreshToken,
        userId: serverUserId,
        userName,
        role,
      } = response.data;

      // JWT accessToken 디코딩
      const tokenPayload = base64DecodeUnicode(accessToken.split(".")[1]);
      if (!tokenPayload) {
        console.error("JWT 페이로드 디코딩 실패.");
        throw new Error("JWT 페이로드 디코딩 실패"); //catch 로 넘어가게 함
      }

      console.log("JWT 페이로드 : ", tokenPayload);

      try {
        updateTokens(accessToken, refreshToken); // 전역 상태 관리 업데이트
        console.log("로컬스토리지 저장 성공.");
        console.log("AuthContext 에 로그인 상태 정보 업데이트 성공.");

        // ✅ 여기가 올바른 위치입니다: 서버에서 받은 실제 userId를 localStorage에 저장
        // 이 코드를 여기에 두고, 아래 setTimeout 안의 중복 코드를 제거합니다.
        localStorage.setItem("loggedInUserId", serverUserId);
        localStorage.setItem("userName", userName);
        console.log(
          `실제 로그인된 사용자 ID (${serverUserId})가 localStorage에 저장되었습니다.`
        );

        // ✅ 역할에 따른 페이지 이동 로직 추가
        console.log("사용자 역할:", role);
        setTimeout(() => {
          if (role === "ADMIN") {
            console.log("관리자로 로그인, 관리자 대시보드로 이동");
            navigate("/admindashboard");
          } else {
            console.log("일반 사용자로 로그인, 사용자 대시보드로 이동");
            navigate("/userdashboard");
          }
        }, 100);
      } catch (storageError) {
        console.error(
          "로컬 스토리지 저장 실패 또는 전역 상태 업데이트 실패.",
          storageError
        );
        throw storageError; // 바깥 catch 로 넘김
      }

      //alert('로그인 성공.');
      //로그인 성공시 부모 컴포넌트로 알림
      if (onLoginSuccess) onLoginSuccess();
    } catch (error) {
      console.error("로그인 실패 : ", error);

      if (error.response) {
        console.error("서버측 에러 응답 데이터 : ", error.response.data);
        alert(error.response.data.error || "서버 오류로 인해 로그인 실패!");
      } else if (error instanceof Error) {
        console.error("에러 메세지 :", error.message);
        alert(error.message);
      } else {
        console.error("예상치 못한 오류 : ", error);
        alert("알 수 없는 오류 발생.");
      }
    } finally {
      setIsLoggedIn(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault(); // 기본 폼 제출 동작 방지
    handleLogin();
  };

  // 🔥 수정된 소셜 로그인 처리 함수
  const handleSocialLogin = (provider) => {
    console.log(`${provider} 소셜 로그인 시도`);
    
    // Spring Security OAuth2 엔드포인트로 직접 이동 (포트 8888 사용)
    switch (provider) {
      case "google":
        // window.location.href = "/oauth2/authorization/google";
        window.location.href = "http://localhost:8888/seems/oauth2/authorization/google";
        // window.location.href = "http://localhost:8080/oauth2/authorization/google";
        break;
      case "kakao":
        // window.location.href = "/oauth2/authorization/kakao";
        window.location.href = "http://localhost:8888/seems/oauth2/authorization/kakao";
        // window.location.href = "http://localhost:8080/oauth2/authorization/kakao";
        break;
      case "naver":
        // window.location.href = "/oauth2/authorization/naver";
        window.location.href = "http://localhost:8888/seems/oauth2/authorization/naver";
        // window.location.href = "http://localhost:8080/oauth2/authorization/naver";
        break;
      default:
        console.log(`지원하지 않는 소셜 로그인: ${provider}`);
    }
  };

  const handleFaceLogin = () => {
    // 페이스 로그인 로직 구현
    navigate("/facelogin");
  };

  const handleSignupClick = () => {
    // 회원가입 페이지 이동
    console.log("회원가입 페이지로 이동");
    navigate("/signup");
  };

  const handleIdFindClick = () => {
    // 아이디 찾기 페이지 이동
    console.log("아이디 찾기 페이지로 이동");
    navigate("/idfindselect");
  };

  const handlePwFindClick = () => {
    // 비밀번호 찾기 페이지 이동
    console.log("비밀번호 찾기 페이지로 이동");
    navigate("/pwfindselect");
  };

  return (
    <div className={styles.loginContainer}>
      <div className={styles.logoWrap}>
        <div className={styles.logoText}>
          <span>SEE</span>
          <span>MS</span>
        </div>
        <img src={logoSeems} alt="SEE MS 로고" className={styles.logoImage} />
      </div>

      <div className={styles.loginTitle}>로그인</div>

      <form className={styles.loginForm} onSubmit={handleSubmit}>
        <label htmlFor="userId">아이디</label>
        <input
          type="text"
          id="id"
          name="id"
          placeholder="아이디를 입력하세요"
          value={userId}
          onChange={(e) => setUserid(e.target.value)}
          required
        />

        <label htmlFor="userPwd">비밀번호</label>
        <input
          type="password"
          id="password"
          name="password"
          placeholder="비밀번호를 입력하세요"
          value={userPwd}
          onChange={(e) => setUserpwd(e.target.value)}
          onKeyDown={handleKeyDown}
          required
        />

        <div className={styles.forgotPassword}>
          <span
            onClick={() => handleIdFindClick()}
            style={{
              cursor: "pointer",
              color: "#4b94d0",
              fontWeight: "900",
              textDecoration: "none",
            }}
          >
            아이디 찾기
          </span>
          <span
            style={{
              cursor: "pointer",
              color: "#4b94d0",
              fontWeight: "900",
              textDecoration: "none",
            }}
          >
            {" "}
            /
          </span>
          <span
            onClick={() => handlePwFindClick()}
            style={{
              cursor: "pointer",
              color: "#4b94d0",
              fontWeight: "900",
              textDecoration: "none",
            }}
          >
            {" "}
            비밀번호 찾기
          </span>
        </div>

        <button type="submit" className={styles.loginBtn}>
          로그인
        </button>
      </form>

      <div className={styles.signupLink}>
        아직 회원이 아니신가요?
        <span
          onClick={() => handleSignupClick()}
          style={{
            cursor: "pointer",
            color: "#4b94d0",
            fontWeight: "900",
            textDecoration: "none",
          }}
        >
          {"  "}
          회원가입
        </span>
      </div>

      <div className={styles.divider}>
        <hr />
        <span>또는</span>
        <hr />
      </div>

      <div className={styles.socialLogin}>
        <button
          className={`${styles.socialBtn} ${styles.google}`}
          onClick={() => openSocialPopup("google")}
        >
          <img
            src="https://img.icons8.com/color/24/000000/google-logo.png"
            alt="구글 로고"
            className={styles.socialIcon}
          />
          구글 로그인
        </button>

        <button
          className={`${styles.socialBtn} ${styles.naver}`}
          onClick={() => openSocialPopup("naver")}
        >
          <img
            src={naverIcon}
            alt="네이버 로고"
            className={styles.socialIcon}
          />
          네이버 로그인
        </button>

        <button
          className={`${styles.socialBtn} ${styles.kakao}`}
          onClick={() => openSocialPopup("kakao")}
        >
          <img
            src={kakaoIcon}
            alt="카카오 로고"
            className={styles.socialIcon}
          />
          카카오 로그인
        </button>

        <button
          className={`${styles.socialBtn} ${styles.faceio}`}
          onClick={() => handleFaceLogin()}
        >
          <img
            src={faceioIcon}
            alt="페이스 아이콘"
            className={styles.socialIcon}
          />
          페이스 로그인
        </button>
      </div>

      {/* API 연동 테스트 컴포넌트 */}
      {/* <ApiTest /> */}
    </div>
  );
}

export default Login;