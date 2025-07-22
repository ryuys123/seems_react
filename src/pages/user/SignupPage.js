import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './SignupPage.module.css';
import logoSeems from '../../assets/images/logo_seems.png';
import naverIcon from '../../assets/images/naver.png';
import kakaoIcon from '../../assets/images/kakao.png';
import apiClient from '../../utils/axios';
import FaceModal from '../../components/modal/FaceModal';

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

  const navigate = useNavigate();

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
        setPreviewUrl(URL.createObjectURL(upfile)); // previewUrl = url; 과 같음
      } else {
        setPreviewUrl(null); // previewUrl = null; 과 같음
      }
    } else {
      setFormData({ ...formData, [name]: value });
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


    //전송보낼 FormData 객체 생성함
    const combinedFormData = new FormData();
    //input 의 값들과 첨부파일을 append 처리함
    Object.keys(formData).forEach((key) => {
      combinedFormData.append(key, formData[key]);
    });

    if (photoFile) {
      combinedFormData.append('photofile', photoFile);
      //'photofile'  서버측 Controller 메소드가 받을 parameter 이름임, 반드시 일치해야 함
    }

    setPendingFormData({ ...formData }); // 회원정보 임시 저장
    setShowFaceModal(true); // 모달 오픈
  };

  const handleFaceRegister = () => {
    setShowFaceModal(false);
    navigate('/user/facesignup', { state: pendingFormData });
  };

  const handleSkipFace = async () => {
    setShowFaceModal(false);
    try {
      const combinedFormData = new FormData();
      Object.keys(formData).forEach((key) => {
        combinedFormData.append(key, formData[key]);
      });
      // photoFile(얼굴 이미지) 없이 전송
      const response = await apiClient.post(
        '/user/signup',
        combinedFormData,
        {
          headers: { 'Content-Type': 'multipart/form-data' },
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

  const handleSocialSignup = (provider) => {
    // 소셜 회원가입 로직 구현
    console.log(`${provider} 회원가입 시도`);
  };

  const handleLoginClick = () => {
    // 로그인 페이지로 이동
    console.log('로그인 페이지로 이동');
    navigate('/');
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
            src={previewUrl || photoFile} 
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
          onClick={() => handleSocialSignup('google')}
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
          onClick={() => handleSocialSignup('naver')}
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
          onClick={() => handleSocialSignup('kakao')}
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