// src/components/common/UserHeader.js
import React, { useState, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import logoSeems from "../../assets/images/logo_seems.png";
import styles from "./AdminHeader.module.css";
import { AuthContext } from "../../AuthProvider";

function AdminHeader() {
  const [showSideMenu, setShowSideMenu] = useState(false);
  const navigate = useNavigate();

  // 전역 상태 관리자 AuthProvider 에서 필요한 정보 가져오기
  const { isLoggedIn, userid, username, role, logoutAndRedirect } =
    useContext(AuthContext);

  const handleLogout = () => {
    // 로그아웃 처리
    logoutAndRedirect();
  };

  return (
    <header className={styles.header}>
      <div className={styles.headerInner}>
        {/* 로고 섹션 */}
        <Link to="/admindashboard" style={{ textDecoration: "none" }}>
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

        {/* 사용자 인사말 */}
        <div
          className={styles.userSection}
          style={{ display: "flex", alignItems: "center", gap: 12 }}
        >
          <span className={styles.userGreeting}>
            {userid === "user001"
              ? "관리자님, 안녕하세요"
              : username
                ? `${username}님, 안녕하세요`
                : "안녕하세요"}
          </span>
        </div>

        <nav className={styles.nav}>
          <Link to="/userlist">사용자 관리</Link>
          <Link to="/notice">공지사항</Link>
          <Link to="/faq">FAQ</Link>
          <Link to="/log">시스템로그</Link>
          <Link
            to="/"
            style={{ color: "var(--main-accent)", fontWeight: 900 }}
            onClick={handleLogout}
          >
            로그아웃
          </Link>
        </nav>
      </div>
    </header>
  );
}

export default AdminHeader;
