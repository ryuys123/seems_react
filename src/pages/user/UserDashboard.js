import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useContext } from 'react';
import UserHeader from '../../components/common/UserHeader';
import { AuthContext } from '../../AuthProvider';
import apiClient from '../../utils/axios';
import bannerImage from '../../assets/images/banner_1 (1).png';
import graphImage from '../../assets/images/graph_1.png';
import styles from './UserDashboard.module.css';
import Footer from '../../components/common/Footer';

const UserDashboard = () => {
  const navigate = useNavigate();
  const { userid } = useContext(AuthContext);
  const [todayEmotion, setTodayEmotion] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // ✅ 오늘의 감정 데이터 가져오기
  useEffect(() => {
    const fetchTodayEmotion = async () => {
      if (!userid) {
        setIsLoading(false);
        return;
      }
      
      try {
        // 기존 API 호출: /api/emotion-logs/{userId}
        const response = await apiClient.get(`/api/emotion-logs/${userid}`);
        
        if (response.data && response.data.length > 0) {
          // 오늘 날짜의 감정 기록 찾기
          const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
          
          const todayRecord = response.data.find(log => {
            const logDate = new Date(log.createdAt).toISOString().split('T')[0];
            return logDate === today;
          });
          
          if (todayRecord) {
            setTodayEmotion({
              emotion: todayRecord.emotion.name, // 감정 이름
              content: todayRecord.textContent,
              createdAt: todayRecord.createdAt
            });
          }
        }
      } catch (error) {
        console.log('감정 데이터 조회 실패:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTodayEmotion();
  }, [userid]);

  // ✅ 감정 아이콘 매핑
  const getEmotionIcon = (emotion) => {
    const emotionIcons = {
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
    return emotionIcons[emotion] || '😐';
  };

  // ✅ 감정 한글 이름 매핑
  const getEmotionName = (emotion) => {
    const emotionNames = {
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
    return emotionNames[emotion] || '감정';
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
          <Link to="/emotionrecord" className={styles.featureCard}>
            <div className={styles.featureIcon}>😊</div>
            <div className={styles.featureTitle}>감정 기록</div>
            <div className={styles.featureDesc}>이모지로 오늘의 감정을 빠르게 기록하고, 나만의 감정 일지를 만들어보세요.</div>
          </Link>
          <Link to="/analysis" className={styles.featureCard}>
            <div className={styles.featureIcon}>📊</div>
            <div className={styles.featureTitle}>심리 분석</div>
            <div className={styles.featureDesc}>감정 변화 그래프와 심리 분석 리포트로 나를 더 깊이 이해할 수 있습니다.</div>
          </Link>
          <Link to="/counseling" className={styles.featureCard}>
            <div className={styles.featureIcon}>💬</div>
            <div className={styles.featureTitle}>AI 상담 챗봇</div>
            <div className={styles.featureDesc}>GPT 기반 챗봇과 대화하며 고민을 나누고, 맞춤형 솔루션을 받아보세요.</div>
          </Link>
          <Link to="/activity" className={styles.featureCard}>
            <div className={styles.featureIcon}>🏆</div>
            <div className={styles.featureTitle}>추천 활동</div>
            <div className={styles.featureDesc}>오늘의 추천 퀘스트와 피드백으로 자기성장도 함께 챙기세요.</div>
          </Link>
          <Link to="/simulation" className={styles.featureCard}>
            <div className={styles.featureIcon}>🤖</div>
            <div className={styles.featureTitle}>AI 시뮬레이션</div>
            <div className={styles.featureDesc}>챗봇 성격 선택, 다양한 시나리오로 실전 대화 시뮬레이션을 경험해보세요.</div>
          </Link>
          <Link to="/analysis" className={styles.featureCard}>
            <div className={styles.featureIcon}>📊</div>
            <div className={styles.featureTitle}>성격 분석</div>
            <div className={styles.featureDesc}>MBTI, 성향 테스트를 통해 나의 성격을 분석하고 이해할 수 있습니다.</div>
          </Link>
          <Link to="/content" className={styles.featureCard}>
            <div className={styles.featureIcon}>📚</div>
            <div className={styles.featureTitle}>추천 콘텐츠</div>
            <div className={styles.featureDesc}>심리학 관련 글, 명상 가이드, 자기계발 콘텐츠를 추천받아보세요.</div>
          </Link>
          <Link to="/emotionrecord" className={styles.featureCard}>
            <div className={styles.featureIcon}>📝</div>
            <div className={styles.featureTitle}>상담/기록</div>
            <div className={styles.featureDesc}>감정 타임라인과 최근 상담 내역을 한눈에 확인할 수 있습니다.</div>
          </Link>
        </section>

        {/* 감정변화 그래프 구획 */}
        <section className={styles.summarySection}>
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
            <div className={styles.summaryTitle}>감정 변화 그래프</div>
            <img src={graphImage} alt="감정 그래프" className={styles.summaryGraph} />
            <button className={styles.summaryBtn} onClick={() => handleSummaryClick('/analysis')}>상세 보기</button>
          </div>
          <div className={styles.summaryCard}>
            <div className={styles.summaryTitle}>상담/기록 요약</div>
            <ul style={{margin: 0, padding: 0, listStyle: 'none'}}>
              <li>최근 상담: 2024-06-01</li>
              <li>최근 기록: 2024-06-02</li>
              <li>최근 기록: 2024-06-03</li>
              <li>최근 기록: 2024-06-04</li>
            </ul>
            <button className={styles.summaryBtn} onClick={() => handleSummaryClick('/emotionrecord')}>더보기</button>
          </div>
          <div className={styles.summaryCard}>
            <div className={styles.summaryTitle}>공지사항</div>
            <ul style={{margin: 0, padding: 0, listStyle: 'none'}}>
              <li style={{color: '#ef770c', fontWeight: 700}}>[긴급] 시스템 점검 안내</li>
              <li style={{color: '#666', fontSize: '0.9rem', marginBottom: '8px'}}>2024-06-05 22:00 ~ 06-06 06:00</li>
              <li style={{color: '#444', marginBottom: '4px'}}>새로운 AI 상담 기능 추가</li>
              <li style={{color: '#444', marginBottom: '4px'}}>감정 분석 리포트 개선</li>
              <li style={{color: '#444', marginBottom: '4px'}}>이용약관 개정 안내</li>
            </ul>
            <button className={styles.summaryBtn} onClick={() => handleSummaryClick('/notice')}>더보기</button>
          </div>
        </section>

        {/* 문의사항 구획 */}
        <section className={styles.faqSection}>
          <div className={styles.faqTitle}>문의사항</div>
          <ul className={styles.recentList}>
            <li>서비스 이용 중 궁금한 점이 있으신가요?</li>
            <li>기술적인 문제나 개선사항을 제안하고 싶으신가요?</li>
            <li>계정 관련 문의나 비밀번호 찾기가 필요하신가요?</li>
            <li>결제 관련 문의나 환불 요청이 있으신가요?</li>
          </ul>
          <button className={styles.faqBtn} onClick={handleFaqClick}>더 보기</button>
        </section>
      </main>
    </>
  );
};

export default UserDashboard; 