import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  kakaoLogin, 
  naverLogin, 
  googleLogin, 
  verifyPassword, 
  deleteAccount,
  getUserInfo 
} from '../../services/authService';
// 소셜 로그인 아이콘 import
import naverIcon from '../../assets/images/naver.png';
import kakaoIcon from '../../assets/images/kakao.png';

const UserDeletePage = () => {
  const [userType, setUserType] = useState(''); // 'social' or 'normal'
  const [socialType, setSocialType] = useState(''); // 'kakao', 'naver', 'google'
  const [password, setPassword] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [userInfo, setUserInfo] = useState(null);
  const navigate = useNavigate();

  // 사용자 정보 및 타입 감지
  useEffect(() => {
    const detectUserType = async () => {
      try {
        // 서버에서 사용자 정보 조회
        const userData = await getUserInfo();
        setUserInfo(userData);
        // 소셜 로그인 여부 확인
        const socialLogin = localStorage.getItem('social-login');
        if (socialLogin) {
          setUserType('social');
          setSocialType(socialLogin);
        } else {
          setUserType('normal');
        }
      } catch (error) {
        console.error('사용자 정보 조회 실패:', error);
        // 로컬 스토리지에서 기본 정보 확인
        const socialLogin = localStorage.getItem('social-login');
        if (socialLogin) {
          setUserType('social');
          setSocialType(socialLogin);
        } else {
          setUserType('normal');
        }
      }
    };
    detectUserType();
  }, []);

  // 소셜 로그인 인증
  const handleSocialAuth = async () => {
    try {
      let authResult;
      switch (socialType) {
        case 'kakao':
          if (!window.Kakao) {
            throw new Error('카카오 SDK가 로드되지 않았습니다. 페이지를 새로고침해주세요.');
          }
          authResult = await kakaoLogin();
          break;
        case 'naver':
          if (!window.naver) {
            throw new Error('네이버 SDK가 로드되지 않았습니다. 페이지를 새로고침해주세요.');
          }
          authResult = await naverLogin();
          break;
        case 'google':
          if (!window.gapi) {
            throw new Error('구글 SDK가 로드되지 않았습니다. 페이지를 새로고침해주세요.');
          }
          authResult = await googleLogin();
          break;
        default:
          throw new Error('지원하지 않는 소셜 로그인입니다.');
      }
      if (authResult.success) {
        setIsAuthenticated(true);
        alert('소셜 로그인 인증이 완료되었습니다.');
      }
    } catch (error) {
      console.error('소셜 로그인 인증 실패:', error);
      alert(`소셜 로그인 인증에 실패했습니다: ${error.message}`);
    }
  };

  // 비밀번호 인증
  const handlePasswordAuth = async () => {
    if (!password) {
      alert('비밀번호를 입력해주세요.');
      return;
    }
    try {
      const isValid = await verifyPassword(password);
      if (isValid) {
        setIsAuthenticated(true);
        alert('비밀번호 확인이 완료되었습니다.');
      } else {
        alert('비밀번호가 일치하지 않습니다.');
      }
    } catch (error) {
      console.error('비밀번호 확인 실패:', error);
      alert('비밀번호 확인에 실패했습니다.');
    }
  };

  // 회원 탈퇴
  const handleDelete = async () => {
    if (!isAuthenticated) {
      alert('먼저 본인 인증을 완료해주세요.');
      return;
    }
    const confirmDelete = window.confirm(
      '정말로 회원 탈퇴를 진행하시겠습니까?\n탈퇴 시 모든 데이터가 영구적으로 삭제되며 복구할 수 없습니다.'
    );
    if (!confirmDelete) {
      return;
    }
    setIsDeleting(true);
    try {
      let authData = {};
      if (userType === 'social') {
        // 소셜 로그인 회원은 추가 인증 데이터 없음
        authData = {};
      } else {
        // 일반 로그인 회원은 비밀번호 전송
        authData = { password };
      }
      const result = await deleteAccount(userType, authData);
      if (result.success) {
        alert('회원 탈퇴가 완료되었습니다.');
        navigate('/');
      }
    } catch (error) {
      console.error('회원 탈퇴 실패:', error);
      alert(`회원 탈퇴에 실패했습니다: ${error.message}`);
    } finally {
      setIsDeleting(false);
    }
  };

  const getSocialTypeName = (type) => {
    switch (type) {
      case 'kakao': return '카카오';
      case 'naver': return '네이버';
      case 'google': return '구글';
      default: return type;
    }
  };

  return (
    <div style={{ maxWidth: 500, margin: '40px auto', padding: 24, background: '#fff', borderRadius: 12, boxShadow: '0 2px 8px #eee' }}>
      <h2 style={{ marginBottom: 24, color: '#d32f2f' }}>회원 탈퇴</h2>
      <div style={{ marginBottom: 24, padding: 16, background: '#fff3e0', borderRadius: 8, border: '1px solid #ffb74d' }}>
        <h4 style={{ marginBottom: 8, color: '#e65100' }}>⚠️ 주의사항</h4>
        <ul style={{ margin: 0, paddingLeft: 20, color: '#bf360c' }}>
          <li>탈퇴 시 모든 데이터가 영구적으로 삭제됩니다.</li>
          <li>삭제된 데이터는 복구할 수 없습니다.</li>
          <li>진행하기 전에 중요한 데이터를 백업하세요.</li>
        </ul>
      </div>
      {userInfo && (
        <div style={{ marginBottom: 24, padding: 12, background: '#f5f5f5', borderRadius: 8 }}>
          <h4 style={{ marginBottom: 8 }}>현재 계정 정보</h4>
          <p style={{ margin: 0, fontSize: 14 }}>
            <strong>이름:</strong> {userInfo.userName || userInfo.name || '-'}<br/>
            <strong>가입일:</strong> {(userInfo.joinDate || userInfo.createdAt)
              ? new Date(userInfo.joinDate || userInfo.createdAt).toLocaleString()
              : '-'}
          </p>
        </div>
      )}
      {!isAuthenticated ? (
        <div>
          <h3 style={{ marginBottom: 16 }}>본인 인증</h3>
          <div style={{ marginBottom: 24 }}>
            <p style={{ marginBottom: 16 }}>
              현재 계정 소셜 타입: <b style={{ color: '#4b94d0' }}>{getSocialTypeName(socialType) || '일반'}</b>
            </p>
            {/* 일반 로그인 회원용 비밀번호 입력란 */}
            <div style={{ marginBottom: 24 }}>
              <p style={{ marginBottom: 12 }}>일반 로그인 회원은 비밀번호를 입력하여 본인을 확인할 수 있습니다.</p>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="비밀번호를 입력하세요"
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  borderRadius: 8,
                  border: '1px solid #bbb',
                  fontSize: 14,
                  marginBottom: 12,
                  boxSizing: 'border-box'
                }}
              />
              <button
                onClick={handlePasswordAuth}
                style={{
                  background: '#4b94d0',
                  color: '#fff',
                  border: 'none',
                  borderRadius: 8,
                  padding: '10px 20px',
                  fontWeight: 600,
                  fontSize: 14,
                  cursor: 'pointer',
                  width: '100%'
                }}
              >
                비밀번호 확인
              </button>
            </div>
            {/* 구분선 */}
            <div style={{ display: 'flex', alignItems: 'center', margin: '24px 0' }}>
              <hr style={{ flex: 1, border: 0, borderTop: '1px solid #eee' }} />
              <span style={{ margin: '0 12px', color: '#888', fontWeight: 500 }}>또는</span>
              <hr style={{ flex: 1, border: 0, borderTop: '1px solid #eee' }} />
            </div>
            {/* 소셜 로그인 버튼들 */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {/* 구글 본인 인증 버튼 */}
              <button
                onClick={socialType === 'google' ? handleSocialAuth : () => alert('현재 계정과 다른 소셜 로그인입니다.')}
                style={{
                  display: 'flex', alignItems: 'center', gap: 10, justifyContent: 'center',
                  background: '#fff', color: '#222', border: '1px solid #ddd', borderRadius: 8,
                  padding: '12px 0', fontWeight: 600, fontSize: 16, cursor: 'pointer', width: '100%',
                  marginBottom: 0, height: 48,
                  boxShadow: socialType === 'google' ? '0 0 0 2px #4285f4' : 'none'
                }}
              >
                {/* 구글 아이콘 등 추가 가능 */}
                구글로 인증
              </button>
              {/* 카카오 본인 인증 버튼 */}
              <button
                onClick={socialType === 'kakao' ? handleSocialAuth : () => alert('현재 계정과 다른 소셜 로그인입니다.')}
                style={{
                  display: 'flex', alignItems: 'center', gap: 10, justifyContent: 'center',
                  background: '#fee500', color: '#222', border: '1px solid #ddd', borderRadius: 8,
                  padding: '12px 0', fontWeight: 600, fontSize: 16, cursor: 'pointer', width: '100%',
                  marginBottom: 0, height: 48,
                  boxShadow: socialType === 'kakao' ? '0 0 0 2px #fee500' : 'none'
                }}
              >
                <img src={kakaoIcon} alt="카카오" style={{ width: 24, height: 24 }} />
                카카오로 인증
              </button>
              {/* 네이버 본인 인증 버튼 */}
              <button
                onClick={socialType === 'naver' ? handleSocialAuth : () => alert('현재 계정과 다른 소셜 로그인입니다.')}
                style={{
                  display: 'flex', alignItems: 'center', gap: 10, justifyContent: 'center',
                  background: '#03c75a', color: '#fff', border: '1px solid #ddd', borderRadius: 8,
                  padding: '12px 0', fontWeight: 600, fontSize: 16, cursor: 'pointer', width: '100%',
                  marginBottom: 0, height: 48,
                  boxShadow: socialType === 'naver' ? '0 0 0 2px #03c75a' : 'none'
                }}
              >
                <img src={naverIcon} alt="네이버" style={{ width: 24, height: 24 }} />
                네이버로 인증
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div style={{ marginTop: 32 }}>
          <button
            onClick={handleDelete}
            disabled={isDeleting}
            style={{
              background: '#d32f2f',
              color: '#fff',
              border: 'none',
              borderRadius: 8,
              padding: '14px 0',
              fontWeight: 700,
              fontSize: 16,
              cursor: isDeleting ? 'not-allowed' : 'pointer',
              width: '100%'
            }}
          >
            {isDeleting ? '탈퇴 처리 중...' : '회원 탈퇴하기'}
          </button>
        </div>
      )}
    </div>
  );
};

export default UserDeletePage; 