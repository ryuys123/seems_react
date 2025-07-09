// src/components/common/Footer.js
import React from 'react';
import styles from './Footer.module.css';

function Footer() {
  return (
    <footer className={styles.footer}>
        <div>© 2024 심리 스나이퍼 | 대표이사 : 홍길동 | 서울시 강남구 신사동00빌딩 | T.02-123-4567 | E.QSHOP@qshop.ai</div>
        <div style={{fontSize: '0.9rem', color: '#aaa', marginTop: '8px'}}>Powered by Team AiON</div>
      </footer>
  );
}



export default Footer;