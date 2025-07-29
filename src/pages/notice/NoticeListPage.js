// src/pages/notice/NoticeListPage.js  : 공지글 목록 출력 페이지
import React, { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom"; // page 에서 page 바꾸기할 때 사용
import apiClient from "../../utils/axios"; // 공지 목록 조회용
import { AuthContext } from "../../AuthProvider"; //공유자원 가져오기 위함
import styles from "./NoticeListPage.module.css"; // css 사용
import UserHeader from "../../components/common/UserHeader"; // 헤더
import AdminHeader from "../../components/common/AdminHeader"; // 관리자헤더
import PagingView from "../../components/common/PagingView"; //목록 아래 페이징 출력 처리용

function NoticeListPage({ searchResults }) {
  // 글쓰기 버튼 표시를 위해 로그인상태와 role 정보 가져오기
  const { isLoggedIn, role } = useContext(AuthContext); //AuthProvider 에서 가져오기

  // 이 페이지에서 사용할 로컬 상태변수 준비
  const [notices, setNotices] = useState([]); // 서버로 부터 받은 공지 목록 데이터 저장할 상태
  // notices = []; 초기화 선언함
  const [pagingInfo, setPagingInfo] = useState({
    currentPage: 1,
    maxPage: 1,
    startPage: 1,
    endPage: 1,
  }); // 서버로 부터 받은 페이징(paging) 정보 저장용 상태

  //현재 동작 상태 관리 변수
  const [loading, setLoading] = useState(false); //로딩 상태 확인용
  const [error, setError] = useState(null); //에러 메세지 저장용
  const [isSearchMode, setIsSearchMode] = useState(false); //검색 모드인지 아닌지 확인용
  // 검색 타입과 검색어 상태 분리
  const [searchType, setSearchType] = useState("title");
  const [searchTerm, setSearchTerm] = useState("");
  // 날짜 검색용 상태 추가
  const [begin, setbegin] = useState("");
  const [end, setend] = useState("");
  const navigate = useNavigate(); // 페이지 이동을 위함

  //서버로 공지목록 조회용 함수 (기본 1페이지)
  const fetchNotices = async (page) => {
    try {
      setLoading(true); //로딩 상태 시작

      const response = await apiClient.get(`/notice?page=${page}`);
      setNotices(response.data.list);
      setPagingInfo(response.data.paging);
      console.log(response.data.list);
      console.log(response.data.paging);

      //일반 목록 조회 모드로 지정
      setIsSearchMode(false);
    } catch (err) {
      setError("공지 목록 조회 실패!");
    } finally {
      setLoading(false); //로딩 상태 종료
    }
  };

  // 검색 버튼 클릭하면 핸들러 추가 : 서버로 검색 요청을 함
  const handleSearch = async () => {
    try {
      setLoading(true);
      let response;
      if (searchType === "date") {
        response = await apiClient.get(`/notice/search/date`, {
          params: { action: searchType, begin, end },
        });
      } else {
        response = await apiClient.get(`/notice/search/${searchType}`, {
          params: { action: searchType, keyword: searchTerm },
        });
      }
      setNotices(response.data.list || []);
      setPagingInfo(response.data.paging || {});
      setIsSearchMode(true);
    } catch (error) {
      console.error("검색 요청 실패 : ", error);
      setNotices([]); // 에러가 나도 테이블 렌더링을 위해 빈 배열로 설정
      setPagingInfo({}); // 페이징 정보도 초기화
      setIsSearchMode(true); // 검색모드 유지
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (searchResults) {
      //검색 결과가 전달되면 검색 모드로 전환 처리함
      setIsSearchMode(true); //검색 모드로 설정
      setNotices(searchResults.list || []);
      setPagingInfo(searchResults.paging || {});
      setLoading(false); //로딩 완료
    } else {
      // 초기 로드 및 일반 조회
      fetchNotices(1);
    }
  }, [searchResults]);

  const handleWriteClick = () => {
    navigate("/noticew"); //글쓰기 페이지로 이동 처리 (라우터로 등록해야 함)
  };

  // 목록 버튼 클릭시 작동할 핸들러
  const handleListButtonClick = () => {
    setIsSearchMode(false); // 검색 모드에서 일반 모드로 바꿈
    fetchNotices(1); // 목록 버튼 클릭시 1페이지 목록 조회 출력 처리함
  };

  const handleTitleClick = (noticeNo) => {
    //상세보기 페이지로 이동 처리 라우터 지정함
    // url path 와 ${변수명} 사용시 반드시 빽틱 사용해야 함
    navigate(`/noticed/${noticeNo}`);
  };

  //페이징뷰에서 페이지 숫자 클릭시 클릭한 페이지에 대한 목록 요청 처리용 핸들러 함수
  // 일반 조회 또는 검색 조회로 페이지 요청 구분 필요함
  const handlePageChange = async (page) => {
    try {
      setLoading(true); //로딩 시작
      if (isSearchMode) {
        let response;
        if (searchType === "date") {
          response = await apiClient.get(`/notice/search/date`, {
            params: {
              action: searchType,
              begin,
              end,
              page,
            },
          });
        } else {
          response = await apiClient.get(`/notice/search/${searchType}`, {
            params: {
              action: searchType,
              keyword: searchTerm,
              page,
            },
          });
        }
        setNotices(response.data.list || []);
        setPagingInfo(response.data.paging || {});
      } else {
        fetchNotices(page); // 일반 목록 조회 요청
      }
    } catch (error) {
      setError("페이징 요청 실패");
    } finally {
      setLoading(false); // 로딩 완료
    }
  };

  if (loading) {
    return <div className={styles.loading}>로딩 중....</div>; //로딩 출력
  }

  if (error) {
    return <div className={styles.error}>{error}</div>; //에러 메세지 출력
  }

  return (
    <div className={styles.noticeContainer}>
      <>{role === "ADMIN" ? <AdminHeader /> : <UserHeader />}</>{" "}
      <main className={styles.main}>
        <h1 className={styles.pageTitle}>공지사항</h1>

        {/* 검색 영역 */}
        <div className={styles.searchContainer}>
          <div className={styles.searchForm}>
            <select
              className={styles.searchSelect}
              value={searchType}
              onChange={(e) => setSearchType(e.target.value)}
            >
              <option value="title">제목</option>
              <option value="content">내용</option>
              <option value="date">등록날짜</option>
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

        {/* 글쓰기 버튼 : role 이 'ADMIN' 일 때만 보여지게 함 */}
        <div className={styles.buttonGroup}>
          {isLoggedIn && role === "ADMIN" && (
            <button className={styles.button} onClick={handleWriteClick}>
              글쓰기
            </button>
          )}
          <button className={styles.button} onClick={handleListButtonClick}>
            목록
          </button>
        </div>
        <br></br>

        <table className={styles.noticeList}>
          <colgroup>
            <col style={{ width: "10%" }} />
            <col style={{ width: "50%" }} />
            <col style={{ width: "20%" }} />
            <col style={{ width: "20%" }} />
          </colgroup>
          <thead>
            <tr className={styles.tableHeaderRow}>
              <th>번호</th>
              <th>제목</th>
              <th>날짜</th>
              <th>조회수</th>
            </tr>
          </thead>
          <tbody>
            {notices.length > 0 ? (
              notices.map((notice) => (
                <tr
                  key={notice.noticeNo}
                  className={`${styles.noticeItem} ${
                    notice.importance === "Y" ? styles.importantRow : ""
                  }`}
                  onClick={() => handleTitleClick(notice.noticeNo)}
                >
                  <td className={styles.noticeNo}>{notice.noticeNo}</td>
                  <td className={styles.title}>
                    {notice.importance === "Y" && (
                      <span className={styles.important}>[긴급] </span>
                    )}
                    {/* 이제 행 전체에 볼드가 적용되므로, 이 span은 단순히 텍스트를 표시합니다. */}
                    {/* 만약 [긴급]과 제목 텍스트 외에 다른 텍스트도 볼드 처리될 필요가 없다면, */}
                    {/* 이 <span> 태그를 <strong>으로 바꾸거나, 텍스트만 남길 수 있습니다. */}
                    {/* 하지만, 보통 전체 행 볼드를 할 때는 단순 텍스트로 두는 경우가 많습니다. */}
                    {notice.title}
                  </td>
                  <td className={styles.noticeDate}>{notice.noticeDate}</td>
                  <td className={styles.readCount}>{notice.readCount}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="4" className={styles.noData}>
                  해당 공지사항 없음!
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </main>
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

export default NoticeListPage;
