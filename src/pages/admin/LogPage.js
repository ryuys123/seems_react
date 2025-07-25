// src/pages/admin/LogPage.js  : 로그 정보 조회 페이지
import React, { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom"; // page 에서 page 바꾸기할 때 사용
import apiClient from "../../utils/axios"; // 로그 목록 조회용
import { AuthContext } from "../../AuthProvider"; //공유자원 가져오기 위함
import styles from "./LogPage.module.css"; // css 사용
import AdminHeader from "../../components/common/AdminHeader"; // 관리자헤더
import PagingView from "../../components/common/PagingView"; //목록 아래 페이징 출력 처리용

function LogPage({ searchResults }) {
  const { isLoggedIn, role } = useContext(AuthContext); //AuthProvider 에서 가져오기

  // 이 페이지에서 사용할 로컬 상태변수 준비
  const [logs, setLogs] = useState([]); // 서버로 부터 받은 log 목록 데이터 저장할 상태
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
  const [searchType, setSearchType] = useState("activity");
  const [searchTerm, setSearchTerm] = useState("");
  // 날짜 검색용 상태 추가
  const [begin, setbegin] = useState("");
  const [end, setend] = useState("");
  //   const navigate = useNavigate(); // 페이지 이동을 위함
  //모달 상태 추가
  const [selectedLog, setSelectedLog] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { secureApiRequest } = useContext(AuthContext);

  //서버로 로그 조회용 함수 (기본 1페이지)
  const fetchLogs = async (page) => {
    try {
      setLoading(true); //로딩 상태 시작

      const response = await apiClient.get(`/log?page=${page}`);
      setLogs(response.data.list);
      setPagingInfo(response.data.paging);
      console.log(response.data.list);
      console.log(response.data.paging);

      //일반 목록 조회 모드로 지정
      setIsSearchMode(false);
    } catch (err) {
      setError("로그 조회 실패!");
    } finally {
      setLoading(false); //로딩 상태 종료
    }
  };

  // 검색 버튼 클릭하면 핸들러 추가 : 서버로 검색 요청을 함
  const handleSearch = async () => {
    try {
      setLoading(true);
      let response;
      if (searchType === "createdAt") {
        response = await apiClient.get(`/log/search/createdAt`, {
          params: { action: searchType, begin, end },
        });
      } else if (searchType === "activity") {
        response = await apiClient.get(`/log/search/activity`, {
          params: { action: searchType, activity: searchTerm },
        });
      } else if (searchType === "severity") {
        response = await apiClient.get(`/log/search/severity`, {
          params: { action: searchType, severity: searchTerm },
        });
      }
      setLogs(response.data.list || []);
      setPagingInfo(response.data.paging || {});
      setIsSearchMode(true);
    } catch (error) {
      console.error("검색 요청 실패 : ", error);
      setLogs([]); // 에러가 나도 테이블 렌더링을 위해 빈 배열로 설정
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
      setLogs(searchResults.list || []);
      setPagingInfo(searchResults.paging || {});
      setLoading(false); //로딩 완료
    } else {
      // 초기 로드 및 일반 조회
      fetchLogs(1);
    }
  }, [searchResults]);

  // 목록 버튼 클릭시 작동할 핸들러
  const handleListButtonClick = () => {
    setIsSearchMode(false); // 검색 모드에서 일반 모드로 바꿈
    fetchLogs(1); // 목록 버튼 클릭시 1페이지 목록 조회 출력 처리함
  };

  const handleTitleClick = (log) => {
    //상세보기 페이지로 이동 처리 라우터 지정함
    // url path 와 ${변수명} 사용시 반드시 빽틱 사용해야 함
    setSelectedLog(log);
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
          response = await apiClient.get(`/log/search/createdAt`, {
            params: {
              action: searchType,
              begin,
              end,
              page,
            },
          });
        } else {
          response = await apiClient.get(`/log/search/${searchType}`, {
            params: {
              action: searchType,
              keyword: searchTerm,
              page,
            },
          });
        }
        setLogs(response.data.list || []);
        setPagingInfo(response.data.paging || {});
      } else {
        fetchLogs(page); // 일반 목록 조회 요청
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
        <h1 className={styles.pageTitle}>로그 페이지</h1>

        {/* 검색 영역 */}
        <div className={styles.searchContainer}>
          <div className={styles.searchForm}>
            <select
              className={styles.searchSelect}
              value={searchType}
              onChange={(e) => setSearchType(e.target.value)}
            >
              <option value="activity">유형</option>
              <option value="severity">심각도</option>
              <option value="createdAt">발생일자</option>
            </select>

            {searchType === "createdAt" ? (
              <>
                <input
                  type="date"
                  className={styles.searchInput}
                  value={begin ? begin.split("T")[0] : ""}
                  onChange={(e) => {
                    const date = e.target.value;
                    setbegin(`${date}T00:00:00`);
                  }}
                  placeholder="시작 날짜"
                />
                <span className={styles.dateSeparator}>~</span>
                <input
                  type="date"
                  className={styles.searchInput}
                  value={end ? end.split("T")[0] : ""}
                  onChange={(e) => {
                    const date = e.target.value;
                    setend(`${date}T23:59:59`);
                  }}
                  placeholder="끝나는 날짜"
                />
              </>
            ) : searchType === "activity" ? (
              <select
                className={styles.searchInput}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              >
                <option value="">유형 선택</option>
                <option value="로그인 시도">로그인 시도</option>
                <option value="사용자 정보 변경">사용자 정보 변경</option>
                <option value="시스템 오류 발생">시스템 오류 발생</option>
              </select>
            ) : (
              <select
                className={styles.searchInputSelect}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              >
                <option value="">심각도 선택</option>
                <option value="INFO">INFO</option>
                <option value="WARN">WARN</option>
                <option value="ERROR">ERROR</option>
                <option value="CRITICAL">CRITICAL</option>
              </select>
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
            <col style={{ width: "30%" }} />
            <col style={{ width: "25%" }} />
            <col style={{ width: "15%" }} />
            <col style={{ width: "15%" }} />
          </colgroup>
          <thead>
            <tr className={styles.tableHeaderRow}>
              <th>로그ID</th>
              <th>시간</th>
              <th>유형</th>
              <th>심각도</th>
              <th>사용자</th>
            </tr>
          </thead>
          <tbody>
            {logs.length > 0 ? (
              logs.map((log) => (
                <tr
                  key={log.logId}
                  className={styles.noticeItem}
                  onClick={() => handleTitleClick(log)}
                >
                  <td className={styles.noticeNo}>{log.logId}</td>
                  <td className={styles.title}>{log.createdAt}</td>
                  <td className={styles.noticeDate}>{log.action}</td>
                  <td className={styles.tdNoPadding}>
                    <div
                      className={`${styles.severity} ${styles[log.severity?.toLowerCase()]}`}
                    >
                      {log.severity}
                    </div>
                  </td>
                  <td className={styles.title}>{log.userId}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5" className={styles.noData}>
                  로그 없음!
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

      {/* 로그 상세보기 모달창 */}
      {isModalOpen && selectedLog && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalContent}>
            <h2>로그 상세 정보</h2>
            <p>
              <strong>로그ID:</strong> {selectedLog.logId}
            </p>
            <p>
              <strong>사용자ID:</strong> {selectedLog.userId}
            </p>
            <p>
              <strong>유형:</strong> {selectedLog.action}
            </p>
            <p>
              <strong>심각도:</strong> {selectedLog.severity}
            </p>
            <p>
              <strong>이전 데이터:</strong> {selectedLog.beforeData}
            </p>
            <p>
              <strong>변경 데이터:</strong> {selectedLog.afterData}
            </p>
            <p>
              <strong>시간:</strong> {selectedLog.createdAt}
            </p>
            <button onClick={() => setIsModalOpen(false)}>닫기</button>
          </div>
        </div>
      )}
    </div>
  );
}

export default LogPage;
