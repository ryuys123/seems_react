import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import styles from './ContentPage.module.css';
import UserHeader from '../../components/common/UserHeader';
import { getTodayEmotion } from '../../services/QuestService';
import { getRecommendedContentsByEmotionId, fetchYoutubeMeta } from '../../services/ContentService';

const YOUTUBE_API_KEY = 'AIzaSyD3Qeh7yajpSfot5QJ9io3Cm5zzCl5YTvc'; // 실제 발급받은 키 적용

const themeList = ['전체', '음악', '게임', '요리', '자연'];

const ContentPage = () => {
  // QuestPage.js와 동일한 robust userId 추출
  const [userId] = useState(() => {
    const userInfo = localStorage.getItem('userInfo');
    if (userInfo) {
      try {
        const parsed = JSON.parse(userInfo);
        if (parsed.userId) return parsed.userId;
      } catch {}
    }
    const accessToken = localStorage.getItem('accessToken');
    if (accessToken) {
      try {
        const payload = JSON.parse(atob(accessToken.split('.')[1]));
        return payload.userId || payload.sub || payload.user_id || payload.userid;
      } catch {}
    }
    const loggedInUserId = localStorage.getItem('loggedInUserId');
    if (loggedInUserId) return loggedInUserId;
    return 'user001';
  });

  const [playingVideoId, setPlayingVideoId] = useState(null);
  const [youtubeContents, setYoutubeContents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [todayEmotion, setTodayEmotion] = useState(null);
  const [error, setError] = useState(null);
  const [selectedTheme, setSelectedTheme] = useState('전체');

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        if (!userId) {
          setError('로그인이 필요합니다.');
          setLoading(false);
          return;
        }
        // 오늘의 감정 조회
        const emotionLog = await getTodayEmotion(userId);
        setTodayEmotion(emotionLog);
        if (!emotionLog || !emotionLog.emotion || !emotionLog.emotion.emotionId) {
          setError('오늘의 감정 기록이 없습니다.');
          setLoading(false);
          return;
        }
        // 추천 유튜브 컨텐츠 조회
        const contents = await getRecommendedContentsByEmotionId(emotionLog.emotion.emotionId);
        // YouTube 메타데이터 보완
        const withMeta = await Promise.all(contents.map(async (item) => {
          if (!item.title || !item.description) {
            const meta = await fetchYoutubeMeta(item.youtubeId, YOUTUBE_API_KEY);
            return { ...item, ...meta };
          }
          return item;
        }));
        setYoutubeContents(withMeta);
      } catch (err) {
        setError('콘텐츠 추천을 불러오는 중 오류가 발생했습니다.');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [userId]);

  return (
    <div>
      <UserHeader/>
      <main className={styles.main}>
        <div className={styles.pageHeader}>
        <h1 className={styles.pageTitle}>콘텐츠</h1>
        </div>
        {/* 분석 결과 감정 요약 */}
        <div className={styles.summarySection}>
          <div className={styles.emotionIcon}>{todayEmotion?.emotion?.emoji || '😊'}</div>
          <div className={styles.summaryContent}>
            <div className={styles.summaryTitle}>오늘의 감정</div>
            <div className={styles.summaryText}>
              {todayEmotion?.emotion?.emotionName
                ? <b>{todayEmotion.emotion.emotionName}</b>
                : '감정 기록 없음'}
              {todayEmotion?.textContent && (
                <><br/>{todayEmotion.textContent}</>
              )}
            </div>
          </div>
        </div>
        {/* 콘텐츠 섹션 - PC 최적화 레이아웃 */}
        <div className={styles.contentContainer}>
          {/* 유튜브 영상 섹션 */}
          <div className={styles.youtubeSection}>
          <div className={styles.contentHeader}>맞춤 콘텐츠 추천</div>
          {/* 테마별 탭/버튼 */}
          <div className={styles.themeTabs}>
            {themeList.map(theme => (
              <button
                key={theme}
                className={`${styles.themeTabBtn} ${selectedTheme === theme ? styles.activeTab : ''}`}
                onClick={() => setSelectedTheme(theme)}
              >
                {theme}
              </button>
            ))}
          </div>
          {loading ? (
            <div>로딩 중...</div>
          ) : error ? (
            <div style={{color:'red'}}>{error}</div>
          ) : (
            <div className={styles.youtubeGrid}>
              {youtubeContents
                .filter(content => {
                  if (selectedTheme === '전체') return true;
                  if (!content.theme) return false;
                  return content.theme.trim().toLowerCase() === selectedTheme.trim().toLowerCase();
                })
                .length === 0 ? (
                <div>추천 유튜브 영상이 없습니다.</div>
              ) : youtubeContents
                .filter(content => {
                  if (selectedTheme === '전체') return true;
                  if (!content.theme) return false;
                  return content.theme.trim().toLowerCase() === selectedTheme.trim().toLowerCase();
                })
                .map(content => (
                  <div key={content.contentId} className={styles.youtubeCard}>
                    <div className={styles.themeBadge}>
                      {content.theme || '테마 없음'}
                    </div>
                    {playingVideoId === content.youtubeId ? (
                      <div className={styles.youtubePlayerWrap}>
                        <iframe
                          width="100%"
                          height="220"
                          src={`https://www.youtube.com/embed/${content.youtubeId}?autoplay=1`}
                          title={content.title}
                          frameBorder="0"
                          allowFullScreen
                        />
                      </div>
                    ) : (
                      <div className={styles.youtubeThumbWrap} onClick={() => setPlayingVideoId(content.youtubeId)}>
                        <img
                          src={content.thumbnail || `https://img.youtube.com/vi/${content.youtubeId}/hqdefault.jpg`}
                          alt={content.title}
                          className={styles.youtubeThumb}
                        />
                        <div className={styles.youtubePlayBtn}>▶</div>
                      </div>
                    )}
                    {/* 제목만 노출, 설명 제거 */}
                    <div className={styles.contentTitle}>{content.title || '제목 없음'}</div>
                  </div>
                ))}
            </div>
          )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default ContentPage;
