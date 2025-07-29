import React, { useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../AuthProvider';

const SocialResult = () => {
  const navigate = useNavigate();
  const { updateTokens } = useContext(AuthContext);

  useEffect(() => {
    const processSocialLogin = async () => {
      try {
        // 페이지의 JSON 내용을 가져옴
        const bodyText = document.body.innerText || document.body.textContent;
        console.log('=== SocialResult 디버깅 시작 ===');
        console.log('페이지 전체 내용:', bodyText);
        console.log('URL:', window.location.href);
        console.log('현재 localStorage 상태:', {
          accessToken: localStorage.getItem('accessToken'),
          refreshToken: localStorage.getItem('refreshToken'),
          socialLogin: localStorage.getItem('social-login')
        });
        
        if (bodyText.trim().startsWith('{') && bodyText.includes('socialEmail')) {
          const socialData = JSON.parse(bodyText.trim());
          console.log('소셜 데이터 파싱 완료:', socialData);
          console.log('토큰 정보:', {
            token: socialData.token,
            refreshToken: socialData.refreshToken,
            isExistingUser: socialData.isExistingUser
          });
          
          if (socialData.isExistingUser === false) {
            // 신규 사용자 - 회원가입 페이지로 이동
            console.log('신규 사용자 - 회원가입 페이지로 이동');
            alert("등록되지 않은 계정입니다. 소셜 회원가입 후 이용해주세요.");
            navigate("/signup");
          } else if (socialData.isExistingUser === true) {
            // 기존 사용자 - 토큰 검증 후 저장
            console.log('기존 사용자 - 토큰 검증 시작');
            
            if (socialData.token && socialData.token !== 'undefined' && socialData.token.trim() !== '') {
              // 유효한 토큰이 있는 경우에만 저장
              console.log('유효한 토큰 발견, 저장 시작');
              updateTokens(socialData.token, socialData.refreshToken || "");
              localStorage.setItem("userName", socialData.userName || "");
              localStorage.setItem("userId", socialData.userId || "");
              localStorage.setItem("email", socialData.email || socialData.socialEmail || "");
              localStorage.setItem("role", socialData.role || "");
              
              // 소셜 로그인 타입 저장
              if (socialData.socialEmail) {
                const provider = socialData.socialEmail.includes('@gmail.com') ? 'google' :
                               socialData.socialEmail.includes('@kakao.com') ? 'kakao' :
                               socialData.socialEmail.includes('@naver.com') ? 'naver' : 'unknown';
                localStorage.setItem('social-login', provider);
              }
              
              console.log('토큰 저장 완료, 대시보드로 이동');
              console.log('최종 localStorage 상태:', {
                accessToken: localStorage.getItem('accessToken'),
                refreshToken: localStorage.getItem('refreshToken'),
                socialLogin: localStorage.getItem('social-login')
              });
              navigate("/userdashboard");
            } else {
              console.error('유효하지 않은 토큰:', socialData.token);
              console.error('토큰 타입:', typeof socialData.token);
              alert('로그인 처리 중 오류가 발생했습니다. 다시 시도해주세요.');
              navigate('/');
            }
          }
        } else {
          // JSON이 아니면 에러 처리
          console.error('예상되지 않은 응답 형식:', bodyText);
          console.error('응답 길이:', bodyText.length);
          alert('로그인 처리 중 오류가 발생했습니다. 다시 시도해주세요.');
          navigate('/');
        }
      } catch (error) {
        console.error('소셜 로그인 결과 처리 오류:', error);
        console.error('오류 스택:', error.stack);
        alert('로그인 처리 중 오류가 발생했습니다. 다시 시도해주세요.');
        navigate('/');
      }
    };

    // 즉시 실행
    processSocialLogin();
  }, [navigate, updateTokens]);

  return (
    <div style={{ 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center', 
      height: '100vh',
      fontSize: '18px' 
    }}>
      소셜 로그인 처리 중...
    </div>
  );
};

export default SocialResult; 