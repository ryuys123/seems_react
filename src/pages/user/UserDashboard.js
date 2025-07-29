import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useContext } from 'react';
import UserHeader from '../../components/common/UserHeader';
import { AuthContext } from '../../AuthProvider';
import apiClient from '../../utils/axios';
import { getLatestNotice } from '../../services/noticeService';
import { getDashboardFaqs } from '../../services/faqService';
// import { drawFortuneCard, checkTodayCardDrawn } from "../../services/cardService";
// import { logFortuneCardActivity } from '../../utils/activityLogger';
import bannerImage from '../../assets/images/banner_1 (1).png';
import graphImage from '../../assets/images/graph_1.png';
import styles from './UserDashboard.module.css';
import Footer from '../../components/common/Footer';

const UserDashboard = () => {
  const navigate = useNavigate();
  const { userid, todayEmotion, fetchTodayEmotion } = useContext(AuthContext);
  const [isLoading, setIsLoading] = useState(true);
  const [latestNotice, setLatestNotice] = useState(null);
  const [dashboardFaqs, setDashboardFaqs] = useState([]);
  const [fortuneCards, setFortuneCards] = useState([]);
  const [cardLoading, setCardLoading] = useState(false);
  const [todayCardDrawn, setTodayCardDrawn] = useState(false);

  // ✅ 오늘의 감정 데이터 가져오기 (전역 상태 사용)
  useEffect(() => {
    const loadTodayEmotion = async () => {
      if (!userid) {
        setIsLoading(false);
        return;
      }
      
      try {
        await fetchTodayEmotion();
      } catch (error) {
        console.log('감정 데이터 조회 실패:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadTodayEmotion();
  }, [userid]); // fetchTodayEmotion 의존성 제거

  // 최신 공지사항 조회
  useEffect(() => {
    const loadLatestNotice = async () => {
      try {
        const notice = await getLatestNotice();
        console.log('최신 공지사항 데이터:', notice);
        setLatestNotice(notice);
      } catch (error) {
        console.log('최신 공지사항 조회 실패:', error);
      }
    };

    loadLatestNotice();
  }, []);

  // 대시보드용 FAQ 조회
  useEffect(() => {
    const loadDashboardFaqs = async () => {
      if (!userid) return;
      
      try {
        const faqData = await getDashboardFaqs(userid);
        console.log('대시보드 FAQ 데이터:', faqData);
        setDashboardFaqs(faqData.list || []);
      } catch (error) {
        console.log('대시보드 FAQ 조회 실패:', error);
        setDashboardFaqs([]);
      }
    };

    loadDashboardFaqs();
  }, [userid]);

  // 포춘카드 데이터 로딩 - 주석처리
  /*
  useEffect(() => {
    const loadFortuneCards = async () => {
      if (!userid) return;
      try {
        setCardLoading(true);
        
        // Spring Boot API로 오늘 카드 뽑기 여부 확인
        const todayCard = await checkTodayCardDrawn(userid);
        setTodayCardDrawn(todayCard.drawn);
        
        if (todayCard.drawn && todayCard.card) {
          // 오늘 이미 카드를 뽑았다면 결과 표시 (첫 번째 카드에만 표시)
          setFortuneCards([todayCard.card, null, null]);
        } else {
          // 카드를 뽑지 않았다면 빈 카드 3개 표시
          setFortuneCards([null, null, null]);
        }
      } catch (error) {
        console.error('포춘카드 로딩 실패:', error);
        // 에러 시 빈 카드 3개 표시
        setFortuneCards([null, null, null]);
      } finally {
        setCardLoading(false);
      }
    };
    
    loadFortuneCards();
  }, [userid]);
  */

  // 디버깅: todayEmotion 상태 변화 감지
  useEffect(() => {
    console.log('대시보드 todayEmotion 변경:', todayEmotion);
  }, [todayEmotion]);

  // ✅ 감정 아이콘 매핑 (한글 감정명 기준)
  const getEmotionIcon = (emotion) => {
    const emotionIcons = {
      // 한글 감정명
      '기쁨': '😄',
      '슬픔': '😢', 
      '화남': '😠',
      '신남': '🤩',
      '평온': '😌',
      '불안': '😰',
      '사랑': '🥰',
      '놀람': '😲',
      '피곤': '😴',
      '혼란': '😕',
      // 영어 감정명 (호환성)
      'happy': '😄',
      'sad': '😢', 
      'angry': '😠',
      'excited': '🤩',
      'calm': '😌',
      'anxious': '😰',
      'love': '🥰',
      'surprised': '😲',
      'tired': '😴',
      'confused': '😕'
    };
    console.log('getEmotionIcon 호출됨 - emotion:', emotion, '아이콘:', emotionIcons[emotion]);
    return emotionIcons[emotion] || '😐';
  };

  // ✅ 감정 한글 이름 매핑 (이미 한글인 경우 그대로 반환)
  const getEmotionName = (emotion) => {
    const emotionNames = {
      // 영어 → 한글 변환
      'happy': '기쁨',
      'sad': '슬픔', 
      'angry': '화남',
      'excited': '신남',
      'calm': '평온',
      'anxious': '불안',
      'love': '사랑',
      'surprised': '놀람',
      'tired': '피곤',
      'confused': '혼란'
    };
    return emotionNames[emotion] || emotion;
  };

  // FAQ 상태 표시 함수
  const getFaqStatusText = (status) => {
    const statusMap = {
      'PENDING': '답변대기',
      'ANSWERED': '답변완료',
      'CLOSED': '상담종료'
    };
    return statusMap[status] || status;
  };

  // FAQ 상태 색상 함수
  const getFaqStatusColor = (status) => {
    const colorMap = {
      'PENDING': '#ff9500',
      'ANSWERED': '#4CAF50',
      'CLOSED': '#9e9e9e'
    };
    return colorMap[status] || '#666';
  };

  // 날짜 포맷팅 함수
  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });
  };

  const handleQuickStart = () => {
    navigate('/counseling');
  };

  const handleSummaryClick = (path) => {
    navigate(path);
  };

  const handleFaqClick = () => {
    navigate('/faq');
  };

  const handleNoticeClick = () => {
    if (latestNotice) {
      navigate(`/notice/detail/${latestNotice.noticeNo}`);
    } else {
      navigate('/notice');
    }
  };

  // 포춘카드 클릭 처리 - 주석처리
  /*
  const handleCardClick = async (cardIndex) => {
    // 이미 카드를 뽑았거나 로딩 중이면 무시
    if (todayCardDrawn || cardLoading) return;
    
    try {
      setCardLoading(true);
      
      // Spring Boot API로 카드 뽑기
      const response = await drawFortuneCard(userid);
      
      if (response.success && response.card) {
        // 카드 결과를 해당 인덱스에 저장
        const newCards = [null, null, null];
        newCards[cardIndex] = response.card;
        setFortuneCards(newCards);
        
        // 오늘 카드를 뽑았음으로 설정
        setTodayCardDrawn(true);
        
        // 활동 기록 (선택사항)
        try {
          await logFortuneCardActivity(userid, response.card.keyword, response.card.message);
          console.log('활동 기록 성공');
        } catch (activityError) {
          console.warn('활동 기록 실패 (무시됨):', activityError);
          // 활동 기록 실패는 카드 뽑기에 영향을 주지 않음
        }
        
        console.log('포춘카드 뽑기 완료:', response.card);
      } else {
        alert(response.message || '카드 뽑기에 실패했습니다.');
      }
    } catch (error) {
      console.error('포춘카드 뽑기 실패:', error);
      alert('카드 뽑기에 실패했습니다. 다시 시도해주세요.');
    } finally {
      setCardLoading(false);
    }
  };
  */

  return (
    <>
      <UserHeader />
      
      <main className={styles.main}>
        {/* 소개 및 퀵버튼 */}
        <section className={styles.introSection} style={{display: 'flex', justifyContent: 'flex-end', alignItems: 'center', minHeight: '340px'}}>
          <div className={styles.introLeft} style={{marginLeft: 'auto', maxWidth: '600px', textAlign: 'center'}}>
            <div className={styles.introTitle}>
              <span style={{color: '#3d3833'}}>내 마음을 정확히 조준하는</span><br />
              <span style={{color: '#4b94d0'}}>AI 심리상담 플랫폼</span>
            </div>
            <div className={styles.introDesc}>
              AI 기반 감정 분석, 맞춤형 상담, 자기이해 퀘스트까지<br />
              심리 스나이퍼에서 한 번에 경험하세요.
            </div>
            <div className={styles.quickBtns}>
              <button className="secondary" onClick={handleQuickStart}>바로 상담 시작</button>
            </div>
          </div>
          <div className={styles.introRight}>
            <img 
              src={bannerImage} 
              alt="상담 일러스트 배너" 
              style={{maxWidth: '100%', height: 'auto', borderRadius: '18px', boxShadow: '0 4px 24px rgba(0,0,0,0.07)'}}
            />
          </div>
        </section>

        {/* 서비스 핵심 기능 카드 */}
        <section className={styles.cardsSection}>
        <Link to="/counseling" className={styles.featureCard}>
            <div className={styles.featureIcon}>💬</div>
            <div className={styles.featureTitle}>AI 상담 챗봇</div>
            <div className={styles.featureDesc}>GPT 기반 챗봇과 대화하며 고민을 나누고, 맞춤형 솔루션을 받아보세요.</div>
          </Link>
          <Link to="/SelectTestPage" className={styles.featureCard}>
            <div className={styles.featureIcon}>📝</div>
            <div className={styles.featureTitle}>심리 검사</div>
            <div className={styles.featureDesc}>MBTI, 성향 테스트를 통해 나의 성격을 분석하고 이해할 수 있습니다.</div>
          </Link>
          <Link to="/analysis-dashboard" className={styles.featureCard}>
            <div className={styles.featureIcon}>📊</div>
            <div className={styles.featureTitle}>심리 분석</div>
            <div className={styles.featureDesc}>감정 변화 그래프와 심리 분석 리포트로 나를 더 깊이 이해할 수 있습니다.</div>
          </Link>
          <Link to="/simulation" className={styles.featureCard}>
            <div className={styles.featureIcon}>🤖</div>
            <div className={styles.featureTitle}>AI 시뮬레이션</div>
            <div className={styles.featureDesc}>챗봇 성격 선택, 다양한 시나리오로 실전 대화 시뮬레이션을 경험해보세요.</div>
          </Link>
          <Link to="/quest" className={styles.featureCard}>
            <div className={styles.featureIcon}>📔</div>
            <div className={styles.featureTitle}>추천 퀘스트</div>
            <div className={styles.featureDesc}>오늘의 추천 퀘스트 완료 후, 상점에 사용할 수 있는 포인트를 획득해보세요.</div>
          </Link>
          <Link to="/content" className={styles.featureCard}>
            <div className={styles.featureIcon}>📺</div>
            <div className={styles.featureTitle}>추천 콘텐츠</div>
            <div className={styles.featureDesc}>현재 감정에 긍정적 영향을 줄 수 있는 콘텐츠를 추천받아보세요.</div>
          </Link>
          <Link to="/emotionrecord" className={styles.featureCard}>
            <div className={styles.featureIcon}>😊</div>
            <div className={styles.featureTitle}>감정 기록</div>
            <div className={styles.featureDesc}>이모지로 오늘의 감정을 빠르게 기록하고, 나만의 감정 일지를 만들어보세요.</div>
          </Link>
          <Link to="/quest-store" className={styles.featureCard}>
            <div className={styles.featureIcon}>💰</div>
            <div className={styles.featureTitle}>뱃지 상점</div>
            <div className={styles.featureDesc}>퀘스트를 동해 획득한 포인트를 뱃지로 교환하세요.</div>
          </Link>
        </section>

        {/* 오늘의 감정과 공지사항 - 좌우 배치 */}
        <section className={styles.middleSection}>
          <div className={styles.summaryCard}>
            <div className={styles.summaryTitle}>오늘의 감정</div>
            {isLoading ? (
              <div style={{textAlign: 'center', padding: '20px'}}>
                <div>로딩 중...</div>
              </div>
            ) : todayEmotion ? (
              <>
                <div className={styles.summaryEmoji} style={{fontSize: '3rem'}}>
                  {getEmotionIcon(todayEmotion.emotion)}
                </div>
                <div style={{color: '#888', fontSize: '1.1rem', marginBottom: '8px'}}>
                  {getEmotionName(todayEmotion.emotion)}
                </div>
                <div style={{
                  color: '#666', 
                  fontSize: '0.9rem', 
                  marginBottom: '12px',
                  maxHeight: '60px',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  display: '-webkit-box',
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: 'vertical'
                }}>
                  {todayEmotion.content}
                </div>
                <div style={{
                  color: '#999', 
                  fontSize: '0.8rem', 
                  marginBottom: '8px'
                }}>
                  {new Date(todayEmotion.createdAt).toLocaleTimeString()}
                </div>
              </>
            ) : (
              <>
                <div className={styles.summaryEmoji} style={{fontSize: '3rem'}}>📝</div>
                <div style={{color: '#888', fontSize: '1.1rem', marginBottom: '8px'}}>
                  기록 없음
                </div>
                <div style={{color: '#666', fontSize: '0.9rem', marginBottom: '12px'}}>
                  오늘의 감정을 기록해보세요
                </div>
              </>
            )}
            <button className={styles.summaryBtn} onClick={() => handleSummaryClick('/emotionrecord')}>
              {todayEmotion ? '상세 보기' : '기록하기'}
            </button>
          </div>
          <div className={styles.summaryCard}>
            {/* 포춘카드 뽑기 섹션 전체 주석처리
            <div className={styles.summaryTitle}>포춘카드 뽑기</div>
            <div className={styles.fortuneContent}>
              {cardLoading ? (
                <div style={{textAlign: 'center', padding: '20px'}}>
                  <div>카드 뽑는 중...</div>
                </div>
              ) : (
                <>
                  <div className={styles.fortuneCards}>
                    {[0, 1, 2].map((cardIndex) => (
                      <div 
                        key={cardIndex}
                        onClick={() => handleCardClick(cardIndex)}
                        style={{ 
                          cursor: todayCardDrawn ? 'default' : 'pointer',
                          width: '120px',
                          height: '160px',
                          margin: '0 8px',
                          borderRadius: '12px',
                          overflow: 'hidden',
                          boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                          transition: 'transform 0.3s ease',
                          backgroundColor: '#f8f9fa',
                          border: '2px solid #e9ecef'
                        }}
                        onMouseEnter={(e) => {
                          if (!todayCardDrawn) {
                            e.target.style.transform = 'scale(1.05)';
                          }
                        }}
                        onMouseLeave={(e) => {
                          e.target.style.transform = 'scale(1)';
                        }}
                      >
                        {fortuneCards[cardIndex] ? (
                          <div style={{
                            width: '100%',
                            height: '100%',
                            position: 'relative',
                            display: 'flex',
                            flexDirection: 'column',
                            justifyContent: 'center',
                            alignItems: 'center',
                            padding: '12px'
                          }}>
                            {fortuneCards[cardIndex].imagePath ? (
                              <img 
                                src={fortuneCards[cardIndex].imagePath} 
                                alt="포춘카드"
                                style={{
                                  width: '100%',
                                  height: '100%',
                                  objectFit: 'cover',
                                  borderRadius: '8px'
                                }}
                                onLoad={(e) => {
                                  console.log('이미지 로딩 성공:', fortuneCards[cardIndex].imagePath);
                                }}
                                onError={(e) => {
                                  console.error('이미지 로딩 실패:', fortuneCards[cardIndex].imagePath);
                                  e.target.style.display = 'none';
                                }}
                              />
                            ) : (
                              <div style={{
                                width: '100%',
                                height: '100%',
                                display: 'flex',
                                flexDirection: 'column',
                                justifyContent: 'center',
                                alignItems: 'center',
                                backgroundColor: '#6c757d',
                                borderRadius: '8px',
                                color: 'white'
                              }}>
                                <div style={{fontSize: '2rem', marginBottom: '8px'}}>🔮</div>
                                <div style={{fontSize: '0.8rem', textAlign: 'center'}}>
                                  {fortuneCards[cardIndex].message || '운세 메시지'}
                                </div>
                              </div>
                            )}
                          </div>
                        ) : (
                          <div style={{
                            width: '100%',
                            height: '100%',
                            display: 'flex',
                            flexDirection: 'column',
                            justifyContent: 'center',
                            alignItems: 'center',
                            backgroundColor: '#f8f9fa',
                            color: '#6c757d',
                            fontSize: '0.8rem',
                            textAlign: 'center',
                            padding: '12px'
                          }}>
                            <div style={{fontSize: '1.5rem', marginBottom: '8px'}}>🎴</div>
                            <div>카드 {cardIndex + 1}</div>
                            <div style={{fontSize: '0.7rem', marginTop: '4px'}}>선택하세요</div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                  <div style={{color: '#888', fontSize: '0.8rem', marginTop: '12px', textAlign: 'center'}}>
                    {todayCardDrawn ? (
                      <div>
                        <div style={{color: '#ef770c', fontWeight: '600', marginBottom: '8px'}}>
                          🎉 오늘의 운세를 확인했습니다
                        </div>
                        {fortuneCards.find(card => card) && (
                          <div style={{
                            color: '#333',
                            fontSize: '0.9rem',
                            lineHeight: '1.4',
                            padding: '12px',
                            backgroundColor: '#f8f9fa',
                            borderRadius: '8px',
                            border: '1px solid #e9ecef'
                          }}>
                            "{fortuneCards.find(card => card)?.message}"
                          </div>
                        )}
                      </div>
                    ) : (
                      '카드를 선택하여 운세를 확인하세요'
                    )}
                  </div>
                </>
              )}
            </div>
            */}
          </div>
        </section>

        {/* 공지사항과 문의사항 - 좌우 배치 */}
        <section className={styles.middleSection}>
          <div className={styles.summaryCard}>
            <div className={styles.summaryTitle}>공지사항</div>
            <div className={styles.noticeContent}>
              {latestNotice ? (
                <>
                  <div style={{
                    color: latestNotice.important ? '#ef770c' : '#444',
                    fontWeight: latestNotice.important ? 700 : 500,
                    marginBottom: '6px',
                    fontSize: '0.95rem',
                    lineHeight: '1.3'
                  }}>
                    {latestNotice.title}
                  </div>
                  {latestNotice.noticeDate && (
                    <div style={{
                      color: '#888', 
                      fontSize: '0.75rem', 
                      marginBottom: '8px'
                    }}>
                      {formatDate(latestNotice.noticeDate)}
                    </div>
                  )}
                  <div style={{
                    color: '#666', 
                    fontSize: '0.85rem', 
                    marginBottom: '12px',
                    maxHeight: '60px',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                    lineHeight: '1.4'
                  }}>
                    {latestNotice.content}
                  </div>
                </>
              ) : (
                <>
                  <div style={{color: '#888', fontSize: '1.1rem', marginBottom: '8px'}}>
                    공지사항 없음
                  </div>
                  <div style={{color: '#666', fontSize: '0.9rem', marginBottom: '12px'}}>
                    새로운 공지사항이 없습니다
                  </div>
                </>
              )}
            </div>
            <button className={styles.summaryBtn} onClick={handleNoticeClick}>
              {latestNotice ? '상세 보기' : '목록 보기'}
            </button>
          </div>
          <div className={styles.summaryCard}>
            <div className={styles.summaryTitle}>문의사항</div>
            <div className={styles.faqContent}>
              {dashboardFaqs.length > 0 ? (
                <div className={styles.faqList}>
                  {dashboardFaqs.slice(0, 3).map((faq) => (
                    <div key={faq.faqNo} className={styles.faqItem} onClick={() => navigate(`/faqd/${faq.faqNo}`)}>
                      <div className={styles.faqContent}>
                        <div className={styles.faqTitle} style={{
                          fontSize: '0.9rem',
                          fontWeight: '500',
                          color: '#333',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap'
                        }}>
                          {faq.title}
                        </div>
                      </div>
                      <div className={styles.faqStatus} style={{
                        fontSize: '0.75rem',
                        fontWeight: '600',
                        color: getFaqStatusColor(faq.status),
                        padding: '2px 8px',
                        borderRadius: '12px',
                        backgroundColor: `${getFaqStatusColor(faq.status)}15`,
                        border: `1px solid ${getFaqStatusColor(faq.status)}30`
                      }}>
                        {getFaqStatusText(faq.status)}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <>
                  <div style={{color: '#888', fontSize: '1.1rem', marginBottom: '8px'}}>
                    등록된 문의사항이 없습니다
                  </div>
                  <div style={{color: '#666', fontSize: '0.9rem', marginBottom: '12px'}}>
                    궁금한 점이 있으시면 문의해주세요
                  </div>
                </>
              )}
            </div>
            <button className={styles.summaryBtn} onClick={handleFaqClick}>더보기</button>
          </div>
        </section>
      </main>
    </>
  );
};

export default UserDashboard; 