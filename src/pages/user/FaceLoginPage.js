import React, { useRef, useState, useContext } from "react";
import { AuthContext } from "../../AuthProvider";
import styles from "./FaceLoginPage.module.css";
import axios from "axios";

const FaceLoginPage = () => {
  const { updateTokens } = useContext(AuthContext);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [step, setStep] = useState("idle"); // idle, camera, loading
  const [capturedImage, setCapturedImage] = useState(null);
  const [loginResult, setLoginResult] = useState(null);

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
      setLoginResult(null);
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const context = canvas.getContext("2d");
      context.drawImage(video, 0, 0, canvas.width, canvas.height);
      const faceImageData = canvas.toDataURL("image/jpeg");
      setCapturedImage(faceImageData);

      // Spring Boot 서버에 페이스 로그인 요청 (올바른 URL 사용)
      try {
        console.log("페이스 로그인 요청 시작...");
        const response = await axios.post("http://localhost:8888/seems/api/face/login", {
          faceImageData: faceImageData,
        });
        
        console.log("페이스 로그인 응답:", response.data);
        setLoginResult(response.data);
        
        if (response.data.success) {
          // 토큰을 로컬 스토리지에 저장
          localStorage.setItem("accessToken", response.data.accessToken);
          localStorage.setItem("refreshToken", response.data.refreshToken);
          localStorage.setItem("userId", response.data.userId);
          localStorage.setItem("userName", response.data.userName);
          
          // AuthProvider의 상태를 갱신
          updateTokens(response.data.accessToken, response.data.refreshToken);
          
          alert("페이스 로그인 성공! 환영합니다, " + response.data.userName + "님!");
          // 성공 시 메인 페이지로 이동
          window.location.href = "/";
        } else {
          alert("페이스 로그인 실패: " + (response.data.message || "다시 시도하세요."));
        }
      } catch (error) {
        console.error("페이스 로그인 오류:", error);
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
    <div className={styles.faceLoginContainer}>
      <h2>페이스 로그인</h2>
      <p>등록된 얼굴로 로그인하세요.</p>
      
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
        className={styles.loginButton}
      >
        {step === "idle" && "페이스 로그인 시작"}
        {step === "camera" && "캡처 및 로그인"}
        {step === "loading" && "로그인 중..."}
      </button>
      {loginResult && (
        <div className={loginResult.success ? styles.successMessage : styles.errorMessage}>
          {loginResult.success ? (
            <p>✅ {loginResult.message}</p>
          ) : (
            <p>❌ {loginResult.message}</p>
          )}
        </div>
      )}
    </div>
  );
};

export default FaceLoginPage;