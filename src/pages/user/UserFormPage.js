import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import UserHeader from '../../components/common/UserHeader';
import logoSeems from '../../assets/images/logo_seems.png';
import styles from './UserFormPage.module.css';
import apiClient from '../../utils/axios';

const initialForm = {
  name: '',
  email: '',
  phone: '',
  notification: true,
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

  // 사용자 정보 불러오기 (마운트 시)
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await apiClient.get('/user/info');
        const user = res.data;
        setFormData({
          name: user.userName || '',
          email: user.email || '',
          phone: user.phone || '',
          notification: true,
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
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value || '',
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (evt) => {
        setProfileImage(evt.target.result);
        setFormData((prev) => ({ ...prev, profileImage: evt.target.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.name) newErrors.name = '이름을 입력하세요.';
    if (!formData.email) newErrors.email = '이메일을 입력하세요.';
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
    try {
      await apiClient.put('/user/info', {
        userName: formData.name || '',
        email: formData.email || '',
        phone: formData.phone || '',
        profileImage: formData.profileImage || '',
        // notification: formData.notification, // 필요시 추가
      });
      alert('프로필이 성공적으로 수정되었습니다.');
      navigate('/userprofile');
    } catch (err) {
      alert('프로필 수정에 실패했습니다.');
    }
  };

  const handleCancel = () => {
    navigate('/userprofile');
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
                <label htmlFor="email">이메일</label>
                <input type="email" id="email" name="email" value={formData.email || ''} onChange={handleInputChange} />
                {errors.email && <div className={styles.errorMsg}>{errors.email}</div>}
              </div>
              <div className={styles.formGroup}>
                <label htmlFor="phone">휴대폰 번호</label>
                <input type="text" id="phone" name="phone" value={formData.phone || ''} onChange={handleInputChange} placeholder="010-1234-5678" />
                {errors.phone && <div className={styles.errorMsg}>{errors.phone}</div>}
              </div>
              <div className={styles.formGroup}>
                <span className={styles.settingsLabel}>알림</span>
                <label className={styles.toggleSwitch}>
                  <input type="checkbox" name="notification" checked={formData.notification} onChange={handleInputChange} />
                  <span className={styles.toggleSlider}></span>
                </label>
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