// src/pages/notice/NoticeDetailPage.js : 공지글 상세보기 페이지
import React, { useState, useEffect, useContext, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
// useParams : 이전 페이지에서 전달온 파라메타 값을 꺼내서 사용하기 위함
// useNavigete : 버튼 클릭시 다른 페이지로 이동 처리하기 위함 (location.href 역할을 하는 훅임)
import apiClient from "../../utils/axios";
import { AuthContext } from "../../AuthProvider";

import styles from "./NoticeDetailPage.module.css";
import UserHeader from "../../components/common/UserHeader"; // 헤더

// 함수형 컴포넌트 작성 방법 2가지
// 1. function 컴포넌트이름() {}
// 2. const 컴포넌트이름 = () => {};

function NoticeDetailPage() {
  // 전역 상태 관리자에서 필요한 정보 가져오기
  const { isLoggedIn, role, secureApiRequest } = useContext(AuthContext);

  // url 에서 no 파라메터 값 추출함
  const { noticeNo } = useParams();

  // 이전 페이지로 이동하기 위해 useHistory() 사용할 수 있음 (React 6 이상에서는 deprecated 임)
  // useNavigete() 사용함 : 이전 페이지로 이동, 다른 페이지로 이동에 사용함
  const navigate = useNavigate();

  // 지역 상태 관리 변수와 함수 준비
  const [notice, setNotice] = useState(null); //공지 데이터 저장할 상태 변수임
  const [error, setError] = useState(null); //에러 메세지 저장용 상태 변수임

  const hasFetched = useRef(false); //  요청 중복 방지용 ref (개발모드에서 2번 실행으로 인해 조회수 2씩 증가 방지)

  useEffect(() => {
    if (hasFetched.current) return; // 이미 실행됐으면 아무것도 안함 (개발모드 2번실행 방지)
    hasFetched.current = true; // 최초 실행에서만 true로 바꿈

    // 서버측에 해당 번호에 대한 공지글 비동기 요청하고, 결과 받아서 notice 업데이트하는 함수 작성함
    const fetchNoticeDetail = async () => {
      console.log("noticeNo : ", noticeNo);

      try {
        const response = await apiClient.get(`/notice/detail/${noticeNo}`);
        setNotice(response.data);
        console.log(response.data);
      } catch (error) {
        setError("공지글 상세 조회 실패!");
        console.error(error);
      }
    };

    fetchNoticeDetail();
  }, [noticeNo]); // useEffect()

  // 수정페이지로 이동 버튼 클릭시 작동하는 핸들러
  const handleMoveEditPage = () => {
    // 라우터에 path 지정은 반드시 빽틱 사용
    navigate(`/noticeu/${noticeNo}`);
  };

  //삭제하기 버튼 클릭시 작동하는 핸들러 추가
  const handleDelete = async () => {
    if (window.confirm("정말 삭제하시겠습니까?")) {
      try {
        console.log("delete : ", notice.renameFilePath);
        await secureApiRequest(
          `/admin/notice/${noticeNo}?rfile=${encodeURIComponent(notice.renameFilePath)}`,
          {
            method: "DELETE",
          }
        );
        // 삭제 요청 성공하면, 공지 목록 페이지로 이동
        navigate("/notice");
      } catch (error) {
        console.error("삭제 요청 중 오류 발생 : ", error);
      }
    }
  };

  const handleBack = () => {
    navigate("/notice");
  };

  //첨부파일명 클릭시 다운로드 요청 처리용 핸들러 함수
  const handleFileDownload = async (originalFileName, renameFileName) => {
    try {
      const response = await apiClient.get("/notice/nfdown", {
        params: {
          ofile: originalFileName,
          rfile: renameFileName,
        },
        responseType: "blob", //파일 다운로드를 위한 설정
      });

      //파일 다운로드 처리
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", originalFileName);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error("File download error : ", error);
      alert("파일 다운로드에 실패했습니다.");
    }
  };

  if (!notice) {
    return <div className={styles.loading}>로딩중....</div>;
  }

  if (error) {
    return <div className={styles.error}>{error}</div>;
  }

  return (
    <div className={styles.container}>
      <UserHeader />

      <table className={styles.table}>
        <colgroup>
          <col style={{ width: "15%" }} />
          <col style={{ width: "85%" }} />
        </colgroup>
        <tbody>
          <tr>
            <td colSpan={2} className={styles.title}>
              {notice.importance === "Y" && (
                <span className={styles.important}>[긴급] </span>
              )}
              {notice.title}
            </td>
          </tr>
          <tr>
            <th>날짜</th>
            <td>{notice.noticeDate}</td>
          </tr>
          <tr>
            <th>내용</th>
            <td>{notice.content}</td>
          </tr>
          <tr>
            <th>첨부파일</th>
            <td>
              {notice.originalFilePath &&
              notice.originalFilePath !== "null" &&
              notice.originalFilePath !== "" ? (
                <div className={styles.attachmentContainer}>
                  <button
                    className={styles.attachmentButton}
                    onClick={() =>
                      handleFileDownload(
                        notice.originalFilePath,
                        notice.renameFilePath
                      )
                    }
                  >
                    <svg className={styles.attachmentIcon} viewBox="0 0 24 24">
                      <path d="M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z" />{" "}
                    </svg>
                    {notice.originalFilePath}
                  </button>
                </div>
              ) : (
                <span className={styles.attachmentText}>첨부파일 없음</span>
              )}
            </td>
          </tr>
          <tr>
            <th>조회수</th>
            <td>{notice.readCount}</td>
          </tr>
        </tbody>
      </table>

      {/* 로그인한 사용자의 role 이 ADMIN 이면, 수정 및 삭제 버튼 표시함 */}
      <div className={styles.buttonGroup}>
        {isLoggedIn && role === "ADMIN" && (
          <>
            <button className={styles.button} onClick={handleMoveEditPage}>
              수정 페이지로 이동
            </button>
            <button className={styles.button} onClick={handleDelete}>
              삭제하기
            </button>
          </>
        )}
        <button className={styles.button} onClick={handleBack}>
          이전으로
        </button>
      </div>
    </div>
  );
}

export default NoticeDetailPage;
