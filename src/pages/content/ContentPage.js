import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import styles from './ContentPage.module.css';
import UserHeader from '../../components/common/UserHeader';

const ContentPage = () => {
  const [playingVideoId, setPlayingVideoId] = useState(null);

  const contents = [
    {
      id: 1,
      type: '유튜브 영상',
      title: '마음이 편안해지는 명상 음악',
      description: '스트레스를 완화하고 집중력을 높여주는 1시간 명상 음악입니다.',
      videoId: '2OEL4P1Rz04'
    },
    {
      id: 2,
      type: '음악',
      title: '잔잔한 피아노 연주곡',
      description: '마음이 지칠 때 듣기 좋은 따뜻한 피아노 선율.',
      media: (
        <audio controls style={{ width: '100%' }}>
          <source src={require("../../assets/audio/audio1.mp3")} type="audio/mp3" />
          브라우저가 오디오 태그를 지원하지 않습니다.
        </audio>
      )
    },
    {
      id: 3,
      type: '글귀',
      title: '오늘의 위로',
      description: '힘들 때 마음을 다독여주는 따뜻한 한마디.',
      quote: '"지금 이 순간도 충분히 잘하고 있어요. 당신의 마음을 응원합니다."'
    },
    {
      id: 4,
      type: '유튜브 영상',
      title: '긍정 에너지 충전 영상',
      description: '하루를 힘차게 시작할 수 있는 긍정 메시지 영상입니다.',
      videoId: 'UPXUG8q4jKU'
    },
    {
      id: 5,
      type: '유튜브 영상',
      title: '힐링 자연 풍경 영상',
      description: '자연의 소리와 풍경으로 마음을 치유하세요.',
      videoId: '5qap5aO4i9A'
    },
    {
      id: 6,
      type: '유튜브 영상',
      title: '집중력 향상 브레인 뮤직',
      description: '공부/업무에 도움되는 집중력 향상 음악.',
      videoId: 'DWcJFNfaw9c'
    },
    {
      id: 7,
      type: '음악',
      title: '기분 좋아지는 기타 연주',
      description: '상쾌한 하루를 위한 기타 연주곡.',
      media: (
        <audio controls style={{ width: '100%' }}>
          <source src="/assets/audio/audio2.mp3" type="audio/mp3" />
          브라우저가 오디오 태그를 지원하지 않습니다.
        </audio>
      )
    },
    {
      id: 8,
      type: '글귀',
      title: '긍정의 한마디',
      description: '하루를 밝게 시작하는 긍정의 메시지.',
      quote: '"오늘도 충분히 잘하고 있어요!"'
    },
    {
      id: 9,
      type: '음악',
      title: '마음 안정 ASMR',
      description: '편안한 밤을 위한 ASMR 사운드.',
      media: (
        <audio controls style={{ width: '100%' }}>
          <source src={require("../../assets/audio/audio1.mp3")} type="audio/mp3" />
          브라우저가 오디오 태그를 지원하지 않습니다.
        </audio>
      )
    },
    {
      id: 10,
      type: '글귀',
      title: '오늘의 다짐',
      description: '스스로를 격려하는 다짐의 글.',
      quote: '"내일의 나는 오늘의 나보다 더 성장할 거야."'
    },
    {
      id: 11,
      type: '유튜브 영상',
      title: '스트레스 해소 요가 명상',
      description: '몸과 마음을 이완시키는 부드러운 요가 명상입니다.',
      videoId: 'inpok4MKVLM'
    },
    {
      id: 12,
      type: '유튜브 영상',
      title: '잠들기 전 마음 진정 음악',
      description: '불면증 해소와 편안한 수면을 위한 힐링 음악.',
      videoId: 'rUxyKA_-grg'
    },
    {
      id: 13,
      type: '유튜브 영상',
      title: '긍정 마인드셋 강화 영상',
      description: '자기계발과 긍정적 사고를 키우는 동기부여 영상.',
      videoId: '7XFLTDQ4JMk'
    },
    {
      id: 14,
      type: '유튜브 영상',
      title: '자연의 소리와 함께하는 명상',
      description: '비 소리, 바람 소리로 마음의 평화를 찾아보세요.',
      videoId: 'q76bMs-NwRk'
    },
    {
      id: 15,
      type: '유튜브 영상',
      title: '창의력 향상 브레인 푸드',
      description: '창의적 사고와 아이디어 발상을 돕는 음악.',
      videoId: 'lFcSrYw-ARY'
    },
    {
      id: 16,
      type: '유튜브 영상',
      title: '감사와 마음챙김 명상',
      description: '일상의 작은 것들에 감사하며 마음챙김을 연습해보세요.',
      videoId: 'z6X5oEIg6Ak'
    }
  ];

  // 유튜브 영상만 분리
  const youtubeContents = contents.filter(c => c.type === '유튜브 영상');
  const otherContents = contents.filter(c => c.type !== '유튜브 영상');

  return (
    <div>
      <UserHeader/>

      <main className={styles.main}>
        <div className={styles.pageHeader}>
        <h1 className={styles.pageTitle}>맞춤 콘텐츠 추천</h1>
        </div>
        
        {/* 분석 결과 감정 요약 */}
        <div className={styles.summarySection}>
          <div className={styles.emotionIcon}>😊</div>
          <div className={styles.summaryContent}>
            <div className={styles.summaryTitle}>오늘의 감정 상태 요약</div>
            <div className={styles.summaryText}>
              최근 상담 및 심리 분석 결과, <b>스트레스</b>가 다소 높고 <b>기분</b>이 저하된 상태입니다.<br />
              마음의 안정을 위한 휴식과 긍정적인 자극이 필요해 보여요.
            </div>
          </div>
        </div>

        {/* 콘텐츠 섹션 - PC 최적화 레이아웃 */}
        <div className={styles.contentContainer}>
          {/* 유튜브 영상 섹션 */}
          <div className={styles.youtubeSection}>
          <div className={styles.contentHeader}>유튜브 영상 추천</div>
          <div className={styles.youtubeGrid}>
            {youtubeContents.map(content => (
              <div key={content.id} className={styles.youtubeCard}>
                {playingVideoId === content.videoId ? (
                  <div className={styles.youtubePlayerWrap}>
                    <iframe
                      width="100%"
                        height="220"
                      src={`https://www.youtube.com/embed/${content.videoId}?autoplay=1`}
                      title={content.title}
                      frameBorder="0"
                      allowFullScreen
                    />
                  </div>
                ) : (
                  <div className={styles.youtubeThumbWrap} onClick={() => setPlayingVideoId(content.videoId)}>
                    <img
                      src={`https://img.youtube.com/vi/${content.videoId}/hqdefault.jpg`}
                      alt={content.title}
                      className={styles.youtubeThumb}
                    />
                    <div className={styles.youtubePlayBtn}>▶</div>
                  </div>
                )}
                <div className={styles.contentTitle}>{content.title}</div>
                <div className={styles.contentDesc}>{content.description}</div>
              </div>
            ))}
          </div>
        </div>

          {/* 기타 콘텐츠 섹션 */}
          <div className={styles.otherContentSection}>
          <div className={styles.contentHeader}>오늘의 추천 콘텐츠</div>
          <div className={styles.contentList}>
            {otherContents.map(content => (
              <div key={content.id} className={styles.contentCard}>
                <div className={styles.contentType}>{content.type}</div>
                <div className={styles.contentTitle}>{content.title}</div>
                <div className={styles.contentDesc}>{content.description}</div>
                {content.media && (
                  <div className={styles.contentMedia}>
                    {content.media}
                  </div>
                )}
                {content.quote && (
                  <div className={styles.contentQuote}>{content.quote}</div>
                )}
              </div>
            ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ContentPage;
