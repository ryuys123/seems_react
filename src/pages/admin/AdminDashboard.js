import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './AdminDashboard.module.css';
import logoSeems from '../../assets/images/logo_seems.png';
import AdminHeader from '../../components/common/AdminHeader';

function AdminDashboard() {
  const [activeSection, setActiveSection] = useState('dashboard');
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [showUserModal, setShowUserModal] = useState(false);
  const [showNoticeModal, setShowNoticeModal] = useState(false);
  const [showLogModal, setShowLogModal] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [showToast, setShowToast] = useState(false);
  
  const navigate = useNavigate();

  useEffect(() => {
    // Chart.js 초기화
    if (typeof window !== 'undefined' && window.Chart) {
      initializeCharts();
    }
  }, []);

  const initializeCharts = () => {
    // 방문자 통계 차트
    const visitorCtx = document.getElementById('visitorChart');
    if (visitorCtx) {
      new window.Chart(visitorCtx.getContext('2d'), {
        type: 'line',
        data: {
          labels: ['3/14', '3/15', '3/16', '3/17', '3/18', '3/19', '3/20'],
          datasets: [{
            label: '방문자 수',
            data: [120, 145, 132, 168, 189, 156, 178],
            borderColor: '#4b94d0',
            backgroundColor: 'rgba(75, 148, 208, 0.1)',
            borderWidth: 3,
            fill: true,
            tension: 0.4
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              display: false
            }
          },
          scales: {
            y: {
              beginAtZero: true,
              grid: {
                color: 'rgba(0,0,0,0.1)'
              }
            },
            x: {
              grid: {
                display: false
              }
            }
          }
        }
      });
    }

    // 시간대별 접속 현황 차트
    const hourlyCtx = document.getElementById('hourlyChart');
    if (hourlyCtx) {
      new window.Chart(hourlyCtx.getContext('2d'), {
        type: 'bar',
        data: {
          labels: ['00시', '02시', '04시', '06시', '08시', '10시', '12시', '14시', '16시', '18시', '20시', '22시'],
          datasets: [{
            label: '접속자 수',
            data: [5, 3, 2, 8, 25, 45, 67, 89, 78, 92, 76, 34],
            backgroundColor: '#4b94d0',
            borderColor: '#3d7ab0',
            borderWidth: 1
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              display: false
            }
          },
          scales: {
            y: {
              beginAtZero: true,
              grid: {
                color: 'rgba(0,0,0,0.1)'
              }
            },
            x: {
              grid: {
                display: false
              }
            }
          }
        }
      });
    }
  };

  const handleSectionChange = (section) => {
    setActiveSection(section);
  };

  const displayToast = (message) => {
    setToastMessage(message);
    setShowToast(true);
    setTimeout(() => {
      setShowToast(false);
    }, 2000);
  };

  const handleUserDetail = () => {
    setShowUserModal(true);
  };

  const handleNoticeForm = () => {
    setShowNoticeModal(true);
  };

  const handleLogDetail = () => {
    setShowLogModal(true);
  };

  const closeModal = (modalType) => {
    switch (modalType) {
      case 'user':
        setShowUserModal(false);
        break;
      case 'notice':
        setShowNoticeModal(false);
        break;
      case 'log':
        setShowLogModal(false);
        break;
      default:
        break;
    }
  };

  const resetFilters = () => {
    displayToast('필터가 초기화되었습니다.');
  };

  const applyFilters = () => {
    displayToast('검색 필터가 적용되었습니다.');
  };

  const showBulkActions = () => {
    const selectedCount = selectedUsers.length;
    if (selectedCount === 0) {
      displayToast('선택된 사용자가 없습니다.');
      return;
    }
    displayToast(`${selectedCount}명의 사용자가 선택되었습니다.`);
  };

  const toggleAllUsers = (checked) => {
    if (checked) {
      setSelectedUsers(['user123', 'user456', 'user789']);
    } else {
      setSelectedUsers([]);
    }
  };

  const viewFAQ = (faqId) => {
    window.open(`/faq?id=${faqId}`, '_blank');
  };

  return (
    <div className={styles.adminDashboard}>
      <AdminHeader/>

      <main className={styles.main}>
        {/* 대시보드 섹션 */}
        {activeSection === 'dashboard' && (
          <section className={styles.dashboardSection}>
            <h1 className={styles.pageTitle}>관리자 대시보드</h1>
            
            {/* 통계 카드 */}
            <div className={styles.statsGrid}>
              <div className={styles.statCard}>
                <div className={styles.statTitle}>총 사용자 수</div>
                <div className={styles.statValue}>1,234</div>
                <div className={styles.statChange}>+12% 이번 달</div>
              </div>
              <div className={styles.statCard}>
                <div className={styles.statTitle}>검사 횟수</div>
                <div className={styles.statValue}>5,678</div>
                <div className={styles.statChange}>+8% 이번 주</div>
              </div>
              <div className={styles.statCard}>
                <div className={styles.statTitle}>현재 접속자</div>
                <div className={styles.statValue}>89</div>
                <div className={styles.statChange}>+5% 어제 대비</div>
              </div>
              <div className={styles.statCard}>
                <div className={styles.statTitle}>평균 체류시간</div>
                <div className={styles.statValue}>23분</div>
                <div className={`${styles.statChange} ${styles.negative}`}>-2% 이번 주</div>
              </div>
            </div>

            {/* 방문자 차트 */}
            <div className={styles.chartContainer}>
              <div className={styles.chartHeader}>
                <h2 className={styles.chartTitle}>방문자 통계</h2>
                <div className={styles.chartFilters}>
                  <button className={`${styles.filterBtn} ${styles.active}`}>일별</button>
                  <button className={styles.filterBtn}>주별</button>
                  <button className={styles.filterBtn}>월별</button>
                </div>
              </div>
              <div className={styles.chart}>
                <canvas id="visitorChart"></canvas>
              </div>
            </div>

            {/* 시간대별 접속 그래프 */}
            <div className={styles.chartContainer}>
              <div className={styles.chartHeader}>
                <h2 className={styles.chartTitle}>시간대별 접속 현황</h2>
              </div>
              <div className={styles.chart}>
                <canvas id="hourlyChart"></canvas>
              </div>
            </div>
          </section>
        )}

        {/* 사용자 관리 섹션 */}
        {activeSection === 'users' && (
          <section className={styles.usersSection}>
            <h1 className={styles.pageTitle}>사용자 관리</h1>
            
            <div className={styles.chartContainer}>
              <div className={styles.chartHeader}>
                <h2 className={styles.chartTitle}>상세 검색</h2>
              </div>
              <div className={styles.searchGrid}>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>검색 유형</label>
                  <select className={styles.formSelect}>
                    <option value="name">이름</option>
                    <option value="id">아이디</option>
                    <option value="email">이메일</option>
                  </select>
                </div>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>검색어</label>
                  <input type="text" className={styles.formInput} placeholder="검색어를 입력하세요" />
                </div>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>가입일</label>
                  <input type="text" className={styles.formInput} placeholder="가입일 기간 선택" />
                </div>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>회원 상태</label>
                  <select className={styles.formSelect}>
                    <option value="">전체</option>
                    <option value="active">활성</option>
                    <option value="inactive">비활성</option>
                  </select>
                </div>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>정렬 기준</label>
                  <select className={styles.formSelect}>
                    <option value="joinDate">가입일</option>
                    <option value="lastLogin">최근 로그인</option>
                    <option value="name">이름</option>
                    <option value="id">아이디</option>
                  </select>
                </div>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>정렬 순서</label>
                  <select className={styles.formSelect}>
                    <option value="desc">내림차순</option>
                    <option value="asc">오름차순</option>
                  </select>
                </div>
              </div>
              <div className={styles.filterButtons}>
                <button className={`${styles.actionBtn} ${styles.resetBtn}`} onClick={resetFilters}>
                  필터 초기화
                </button>
                <button className={styles.actionBtn} onClick={applyFilters}>
                  검색
                </button>
              </div>
            </div>

            <div className={styles.searchBar}>
              <div className={styles.bulkActions}>
                <button className={`${styles.actionBtn} ${styles.bulkBtn}`} onClick={showBulkActions}>
                  일괄 작업
                </button>
              </div>
              <div className={styles.searchInfo}>
                <span>총 사용자: <strong>1,234</strong>명</span>
                <select className={styles.formSelect}>
                  <option>10개씩 보기</option>
                  <option>20개씩 보기</option>
                  <option>50개씩 보기</option>
                  <option>100개씩 보기</option>
                </select>
              </div>
            </div>

            <div className={styles.tableContainer}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>
                      <input 
                        type="checkbox" 
                        onChange={(e) => toggleAllUsers(e.target.checked)}
                      />
                    </th>
                    <th>ID</th>
                    <th>이름</th>
                    <th>이메일</th>
                    <th>회원등급</th>
                    <th>가입일</th>
                    <th>최근 로그인</th>
                    <th>상태</th>
                    <th>관리</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>
                      <input 
                        type="checkbox" 
                        checked={selectedUsers.includes('user123')}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedUsers([...selectedUsers, 'user123']);
                          } else {
                            setSelectedUsers(selectedUsers.filter(id => id !== 'user123'));
                          }
                        }}
                      />
                    </td>
                    <td>user123</td>
                    <td>홍길동</td>
                    <td>hong@example.com</td>
                    <td>일반</td>
                    <td>2024-03-15</td>
                    <td>2024-03-20 15:30</td>
                    <td><span className={`${styles.badge} ${styles.info}`}>활성</span></td>
                    <td>
                      <button className={styles.actionBtn} onClick={handleUserDetail}>
                        상세
                      </button>
                    </td>
                  </tr>
                </tbody>
              </table>
              
              <div className={styles.pagination}>
                <button className={styles.pageBtn}>&lt;</button>
                <button className={`${styles.pageBtn} ${styles.active}`}>1</button>
                <button className={styles.pageBtn}>2</button>
                <button className={styles.pageBtn}>3</button>
                <button className={styles.pageBtn}>4</button>
                <button className={styles.pageBtn}>5</button>
                <button className={styles.pageBtn}>&gt;</button>
              </div>
            </div>
          </section>
        )}

        {/* 콘텐츠 관리 섹션 */}
        {activeSection === 'contents' && (
          <section className={styles.contentsSection}>
            <h1 className={styles.pageTitle}>콘텐츠 관리</h1>
            
            <div className={styles.tableContainer}>
              <div className={styles.chartHeader}>
                <h2 className={styles.chartTitle}>공지사항</h2>
                <button className={styles.actionBtn} onClick={handleNoticeForm}>
                  새 공지 작성
                </button>
              </div>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>제목</th>
                    <th>작성일</th>
                    <th>공개범위</th>
                    <th>조회수</th>
                    <th>관리</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>시스템 점검 안내</td>
                    <td>2024-03-20</td>
                    <td>전체</td>
                    <td>156</td>
                    <td>
                      <button className={styles.actionBtn}>수정</button>
                      <button className={styles.actionBtn}>삭제</button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className={styles.tableContainer}>
              <div className={styles.chartHeader}>
                <h2 className={styles.chartTitle}>FAQ 게시판 관리</h2>
              </div>
              <div className={styles.searchBar}>
                <input 
                  type="text" 
                  className={styles.searchInput} 
                  placeholder="질문 제목 또는 내용으로 검색..." 
                />
                <button className={styles.actionBtn}>검색</button>
              </div>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>카테고리</th>
                    <th>질문 제목</th>
                    <th>작성자</th>
                    <th>작성일</th>
                    <th>답변 상태</th>
                    <th>관리</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>계정 관리</td>
                    <td>비밀번호를 잊어버렸어요</td>
                    <td>user123</td>
                    <td>2024-03-15</td>
                    <td><span className={`${styles.badge} ${styles.info}`}>답변완료</span></td>
                    <td>
                      <button className={styles.actionBtn} onClick={() => viewFAQ('faq1')}>
                        상세보기
                      </button>
                    </td>
                  </tr>
                  <tr>
                    <td>서비스 이용</td>
                    <td>감정 기록은 어떻게 하나요?</td>
                    <td>user456</td>
                    <td>2024-03-10</td>
                    <td><span className={`${styles.badge} ${styles.info}`}>답변완료</span></td>
                    <td>
                      <button className={styles.actionBtn} onClick={() => viewFAQ('faq2')}>
                        상세보기
                      </button>
                    </td>
                  </tr>
                  <tr>
                    <td>결제 문의</td>
                    <td>구독 취소는 언제까지 가능한가요?</td>
                    <td>user789</td>
                    <td>2024-03-08</td>
                    <td><span className={`${styles.badge} ${styles.warning}`}>답변대기</span></td>
                    <td>
                      <button className={styles.actionBtn} onClick={() => viewFAQ('faq3')}>
                        상세보기
                      </button>
                    </td>
                  </tr>
                </tbody>
              </table>
              
              <div className={styles.pagination}>
                <button className={styles.pageBtn}>&lt;</button>
                <button className={`${styles.pageBtn} ${styles.active}`}>1</button>
                <button className={styles.pageBtn}>2</button>
                <button className={styles.pageBtn}>3</button>
                <button className={styles.pageBtn}>&gt;</button>
              </div>
            </div>
          </section>
        )}

        {/* 시스템 로그 섹션 */}
        {activeSection === 'logs' && (
          <section className={styles.logsSection}>
            <h1 className={styles.pageTitle}>시스템 로그</h1>
            
            <div className={styles.chartContainer}>
              <div className={styles.chartHeader}>
                <h2 className={styles.chartTitle}>로그 필터</h2>
              </div>
              <div className={styles.searchGrid}>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>기간 선택</label>
                  <select className={styles.formSelect}>
                    <option>오늘</option>
                    <option>지난 7일</option>
                    <option>지난 30일</option>
                    <option>직접 설정</option>
                  </select>
                </div>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>로그 유형</label>
                  <select className={styles.formSelect}>
                    <option>전체</option>
                    <option>시스템</option>
                    <option>사용자</option>
                    <option>보안</option>
                    <option>데이터</option>
                    <option>에러</option>
                  </select>
                </div>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>심각도</label>
                  <select className={styles.formSelect}>
                    <option>전체</option>
                    <option>INFO</option>
                    <option>WARNING</option>
                    <option>ERROR</option>
                    <option>CRITICAL</option>
                  </select>
                </div>
              </div>
            </div>

            <div className={styles.searchBar}>
              <input 
                type="text" 
                className={styles.searchInput} 
                placeholder="사용자, 변경 항목, IP 주소로 검색..." 
              />
              <button className={styles.actionBtn}>검색</button>
              <button className={`${styles.actionBtn} ${styles.exportBtn}`}>
                로그 내보내기
              </button>
            </div>

            <div className={styles.tableContainer}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>시간</th>
                    <th>유형</th>
                    <th>심각도</th>
                    <th>사용자</th>
                    <th>IP 주소</th>
                    <th>변경 항목</th>
                    <th>변경 내용</th>
                    <th>상세</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>2024-03-20 14:30:15</td>
                    <td>사용자</td>
                    <td><span className={`${styles.badge} ${styles.info}`}>INFO</span></td>
                    <td>admin</td>
                    <td>192.168.1.100</td>
                    <td>사용자 정보</td>
                    <td>이메일 변경</td>
                    <td>
                      <button className={styles.actionBtn} onClick={handleLogDetail}>
                        보기
                      </button>
                    </td>
                  </tr>
                  <tr>
                    <td>2024-03-20 14:28:45</td>
                    <td>보안</td>
                    <td><span className={`${styles.badge} ${styles.warning}`}>WARNING</span></td>
                    <td>system</td>
                    <td>192.168.1.105</td>
                    <td>로그인 시도</td>
                    <td>비밀번호 5회 실패</td>
                    <td>
                      <button className={styles.actionBtn} onClick={handleLogDetail}>
                        보기
                      </button>
                    </td>
                  </tr>
                  <tr>
                    <td>2024-03-20 14:25:30</td>
                    <td>시스템</td>
                    <td><span className={`${styles.badge} ${styles.error}`}>ERROR</span></td>
                    <td>system</td>
                    <td>192.168.1.1</td>
                    <td>데이터베이스</td>
                    <td>연결 오류 발생</td>
                    <td>
                      <button className={styles.actionBtn} onClick={handleLogDetail}>
                        보기
                      </button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>
        )}
      </main>

      {/* 사용자 상세 모달 */}
      {showUserModal && (
        <div className={styles.modal}>
          <div className={styles.modalContent}>
            <div className={styles.modalHeader}>
              <h2 className={styles.modalTitle}>사용자 상세 정보</h2>
              <button className={styles.closeBtn} onClick={() => closeModal('user')}>
                &times;
              </button>
            </div>
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>이름</label>
              <input type="text" className={styles.formInput} defaultValue="홍길동" />
            </div>
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>이메일</label>
              <input type="email" className={styles.formInput} defaultValue="hong@example.com" />
            </div>
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>가입일</label>
              <input type="text" className={styles.formInput} defaultValue="2024-03-15" readOnly />
            </div>
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>상태</label>
              <select className={styles.formSelect}>
                <option>활성</option>
                <option>비활성</option>
                <option>정지</option>
              </select>
            </div>
            <button className={styles.actionBtn} style={{ width: '100%' }}>
              저장
            </button>
          </div>
        </div>
      )}

      {/* 공지 작성 모달 */}
      {showNoticeModal && (
        <div className={styles.modal}>
          <div className={styles.modalContent}>
            <div className={styles.modalHeader}>
              <h2 className={styles.modalTitle}>새 공지 작성</h2>
              <button className={styles.closeBtn} onClick={() => closeModal('notice')}>
                &times;
              </button>
            </div>
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>제목</label>
              <input type="text" className={styles.formInput} placeholder="공지 제목을 입력하세요" />
            </div>
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>내용</label>
              <textarea 
                className={styles.formInput} 
                style={{ height: '200px' }} 
                placeholder="공지 내용을 입력하세요"
              />
            </div>
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>공개범위</label>
              <select className={styles.formSelect}>
                <option>전체</option>
                <option>사용자</option>
                <option>관리자</option>
              </select>
            </div>
            <button className={styles.actionBtn} style={{ width: '100%' }}>
              작성
            </button>
          </div>
        </div>
      )}

      {/* 로그 상세 모달 */}
      {showLogModal && (
        <div className={styles.modal}>
          <div className={styles.modalContent}>
            <div className={styles.modalHeader}>
              <h2 className={styles.modalTitle}>로그 상세 정보</h2>
              <button className={styles.closeBtn} onClick={() => closeModal('log')}>
                &times;
              </button>
            </div>
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>발생 시간</label>
              <input type="text" className={styles.formInput} readOnly defaultValue="2024-03-20 14:30:15" />
            </div>
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>로그 ID</label>
              <input type="text" className={styles.formInput} readOnly defaultValue="LOG_123456789" />
            </div>
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>세션 ID</label>
              <input type="text" className={styles.formInput} readOnly defaultValue="SESSION_987654321" />
            </div>
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>사용자 에이전트</label>
              <input type="text" className={styles.formInput} readOnly defaultValue="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36" />
            </div>
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>요청 URL</label>
              <input type="text" className={styles.formInput} readOnly defaultValue="/api/users/update" />
            </div>
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>상세 내용</label>
              <textarea 
                className={styles.formInput} 
                style={{ height: '150px' }} 
                readOnly 
                defaultValue="사용자 정보 업데이트 중 발생한 이벤트에 대한 상세 설명입니다.\n- 이전 이메일: old@example.com\n- 새 이메일: new@example.com"
              />
            </div>
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>스택 트레이스</label>
              <pre className={styles.stackTrace}>
                Error: Database connection failed{'\n'}
                at Database.connect (/src/db.js:42){'\n'}
                at async Server.start (/src/server.js:12)
              </pre>
            </div>
          </div>
        </div>
      )}

      {/* 토스트 메시지 */}
      {showToast && (
        <div className={styles.toast}>
          {toastMessage}
        </div>
      )}
    </div>
  );
}

export default AdminDashboard; 