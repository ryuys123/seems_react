// src/pages/faq/FaqDetailPage.js  : FAQ 상세보기 페이지
import React, { useEffect, useState, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
// useParams : 이전 페이지에서 전달온 파라메타 값을 꺼내서 사용하기 위함
// useNavigete : 버튼 클릭시 다른 페이지로 이동 처리하기 위함 (location.href 역할을 하는 훅임)
import { AuthContext } from "../../AuthProvider";
import apiClient from "../../utils/axios";

import styles from "./FaqDetailPage.module.css";
import UserHeader from "../../components/common/UserHeader"; // 헤더
import AdminHeader from "../../components/common/AdminHeader"; // 관리자헤더
import ReplySection from "./ReplySection"; //댓글

// 함수형 컴포넌트 작성 방법 2가지
// 1. function 컴포넌트이름() {}
// 2. const 컴포넌트이름 = () => {};

function FaqDetailPage() {
  // 전역 상태 관리자에서 필요한 정보 가져오기
  const { isLoggedIn, role, secureApiRequest, userid } =
    useContext(AuthContext);

  // url 에서 no 파라메터 값 추출함
  const { faqNo } = useParams();

  // 이전 페이지로 이동하기 위해 useHistory() 사용할 수 있음 (React 6 이상에서는 deprecated 임)
  // useNavigete() 사용함 : 이전 페이지로 이동, 다른 페이지로 이동에 사용함
  const navigate = useNavigate();

  // 지역 상태 관리 변수와 함수 준비
  const [faq, setFaq] = useState(null); //faq 데이터 저장할 상태 변수임
  const [error, setError] = useState(null); //에러 메세지 저장용 상태 변수임

  useEffect(() => {
    fetchFaqDetail();
    fetchRepliesAndCheckAdmin(); //관리자 댓글 여부
  }, [faqNo]); // useEffect()

  // 서버측에 해당 번호에 대한 공지글 비동기 요청하고, 결과 받아서 faq 업데이트하는 함수 작성함
  const fetchFaqDetail = async () => {
    try {
      const response = await apiClient.get(`/faq/detail/${faqNo}`);
      setFaq(response.data);
    } catch (error) {
      setError("공지글 상세 조회 실패!");
      console.error(error);
    }
  };

  // 수정페이지로 이동 버튼 클릭시 작동하는 핸들러
  const handleMoveEditPage = () => {
    // 라우터에 path 지정은 반드시 빽틱 사용
    navigate(`/faqu/${faqNo}`);
  };

  //삭제하기 버튼 클릭시 작동하는 핸들러 추가
  const handleDelete = async () => {
    if (window.confirm("정말 삭제하시겠습니까?")) {
      try {
        await apiClient.delete(`/faq/${faqNo}`);
        alert("문의글 삭제 성공!");
        navigate("/faq"); // 목록 페이지로 이동
      } catch (error) {
        console.error("삭제 요청 중 오류 발생 : ", error);
      }
    }
  };

  // 관리자가 댓글 단 여부
  const [adminReplied, setAdminReplied] = useState(false);

  const fetchRepliesAndCheckAdmin = async () => {
    try {
      const response = await apiClient.get(`/faq/detail/${faqNo}/replies`); // 댓글 목록
      const replies = response.data;

      const hasAdminReply = replies.some((reply) => reply.userid === "user001");
      setAdminReplied(hasAdminReply);
    } catch (error) {
      console.error("댓글 목록 조회 실패", error);
    }
  };

  // 상담종료버튼
  const handleCloseFaq = async () => {
    if (window.confirm("상담을 종료하시겠습니까?")) {
      try {
        await apiClient.put(`/faq/detail/${faqNo}/close`);
        alert("상담이 종료되었습니다.");
        // 상태값 반영을 위해 다시 불러오기
        fetchFaqDetail();
      } catch (error) {
        alert("상담 종료 처리 중 오류 발생");
        console.error(error);
      }
    }
  };

  const handleBack = () => {
    navigate("/faq");
  };

  if (!faq) {
    return <div className={styles.loading}>로딩중....</div>;
  }

  if (error) {
    return <div className={styles.error}>{error}</div>;
  }

  return (
    <div className={styles.container}>
      <>{role === "ADMIN" ? <AdminHeader /> : <UserHeader />}</> <br></br>
      <h2 className={styles.pageTitle}>FAQ 상세보기 페이지</h2>
      <div className={styles.card}>
        <h3 className={styles.title}>{faq.title}</h3>
        <p className={styles.meta}>
          카테고리: {faq.category} | 작성일: {faq.faqDate}
        </p>
        <p className={styles.content}>{faq.content}</p>

        <div className={styles.buttonGroup}>
          {isLoggedIn && userid === faq.userid && !adminReplied && (
            <>
              <button onClick={handleMoveEditPage}>수정</button>
            </>
          )}
          {isLoggedIn && userid === faq.userid && (
            <>
              <button onClick={handleDelete}>삭제</button>
            </>
          )}
          <button
            onClick={() => navigate(role === "ADMIN" ? "/adminfaq" : "/faq")}
          >
            목록
          </button>
          {isLoggedIn && userid === faq.userid && faq.status !== "CLOSED" && (
            <button className={styles.closeButton} onClick={handleCloseFaq}>
              상담 종료
            </button>
          )}
        </div>
        <h5 className={styles.ment}>
          상담 종료 시 버튼을 눌러주세요. 마지막 답변 후 7일이 지나면 자동으로
          상담이 종료됩니다.
        </h5>
      </div>
      <ReplySection
        faqNo={faqNo}
        questionUserId={faq.userid}
        faqStatus={faq.status}
      />
    </div>
  );
}

export default FaqDetailPage;
