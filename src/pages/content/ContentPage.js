import React from 'react';
import { Link } from 'react-router-dom';
import styles from './ContentPage.module.css';

const ContentPage = () => {
  const contents = [
    {
      id: 1,
      type: '유튜브 영상',
      title: '마음이 편안해지는 명상 음악',
      description: '스트레스를 완화하고 집중력을 높여주는 1시간 명상 음악입니다.',
      media: (
        <iframe 
          width="100%" 
          height="120" 
          src="https://www.youtube.com/embed/2OEL4P1Rz04" 
          title="명상 음악" 
          frameBorder="0" 
          allowFullScreen
        />
      )
    },
    {
      id: 2,
      type: '음악',
      title: '잔잔한 피아노 연주곡',
      description: '마음이 지칠 때 듣기 좋은 따뜻한 피아노 선율.',
      media: (
        <audio controls style={{ width: '100%' }}>
          <source src="https://cdn.pixabay.com/audio/2022/10/16/audio_12b6fae5b7.mp3" type="audio/mp3" />
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
      media: (
        <iframe 
          width="100%" 
          height="120" 
          src="https://www.youtube.com/embed/UPXUG8q4jKU" 
          title="긍정 에너지 영상" 
          frameBorder="0" 
          allowFullScreen
        />
      )
    }
  ];

  return (
    <div>
      <header className={styles.header}>
        <div className={styles.headerInner}>
          <Link to="/" style={{ textDecoration: 'none' }}>
            <div className={styles.logoWrap}>
              <span className={styles.logoText}>
                <span style={{ color: '#4b94d0', fontWeight: 900, fontSize: '2rem', letterSpacing: '-1px' }}>SEE</span>
                <span style={{ color: '#3d3833', fontWeight: 900, fontSize: '2rem', letterSpacing: '-1px' }}>MS</span>
              </span>
              <img 
                src="/logo.png" 
                alt="SEE MS 로고" 
                style={{ marginLeft: '-5px', width: '54px', height: '54px', borderRadius: 0, background: 'none', boxShadow: 'none' }}
              />
            </div>
          </Link>
          <nav className={styles.nav}>
            <Link to="/">홈</Link>
            <Link to="/counseling">상담</Link>
            <Link to="/record">기록</Link>
            <Link to="/test">심리 검사</Link>
            <Link to="/analysis">분석</Link>
            <Link to="/quest">활동</Link>
            <Link to="/quest-store">퀘스트 스토어</Link>
            <Link to="/simulation">시뮬레이션</Link>
            <Link to="/content" className={styles.active}>콘텐츠</Link>
            <Link to="/mypage">마이페이지</Link>
            <Link to="/login" style={{ color: 'var(--main-accent)', fontWeight: 900 }}>로그인/회원가입</Link>
          </nav>
        </div>
      </header>

      <main className={styles.main}>
        <h1 className={styles.pageTitle}>맞춤 콘텐츠 추천</h1>
        
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

        {/* 콘텐츠 추천 리스트 */}
        <div className={styles.contentSection}>
          <div className={styles.contentHeader}>오늘의 추천 콘텐츠</div>
          <div className={styles.contentList}>
            {contents.map(content => (
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
      </main>
    </div>
  );
};

export default ContentPage;
