import React, { useState, useRef, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import UserHeader from '../../components/common/UserHeader';
import logoSeems from '../../assets/images/logo_seems.png';
import styles from './UserFormPage.module.css';
import apiClient from '../../utils/axios';
import { AuthContext } from '../../AuthProvider';

const initialForm = {
  name: '',
  phone: '',
  currentPassword: '',
  newPassword: '',
  confirmPassword: '',
};

const UserFormPage = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const [formData, setFormData] = useState(initialForm);
  const [profileImage, setProfileImage] = useState(logoSeems);
  const [errors, setErrors] = useState({});
  const [showPasswordFields, setShowPasswordFields] = useState(false);
  const [loading, setLoading] = useState(true);
  const { updateTokens } = useContext(AuthContext);

  // 사용자 정보 불러오기 (마운트 시)
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await apiClient.get('/user/info');
        const user = res.data;
        setFormData({
          name: user.userName || '',
          phone: user.phone || '',
          currentPassword: '',
          newPassword: '',
          confirmPassword: '',
        });
        setProfileImage(user.profileImage || logoSeems);
      } catch (err) {
        // 실패 시 기본값 유지
        setFormData(initialForm);
        setProfileImage(logoSeems);
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, []);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => {
      const updated = {
        ...prev,
        [name]: type === 'checkbox' ? checked : value || '',
      };
      console.log('formData 변경됨:', updated);
      return updated;
    });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    console.log('파일 선택됨:', file);
    
    if (file) {
      const reader = new FileReader();
      reader.onload = (evt) => {
        const base64Data = evt.target.result;
        console.log('Base64 데이터 생성됨:', base64Data.substring(0, 50) + '...');
        setProfileImage(base64Data);
        // base64 데이터를 formData에 저장 (서버 전송용)
        setFormData((prev) => {
          const updated = { ...prev, profileImage: base64Data };
          console.log('formData 업데이트됨:', updated);
          return updated;
        });
      };
      reader.readAsDataURL(file);
    } else {
      console.log('파일이 선택되지 않음');
    }
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.name) newErrors.name = '이름을 입력하세요.';
    if (formData.phone && !/^01[016789]-?\d{3,4}-?\d{4}$/.test(formData.phone)) newErrors.phone = '휴대폰 번호 형식이 올바르지 않습니다.';
    if (showPasswordFields && (formData.newPassword || formData.confirmPassword)) {
      if (!formData.currentPassword) newErrors.currentPassword = '현재 비밀번호를 입력하세요.';
      if (formData.newPassword.length < 6) newErrors.newPassword = '새 비밀번호는 6자 이상이어야 합니다.';
      if (formData.newPassword !== formData.confirmPassword) newErrors.confirmPassword = '비밀번호가 일치하지 않습니다.';
    }
    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validation = validate();
    setErrors(validation);
    if (Object.keys(validation).length > 0) return;
    
    console.log('프로필 수정 요청 시작');
    console.log('현재 formData:', formData);
    console.log('프로필 이미지 데이터:', formData.profileImage ? formData.profileImage.substring(0, 50) + '...' : '없음');
    
    try {
      // FormData 사용하여 multipart/form-data로 전송
      const formDataToSend = new FormData();
      formDataToSend.append('userName', formData.name || '');
      formDataToSend.append('phone', formData.phone || '');
      
      // 프로필 이미지가 있는 경우에만 추가
      if (formData.profileImage) {
        // Base64 데이터를 Blob으로 변환
        const base64Response = await fetch(formData.profileImage);
        const blob = await base64Response.blob();
        formDataToSend.append('profileImage', blob, 'profile.jpg');
        console.log('FormData에 프로필 이미지 추가됨');
      } else {
        console.log('프로필 이미지가 없어서 추가하지 않음');
      }
      
      console.log('전송할 FormData 내용:');
      for (let [key, value] of formDataToSend.entries()) {
        console.log(key, ':', value);
      }
      
      const response = await apiClient.put('/user/info', formDataToSend, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      
      console.log('프로필 수정 응답:', response.data);
      
      // 프로필 수정 성공 후 새로운 토큰이 응답에 포함되어 있다면 업데이트
      if (response.data.accessToken && response.data.refreshToken) {
        updateTokens(response.data.accessToken, response.data.refreshToken);
        console.log('프로필 수정 후 토큰 업데이트 완료');
      } else {
        // 토큰이 없으면 localStorage의 userName만 업데이트
        localStorage.setItem('userName', formData.name);
        console.log('프로필 수정 후 localStorage userName 업데이트 완료');
      }
      
      alert('프로필이 성공적으로 수정되었습니다.');
      navigate('/userprofile');
    } catch (err) {
      alert('프로필 수정에 실패했습니다.');
    }
  };

  const handleCancel = () => {
    navigate('/userprofile');
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    const validation = validate();
    setErrors(validation);
    if (Object.keys(validation).length > 0) return;
    try {
      // Base64 데이터를 JSON으로 전송
      const requestData = {
        userName: formData.name || '',
        phone: formData.phone || '',
        currentPassword: formData.currentPassword,
        newPassword: formData.newPassword,
        confirmPassword: formData.confirmPassword,
        profileImage: formData.profileImage || ''
      };
      
      await apiClient.put('/user/info', requestData, {
        headers: { 'Content-Type': 'application/json' },
      });
      alert('비밀번호가 성공적으로 변경되었습니다. 다시 로그인 해주세요.');
      setFormData({ ...formData, currentPassword: '', newPassword: '', confirmPassword: '' });
      setShowPasswordFields(false);
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      navigate('/');
    } catch (err) {
      alert('비밀번호 변경에 실패했습니다.');
    }
  };

  if (loading) return <div>로딩 중...</div>;

  return (
    <>
      <UserHeader />
      <main className={styles.main}>
        <div className={styles.pageTitle}>프로필 수정</div>
        <div className={styles.profileImageSection}>
          <div className={styles.profileImgWrap}>
            <img src={profileImage} alt="프로필 이미지" className={styles.profileImg} />
            <input
              type="file"
              accept="image/*"
              id="profileImage"
              ref={fileInputRef}
              onChange={handleImageChange}
              className={styles.fileInput}
            />
            <label htmlFor="profileImage" className={styles.fileLabel}>
              이미지 변경
            </label>
          </div>
        </div>
        <form className={styles.editForm} onSubmit={handleSubmit}>
          <div className={styles.profileCardColumn}>
            <div className={styles.profileCardLeft}>
              <div className={styles.formGroup}>
                <label htmlFor="name">이름</label>
                <input type="text" id="name" name="name" value={formData.name || ''} onChange={handleInputChange} />
                {errors.name && <div className={styles.errorMsg}>{errors.name}</div>}
              </div>
              <div className={styles.formGroup}>
                <label htmlFor="phone">휴대폰 번호</label>
                <input type="text" id="phone" name="phone" value={formData.phone || ''} onChange={handleInputChange} placeholder="010-1234-5678" />
                {errors.phone && <div className={styles.errorMsg}>{errors.phone}</div>}
              </div>
              <div className={styles.formGroup}>
                <button type="button" className={styles.passwordToggleBtn} onClick={() => setShowPasswordFields((v) => !v)}>
                  {showPasswordFields ? '비밀번호 변경 취소' : '비밀번호 변경'}
                </button>
                {showPasswordFields && (
                  <div className={styles.passwordFields}>
                    <input type="password" name="currentPassword" placeholder="현재 비밀번호" value={formData.currentPassword} onChange={handleInputChange} autoComplete="current-password" />
                    {errors.currentPassword && <div className={styles.errorMsg}>{errors.currentPassword}</div>}
                    <input type="password" name="newPassword" placeholder="새 비밀번호 (6자 이상)" value={formData.newPassword} onChange={handleInputChange} autoComplete="new-password" />
                    {errors.newPassword && <div className={styles.errorMsg}>{errors.newPassword}</div>}
                    <input type="password" name="confirmPassword" placeholder="새 비밀번호 확인" value={formData.confirmPassword} onChange={handleInputChange} autoComplete="new-password" />
                    {errors.confirmPassword && <div className={styles.errorMsg}>{errors.confirmPassword}</div>}
                    <button type="button" className={styles.saveBtn} onClick={handlePasswordChange}>비밀번호 변경</button>
                  </div>
                )}
              </div>
            </div>
          </div>
          <div className={styles.formActionsInline}>
            <button type="submit" className={styles.saveBtn}>저장</button>
            <button type="button" className={styles.cancelBtn} onClick={handleCancel}>취소</button>
          </div>
        </form>
      </main>
    </>
  );
};

export default UserFormPage; 