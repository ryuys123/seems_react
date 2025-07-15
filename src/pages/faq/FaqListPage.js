// src/pages/faq/FaqListPage.js  : FAQ 목록 출력 페이지
import React, { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom"; // page 에서 page 바꾸기할 때 사용
import apiClient from "../../utils/axios"; // 공지 목록 조회용
import { AuthContext } from "../../AuthProvider"; //공유자원 가져오기 위함import UserHeader from "../../components/common/UserHeader"; // 헤더

import styles from "./FaqListPage.module.css"; // css 사용
import UserHeader from "../../components/common/UserHeader"; // 헤더
import PagingView from "../../components/common/PagingView"; //목록 아래 페이징 출력 처리용

function FaqListPage({ searchResults }) {
  const [boards, setBoards] = useState([]); // 게시글 데이터를 저장할 상태
  const [pagingInfo, setPagingInfo] = useState({
    currentPage: 1,
    maxPage: 1,
    startPage: 1,
    endPage: 1,
  });

  //현재 동작 상태 관리 (list or search)
  const [isSearchMode, setIsSearchMode] = useState(false);
  const [loading, setLoading] = useState(true); // 로딩 상태 관리
  const [error, setError] = useState(null); // 에러 상태 관리
  const ERROR_MESSAGE = "게시글을 불러오는 데 실패했습니다.";

  const { isLoggedIn, secureApiRequest } = useContext(AuthContext); // AuthProvider 에서 가져오기

  const navigate = useNavigate(); //페이지 이동을 위한 navigate 함수 선언함

  // 서버에서 게시글 목록 (기본 1page) 데이터를 가져오는 함수
  const fetchBoards = async (page) => {
    try {
      setLoading(true); // 로딩 상태 시작
      const response = await secureApiRequest(`/faq?page=${page}`, {
        method: "GET",
      }); // Spring Boot 서버 URL
      setBoards(response.data.list); // 응답 데이터를 상태로 설정  //boards = response.data.list; 과 같음
      setPagingInfo(response.data.paging); //서버에서 제공하는 페이징 정보
      console.log(response.data.paging);
      setIsSearchMode(false); // 일반 목록 조회 모드 지정
    } catch (err) {
      setError(ERROR_MESSAGE);
    } finally {
      setLoading(false); // 로딩 상태 종료, loading = false; 과 같음
    }
  };

  //검색 결과가 변경되면 상태 업데이트 코드 추가함
  // 컴포넌트가 처음 렌더링될 때 fetchNotices 호출
  // window.onload 될때 (jquery.document.ready 과 같음)
  useEffect(() => {
    if (searchResults) {
      //검색 결과가 전달되면 검색 모드로 전환 처리함
      setBoards(searchResults.list || []);
      setPagingInfo(searchResults.paging || {});
      setIsSearchMode(true); //검색 모드로 설정
      setLoading(false);
    } else {
      // 초기 로드 또는 일반 조회
      fetchBoards(1);
    }
  }, [searchResults]);

  //페이지 변경 핸들러 : 클릭한 page 의 목록을 요청 처리함 (일반 목록 페이지 요청 또는 검색 목록 페이지 요청)
  const handlePageChange = async (page) => {
    try {
      setLoading(true);
      if (isSearchMode) {
        // 검색 목록 페이지 요청
        const response = await secureApiRequest("/board/search/title", {
          method: "GET",
          body: {
            action: searchResults.action,
            keyword: searchResults.keyword,
            page,
          },
        });
        setBoards(response.data.list || []);
        setPagingInfo(response.data.paging || {});
      } else {
        fetchBoards(page); //일반 목록 페이지 요청
      }
    } catch (error) {
      setError("페이징 요청 실패!");
    } finally {
      setLoading(false);
    }
  };

  // 목록 버튼 클릭시 작동할 함수 (핸들러)
  const handleListButtonClick = () => {
    // 검색 결과 초기화 및 일반 조회로 전환
    setIsSearchMode(false);
    fetchBoards(1);
  };

  //제목 클릭시 상세보기 이동
  // const handleTitleClick = (boardNum) => {
  //   // url path 와 ${변수명} 를 같이 사용시에는 반드시 빽틱(`)을 표시해야 함 (작은따옴표 아님 : 주의)
  //   navigate(/board/detail/${boardNum}); //상세 페이지로 이동 처리 지정
  //   //라우터로 등록함
  // };
  const handleRowClick = (faqNo) => navigate(`/faqd/${faqNo}`);

  //글쓰기 버튼 클릭시 글쓰기 페이지로 이동동
  const handleWriteClick = () => {
    navigate("/board/write"); //글쓰기 페이지로 이동 처리 지정, 라우터로 등록해야 함
  };

  if (loading) {
    return <div className={styles.loading}>로딩 중...</div>; // 로딩 표시
  }

  return (
    <div className={styles.container}>
      <UserHeader />
      <br></br>
      <h1 className={styles.pageTitle}>FAQ 1:1 문의 게시판</h1>
      <div className={styles.subText}>본인이 작성한 문의만 볼 수 있습니다.</div>
      <button className={styles.writeButton} onClick={() => navigate("/faqw")}>
        질문 작성하기
      </button>
      <table className={styles.faqTable}>
        <colgroup>
          <col style={{ width: "15%" }} />
          <col style={{ width: "50%" }} />
          <col style={{ width: "20%" }} />
          <col style={{ width: "15%" }} />
        </colgroup>
        <thead>
          <tr>
            <th>작성일</th>
            <th>제목</th>
            <th>카테고리</th>
            <th>상태</th>
          </tr>
        </thead>
        <tbody>
          {error ? (
            <tr>
              <td colSpan="4" className={styles.noData}>
                {error}
              </td>
            </tr>
          ) : boards.length === 0 ? (
            <tr>
              <td colSpan="4" className={styles.noData}>
                게시글이 없습니다.
              </td>
            </tr>
          ) : (
            boards.map((faq) => (
              <tr
                key={faq.faqNo}
                onClick={() => handleRowClick(faq.faqNo)}
                className={styles.faqRow}
              >
                <td>{faq.faqDate}</td>
                <td>{faq.title}</td>
                <td>{faq.category}</td>
                <td>
                  <span
                    className={
                      faq.status === "ANSWERED"
                        ? styles.statusDone
                        : faq.status === "CLOSED"
                          ? styles.statusClosed
                          : styles.statusWait
                    }
                  >
                    {faq.status === "PENDING"
                      ? "답변대기"
                      : faq.status === "ANSWERED"
                        ? "답변완료"
                        : faq.status === "CLOSED"
                          ? "종료"
                          : "알 수 없음"}
                  </span>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>

      <PagingView
        currentPage={pagingInfo.currentPage || 1}
        totalPage={pagingInfo.maxPage || 1}
        startPage={pagingInfo.startPage || 1}
        endPage={pagingInfo.endPage || 1}
        onPageChange={(page) => handlePageChange(page)}
      />
    </div>
  );
}

export default FaqListPage;
