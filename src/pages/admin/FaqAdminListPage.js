// src/pages/faq/FaqAdminListPage.js  : FAQ 목록 출력 페이지
import React, { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom"; // page 에서 page 바꾸기할 때 사용
import apiClient from "../../utils/axios"; // 공지 목록 조회용
import { AuthContext } from "../../AuthProvider"; //공유자원 가져오기 위함import UserHeader from "../../components/common/UserHeader"; // 헤더

import styles from "./FaqAdminListPage.module.css"; // css 사용
import UserHeader from "../../components/common/UserHeader"; // 헤더
import AdminHeader from "../../components/common/AdminHeader"; // 관리자헤더
import PagingView from "../../components/common/PagingView"; //목록 아래 페이징 출력 처리용

function FaqAdminListPage({ searchResults }) {
  const [boards, setBoards] = useState([]); //  게시글 상태로 통일
  const [pagingInfo, setPagingInfo] = useState({
    currentPage: 1,
    maxPage: 1,
    startPage: 1,
    endPage: 1,
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const ERROR_MESSAGE = "게시글을 불러오는 데 실패했습니다.";
  const [isSearchMode, setIsSearchMode] = useState(false); // 검색 모드 여부

  const [searchType, setSearchType] = useState("title");
  const [searchTerm, setSearchTerm] = useState("");
  const [begin, setbegin] = useState("");
  const [end, setend] = useState("");
  // 상태 검색용 상태변수 추가
  const [statusFilter, setStatusFilter] = useState(""); // "", "PENDING", "ANSWERED", "CLOSED"

  const { role, secureApiRequest } = useContext(AuthContext);
  const navigate = useNavigate();

  //  공통 목록 호출 함수
  const fetchBoards = async (page) => {
    try {
      setLoading(true);
      const response = await secureApiRequest(
        `/faq?page=${page}&role=${role}`,
        {
          method: "GET",
        }
      );
      setBoards(response.data.list);
      setPagingInfo(response.data.paging);
      setIsSearchMode(false);
    } catch (err) {
      setError(ERROR_MESSAGE);
    } finally {
      setLoading(false);
    }
  };

  //  검색 버튼 클릭 시 목록 바로 업데이트
  const handleSearch = async () => {
    try {
      setLoading(true);
      let response;

      if (searchType === "date") {
        response = await apiClient.get(`/faq/search/date`, {
          params: { action: searchType, begin, end },
        });
      } else if (searchType === "status") {
        response = await apiClient.get(`/faq/search/status`, {
          params: { action: searchType, keyword: statusFilter },
        });
      } else {
        response = await apiClient.get(`/faq/search/${searchType}`, {
          params: { action: searchType, keyword: searchTerm },
        });
      }

      setBoards(response.data.list || []);
      setPagingInfo(response.data.paging || {});
      setIsSearchMode(true);
    } catch (error) {
      console.error("검색 요청 실패: ", error);
      setBoards([]);
      setPagingInfo({});
      setIsSearchMode(true);
    } finally {
      setLoading(false);
    }
  };

  //  최초 렌더링 또는 검색결과 바뀔 때 실행
  useEffect(() => {
    if (searchResults) {
      // 검색 결과가 존재하는 경우
      setBoards(searchResults.list || []);
      setPagingInfo(searchResults.paging || {});
      setIsSearchMode(true);
      setLoading(false);
    } else if (role) {
      // 일반 목록 초기 로딩
      fetchBoards(1);
    }
  }, [searchResults, role]);

  //  페이징 처리
  const handlePageChange = async (page) => {
    try {
      setLoading(true);
      if (isSearchMode) {
        let response;
        if (searchType === "date") {
          response = await apiClient.get(`/faq/search/date`, {
            params: { action: searchType, begin, end, page },
          });
        } else {
          response = await apiClient.get(`/faq/search/${searchType}`, {
            params: { action: searchType, keyword: searchTerm, page },
          });
        }
        setBoards(response.data.list || []);
        setPagingInfo(response.data.paging || {});
      } else {
        fetchBoards(page);
      }
    } catch (error) {
      setError("페이징 요청 실패!");
    } finally {
      setLoading(false);
    }
  };

  //  목록 클릭 → 상세 페이지 이동
  const handleRowClick = (faqNo) => navigate(`/faqd/${faqNo}`);

  // 목록 버튼 클릭시 작동할 핸들러
  const handleListButtonClick = () => {
    setIsSearchMode(false); // 검색 모드에서 일반 모드로 바꿈
    fetchBoards(1); // 목록 버튼 클릭시 1페이지 목록 조회 출력 처리함
  };

  if (loading) return <div className={styles.loading}>로딩 중...</div>;

  return (
    <div className={styles.container}>
      <>{role === "ADMIN" ? <AdminHeader /> : <UserHeader />}</> <br></br>
      <h1 className={styles.pageTitle}>관리자 FAQ 게시판</h1>
      {/* 검색 영역 */}
      <div className={styles.searchContainer}>
        <div className={styles.searchForm}>
          <select
            className={styles.searchSelect}
            value={searchType}
            onChange={(e) => {
              setSearchType(e.target.value);
              setSearchTerm(""); // 검색어 초기화
              setbegin("");
              setend(""); // 날짜 초기화
              setStatusFilter(""); // 상태 초기화
            }}
          >
            <option value="title">제목</option>
            <option value="content">내용</option>
            <option value="date">등록날짜</option>
            <option value="status">답변상태</option>
          </select>

          {searchType === "date" ? (
            <>
              <input
                type="date"
                className={styles.searchInput}
                value={begin}
                onChange={(e) => setbegin(e.target.value)}
                placeholder="시작 날짜"
              />
              <span style={{ margin: "0 8px" }}>~</span>
              <input
                type="date"
                className={styles.searchInput}
                value={end}
                onChange={(e) => setend(e.target.value)}
                placeholder="끝나는 날짜"
              />
            </>
          ) : searchType === "status" ? (
            <select
              className={styles.searchInput}
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="">전체</option>
              <option value="PENDING">답변대기</option>
              <option value="ANSWERED">답변완료</option>
              <option value="CLOSED">종료</option>
            </select>
          ) : (
            <input
              type="text"
              className={styles.searchInput}
              placeholder={`${searchType === "title" ? "제목" : "내용"}을 입력하세요`}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          )}

          <button className={styles.searchButton} onClick={handleSearch}>
            검색
          </button>
        </div>
      </div>
      <button className={styles.listbutton} onClick={handleListButtonClick}>
        목록
      </button>
      {/* FAQ 글 영역 */}
      <table className={styles.faqTable}>
        <colgroup>
          <col style={{ width: "15%" }} />
          <col style={{ width: "15%" }} />
          <col style={{ width: "40%" }} />
          <col style={{ width: "15%" }} />
          <col style={{ width: "15%" }} />
        </colgroup>
        <thead>
          <tr>
            <th>작성일</th>
            <th>작성자</th>
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
                <td>{faq.userid}</td>
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

export default FaqAdminListPage;
