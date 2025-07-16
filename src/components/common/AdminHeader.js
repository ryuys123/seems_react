// src/components/common/UserHeader.js
import React, { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import logoSeems from '../../assets/images/logo_seems.png';
import styles from './AdminHeader.module.css';
import { AuthContext } from '../../AuthProvider';

function AdminHeader() {
  const [showSideMenu, setShowSideMenu] = useState(false);
  const navigate = useNavigate();

  // 전역 상태 관리자 AuthProvider 에서 필요한 정보 가져오기
  const { isLoggedIn, username, role, logoutAndRedirect } =
    useContext(AuthContext);

  const handleLogout = () => {
    // 로그아웃 처리
    logoutAndRedirect();
  };

  return (
    <header className={styles.header}>
      <div className={styles.headerInner}>
        <Link to="/" style={{ textDecoration: 'none' }}>
          <div className={styles.logoWrap}>
            <span className={styles.logoText}>
              <span style={{ color: '#4b94d0', fontWeight: 900, fontSize: '2rem', letterSpacing: '-1px' }}>SEE</span>
              <span style={{ color: '#3d3833', fontWeight: 900, fontSize: '2rem', letterSpacing: '-1px' }}>MS</span>
            </span>
            <img 
              src={logoSeems} 
              alt="SEE MS 로고" 
              className={styles.logoImage}
            />
          </div>
        </Link>
        
        <nav className={styles.nav}>
          <Link to="/userlist">사용자 관리</Link>
          <Link to="/notice">공지사항</Link>
          <Link to="/faqlist">FAQ</Link>
          <Link to="/log">시스템로그</Link>
          <Link to="/" style={{ color: 'var(--main-accent)', fontWeight: 900 }} onClick={handleLogout}>로그아웃</Link>
        </nav>
      </div>
    </header>
  );
}

export default AdminHeader;