import React, { useState, useEffect, useRef, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './SignupPage.module.css';
import logoSeems from '../../assets/images/logo_seems.png';
import naverIcon from '../../assets/images/naver.png';
import kakaoIcon from '../../assets/images/kakao.png';
import apiClient from '../../utils/axios';
import FaceModal from '../../components/modal/FaceModal';
import AdditionInfo from '../../components/modal/AdditionInfo';
import { AuthContext } from '../../AuthProvider';


// 회원가입 페이지 컴포넌트
  function SignupPage() {
  const [formData, setFormData] = useState({
    userName: '',
    userId: '',
    userPwd: '',
    confirmPwd: '',
    phone: '',
  });

  //첨부할 파일은 formData 와 별개로 지정함
  const [photoFile, setPhotoFile] = useState(logoSeems);
  const fileInputRef = useRef(null); // 선언 : 작성취소시 선택된 파일명 초기화에 필요
  // 작성된 아이디 사용 가능 여부에 대한 상태변수 추가함
  const [isIdAvailable, setIsIdAvailable] = useState(null);
  // 첨부 사진 미리보기 상태 관리 변수 추가함
  const [previewUrl, setPreviewUrl] = useState(null);
  const [showFaceModal, setShowFaceModal] = useState(false);
  const [pendingFormData, setPendingFormData] = useState(null);
  const [showAdditionInfoModal, setShowAdditionInfoModal] = useState(false);
  const [socialUserInfo, setSocialUserInfo] = useState(null);
  

  
  // 디버깅용: 모달 상태 변화 추적
  React.useEffect(() => {
    console.log('🚨 showAdditionInfoModal 상태 변경:', showAdditionInfoModal);
    console.log('🚨 socialUserInfo 상태 변경:', socialUserInfo);
  }, [showAdditionInfoModal, socialUserInfo]);
  
  // 비밀번호 조건 검증 상태
  const [passwordValidation, setPasswordValidation] = useState({
    length: false,      // 8자 이상 16자 이하
    upperCase: false,   // 영문 대문자 포함
    lowerCase: false,   // 영문 소문자 포함
    number: false,      // 숫자 포함
    specialChar: false  // 특수문자 포함
  });

  const navigate = useNavigate();
  const { updateTokens } = useContext(AuthContext);

  // 비밀번호 조건 검증 함수
  const validatePassword = (password) => {
    const validation = {
      length: password.length >= 8 && password.length <= 16,
      upperCase: /[A-Z]/.test(password),
      lowerCase: /[a-z]/.test(password),
      number: /[0-9]/.test(password),
      specialChar: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)
    };
    setPasswordValidation(validation);
    return Object.values(validation).every(Boolean);
  };

  //previewUrl과 formData.id는 서로 다른 상태 변수이기 때문에,
  // 다음처럼 useEffect를 두 개로 분리하는 것이 가장 바람직함:
  // 1. previewUrl 해제 (메모리 누수 방지)
  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  // 2. userId 변경 시 중복검사 상태 초기화
  useEffect(() => {
    setIsIdAvailable(null);
  }, [formData.userId]);

  // input 의 값이 입력하면 입력된 값으로 formData 의 property 값으로 반영되게 하기 위해
  // 타이핑한 글자가 input 에 보여지게 하는 부분이기도 함
  // 타이핑하는 글자가 input 에 표시되지 않으면 handleChange 와 useState 가 연결되지 않은 오류임(확인 필요)
  const handleChange = (e) => {
    const { name, value, type, files } = e.target;

    //사진 파일이 첨부(선택)되었다면
    if (type === 'file') {
      const upfile = files[0];
      setPhotoFile(upfile);

      //첨부된 사진 미리보기 처리
      if (upfile) {
        const reader = new FileReader();
        reader.onload = (evt) => {
          setPreviewUrl(evt.target.result);
          // Base64 데이터를 formData에 저장
          setFormData(prev => ({ ...prev, profileImage: evt.target.result }));
        };
        reader.readAsDataURL(upfile);
      } else {
        setPreviewUrl(null);
        setFormData(prev => ({ ...prev, profileImage: '' }));
      }
    } else {
      setFormData({ ...formData, [name]: value });
      
      // 비밀번호 입력 시 실시간 검증
      if (name === 'userPwd') {
        validatePassword(value);
      }
    }
  };

    // 아이디 중복검사 버튼 클릭시 작동할 핸들러 함수
  const handleIdCheck = async () => {
    if (!formData.userId) {
      alert('아이디를 입력하세요.');
      return;
    }

    try {
      const response = await apiClient.post('/user/idchk', null, {
        // post 요청인 이유 : userId 는 개인정보이므로 안보이게 하는 기능 : select 일지라도 post 처리
        params: { userId: formData.userId },
      });

      if (response.data === 'ok') {
        setIsIdAvailable(true);
        alert('사용 가능한 아이디입니다.');
      } else {
        setIsIdAvailable(false);
        alert('이미 사용중인 아이디입니다. 아이디를 다시 작성하세요.');
      }
    } catch (error) {
      console.error('아이디 중복검사 실패 : ', error);
      alert('아이디 중복검사 중 오류가 발생했습니다. 관리자에게 문의하세요.');
    }
  };

  //전송 전에 input 값 유효성 검사 처리
  const validate = () => {
    // 비밀번호 조건 검증
    if (!Object.values(passwordValidation).every(Boolean)) {
      alert('비밀번호가 모든 조건을 만족하지 않습니다. 비밀번호 조건을 확인해주세요.');
      return false;
    }

    //암호와 암호 확인이 일치하는지 확인
    if (formData.userPwd !== formData.confirmPwd) {
      alert('비밀번호와 비밀번호 확인이 일치하지 않습니다. 다시 입력하세요.');
      return false;
    }

    //모든 유효성 검사를 통과하면
    return true;
  };

  // 암호확인 input 의 포커스(focus) 가 사라지면 작동되는 핸들러 함수임
  const handleConfirmPwd = () => {
    if (formData.confirmPwd) {
      validate();
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    //alert('가입하기 버튼 클릭');
    //e.preventDefault(); // submit 이벤트 취소함 (axios 로 따로 전송할 것이므로)

    if (isIdAvailable === false) {
      alert('이미 사용중인 아이디입니다. 아이디를 다시 작성하세요.');
      return;
    }

    if (isIdAvailable === null) {
      alert('아이디 중복검사를 필수로 하여야 합니다.');
      return;
    }

    // 전송 전에 유효성 검사 확인
    if (!validate()) {
      return;
    }


    // Base64 데이터를 JSON으로 전송
    const requestData = {
      ...formData,
      profileImage: formData.profileImage || ''
    };

    setPendingFormData({ ...formData }); // 회원정보 임시 저장
    setShowFaceModal(true); // 모달 오픈
  };

  const handleFaceRegister = () => {
    setShowFaceModal(false);
    navigate('/facesignup', { state: pendingFormData });
  };

  const handleSkipFace = async () => {
    setShowFaceModal(false);
    try {
      // Base64 데이터를 JSON으로 전송
      const requestData = {
        ...formData,
        profileImage: formData.profileImage || ''
      };
      
      const response = await apiClient.post(
        '/user/signup',
        requestData,
        {
          headers: { 'Content-Type': 'application/json' },
        }
      );
      if (response.status === 200) {
        alert('회원가입이 완료되었습니다.');
        navigate('/');
      }
    } catch (error) {
      alert('회원 가입에 실패했습니다. 다시 시도해 주세요');
    }
  };


  const [terms, setTerms] = useState({
    allTerms: false,
    serviceTerms: false,
    privacyTerms: false,
    marketingTerms: false
  });

  const handleTermsChange = (e) => {
    const { name, checked } = e.target;
    
    if (name === 'allTerms') {
      setTerms({
        allTerms: checked,
        serviceTerms: checked,
        privacyTerms: checked,
        marketingTerms: checked
      });
    } else {
      const newTerms = {
        ...terms,
        [name]: checked
      };
      
      // 모든 필수 약관이 체크되었는지 확인
      const allRequiredChecked = newTerms.serviceTerms && newTerms.privacyTerms;
      
      setTerms({
        ...newTerms,
        allTerms: allRequiredChecked && newTerms.marketingTerms
      });
    }
  };

  const handleLoginClick = () => {
    // 로그인 페이지로 이동
    console.log('로그인 페이지로 이동');
    navigate('/');
  };

  // 팝업 창에서 소셜 로그인/회원가입 성공 시 메인 창에서 처리
  React.useEffect(() => {
    const handleMessage = (event) => {
      console.log('🚨 받은 메시지:', event.data); // 디버깅용 로그 추가
      console.log('🚨 메시지 타입:', event.data?.type);
      console.log('🚨 isExistingUser:', event.data?.isExistingUser);
      console.log('🚨 받은 데이터 키들:', Object.keys(event.data || {})); // 어떤 키들이 있는지 확인
      console.log('🚨 tempToken 존재:', !!event.data?.tempToken);
      console.log('🚨 sessionId 존재:', !!event.data?.sessionId);
      try {
        // 소셜 로그인/회원가입 관련 메시지 처리 (더 포괄적으로)
        if (event.data && (
          event.data.type === "social-login-success" || 
          event.data.type === "social-signup-complete" ||
          event.data.type === "social-auth-result" ||
          event.data.type === "social-signup-needed"
        )) {
          console.log('🚨 소셜 인증 메시지 감지됨');
        // 기존 사용자인 경우 - 바로 로그인 처리
        if (event.data.isExistingUser === true) {
          console.log('🚨 기존 사용자 로그인 처리');
          // 1. 토큰 저장 (key를 'accessToken'으로 변경)
          // 1. AuthProvider의 updateTokens 함수 호출하여 authInfo 업데이트 (토큰 저장도 함께 처리)
          updateTokens(event.data.token, event.data.refreshToken || "");
          // 2. 사용자 정보 저장
          localStorage.setItem("userName", event.data.userName || "");
          localStorage.setItem("userId", event.data.userId || "");
          localStorage.setItem("email", event.data.email || event.data.socialEmail || "");
          localStorage.setItem("role", event.data.role || "");
          // 3. 대시보드로 이동
          navigate("/userdashboard");
        } else {
          // 신규 사용자인 경우 - 추가 정보 입력 모달 열기
          console.log('🚨 신규 사용자 - AdditionInfo 모달 열기');
          console.log('🚨 socialUserInfo 설정:', {
            socialId: event.data.socialId,
            provider: event.data.provider,
            email: event.data.email || event.data.socialEmail,
            userName: event.data.userName,
            profileImage: event.data.profileImage,
            sessionId: event.data.sessionId || event.data.tempToken // 둘 다 지원
          });
          setSocialUserInfo({
            socialId: event.data.socialId,
            provider: event.data.provider,
            email: event.data.email || event.data.socialEmail,
            userName: event.data.userName,
            profileImage: event.data.profileImage,
            sessionId: event.data.sessionId || event.data.tempToken // 둘 다 지원
          });
          console.log('🚨 setShowAdditionInfoModal(true) 호출');
          setShowAdditionInfoModal(true);
        }
      }
    } catch (error) {
      console.error('메시지 처리 중 오류 발생:', error);
    }
    };
    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, []);

  // 페이지 로드 시 URL 파라미터에서 소셜 로그인 결과 확인
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const socialData = urlParams.get('socialData');
    
    if (socialData) {
      try {
        const parsedData = JSON.parse(decodeURIComponent(socialData));
        console.log('URL에서 소셜 데이터 받음:', parsedData);
        
        if (parsedData.isExistingUser === false) {
          setSocialUserInfo({
            socialId: parsedData.socialId,
            provider: parsedData.provider,
            email: parsedData.email || parsedData.socialEmail,
            userName: parsedData.userName,
            profileImage: parsedData.profileImage,
            sessionId: parsedData.sessionId
          });
          setShowAdditionInfoModal(true);
          
          // URL 정리
          window.history.replaceState({}, document.title, window.location.pathname);
        }
      } catch (error) {
        console.error('소셜 데이터 파싱 오류:', error);
      }
    }
  }, []);

  const handleSocialSignup = (provider) => {
    // 소셜 회원가입 로직 구현
    console.log(`${provider} 회원가입 시도`);
    
    // 백엔드 호출 후 결과를 직접 처리
    window.location.href = `http://localhost:8888/seems/oauth2/authorization/${provider}`;
  };

  // 페이지가 로드될 때 현재 페이지의 내용이 JSON인지 확인
  useEffect(() => {
    // 페이지 로드 직후 약간의 지연을 두고 체크
    const checkForSocialData = () => {
      try {
        const bodyText = document.body.innerText || document.body.textContent;
        console.log('페이지 내용 확인:', bodyText.substring(0, 100));
        
        // JSON 형태인지 확인
        if (bodyText.trim().startsWith('{') && bodyText.includes('socialEmail') && bodyText.includes('tempToken')) {
          console.log('소셜 로그인 JSON 데이터 감지됨');
          const socialData = JSON.parse(bodyText.trim());
          console.log('파싱된 소셜 데이터:', socialData);
          
          if (socialData.isExistingUser === false) {
            console.log('신규 사용자 - AdditionInfo 모달 열기');
            // 신규 사용자 - AdditionInfo 모달 열기
            setSocialUserInfo({
              socialId: socialData.socialId,
              provider: socialData.provider,
              email: socialData.email || socialData.socialEmail,
              userName: socialData.userName,
              profileImage: socialData.profileImage,
              sessionId: socialData.sessionId
            });
            setShowAdditionInfoModal(true);
            
            // 원래 페이지 내용을 숨기고 SignupPage UI 표시
            document.body.innerHTML = '';
            // React 컴포넌트가 다시 렌더링되도록 강제
            window.location.href = '/signup';
            return;
          } else if (socialData.isExistingUser === true) {
            // 기존 사용자 - 토큰 저장 후 대시보드로
            updateTokens(socialData.token, socialData.refreshToken || "");
            localStorage.setItem("userName", socialData.userName || "");
            localStorage.setItem("userId", socialData.userId || "");
            localStorage.setItem("email", socialData.email || socialData.socialEmail || "");
            localStorage.setItem("role", socialData.role || "");
            navigate("/userdashboard");
          }
        }
      } catch (error) {
        console.log('JSON 파싱 실패 또는 정상 페이지:', error.message);
      }
    };
    
    // 즉시 실행
    checkForSocialData();
    
    // 100ms 후에도 한 번 더 체크 (DOM이 완전히 로드된 후)
    const timer = setTimeout(checkForSocialData, 100);
    
    return () => clearTimeout(timer);
  }, [navigate, updateTokens]);

  // 팝업 열기 함수
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

  return (
    <div className={styles.signupContainer}>
      <div className={styles.logoWrap}>
        <div className={styles.logoText}>
          <span>SEE</span>
          <span>MS</span>
        </div>
        <img 
          src={logoSeems} 
          alt="SEE MS 로고" 
          className={styles.logoImage}
        />
      </div>
      
      <div className={styles.signupTitle}>회원가입</div>
      <form className={styles.signupForm} onSubmit={handleSubmit}>
        <div className={styles.profileImgWrap}>
          <img 
            src={previewUrl || logoSeems} 
            alt="프로필 이미지" 
            className={styles.profileImg}
          />
          <input 
            type="file"
            id="photoFile"
            name="photoFile"
            onChange={handleChange}
            accept="image/*"
            ref={fileInputRef} // 여기에 ref 연결
          />
        </div>
        
        <div className={styles.formRow}>
          <div className={styles.formGroup}>
            <label htmlFor="userName">이름</label>
            <input
              type="text"
              id="userName"
              name="userName"
              placeholder="이름을 입력하세요"
              value={formData.userName}
              onChange={handleChange}
              required
            />
          </div>
        </div>
        
        <div className={styles.formGroup}>
          <label htmlFor="userId">아이디</label>
          <input
            type="text"
            id="userId"
            name="userId"
            placeholder="아이디를 입력하세요"
            value={formData.userId}
            onChange={handleChange}
            required
          />
        </div>

        <div className={styles.buttonGroup}>
            <button
              type="button"
              className={styles.button}
              onClick={handleIdCheck}
            >
              중복검사
            </button>
          </div>
        
        <div className={styles.formGroup}>
          <label htmlFor="userPwd">비밀번호</label>
          <input
            type="password"
            id="userPwd"
            name="userPwd"
            placeholder="비밀번호를 입력하세요"
            value={formData.userPwd}
            onChange={handleChange}
            required
          />
          
          {/* 비밀번호 조건 체크리스트 */}
          {formData.userPwd && (
            <div className={styles.passwordValidation}>
              <div className={styles.validationTitle}>비밀번호 조건</div>
              <div className={styles.validationList}>
                <div className={`${styles.validationItem} ${passwordValidation.length ? styles.valid : styles.invalid}`}>
                  <span className={styles.validationIcon}>
                    {passwordValidation.length ? '✅' : '❌'}
                  </span>
                  8자 이상 16자 이하
                </div>
                <div className={`${styles.validationItem} ${passwordValidation.upperCase ? styles.valid : styles.invalid}`}>
                  <span className={styles.validationIcon}>
                    {passwordValidation.upperCase ? '✅' : '❌'}
                  </span>
                  영문 대문자 포함
                </div>
                <div className={`${styles.validationItem} ${passwordValidation.lowerCase ? styles.valid : styles.invalid}`}>
                  <span className={styles.validationIcon}>
                    {passwordValidation.lowerCase ? '✅' : '❌'}
                  </span>
                  영문 소문자 포함
                </div>
                <div className={`${styles.validationItem} ${passwordValidation.number ? styles.valid : styles.invalid}`}>
                  <span className={styles.validationIcon}>
                    {passwordValidation.number ? '✅' : '❌'}
                  </span>
                  숫자 포함
                </div>
                <div className={`${styles.validationItem} ${passwordValidation.specialChar ? styles.valid : styles.invalid}`}>
                  <span className={styles.validationIcon}>
                    {passwordValidation.specialChar ? '✅' : '❌'}
                  </span>
                  특수문자 포함 (!@#$%^&*)
                </div>
              </div>
              
              {/* 전체 조건 만족 시 강도 표시 */}
              {Object.values(passwordValidation).every(Boolean) && (
                <div className={styles.passwordStrength}>
                  <span className={styles.strengthIcon}>🔒</span>
                  <span className={styles.strengthText}>강력한 비밀번호</span>
                </div>
              )}
            </div>
          )}
        </div>
        
        <div className={styles.formGroup}>
          <label htmlFor="confirmPwd">비밀번호 확인</label>
          <input
            type="password"
            id="confirmPwd"
            name="confirmPwd"
            placeholder="비밀번호를 다시 입력하세요"
            value={formData.confirmPwd}
            onChange={handleChange}
            onBlur={handleConfirmPwd}
            required
          />
        </div>
        
        <div className={styles.formGroup}>
          <label htmlFor="phone">휴대폰 번호</label>
          <input
            type="tel"
            id="phone"
            name="phone"
            placeholder="휴대폰 번호를 입력하세요"
            value={formData.phone}
            onChange={handleChange}
            required
          />
        </div>
        
        <div className={styles.termsGroup}>
          <label>
            <input
              type="checkbox"
              name="allTerms"
              checked={terms.allTerms}
              onChange={handleTermsChange}
            />
            <span>모든 약관에 동의합니다</span>
          </label>
          <div className={styles.termsSubGroup}>
            <label>
              <input
                type="checkbox"
                name="serviceTerms"
                checked={terms.serviceTerms}
                onChange={handleTermsChange}
                required
              />
              <span>서비스 이용약관 (필수)</span>
            </label>
            <label>
              <input
                type="checkbox"
                name="privacyTerms"
                checked={terms.privacyTerms}
                onChange={handleTermsChange}
                required
              />
              <span>개인정보 처리방침 (필수)</span>
            </label>
            <label>
              <input
                type="checkbox"
                name="marketingTerms"
                checked={terms.marketingTerms}
                onChange={handleTermsChange}
              />
              <span>마케팅 정보 수신 동의 (선택)</span>
            </label>
          </div>
        </div>
        
        <button type="submit" className={styles.signupBtn}>
          회원가입
        </button>
        
      </form>
      <FaceModal
        open={showFaceModal}
        onRegister={handleFaceRegister}
        onSkip={handleSkipFace}
        onClose={() => setShowFaceModal(false)}
      />
      
      <AdditionInfo
        open={showAdditionInfoModal}
        socialUserInfo={socialUserInfo}
        onSubmit={(userData) => {
          // 추가 정보 저장 성공 시 토큰 저장 및 대시보드로 이동
          localStorage.setItem("accessToken", userData.accessToken);
          localStorage.setItem("userName", userData.userName);
          localStorage.setItem("userId", userData.userId);
          localStorage.setItem("email", userData.email || userData.socialEmail);
          localStorage.setItem("role", userData.role);
          navigate("/userdashboard");
        }}
        onClose={() => setShowAdditionInfoModal(false)}
      />
      
      <div className={styles.loginLink}>
        이미 계정이 있으신가요?
        <span 
          onClick={() => handleLoginClick()} 
          style={{ cursor: 'pointer', color: '#4b94d0', fontWeight: '900', textDecoration: 'none' }}
        >{'  '}로그인
        </span>
      </div>
      

      
      <div className={styles.divider}>
        <hr />
        <span>또는</span>
        <hr />
      </div>
      
      <div className={styles.socialSignup}>
        <button 
          className={`${styles.socialBtn} ${styles.google}`}
          onClick={() => openSocialPopup('google')}
        >
          <img 
            src="https://img.icons8.com/color/24/000000/google-logo.png" 
            alt="구글 로고"
            className={styles.socialIcon}
          />
          구글 회원가입
        </button>
        
        <button 
          className={`${styles.socialBtn} ${styles.naver}`}
          onClick={() => openSocialPopup('naver')}
        >
          <img 
            src={naverIcon} 
            alt="네이버 로고"
            className={styles.socialIcon}
          />
          네이버 회원가입
        </button>
        
        <button 
          className={`${styles.socialBtn} ${styles.kakao}`}
          onClick={() => openSocialPopup('kakao')}
        >
          <img 
            src={kakaoIcon} 
            alt="카카오 로고"
            className={styles.socialIcon}
          />
          카카오 회원가입
        </button>
        
        {/* <button 
          className={`${styles.socialBtn} ${styles.faceio}`}
          onClick={() => handleSocialSignup('faceio')}
        >
          <img 
            src={faceioIcon} 
            alt="페이스 아이콘"
            className={styles.socialIcon}
          />
          페이스 회원가입
        </button> */}
      </div>
    </div>
  );
};

export default SignupPage; 