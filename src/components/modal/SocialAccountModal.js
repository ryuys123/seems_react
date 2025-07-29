import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './SocialAccountModal.module.css';
import apiClient from '../../utils/axios';

const SocialAccountModal = ({ isOpen, onClose, socialData }) => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [existingAccount, setExistingAccount] = useState(null);
  const [linkMode, setLinkMode] = useState('select'); // 'select', 'link', 'create', 'confirm'
  const [showPasswordForm, setShowPasswordForm] = useState(false);

  // 신규 가입 폼 상태
  const [signupForm, setSignupForm] = useState({
    userId: '',
    userPwd: '',
    confirmPwd: '',
    phone: '',
    profileImage: null // 프로필 사진 추가
  });

  // 프로필 사진 미리보기 상태
  const [previewUrl, setPreviewUrl] = useState(null);
  const fileInputRef = useRef(null);

  // 중복 체크 상태
  const [idCheckStatus, setIdCheckStatus] = useState({
    checked: false,
    available: false,
    loading: false
  });

  // 비밀번호 조건 상태
  const [passwordValidation, setPasswordValidation] = useState({
    length: false,
    hasNumber: false,
    hasLetter: false,
    hasSpecial: false
  });

  useEffect(() => {
    if (!isOpen) {
      // 모달이 닫힐 때 상태 초기화
      setLinkMode('select');
      setExistingAccount(null);
      setShowPasswordForm(false);
      setSignupForm({
        userId: '',
        userPwd: '',
        userPwdConfirm: '',
        phone: ''
      });
      setIdCheckStatus({
        checked: false,
        available: false,
        loading: false
      });
      setPasswordValidation({
        length: false,
        hasNumber: false,
        hasLetter: false,
        hasSpecial: false
      });
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // 기존 계정 연동 선택
  const handleLinkExistingAccount = () => {
    setLinkMode('link');
    setShowPasswordForm(true);
  };

  // 신규 가입 선택
  const handleCreateNewAccount = () => {
    setLinkMode('create');
  };

  // 이전 버튼 클릭
  const handleGoBack = () => {
    if (linkMode === 'link') {
      setLinkMode('select');
      setExistingAccount(null);
    } else if (linkMode === 'confirm') {
      setLinkMode('link');
      setExistingAccount(null);
    } else if (linkMode === 'create') {
      setLinkMode('select');
    }
  };

  // 아이디 중복 체크
  const checkUserIdDuplicate = async (userId) => {
    if (!userId || userId.length < 3) {
      alert('아이디는 3자 이상 입력해주세요.');
      return;
    }

    try {
      setIdCheckStatus(prev => ({ ...prev, loading: true }));
      
      // 자체 로그인과 동일한 방식 사용
      const response = await apiClient.post('/user/idchk', null, {
        // post 요청인 이유 : userId 는 개인정보이므로 안보이게 하는 기능
        params: { userId: userId },
      });

      console.log('아이디 중복 체크 응답:', response.data);

      if (response.data === 'ok') {
        setIdCheckStatus({
          checked: true,
          available: true,
          loading: false
        });
        alert('사용 가능한 아이디입니다.');
      } else {
        setIdCheckStatus({
          checked: true,
          available: false,
          loading: false
        });
        alert('이미 사용 중인 아이디입니다.');
      }
    } catch (error) {
      console.error('아이디 중복 체크 실패:', error);
      console.error('에러 응답:', error.response?.data);
      
      // 에러 발생 시 상태를 명확하게 설정
      setIdCheckStatus({
        checked: false,
        available: false,
        loading: false
      });
      
      if (error.response?.status === 400) {
        alert(error.response.data.message || '아이디 중복 체크에 실패했습니다.');
      } else if (error.response?.status === 401) {
        // 401 에러는 백엔드에서 인증을 요구하는 경우
        // 아이디 중복 체크는 인증이 필요하지 않아야 함
        console.log('백엔드에서 인증을 요구함 - 아이디 중복 체크는 인증 불필요');
        alert('아이디 중복 체크 중 인증 오류가 발생했습니다. 다시 시도해주세요.');
      } else if (error.response?.status === 409) {
        // 409는 이미 사용 중인 아이디
        setIdCheckStatus({
          checked: true,
          available: false,
          loading: false
        });
        alert('이미 사용 중인 아이디입니다.');
      } else {
        alert('아이디 중복 체크 중 오류가 발생했습니다. 다시 시도해주세요.');
      }
    }
  };

  // 기존 계정 확인 (비밀번호 입력 후)
  const checkExistingAccount = async (userId, password) => {
    try {
      setLoading(true);
      console.log('계정 확인 요청:', { userId, password: '***' });
      
      // 기존 로그인 API를 사용하여 계정 확인
      const response = await apiClient.post('/login', {
        userId: userId,
        userPwd: password
      }, {
        headers: {
          // Authorization 헤더 완전 제거
        },
        // 세션 만료 모달 방지
        _preventSessionExpired: true
      });
      
      console.log('계정 확인 응답:', response.data);
      
      // 로그인 성공 시 기존 계정 정보로 설정
      if (response.data && response.data.accessToken) {
        // 기존 계정 정보 구성 (비밀번호 포함)
        const existingAccount = {
          userId: response.data.userId || userId,
          userName: response.data.userName || userId,
          email: response.data.email || socialData.email,
          password: password, // 연동 시 사용할 비밀번호 저장
          accessToken: response.data.accessToken // 계정 확인 후 받은 토큰 저장
        };
        
        setExistingAccount(existingAccount);
        setLinkMode('confirm');
      } else {
        alert('입력하신 계정 정보가 올바르지 않습니다.');
      }
    } catch (error) {
      console.error('계정 확인 실패:', error);
      console.error('에러 응답:', error.response?.data);
      
      if (error.response?.status === 401) {
        alert('입력하신 계정 정보가 올바르지 않습니다.');
      } else if (error.response?.status === 404) {
        alert('계정을 찾을 수 없습니다.');
      } else if (error.response?.data?.error) {
        alert(error.response.data.error);
      } else if (error.response?.data?.message) {
        alert(error.response.data.message);
      } else {
        alert('계정 확인 중 오류가 발생했습니다.');
      }
    } finally {
      setLoading(false);
    }
  };

  // 기존 계정과 연동
  const handleLinkAccount = async () => {
    try {
      setLoading(true);
      console.log('계정 연동 요청:', {
        userId: existingAccount.userId,
        socialId: socialData.socialId,
        provider: socialData.provider
      });
      
      // 계정 확인 후 받은 토큰으로 Authorization 헤더 설정
      const authToken = existingAccount.accessToken;
      console.log('사용할 토큰:', authToken ? '존재' : '없음');
      
      // 소셜 계정 연동 API 호출 - 이메일과 이름 제거
      const requestHeaders = {
        // 계정 확인 후 받은 토큰 사용
        ...(authToken && { Authorization: `Bearer ${authToken}` })
      };
      
      console.log('요청 헤더:', requestHeaders);
      
      const response = await apiClient.post('/api/user/link-social-account', {
        userId: existingAccount.userId,
        socialId: socialData.socialId,
        socialProvider: socialData.provider // provider를 socialProvider로 변경
      }, {
        headers: requestHeaders,
        // 세션 만료 모달 방지
        _preventSessionExpired: true
      });

      console.log('계정 연동 응답:', response.data);

      // 서버 응답 구조에 따라 성공 여부 판단
      let isSuccess = false;
      if (response.data.success !== undefined) {
        isSuccess = response.data.success;
      } else if (response.data.message && response.data.message.includes('성공')) {
        isSuccess = true;
      } else if (response.data.message && response.data.message.includes('연동')) {
        isSuccess = true;
      } else if (response.status === 200 || response.status === 201) {
        isSuccess = true;
      }

      console.log('성공 여부 판단:', isSuccess);

      if (isSuccess) {
        alert('소셜 계정이 성공적으로 연동되었습니다.');
        // 로그인 처리
        if (response.data.accessToken) {
          localStorage.setItem('accessToken', response.data.accessToken);
          localStorage.setItem('refreshToken', response.data.refreshToken);
          localStorage.setItem('userId', existingAccount.userId);
          localStorage.setItem('userName', existingAccount.userName);
          
          // 세션 타이머 강제 업데이트
          setTimeout(() => {
            window.dispatchEvent(new CustomEvent('sessionUpdate', { 
              detail: { forceUpdate: true } 
            }));
          }, 100);
        }
        onClose();
        navigate('/userdashboard');
      } else {
        alert(response.data.message || '계정 연동에 실패했습니다.');
      }
    } catch (error) {
      console.error('계정 연동 실패:', error);
      console.error('에러 응답:', error.response?.data);
      
      if (error.response?.status === 400) {
        alert(error.response.data.message || '잘못된 요청입니다.');
      } else if (error.response?.status === 401) {
        alert('계정 정보가 올바르지 않습니다.');
      } else if (error.response?.status === 409) {
        alert('이미 연동된 소셜 계정입니다.');
      } else if (error.response?.data?.message) {
        alert(error.response.data.message);
      } else {
        alert('계정 연동에 실패했습니다.');
      }
    } finally {
      setLoading(false);
    }
  };

  // 비밀번호 조건 검증
  const validatePassword = (password) => {
    const validations = {
      length: password.length >= 6, // 백엔드 기준 6자 이상
      hasNumber: /\d/.test(password),
      hasLetter: /[a-zA-Z]/.test(password),
      hasSpecial: /[!@#$%^&*(),.?":{}|<>]/.test(password)
    };
    
    setPasswordValidation(validations);
    return Object.values(validations).every(Boolean);
  };

  // 신규 가입 폼 입력 처리
  const handleSignupInputChange = (e) => {
    const { name, value } = e.target;
    setSignupForm(prev => ({
      ...prev,
      [name]: value
    }));

    // 아이디 변경 시 중복 체크 상태 초기화
    if (name === 'userId') {
      setIdCheckStatus({
        checked: false,
        available: false,
        loading: false
      });
    }

    // 비밀번호 변경 시 조건 검증
    if (name === 'userPwd') {
      validatePassword(value);
    }
  };

  // 신규 가입 처리
  const handleSignup = async (e) => {
    e.preventDefault();
    
    // 입력 검증
    if (!signupForm.userId || !signupForm.userPwd || !signupForm.phone) {
      alert('모든 필드를 입력해주세요.');
      return;
    }

    // 아이디 중복 체크 확인
    if (!idCheckStatus.checked || !idCheckStatus.available) {
      alert('아이디 중복 체크를 완료해주세요.');
      return;
    }

    // 비밀번호 조건 확인 (백엔드 기준 6자 이상)
    if (signupForm.userPwd.length < 6) {
      alert('비밀번호는 6자 이상이어야 합니다.');
      return;
    }

    if (signupForm.userPwd !== signupForm.userPwdConfirm) {
      alert('비밀번호가 일치하지 않습니다.');
      return;
    }

    try {
      setLoading(true);
      console.log('신규 가입 요청:', { 
        userId: signupForm.userId, 
        phone: signupForm.phone,
        socialData 
      });

      // 신규 가입 API 호출 - FormData로 프로필 사진 포함
      const formData = new FormData();
      formData.append('userId', signupForm.userId);
      formData.append('userPwd', signupForm.userPwd);
      formData.append('phone', signupForm.phone);
      formData.append('userName', socialData.name || signupForm.userId);
      formData.append('socialId', socialData.socialId);        // 추가
      formData.append('socialProvider', socialData.provider);  // 추가
      
      // 프로필 사진이 있으면 추가
      if (signupForm.profileImage) {
        formData.append('profileImage', signupForm.profileImage);
      }

      // FormData 디버깅 - 파일 객체 확인
      console.log('신규 가입 요청 데이터:', {
        userId: signupForm.userId,
        userPwd: signupForm.userPwd,
        phone: signupForm.phone,
        userName: socialData.name || signupForm.userId,
        socialId: socialData.socialId,
        socialProvider: socialData.provider,
        profileImage: signupForm.profileImage
      });

      // FormData 내용 확인
      console.log('FormData 내용:');
      for (let [key, value] of formData.entries()) {
        console.log(`${key}:`, value);
      }

      const response = await apiClient.post('/user/signup', formData, {
        // Content-Type 헤더 제거 - axios가 자동으로 설정
        // 세션 만료 모달 방지
        _preventSessionExpired: true
      });

      console.log('신규 가입 응답:', response.data);

      if (response.status === 200) {
        alert('소셜 계정으로 신규 가입이 완료되었습니다.');
        
        // 로그인 처리 - 백엔드에서 토큰을 반환하지 않으므로 로그인 페이지로 이동
        localStorage.setItem('userId', signupForm.userId);
        localStorage.setItem('userName', signupForm.userId); // 임시로 userId 사용
        
        // 소셜 계정 정보 저장
        localStorage.setItem('social-linked', 'true');
        localStorage.setItem('social-provider', socialData.provider);
        localStorage.setItem('social-id', socialData.socialId);
        localStorage.setItem('social-email', socialData.email || '');
        
        // 세션 타이머 강제 업데이트 (신규 가입의 경우 토큰이 없으므로 제한적)
        setTimeout(() => {
          window.dispatchEvent(new CustomEvent('sessionUpdate', { 
            detail: { forceUpdate: true } 
          }));
        }, 100);
        
        onClose();
        navigate('/'); // 로그인 페이지로 이동
      } else {
        // 신규 가입 실패 시 추가정보는 DB에 반영되지 않음
        console.error('신규 가입 실패 - 추가정보 DB 반영 안됨');
        alert('신규 가입에 실패했습니다. 다시 시도해 주세요');
      }
    } catch (error) {
      console.error('신규 가입 실패:', error);
      console.error('에러 응답:', error.response?.data);
      alert('신규 가입에 실패했습니다. 다시 시도해 주세요');
    } finally {
      setLoading(false);
    }
  };

  // 프로필 사진 처리 함수들
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // 파일 크기 체크 (5MB 이하)
      if (file.size > 5 * 1024 * 1024) {
        alert('파일 크기는 5MB 이하여야 합니다.');
        return;
      }

      // 파일 타입 체크
      if (!file.type.startsWith('image/')) {
        alert('이미지 파일만 업로드 가능합니다.');
        return;
      }

      setSignupForm(prev => ({
        ...prev,
        profileImage: file
      }));

      // 미리보기 URL 생성
      const reader = new FileReader();
      reader.onload = (e) => {
        setPreviewUrl(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemovePhoto = () => {
    setSignupForm(prev => ({
      ...prev,
      profileImage: null
    }));
    setPreviewUrl(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handlePhotoClick = () => {
    fileInputRef.current?.click();
  };

  if (loading) {
    return (
      <div className={styles.modalOverlay}>
        <div className={styles.modal}>
          <div className={styles.loading}>처리 중...</div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modal}>
        <div className={styles.modalHeader}>
          <h2 className={styles.title}>소셜 계정 연동</h2>
          <button className={styles.closeButton} onClick={onClose}>×</button>
        </div>
        
        <div className={styles.modalContent}>
          {linkMode === 'select' && (
            <div className={styles.selectSection}>
              <div className={styles.socialInfo}>
                <h3>소셜 계정 정보</h3>
                <p><strong>소셜 계정:</strong> {socialData?.provider}</p>
                <p><strong>이름:</strong> {socialData?.name}</p>
              </div>
              
              <div className={styles.choiceSection}>
                <h3>연동 방법 선택</h3>
                <p>기존 계정에 연동하시겠습니까, 아니면 새 계정을 만드시겠습니까?</p>
                
                <div className={styles.choiceButtons}>
                  <button 
                    className={styles.linkButton}
                    onClick={handleLinkExistingAccount}
                  >
                    기존 계정에 연동
                  </button>
                  
                  <button 
                    className={styles.createButton}
                    onClick={handleCreateNewAccount}
                  >
                    새 계정 만들기
                  </button>
                </div>
              </div>
            </div>
          )}

          {linkMode === 'link' && (
            <div className={styles.linkSection}>
              <div className={styles.accountInfo}>
                <h3>기존 계정 연동</h3>
                <p>연동할 기존 계정의 정보를 입력해주세요.</p>
              </div>
              
              <div className={styles.linkForm}>
                <PasswordInput onSubmit={checkExistingAccount} />
              </div>
              
              <div className={styles.backButton}>
                <button 
                  className={styles.backBtn}
                  onClick={handleGoBack}
                >
                  ← 이전
                </button>
              </div>
            </div>
          )}

          {linkMode === 'confirm' && existingAccount && (
            <div className={styles.confirmSection}>
              <div className={styles.accountInfo}>
                <h3>계정 연동 확인</h3>
                <p>다음 계정에 연동하시겠습니까?</p>
                <div className={styles.accountDetails}>
                  <p><strong>아이디:</strong> {existingAccount.userId}</p>
                  <p><strong>이름:</strong> {existingAccount.userName}</p>
                  <p><strong>이메일:</strong> {existingAccount.email}</p>
                </div>
              </div>
              
              <div className={styles.confirmButtons}>
                <button 
                  className={styles.confirmButton}
                  onClick={handleLinkAccount}
                >
                  연동하기
                </button>
                
                <button 
                  className={styles.cancelButton}
                  onClick={handleGoBack}
                >
                  이전
                </button>
              </div>
            </div>
          )}

          {linkMode === 'create' && (
            <div className={styles.createSection}>
              <div className={styles.accountInfo}>
                <h3>새 계정 만들기</h3>
                <p>추가 정보를 입력하여 새 계정을 만드세요.</p>
              </div>
              
              <form onSubmit={handleSignup} className={styles.signupForm}>
                <div className={styles.inputGroup}>
                  <label>프로필 사진</label>
                  <div className={styles.photoUploadContainer}>
                    <div className={styles.photoPreview} onClick={handlePhotoClick}>
                      {previewUrl ? (
                        <img src={previewUrl} alt="프로필 미리보기" />
                      ) : (
                        <div className={styles.photoPlaceholder}>
                          <span>📷</span>
                          <p>클릭하여 사진 선택</p>
                        </div>
                      )}
                    </div>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                      style={{ display: 'none' }}
                    />
                    {previewUrl && (
                      <button
                        type="button"
                        className={styles.removePhotoButton}
                        onClick={handleRemovePhoto}
                      >
                        삭제
                      </button>
                    )}
                  </div>
                  <p className={styles.photoHelpText}>
                    선택사항입니다. 5MB 이하의 이미지 파일만 업로드 가능합니다.
                  </p>
                </div>

                <div className={styles.inputGroup}>
                  <label>아이디 *</label>
                  <div className={styles.idInputContainer}>
                    <input
                      type="text"
                      name="userId"
                      value={signupForm.userId}
                      onChange={handleSignupInputChange}
                      placeholder="아이디를 입력하세요 (3자 이상)"
                      required
                    />
                    <button
                      type="button"
                      className={styles.checkButton}
                      onClick={() => checkUserIdDuplicate(signupForm.userId)}
                      disabled={idCheckStatus.loading || !signupForm.userId || signupForm.userId.length < 3}
                    >
                      {idCheckStatus.loading ? '확인 중...' : '중복 확인'}
                    </button>
                  </div>
                  {idCheckStatus.loading && <span className={styles.loadingIndicator}>중복 체크 중...</span>}
                  {idCheckStatus.checked && idCheckStatus.available && <span className={styles.availableIndicator}>✓ 사용 가능한 아이디입니다</span>}
                  {idCheckStatus.checked && !idCheckStatus.available && <span className={styles.unavailableIndicator}>✗ 이미 사용 중인 아이디입니다</span>}
                  {!idCheckStatus.loading && !idCheckStatus.checked && signupForm.userId && signupForm.userId.length >= 3 && (
                    <span className={styles.unavailableIndicator}>⚠ 중복 확인이 필요합니다</span>
                  )}
                </div>
                
                <div className={styles.inputGroup}>
                  <label>비밀번호 *</label>
                  <input
                    type="password"
                    name="userPwd"
                    value={signupForm.userPwd}
                    onChange={handleSignupInputChange}
                    placeholder="비밀번호를 입력하세요 (6자 이상)"
                    required
                  />
                  <div className={styles.passwordValidation}>
                    <div className={styles.validationItem}>
                      <span className={passwordValidation.length ? styles.valid : styles.invalid}>
                        {passwordValidation.length ? '✓' : '✗'} 6자 이상
                      </span>
                    </div>
                    <div className={styles.validationItem}>
                      <span className={passwordValidation.hasNumber ? styles.valid : styles.invalid}>
                        {passwordValidation.hasNumber ? '✓' : '✗'} 숫자 포함
                      </span>
                    </div>
                    <div className={styles.validationItem}>
                      <span className={passwordValidation.hasLetter ? styles.valid : styles.invalid}>
                        {passwordValidation.hasLetter ? '✓' : '✗'} 영문 포함
                      </span>
                    </div>
                    <div className={styles.validationItem}>
                      <span className={passwordValidation.hasSpecial ? styles.valid : styles.invalid}>
                        {passwordValidation.hasSpecial ? '✓' : '✗'} 특수문자 포함
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className={styles.inputGroup}>
                  <label>비밀번호 확인 *</label>
                  <input
                    type="password"
                    name="userPwdConfirm"
                    value={signupForm.userPwdConfirm}
                    onChange={handleSignupInputChange}
                    placeholder="비밀번호를 다시 입력하세요"
                    required
                  />
                  {signupForm.userPwdConfirm && signupForm.userPwd !== signupForm.userPwdConfirm && (
                    <span className={styles.unavailableIndicator}>비밀번호가 일치하지 않습니다</span>
                  )}
                  {signupForm.userPwdConfirm && signupForm.userPwd === signupForm.userPwdConfirm && (
                    <span className={styles.availableIndicator}>✓ 비밀번호가 일치합니다</span>
                  )}
                </div>
                
                <div className={styles.inputGroup}>
                  <label>휴대전화 *</label>
                  <input
                    type="tel"
                    name="phone"
                    value={signupForm.phone}
                    onChange={handleSignupInputChange}
                    placeholder="휴대전화 번호를 입력하세요"
                    required
                  />
                </div>
                
                <div className={styles.formButtons}>
                  <button type="submit" className={styles.signupButton}>
                    가입하기
                  </button>
                  
                  <button 
                    type="button"
                    className={styles.backBtn}
                    onClick={handleGoBack}
                  >
                    ← 이전
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// 비밀번호 입력 컴포넌트
const PasswordInput = ({ onSubmit }) => {
  const [userId, setUserId] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (userId.trim() && password.trim()) {
      onSubmit(userId, password);
    }
  };

  return (
    <form onSubmit={handleSubmit} className={styles.passwordForm}>
      <div className={styles.inputGroup}>
        <label>아이디</label>
        <input
          type="text"
          value={userId}
          onChange={(e) => setUserId(e.target.value)}
          placeholder="아이디를 입력하세요"
          required
        />
      </div>
      
      <div className={styles.inputGroup}>
        <label>비밀번호</label>
        <div className={styles.passwordInput}>
          <input
            type={showPassword ? 'text' : 'password'}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="비밀번호를 입력하세요"
            required
          />
          <button
            type="button"
            className={styles.togglePassword}
            onClick={() => setShowPassword(!showPassword)}
          >
            {showPassword ? '👁️' : '👁️‍🗨️'}
          </button>
        </div>
      </div>
      
      <button type="submit" className={styles.linkButton}>
        계정 확인
      </button>
    </form>
  );
};

export default SocialAccountModal;