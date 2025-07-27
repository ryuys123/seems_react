// src/components/common/UserHeader.js
import React, { useState, useContext, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import logoSeems from "../../assets/images/logo_seems.png";
import styles from "./UserHeader.module.css";
import { AuthContext } from "../../AuthProvider";
import apiClient from "../../utils/axios";
import profileStyles from "../../pages/user/UserProfilePage.module.css";

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

  // 뱃지 REWARD_ID별 클래스
  const badgeClass =
    equippedBadge && equippedBadge.rewardId
      ? `${profileStyles.profileBadge} ${profileStyles["badge" + equippedBadge.rewardId]}`
      : profileStyles.profileBadge;

  const handleLogout = () => {
    // 로그아웃 처리
    logoutAndRedirect();
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

        {/* 사용자 인사말 + 장착 뱃지 */}
        <div
          className={styles.userSection}
          style={{ display: "flex", alignItems: "center", gap: 12 }}
        >
          <span className={styles.userGreeting}>
            {localUserName ? `${localUserName}님, 안녕하세요` : "안녕하세요"}
          </span>
          {/* 장착 뱃지 노출 */}
          {equippedBadge && (
            <div
              className={badgeClass}
              style={{ display: "flex", alignItems: "center", gap: 6 }}
            >
              <img
                src={equippedBadge.imagePath}
                alt="장착 뱃지"
                style={{
                  width: 24,
                  height: 24,
                  marginRight: 4,
                  verticalAlign: "middle",
                }}
              />
              <span style={{ fontSize: "0.98rem" }}>
                {equippedBadge.titleReward || equippedBadge.questName || "뱃지"}
              </span>
            </div>
          )}
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
    </header>
  );
}

export default UserHeader;
