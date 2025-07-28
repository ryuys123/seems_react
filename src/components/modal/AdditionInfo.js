import React, { useState, useRef, useContext } from "react";
import styles from "./AdditionInfo.module.css";
import apiClient from "../../utils/axios";
import { AuthContext } from "../../AuthProvider";

const AdditionInfo = ({ open, onSubmit, onClose, socialUserInfo }) => {
  console.log('🚨 AdditionInfo 컴포넌트 렌더링됨!', { open, socialUserInfo });
  console.log('🚨 socialUserInfo 상세 분석:', {
    전체_키들: Object.keys(socialUserInfo || {}),
    socialId: socialUserInfo?.socialId,
    provider: socialUserInfo?.provider,
    email: socialUserInfo?.email,
    userName: socialUserInfo?.userName,
    sessionId: socialUserInfo?.sessionId,
    tempToken: socialUserInfo?.tempToken,
    sessionId_존재: !!socialUserInfo?.sessionId,
    tempToken_존재: !!socialUserInfo?.tempToken
  });
  
  const { updateTokens } = useContext(AuthContext);
  const [formData, setFormData] = useState({
    userId: "",
    userPwd: "",
    confirmPwd: "",
    userName: socialUserInfo?.userName || "",
    phone: ""
  });
  const [photoFile, setPhotoFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // 비밀번호 검증 상태 추가
  const [passwordValidation, setPasswordValidation] = useState({
    length: false,
    upperCase: false,
    lowerCase: false,
    number: false,
    specialChar: false
  });
  
  // 소셜 프로필 이미지가 있으면 초기값으로 설정
  React.useEffect(() => {
    if (socialUserInfo?.profileImage && !previewUrl) {
      setPreviewUrl(socialUserInfo.profileImage);
      setFormData(prev => ({ ...prev, profileImage: socialUserInfo.profileImage }));
    }
  }, [socialUserInfo, previewUrl]);
  const fileInputRef = useRef(null);

  // 비밀번호 검증 함수
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

  const handleChange = (e) => {
    const { name, value, type, files } = e.target;

    if (type === 'file') {
      const upfile = files[0];
      setPhotoFile(upfile);

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

  const validate = () => {
    if (!formData.userId.trim()) {
      setError("아이디를 입력해주세요.");
      return false;
    }
    if (!formData.userPwd.trim()) {
      setError("비밀번호를 입력해주세요.");
      return false;
    }
    
    // 비밀번호 조건 검증
    if (!Object.values(passwordValidation).every(Boolean)) {
      setError('비밀번호가 모든 조건을 만족하지 않습니다. 비밀번호 조건을 확인해주세요.');
      return false;
    }
    
    if (formData.userPwd !== formData.confirmPwd) {
      setError("비밀번호와 비밀번호 확인이 일치하지 않습니다.");
      return false;
    }
    if (!formData.userName.trim()) {
      setError("이름을 입력해주세요.");
      return false;
    }
    if (!formData.phone.trim()) {
      setError("전화번호를 입력해주세요.");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log('🔥🔥🔥 handleSubmit 함수 시작됨! 🔥🔥🔥');
    console.log('🔥 버튼 클릭 감지됨!');
    
    // 임시로 검증 우회
    // if (!validate()) {
    //   console.log('🚨 검증 실패로 handleSubmit 중단됨');
    //   return;
    // }
    
    setIsSubmitting(true);
    setError('');

    console.log('🚨 handleSubmit 시작');
    console.log('🚨 socialUserInfo 전체:', JSON.stringify(socialUserInfo, null, 2));
    console.log('🚨 socialUserInfo.sessionId:', socialUserInfo?.sessionId);
    console.log('🚨 socialUserInfo에 있는 모든 키:', Object.keys(socialUserInfo || {}));
    console.log('🚨 formData 전체:', JSON.stringify(formData, null, 2));

    try {
      // Base64 데이터를 JSON으로 전송
      const requestData = {
        ...formData,
        profileImage: formData.profileImage || ''
      };

      // 소셜 사용자 정보도 함께 전송
      if (socialUserInfo) {
        requestData.socialId = socialUserInfo.socialId;
        requestData.provider = socialUserInfo.provider; // socialProvider -> provider
        requestData.socialEmail = socialUserInfo.email;
        
        // sessionId 또는 tempToken 찾기
        const sessionId = socialUserInfo.sessionId || socialUserInfo.tempToken;
        console.log('🚨 추출된 sessionId/tempToken:', sessionId);
        
        if (sessionId) {
          // 여러 필드명으로 시도
          requestData.sessionId = sessionId;
          requestData.tempToken = sessionId;  // 백엔드가 tempToken을 기대할 수도 있음
          requestData.token = sessionId;      // 단순히 token일 수도 있음
        } else {
          console.error('🚨 sessionId나 tempToken이 없습니다!');
        }
        
        console.log('🚨 요청 데이터:', {
          ...requestData,
          sessionId: requestData.sessionId,
          hasSessionId: !!requestData.sessionId
        });
      }

      console.log('🚨 최종 요청 데이터:', JSON.stringify(requestData, null, 2));
      console.log('🚨 API 호출 시작:', '/auth/social/complete-signup');
      console.log('🔥🔥🔥 백엔드로 전송할 데이터 🔥🔥🔥');
      console.log('📝 userId:', requestData.userId);
      console.log('📝 userName:', requestData.userName);
      console.log('📝 phone:', requestData.phone);
      console.log('📝 userPwd:', requestData.userPwd ? '***설정됨***' : '❌없음');
      console.log('📝 socialId:', requestData.socialId);
      console.log('📝 provider:', requestData.provider);
      console.log('📝 socialEmail:', requestData.socialEmail);
      console.log('📝 sessionId:', requestData.sessionId);
      console.log('📝 tempToken:', requestData.tempToken);
      console.log('📝 token:', requestData.token);
      console.log('🔥 전체 요청 데이터 키들:', Object.keys(requestData));

      const response = await apiClient.post('/auth/social/complete-signup', requestData, {
        headers: { 
          'Content-Type': 'application/json'
          // Authorization 헤더 제거 (sessionId 방식에서는 불필요)
        },
      });

      console.log('🚨 API 응답 성공:', response.data);
      if (response.status === 200) {
        console.log('소셜회원가입 성공 응답:', response);
        
        // 토큰이 있으면 AuthProvider에 업데이트
        if (response.data?.accessToken || response.headers?.authorization) {
          const accessToken = response.data?.accessToken || response.headers?.authorization;
          const refreshToken = response.data?.refreshToken || response.headers?.['refresh-token'];
          
          console.log('소셜회원가입 후 토큰 업데이트:', { accessToken: !!accessToken, refreshToken: !!refreshToken });
          updateTokens(accessToken, refreshToken || "");
          
          // 사용자 정보도 저장
          if (response.data?.userName) {
            localStorage.setItem("userName", response.data.userName);
          }
          if (response.data?.userId) {
            localStorage.setItem("userId", response.data.userId);
          }
          
          // 프로필 이미지 정보 저장 (마이페이지에서 사용)
          if (response.data?.profileImage || formData.profileImage) {
            const profileImageData = response.data?.profileImage || formData.profileImage;
            localStorage.setItem("userProfileImage", profileImageData);
            console.log('프로필 이미지 저장 완료');
          }
        }
        
        // 성공 시 모달 닫고 대시보드로 이동
        if (onSubmit) onSubmit(response.data);
        onClose();
      }
    } catch (error) {
      console.error('🚨 API 에러 상세:', {
        message: error.message,
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        config: error.config
      });
      console.error('추가 정보 저장 실패:', error);
      setError(error.response?.data?.message || '추가 정보 저장에 실패했습니다.');
    } finally {
      setIsSubmitting(false);
    }
  };

  console.log('🚨 AdditionInfo return 실행됨!');
  
  // open이 false이면 아무것도 렌더링하지 않음
  if (!open) {
    console.log('🚨 AdditionInfo open이 false이므로 렌더링 안함');
    return null;
  }
  
  console.log('🔍 passwordValidation 상태:', passwordValidation);
  
  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modalContent}>
        <h3>추가 정보 입력</h3>
        <p>소셜 회원가입을 위해 추가 정보를 입력해주세요.</p>
        
        <div className={styles.inputGroup}>
          <input
            type="text"
            name="userId"
            placeholder="아이디"
            value={formData.userId}
            onChange={handleChange}
            className={styles.input}
          />
          
          {/* 프로필 이미지 섹션 - 아이디 바로 아래로 이동 */}
          <div className={styles.profileImgWrap}>
            <h4 style={{color: '#333', marginBottom: '16px'}}>프로필 이미지</h4>
            <div className={styles.profileImageContainer}>
              <img 
                src={previewUrl || socialUserInfo?.profileImage || "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100' viewBox='0 0 100 100'%3E%3Crect width='100' height='100' fill='%23f8f9fa'/%3E%3Ctext x='50' y='50' text-anchor='middle' dy='0.3em' font-family='Arial' font-size='40' fill='%23dee2e6'%3E👤%3C/text%3E%3C/svg%3E"}
                alt="프로필 이미지" 
                className={styles.profileImg}
                onError={(e) => {
                  console.log('이미지 로드 실패:', e.target.src);
                  e.target.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100' viewBox='0 0 100 100'%3E%3Crect width='100' height='100' fill='%23f8f9fa'/%3E%3Ctext x='50' y='50' text-anchor='middle' dy='0.3em' font-family='Arial' font-size='40' fill='%23dee2e6'%3E👤%3C/text%3E%3C/svg%3E";
                }}
              />
              <div className={styles.imageOverlay}>
                <span className={styles.changeText}>📷 변경</span>
              </div>
              <input 
                type="file"
                id="photoFile"
                name="photoFile"
                onChange={handleChange}
                accept="image/*"
                ref={fileInputRef}
                className={styles.fileInput}
              />
            </div>
            <div className={styles.imageInfo}>
              <p className={styles.imageNote}>
                {socialUserInfo?.profileImage && !photoFile ? 
                  '소셜 계정 프로필 이미지를 사용하거나 새 이미지를 선택하세요' : 
                  '프로필 이미지를 선택해주세요 (선택사항)'
                }
              </p>
              <button 
                type="button" 
                onClick={() => fileInputRef.current?.click()}
                className={styles.imageChangeBtn}
              >
                {photoFile ? '다른 이미지 선택' : '이미지 선택'}
              </button>
            </div>
          </div>
          <input
            type="password"
            name="userPwd"
            placeholder="비밀번호"
            value={formData.userPwd}
            onChange={handleChange}
            className={styles.input}
          />
          
          {/* 비밀번호 조건 표시 */}
          {formData.userPwd && (
            <div className={styles.passwordValidation}>
              <div className={styles.validationTitle}>비밀번호 조건</div>
              <div className={styles.validationList}>
                <div className={`${styles.validationItem} ${passwordValidation.length ? styles.valid : styles.invalid}`}>
                  <span className={styles.validationIcon}>{passwordValidation.length ? '✅' : '❌'}</span> 8자 이상 16자 이하
                </div>
                <div className={`${styles.validationItem} ${passwordValidation.upperCase ? styles.valid : styles.invalid}`}>
                  <span className={styles.validationIcon}>{passwordValidation.upperCase ? '✅' : '❌'}</span> 영문 대문자 포함
                </div>
                <div className={`${styles.validationItem} ${passwordValidation.lowerCase ? styles.valid : styles.invalid}`}>
                  <span className={styles.validationIcon}>{passwordValidation.lowerCase ? '✅' : '❌'}</span> 영문 소문자 포함
                </div>
                <div className={`${styles.validationItem} ${passwordValidation.number ? styles.valid : styles.invalid}`}>
                  <span className={styles.validationIcon}>{passwordValidation.number ? '✅' : '❌'}</span> 숫자 포함
                </div>
                <div className={`${styles.validationItem} ${passwordValidation.specialChar ? styles.valid : styles.invalid}`}>
                  <span className={styles.validationIcon}>{passwordValidation.specialChar ? '✅' : '❌'}</span> 특수문자 포함 (!@#$%^&*)
                </div>
              </div>
              {Object.values(passwordValidation).every(Boolean) && (
                <div className={styles.passwordStrength}>
                  <span className={styles.strengthIcon}>🔒</span>
                  <span className={styles.strengthText}>강력한 비밀번호</span>
                </div>
              )}
            </div>
          )}
          
          <input
            type="password"
            name="confirmPwd"
            placeholder="비밀번호 확인"
            value={formData.confirmPwd}
            onChange={handleChange}
            className={styles.input}
          />
          <input
            type="text"
            name="userName"
            placeholder="이름"
            value={formData.userName}
            onChange={handleChange}
            className={styles.input}
          />
          <input
            type="tel"
            name="phone"
            placeholder="전화번호"
            value={formData.phone}
            onChange={handleChange}
            className={styles.input}
          />
        </div>
        
        {error && <div className={styles.error}>{error}</div>}
        
        <div className={styles.buttonGroup}>
          <button 
            onClick={handleSubmit} 
            disabled={isSubmitting}
            className={styles.submitBtn}
          >
            {isSubmitting ? '저장 중...' : '저장'}
          </button>
          <button onClick={onClose} className={styles.cancelBtn}>
            취소
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdditionInfo;
