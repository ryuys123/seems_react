import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import SocialAccountModal from '../../components/modal/SocialAccountModal';
import styles from './SocialAccountLinkPage.module.css';

const SocialAccountLinkPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [socialData, setSocialData] = useState(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    // URL 파라미터에서 소셜 데이터 확인
    const params = new URLSearchParams(location.search);
    const socialProvider = params.get('provider');
    const socialId = params.get('socialId');
    const socialEmail = params.get('email');
    const socialName = params.get('name');

    console.log('🔍 소셜 데이터 파싱:', {
      provider: socialProvider,
      socialId: socialId,
      email: socialEmail,
      name: socialName
    });

    if (socialProvider && socialId) {
      const data = {
        provider: socialProvider,
        socialId: socialId,
        email: socialEmail,
        name: socialName
      };
      
      console.log('✅ 설정된 소셜 데이터:', data);
      setSocialData(data);
      setShowModal(true);
      
      // 새로고침 시에도 소셜 데이터를 URL에 유지
      if (!location.search.includes('provider')) {
        const newParams = new URLSearchParams({
          provider: socialProvider,
          socialId: socialId,
          email: socialEmail || '',
          name: socialName || ''
        });
        window.history.replaceState({}, '', `${location.pathname}?${newParams.toString()}`);
      }
    } else {
      console.log('❌ 소셜 데이터 없음, 로그인 페이지로 이동');
      // 소셜 데이터가 없으면 로그인 페이지로 이동
      navigate('/');
    }
  }, [location, navigate]);

  const handleModalClose = () => {
    setShowModal(false);
    // 모달이 닫히면 로그인 페이지로 이동
    navigate('/');
  };

  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <div className={styles.loading}>소셜 계정 연동 모달을 불러오는 중...</div>
      </div>
      
      {socialData && (
        <SocialAccountModal
          isOpen={showModal}
          onClose={handleModalClose}
          socialData={socialData}
        />
      )}
    </div>
  );
};

export default SocialAccountLinkPage; 