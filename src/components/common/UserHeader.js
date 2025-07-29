// src/components/common/UserHeader.js
import React, { useState, useContext, useEffect, useCallback, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import logoSeems from "../../assets/images/logo_seems.png";
import styles from "./UserHeader.module.css";
import { AuthContext } from "../../AuthProvider";
import apiClient from "../../utils/axios";
import profileStyles from "../../pages/user/UserProfilePage.module.css";
import SessionExpiryModal from "../modal/SessionExpiryModal";

function UserHeader() {
  const [showSideMenu, setShowSideMenu] = useState(false);
  const navigate = useNavigate();

  // 전역 상태 관리자 AuthProvider 에서 필요한 정보 가져오기
  const { isLoggedIn, username, role, logoutAndRedirect, userid } =
    useContext(AuthContext);
  
  // localStorage에서 최신 userName 가져오기 (프로필 수정 후 반영을 위해)
  const [localUserName, setLocalUserName] = useState(localStorage.getItem('userName') || username);

  // 장착 뱃지 상태
  const [equippedBadge, setEquippedBadge] = useState(null);

  // 뱃지 클래스 계산 (UserProfilePage와 동일한 로직)
  const badgeClass = equippedBadge && equippedBadge.rewardId
    ? `${profileStyles.profileBadge} ${profileStyles["badge" + equippedBadge.rewardId]}`
    : profileStyles.profileBadge;

  // 뱃지 업데이트를 위한 이벤트 리스너
  useEffect(() => {
    const handleBadgeUpdate = () => {
      fetchEquippedBadge();
    };

    // 뱃지 변경 이벤트 리스너 등록
    window.addEventListener('badge-updated', handleBadgeUpdate);
    
    return () => {
      window.removeEventListener('badge-updated', handleBadgeUpdate);
    };
  }, []);

  const fetchEquippedBadge = async () => {
    try {
      if (!userid) {
        console.log('UserHeader: userid 없음');
        return;
      }
      
      const res = await apiClient.get(
        `/api/user/equipped-badge?userId=${userid}`
      );
      
      console.log('UserHeader: 뱃지 데이터 로드됨:', res.data);
      setEquippedBadge(res.data);
    } catch (error) {
      console.error('UserHeader: 뱃지 조회 실패:', error.response?.status, error.response?.data);
      setEquippedBadge(null);
    }
  };

  // 뱃지 업데이트 함수를 전역으로 노출 (다른 컴포넌트에서 사용)
  useEffect(() => {
    window.updateUserHeaderBadge = fetchEquippedBadge;
    return () => {
      delete window.updateUserHeaderBadge;
    };
  }, [userid]);

  // 뱃지 업데이트 이벤트 발생 함수 (다른 컴포넌트에서 사용)
  useEffect(() => {
    window.triggerBadgeUpdate = () => {
      console.log('UserHeader: 뱃지 업데이트 이벤트 발생');
      window.dispatchEvent(new Event('badge-updated'));
    };
    return () => {
      delete window.triggerBadgeUpdate;
    };
  }, []);

  // 세션 타이머 상태 (JWT 토큰 만료 시간 기반)
  const [sessionTime, setSessionTime] = useState(0);
  const [lastActivity, setLastActivity] = useState(Date.now());

  // 세션 만료 알림 상태
  const [showSessionModal, setShowSessionModal] = useState(false);
  const [remainingTime, setRemainingTime] = useState(300); // 5분 (300초)
  const sessionExpiryTimerRef = useRef(null);
  const [modalAlreadyShown, setModalAlreadyShown] = useState(false); // 중복 모달 방지

  useEffect(() => {
    const fetchEquippedBadge = async () => {
      try {
        if (!userid) return;
        const res = await apiClient.get(
          `/api/user/equipped-badge?userId=${userid}`
        );
        setEquippedBadge(res.data);
      } catch {
        setEquippedBadge(null);
      }
    };
    if (userid) fetchEquippedBadge();
  }, [userid]);

  // localStorage의 userName 변경 감지
  useEffect(() => {
    const handleStorageChange = () => {
      const newUserName = localStorage.getItem('userName');
      if (newUserName && newUserName !== localUserName) {
        setLocalUserName(newUserName);
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [localUserName]);

  // 주기적 핑 및 세션 타이머 관리
  useEffect(() => {
    if (!isLoggedIn) return;

    const accessToken = localStorage.getItem('accessToken');
    if (!accessToken) return;



    // 1초마다 세션 타이머 업데이트 (실제 토큰 만료 시간 기반)
    const timerInterval = setInterval(() => {
      const remainingTime = calculateTokenExpiry();
      setSessionTime(remainingTime);
      
      if (remainingTime <= 0) {
        // 토큰이 만료되면 로그아웃
        clearInterval(timerInterval);
        logoutAndRedirect();
      }
    }, 1000);

    // 세션 만료 알림 타이머 (토큰 만료 5분 전 알림)
    const checkExpiryWarning = () => {
      const remainingTime = calculateTokenExpiry();
      console.log('세션 만료 체크 - 남은 시간:', remainingTime, '초');
      
      if (remainingTime <= 300 && remainingTime > 0 && !modalAlreadyShown) { // 5분 이하, 0초 초과, 모달이 아직 표시되지 않은 경우
        console.log('세션 만료 5분 전 알림 표시');
        setShowSessionModal(true);
        setRemainingTime(remainingTime);
        setModalAlreadyShown(true); // 모달이 표시되었음을 기록
      } else if (remainingTime <= 0) {
        // 토큰이 완전히 만료된 경우
        console.log('토큰 완전 만료 - 로그아웃 처리');
        setShowSessionModal(false);
        setModalAlreadyShown(false);
        logoutAndRedirect();
      }
    };
    
    // 1분마다 만료 알림 체크
    const warningInterval = setInterval(checkExpiryWarning, 60 * 1000);
    
    // 초기 체크
    checkExpiryWarning();

    // 사용자 활동 감지 (마우스, 키보드, 터치)
    const handleUserActivity = () => {
      setLastActivity(Date.now());
    };

    window.addEventListener('mousemove', handleUserActivity);
    window.addEventListener('keydown', handleUserActivity);
    window.addEventListener('click', handleUserActivity);
    window.addEventListener('touchstart', handleUserActivity);

    return () => {
      clearInterval(timerInterval);
      clearInterval(warningInterval);
      window.removeEventListener('mousemove', handleUserActivity);
      window.removeEventListener('keydown', handleUserActivity);
      window.removeEventListener('click', handleUserActivity);
      window.removeEventListener('touchstart', handleUserActivity);
    };
  }, [isLoggedIn]);

  // URL 안전 Base64를 표준 Base64로 변환
  const urlSafeBase64ToStandard = (str) => {
    return str.replace(/-/g, '+').replace(/_/g, '/');
  };

  // JWT 토큰에서 만료 시간 계산
  const calculateTokenExpiry = () => {
    try {
      const accessToken = localStorage.getItem('accessToken');
      if (!accessToken) return 0;
      
      // JWT 토큰 파싱 (header.payload.signature)
      const parts = accessToken.split('.');
      if (parts.length !== 3) {
        console.error('잘못된 JWT 토큰 형식:', accessToken);
        return 0;
      }
      
      const payload = parts[1];
      if (!payload) return 0;
      
      // Base64 디코딩 (URL 안전 Base64 처리)
      let decodedPayload;
      try {
        // URL 안전 Base64를 표준 Base64로 변환
        const standardBase64 = urlSafeBase64ToStandard(payload);
        // Base64 패딩 추가
        const paddedPayload = standardBase64 + '='.repeat((4 - standardBase64.length % 4) % 4);
        const decodedString = atob(paddedPayload);
        decodedPayload = JSON.parse(decodedString);
      } catch (decodeError) {
        console.error('JWT 토큰 디코딩 실패:', decodeError);
        console.error('토큰 payload:', payload);
        console.error('표준 Base64 변환 후:', urlSafeBase64ToStandard(payload));
        return 0;
      }
      
      if (!decodedPayload.exp) {
        console.error('토큰에 만료 시간이 없습니다:', decodedPayload);
        return 0;
      }
      
      const expiryTime = decodedPayload.exp * 1000; // 밀리초로 변환
      const currentTime = Date.now();
      
      const remainingTime = Math.max(0, Math.floor((expiryTime - currentTime) / 1000));
      return remainingTime;
    } catch (error) {
      console.error('토큰 만료 시간 계산 실패:', error);
      return 0;
    }
  };

  // 세션 시간을 시:분:초 형식으로 변환
  const formatSessionTime = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // 세션 만료 시 로그아웃 처리 함수
  const handleSessionExpiry = useCallback(() => {
    logoutAndRedirect();
  }, [logoutAndRedirect]);

  // 세션 만료 모달 카운트다운 (5분 남은 시간 표시용)
  useEffect(() => {
    if (!showSessionModal) return;

    const countdownInterval = setInterval(() => {
      setRemainingTime(prev => {
        if (prev <= 1) {
          // 5분이 다 되면 모달 닫기 (메인 타이머에서 로그아웃 처리)
          clearInterval(countdownInterval);
          setShowSessionModal(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(countdownInterval);
  }, [showSessionModal]);

  // 세션 연장 처리
  const handleSessionExtend = async (isQuickExtend = false) => {
    try {
      const accessToken = localStorage.getItem('accessToken');
      const refreshToken = localStorage.getItem('refreshToken');
      
      console.log('세션 연장 시도 - accessToken:', accessToken ? '존재' : '없음');
      console.log('세션 연장 시도 - refreshToken:', refreshToken ? '존재' : '없음');
      
      if (!accessToken || !refreshToken) {
        throw new Error('토큰이 없습니다.');
      }

      // 토큰 재발급 요청 (다른 파일들과 동일한 방식)
      console.log('토큰 재발급 요청 시작');
      const response = await apiClient.post('/api/reissue', null, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          RefreshToken: `Bearer ${refreshToken}`,
          ExtendLogin: "true",
        }
      });

      console.log('토큰 재발급 응답:', response);
      console.log('응답 헤더:', response.headers);
      console.log('응답 데이터:', response.data);

      if (response.status === 200) {
        // 모든 가능한 토큰 형식 확인
        console.log('=== 토큰 추출 디버깅 ===');
        console.log('전체 응답 헤더 키들:', Object.keys(response.headers));
        console.log('전체 응답 헤더 내용:', response.headers);
        console.log('전체 응답 데이터 키들:', Object.keys(response.data || {}));
        
        // 백엔드 응답 분석: 현재 "Reissue Token" 문자열로 응답
        // 실제 토큰 추출 방식을 백엔드 개발자와 확인 필요
        
        console.log('백엔드 응답 분석:');
        console.log('- 응답 타입:', typeof response.data);
        console.log('- 응답 길이:', response.data?.length);
        console.log('- 응답이 JWT 형식인가?:', response.data?.startsWith?.('eyJ'));
        
        // 헤더에서 토큰 추출 시도
        let newAccessToken = response.headers["authorization"] || response.headers["Authorization"];
        let newRefreshToken = response.headers["refresh-token"] || response.headers["Refresh-Token"];
        
        // 응답 본문에서 토큰 추출 시도
        if (!newAccessToken) {
          // 백엔드가 문자열로 응답하는 경우 처리
          if (typeof response.data === 'string' && response.data.startsWith('eyJ')) {
            newAccessToken = response.data;
          } else if (response.data?.accessToken) {
            newAccessToken = response.data.accessToken;
          } else if (response.data?.access_token) {
            newAccessToken = response.data.access_token;
          } else if (response.data?.token) {
            newAccessToken = response.data.token;
          }
        }
        
        if (!newRefreshToken) {
          if (response.data?.refreshToken) {
            newRefreshToken = response.data.refreshToken;
          } else if (response.data?.refresh_token) {
            newRefreshToken = response.data.refresh_token;
          }
        }
        
        console.log('헤더 authorization:', response.headers['authorization']);
        console.log('헤더 Authorization:', response.headers['Authorization']);
        console.log('헤더 refresh-token:', response.headers['refresh-token']);
        console.log('응답 본문 전체:', JSON.stringify(response.data, null, 2));
        console.log('최종 추출된 accessToken:', newAccessToken || '없음');
        console.log('최종 추출된 refreshToken:', newRefreshToken || '없음');
        console.log('=== 토큰 추출 디버깅 끝 ===');
        
        // 새로운 토큰이 발급된 경우에만 저장
        if (newAccessToken || newRefreshToken) {
          if (newAccessToken) {
            localStorage.setItem('accessToken', newAccessToken);
            console.log('새로운 accessToken 저장 완료');
          }
          if (newRefreshToken) {
            localStorage.setItem('refreshToken', newRefreshToken);
            console.log('새로운 refreshToken 저장 완료');
          }

          // 타이머를 30분(1800초)으로 리셋
          setSessionTime(1800);
          console.log('세션 타이머 30분으로 리셋');

          // 모달 닫기 및 상태 리셋
          setShowSessionModal(false);
          setModalAlreadyShown(false); // 모달 상태 리셋하여 다음 세션 만료 시 다시 표시 가능
          
          console.log('세션 연장 성공!');
          return;
        } else {
          // 토큰이 발급되지 않은 경우
          console.error('토큰 재발급 실패: 새로운 토큰이 발급되지 않음');
          throw new Error('토큰 재발급에 실패했습니다.');
        }
      } else {
        throw new Error(`토큰 재발급 실패: ${response.status}`);
      }
    } catch (error) {
      console.error('세션 연장 실패:', error);
      
      // 세션 연장 실패 시 모달 닫고 로그아웃 처리
      setShowSessionModal(false);
      setModalAlreadyShown(false);
      
      // 사용자에게 알림 후 로그아웃
      alert('세션 연장에 실패했습니다. 다시 로그인해주세요.');
      logoutAndRedirect();
    }
  };

  // 세션 만료 모달 닫기
  const handleSessionModalClose = () => {
    setShowSessionModal(false);
    // 모달 상태 리셋하지 않음 - 사용자가 닫기만 한 경우 다시 표시하지 않음
    // 모달을 닫아도 세션은 계속 진행
    console.log('사용자가 세션 만료 모달을 닫음');
  };

  // 뱃지 REWARD_ID별 클래스
  // const badgeClass =
  //   equippedBadge && equippedBadge.rewardId
  //     ? `${profileStyles.profileBadge} ${profileStyles["badge" + equippedBadge.rewardId]}`
  //     : profileStyles.profileBadge;

  const handleLogout = useCallback(() => {
    // 로그아웃 처리
    logoutAndRedirect();
  }, [logoutAndRedirect]);

  // 즉시 세션 연장 핸들러 (타이머 옆 +30분 버튼)
  const handleQuickSessionExtend = async () => {
    try {
      console.log('즉시 세션 연장 요청');
      
      // 기존 세션 연장 함수 재사용 (즉시 연장 모드)
      await handleSessionExtend(true);
      
    } catch (error) {
      console.error('즉시 세션 연장 실패:', error);
      // 에러는 handleSessionExtend에서 이미 처리됨
    }
  };

  return (
    <header className={styles.header}>
      <div className={styles.headerInner}>
        {/* 로고 섹션 */}
        <Link to={isLoggedIn ? "/userdashboard" : "/"} style={{ textDecoration: "none" }}>
          <div className={styles.logoWrap}>
            <span className={styles.logoText}>
              <span className={styles.logoSee}>SEE</span>
              <span className={styles.logoMs}>MS</span>
            </span>
            <img
              src={logoSeems}
              alt="SEE MS 로고"
              className={styles.logoImage}
            />
          </div>
        </Link>

                  {/* 사용자 인사말 + 장착 뱃지 + 세션 타이머 */}
          <div
            className={styles.userSection}
            style={{ display: "flex", flexDirection: "column", alignItems: "flex-start", gap: 8 }}
          >
            {/* 첫 번째 줄: 세션 타이머 */}
            {isLoggedIn && (
              <div style={{ 
                display: "flex", 
                alignItems: "center", 
                gap: 6,
                fontSize: "0.75rem",
                color: "#000",
                fontWeight: "500",
                marginLeft: "12px" // 사용자 인사말과 왼쪽 정렬 맞추기
              }}>
                <span style={{ fontSize: "0.7rem", color: "#000", fontWeight: "500" }}>세션만료</span>
                <span style={{ fontSize: "0.7rem" }}>⏱️</span>
                <span style={{ fontWeight: "500" }}>{formatSessionTime(sessionTime)}</span>
                
                {/* 즉시 연장 버튼 */}
                <button
                  onClick={handleQuickSessionExtend}
                  style={{
                    fontSize: "0.6rem",
                    padding: "2px 6px",
                    border: "1px solid #ddd",
                    borderRadius: "4px",
                    backgroundColor: "#f8f9fa",
                    color: "#666",
                    cursor: "pointer",
                    transition: "all 0.2s ease",
                    marginLeft: "4px"
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.backgroundColor = "#4ecdc4";
                    e.target.style.color = "#fff";
                    e.target.style.borderColor = "#4ecdc4";
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.backgroundColor = "#f8f9fa";
                    e.target.style.color = "#666";
                    e.target.style.borderColor = "#ddd";
                  }}
                  title="로그인 연장 (+30분)"
                >
                  +30분
                </button>
              </div>
            )}
            
            {/* 두 번째 줄: 뱃지와 인사말 */}
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              {/* 장착 뱃지 노출 (사용자 이름 왼쪽) */}
              {equippedBadge && (
                <div
                  className={badgeClass}
                  style={{ 
                    display: "flex", 
                    alignItems: "center", 
                    gap: 6,
                    padding: "4px 8px",
                    borderRadius: "12px",
                    fontSize: "0.8rem",
                    fontWeight: "600",
                    boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                    transition: "all 0.3s ease",
                    backgroundColor: "#ff6b6b",
                    color: "white"
                  }}
                  title={`장착중: ${equippedBadge.titleReward || equippedBadge.questName || "뱃지"}`}
                >
                  <img
                    src={equippedBadge.imagePath}
                    alt="장착 뱃지"
                    style={{
                      width: 20,
                      height: 20,
                      marginRight: 4,
                      verticalAlign: "middle",
                    }}
                  />
                  <span style={{ fontSize: "0.75rem", fontWeight: "600" }}>
                    {equippedBadge.titleReward || equippedBadge.questName || "뱃지"}
                  </span>
                </div>
              )}
              
              <span className={styles.userGreeting}>
                {localUserName ? `${localUserName}님, 안녕하세요` : "안녕하세요"}
              </span>
            </div>
          </div>

        {/* 네비게이션 메뉴 */}
        <nav className={styles.nav}>
          {/* 주요 서비스 */}
          <div className={styles.navGroup}>
            <Link to="/counseling" className={styles.navLink}>
              상담
            </Link>
            <Link to="/SelectTestPage" className={styles.navLink}>
              심리 검사
            </Link>
            <Link to="/analysis-dashboard" className={styles.navLink}>
              분석
            </Link>
          </div>

          {/* 게임화 요소 */}
          <div className={styles.navGroup}>
            <Link to="/simulation" className={styles.navLink}>
              시뮬레이션
            </Link>
            <Link to="/quest" className={styles.navLink}>
              퀘스트
            </Link>
            <Link to="/content" className={styles.navLink}>
              콘텐츠
            </Link>
            
          </div>

          {/* 기록록 */}
          <div className={styles.navGroup}>
            <Link to="/emotionrecord" className={styles.navLink}>
              기록
            </Link>
          </div>

          {/* 정보 및 지원 */}
          <div className={styles.navGroup}>
            <Link to="/notice" className={styles.navLink}>
              공지사항
            </Link>
            <Link to="/faq" className={styles.navLink}>
              FAQ
            </Link>
          </div>

          {/* 사용자 관련 */}
          <div className={styles.navGroup}>
            <Link to="/userprofile" className={styles.navLink}>
              마이페이지
            </Link>
            <Link
              to="/"
              className={`${styles.navLink} ${styles.logoutLink}`}
              onClick={handleLogout}
            >
              로그아웃
            </Link>
          </div>
        </nav>
      </div>
      
      {/* 세션 만료 알림 모달 */}
      <SessionExpiryModal
        isOpen={showSessionModal}
        onExtend={handleSessionExtend}
        onClose={handleSessionModalClose}
        remainingTime={remainingTime}
      />
    </header>
  );
}

export default UserHeader;
