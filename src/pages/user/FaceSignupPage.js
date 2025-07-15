import React, { useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import styles from "./FaceSignupPage.module.css";
import axios from "axios";

const FaceSignupPage = () => {
  const location = useLocation();
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
      const imageData = canvas.toDataURL("image/jpeg");
      setCapturedImage(imageData);

      // 서버 전송
      try {
        // 전달받은 회원정보와 캡처 이미지를 함께 전송
        const response = await axios.post("http://localhost:5000/api/face-signup", {
          user_id: signupInfo.userId,
          username: signupInfo.userName,
          phone: signupInfo.phone,
          password: signupInfo.userPwd,
          image_data: imageData,
        });
        setRegisterResult(response.data);
        if (response.data.success) {
          alert("얼굴 등록 성공! 이제 페이스로그인을 사용할 수 있습니다.");
        } else {
          alert("얼굴 등록 실패: " + (response.data.message || "다시 시도하세요."));
        }
      } catch (error) {
        alert("서버 오류: " + error.message);
      }
      setStep("idle");
    }
  };

  return (
    <div className={styles.faceSignupContainer}>
      <h2>얼굴 등록(회원가입)</h2>
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
      >
        {step === "idle" && "얼굴 등록"}
        {step === "camera" && "캡처 및 등록"}
        {step === "loading" && "등록 중..."}
      </button>
      {registerResult && (
        <div>
          {registerResult.success ? (
            <p style={{ color: "green" }}>등록 성공! 이제 페이스로그인을 사용할 수 있습니다.</p>
          ) : (
            <p style={{ color: "red" }}>등록 실패: {registerResult.message}</p>
          )}
        </div>
      )}
    </div>
  );
};

export default FaceSignupPage;
