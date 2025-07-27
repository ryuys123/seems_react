import React, { useState, useRef } from "react";
import styles from "./AdditionInfo.module.css";
import apiClient from "../../utils/axios";

const AdditionInfo = ({ open, onSubmit, onClose, socialUserInfo }) => {
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
  const fileInputRef = useRef(null);

  if (!open) return null;

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

  const handleSubmit = async () => {
    if (!validate()) return;

    setIsSubmitting(true);
    setError("");

    try {
      // Base64 데이터를 JSON으로 전송
      const requestData = {
        ...formData,
        profileImage: formData.profileImage || ''
      };

      // 소셜 사용자 정보도 함께 전송
      if (socialUserInfo) {
        requestData.socialId = socialUserInfo.socialId;
        requestData.socialProvider = socialUserInfo.provider;
        requestData.socialEmail = socialUserInfo.email;
      }

      const response = await apiClient.post('/user/social-signup', requestData, {
        headers: { 'Content-Type': 'application/json' },
      });

      if (response.status === 200) {
        // 성공 시 모달 닫고 대시보드로 이동
        if (onSubmit) onSubmit(response.data);
        onClose();
      }
    } catch (error) {
      console.error('추가 정보 저장 실패:', error);
      setError(error.response?.data?.message || '추가 정보 저장에 실패했습니다.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modalContent}>
        <h3>추가 정보 입력</h3>
        <p>소셜 회원가입을 위해 추가 정보를 입력해주세요.</p>
        
        <div className={styles.profileImgWrap}>
          <img 
            src={previewUrl || socialUserInfo?.profileImage || "https://via.placeholder.com/100"} 
            alt="프로필 이미지" 
            className={styles.profileImg}
          />
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

        <div className={styles.inputGroup}>
          <input
            type="text"
            name="userId"
            placeholder="아이디"
            value={formData.userId}
            onChange={handleChange}
            className={styles.input}
          />
          <input
            type="password"
            name="userPwd"
            placeholder="비밀번호"
            value={formData.userPwd}
            onChange={handleChange}
            className={styles.input}
          />
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
