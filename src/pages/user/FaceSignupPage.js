import React, { useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import styles from "./FaceSignupPage.module.css";
import axios from "axios";

const FaceSignupPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const signupInfo = location.state || {}; // 전달받은 회원정보

  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [step, setStep] = useState("idle"); // idle, camera, loading
  const [capturedImage, setCapturedImage] = useState(null);
  const [registerResult, setRegisterResult] = useState(null);

  // 버튼 클릭 핸들러
  const handleButtonClick = async () => {
    if (step === "idle") {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        videoRef.current.srcObject = stream;
        setStep("camera");
      } catch (err) {
        alert("웹캠 접근이 불가합니다.");
      }
    } else if (step === "camera") {
      setStep("loading");
      setRegisterResult(null);
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const context = canvas.getContext("2d");
      context.drawImage(video, 0, 0, canvas.width, canvas.height);
      const faceImageData = canvas.toDataURL("image/jpeg");
      setCapturedImage(faceImageData);

      // Spring Boot 서버에 페이스 회원가입 요청
      try {
        console.log("페이스 회원가입 요청 시작...");
        console.log("회원정보:", signupInfo);
        
        const requestData = {
          userId: signupInfo.userId,
          username: signupInfo.userName,
          phone: signupInfo.phone,
          password: signupInfo.userPwd,
          faceImageData: faceImageData,
        };
        
        console.log("요청 데이터:", requestData);
        
        const response = await axios.post("http://localhost:8888/seems/api/face/signup", requestData);
        
        console.log("페이스 회원가입 응답:", response.data);
        setRegisterResult(response.data);
        
        if (response.data.success) {
          alert("페이스 회원가입 성공! 이제 페이스로그인을 사용할 수 있습니다.");
          // 성공 시 대시보드로 이동
          setTimeout(() => {
            navigate('/userdashboard');
          }, 1500);
        } else {
          alert("페이스 회원가입 실패: " + (response.data.message || "다시 시도하세요."));
        }
      } catch (error) {
        console.error("페이스 회원가입 오류:", error);
        if (error.response) {
          // 서버에서 응답이 왔지만 오류인 경우
          console.error("서버 응답 오류:", error.response.data);
          alert("서버 오류: " + (error.response.data?.message || error.response.statusText));
        } else if (error.request) {
          // 요청은 보냈지만 응답이 없는 경우
          console.error("서버 연결 실패:", error.request);
          alert("서버 연결 실패: Spring Boot 서버가 실행 중인지 확인해주세요.");
        } else {
          // 요청 자체에 문제가 있는 경우
          console.error("요청 오류:", error.message);
          alert("요청 오류: " + error.message);
        }
      }
      setStep("idle");
    }
  };

  return (
    <div className={styles.faceSignupContainer}>
      <h2>페이스 회원가입</h2>
      <p>회원가입과 함께 얼굴을 등록하여 페이스 로그인을 사용할 수 있습니다.</p>
      
      <div style={{ marginBottom: '20px', padding: '10px', backgroundColor: '#f5f5f5' }}>
        <h4>회원정보 확인</h4>
        <p>사용자 ID: {signupInfo.userId}</p>
        <p>사용자명: {signupInfo.userName}</p>
        <p>전화번호: {signupInfo.phone}</p>
      </div>
      
      <video
        ref={videoRef}
        width={320}
        height={240}
        autoPlay
        style={{ border: "1px solid #ccc", display: step !== "idle" ? "block" : "none" }}
      />
      <canvas
        ref={canvasRef}
        width={320}
        height={240}
        style={{ display: "none" }}
      />
      {capturedImage && (
        <div>
          <h4>캡처된 이미지 미리보기</h4>
          <img src={capturedImage} alt="캡처" width={160} />
        </div>
      )}
      <button
        onClick={handleButtonClick}
        disabled={step === "loading"}
        className={styles.signupButton}
      >
        {step === "idle" && "페이스 회원가입 시작"}
        {step === "camera" && "캡처 및 회원가입"}
        {step === "loading" && "처리 중..."}
      </button>
      {registerResult && (
        <div className={registerResult.success ? styles.successMessage : styles.errorMessage}>
          {registerResult.success ? (
            <p>✅ {registerResult.message}</p>
          ) : (
            <p>❌ {registerResult.message}</p>
          )}
        </div>
      )}
    </div>
  );
};

export default FaceSignupPage;