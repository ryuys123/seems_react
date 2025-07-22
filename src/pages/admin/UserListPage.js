// src/pages/admin/UserListPage.js  : 사용자 정보 조회 페이지
import React, { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom"; // page 에서 page 바꾸기할 때 사용
import apiClient from "../../utils/axios"; // 공지 목록 조회용
import { AuthContext } from "../../AuthProvider"; //공유자원 가져오기 위함
import styles from "./UserListPage.module.css"; // css 사용
import AdminHeader from "../../components/common/AdminHeader"; // 관리자헤더
import PagingView from "../../components/common/PagingView"; //목록 아래 페이징 출력 처리용

function UserListPage({ searchResults }) {
  const { isLoggedIn, role } = useContext(AuthContext); //AuthProvider 에서 가져오기

  // 이 페이지에서 사용할 로컬 상태변수 준비
  const [users, setUsers] = useState([]); // 서버로 부터 받은 공지 목록 데이터 저장할 상태
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
  //   const navigate = useNavigate(); // 페이지 이동을 위함
  //모달 상태 추가
  const [selectedUser, setSelectedUser] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  //서버로 유저목록 조회용 함수 (기본 1페이지)
  const fetchUsers = async (page) => {
    try {
      setLoading(true); //로딩 상태 시작

      const response = await apiClient.get(`/admin/ulist?page=${page}`);
      setUsers(response.data.list);
      setPagingInfo(response.data.paging);
      console.log(response.data.list);
      console.log(response.data.paging);

      //일반 목록 조회 모드로 지정
      setIsSearchMode(false);
    } catch (err) {
      setError("사용자 목록 조회 실패!");
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
        response = await apiClient.get(`/user/search/date`, {
          params: { action: searchType, begin, end },
        });
      } else {
        response = await apiClient.get(`/notice/search/${searchType}`, {
          params: { action: searchType, keyword: searchTerm },
        });
      }
      setUsers(response.data.list || []);
      setPagingInfo(response.data.paging || {});
      setIsSearchMode(true);
    } catch (error) {
      console.error("검색 요청 실패 : ", error);
      setUsers([]); // 에러가 나도 테이블 렌더링을 위해 빈 배열로 설정
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
      setUsers(searchResults.list || []);
      setPagingInfo(searchResults.paging || {});
      setLoading(false); //로딩 완료
    } else {
      // 초기 로드 및 일반 조회
      fetchUsers(1);
    }
  }, [searchResults]);

  // 목록 버튼 클릭시 작동할 핸들러
  const handleListButtonClick = () => {
    setIsSearchMode(false); // 검색 모드에서 일반 모드로 바꿈
    fetchUsers(1); // 목록 버튼 클릭시 1페이지 목록 조회 출력 처리함
  };

  const handleTitleClick = (user) => {
    //상세보기 페이지로 이동 처리 라우터 지정함
    // url path 와 ${변수명} 사용시 반드시 빽틱 사용해야 함
    setSelectedUser(user);
    setIsModalOpen(true);
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
        setUsers(response.data.list || []);
        setPagingInfo(response.data.paging || {});
      } else {
        fetchUsers(page); // 일반 목록 조회 요청
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
      <AdminHeader />
      <main className={styles.main}>
        <h1 className={styles.pageTitle}>사용자 정보 관리</h1>

        {/* 검색 영역 */}
        <div className={styles.searchContainer}>
          <div className={styles.searchForm}>
            <select
              className={styles.searchSelect}
              value={searchType}
              onChange={(e) => setSearchType(e.target.value)}
            >
              <option value="name">이름 또는 아이디</option>
              <option value="date">가입일</option>
              <option value="activity">상태</option>
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
            ) : searchType === "activity" ? (
              <select
                className={styles.searchInput}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              >
                <option value="">상태 선택</option>
                <option value="ACTIVE">활성</option>
                <option value="INACTIVE">비활성</option>
              </select>
            ) : (
              <input
                type="text"
                className={styles.searchInput}
                placeholder={
                  searchType === "name"
                    ? "이름 또는 아이디를 입력하세요"
                    : "검색어를 입력하세요"
                }
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            )}

            <button className={styles.searchButton} onClick={handleSearch}>
              검색
            </button>
          </div>
        </div>

        <div className={styles.buttonGroup}>
          <button className={styles.button} onClick={handleListButtonClick}>
            목록
          </button>
        </div>
        <br></br>

        <table className={styles.noticeList}>
          <colgroup>
            <col style={{ width: "10%" }} />
            <col style={{ width: "20%" }} />
            <col style={{ width: "20%" }} />
            <col style={{ width: "20%" }} />
            <col style={{ width: "20%" }} />
            <col style={{ width: "10%" }} />
          </colgroup>
          <thead>
            <tr className={styles.tableHeaderRow}>
              <th>ID</th>
              <th>이름</th>
              <th>전화번호</th>
              <th>가입일</th>
              <th>최근 로그인</th>
              <th>상태</th>
            </tr>
          </thead>
          <tbody>
            {users.length > 0 ? (
              users.map((user) => (
                <tr
                  key={user.userId}
                  className={styles.noticeItem}
                  onClick={() => handleTitleClick(user)}
                >
                  <td className={styles.noticeNo}>{user.userId}</td>
                  <td className={styles.title}>{user.userName}</td>
                  <td className={styles.noticeDate}>{user.phone}</td>
                  <td className={styles.readCount}>{user.createdAt}</td>
                  <td className={styles.readCount}>{user.updatedAt}</td>
                  <td className={styles.readCount}>
                    {user.status === 1 ? "활성" : "탈퇴"}
                  </td>{" "}
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="4" className={styles.noData}>
                  해당 사용자 없음!
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

      {/* 사용자 상세보기 모달창 */}
      {isModalOpen && selectedUser && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalContent}>
            <h2>사용자 상세 정보</h2>
            <p>
              <strong>ID:</strong> {selectedUser.userId}
            </p>
            <p>
              <strong>이름:</strong> {selectedUser.userName}
            </p>
            <p>
              <strong>전화번호:</strong> {selectedUser.phone}
            </p>
            <p>
              <strong>가입일:</strong> {selectedUser.createdAt}
            </p>
            <p>
              <strong>최근 로그인:</strong> {selectedUser.updatedAt}
            </p>
            <p>
              <strong>상태:</strong>{" "}
              {selectedUser.status === 1
                ? "활성"
                : selectedUser.status === 2
                  ? "비활성"
                  : "탈퇴"}
            </p>
            <button onClick={() => setIsModalOpen(false)}>닫기</button>
          </div>
        </div>
      )}
    </div>
  );
}

export default UserListPage;
