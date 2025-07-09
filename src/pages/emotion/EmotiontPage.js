
import React, { useState, useEffect } from 'react';
import styles from './EmotionPage.module.css';

// 이미지 경로 정의
const images = {
  logo: '/images/logo.png',
  camera: '/images/camera_1.png',
  mic: '/images/rec_1.png',
};

// 감정 데이터
const emotions = [
  { emoji: '😊', label: '행복' },
  { emoji: '😔', label: '슬픔' },
  { emoji: '😡', label: '화남' },
  { emoji: '😌', label: '평온' },
  { emoji: '😰', label: '불안' },
  { emoji: '😴', label: '피곤' },
  { emoji: '🤔', label: '고민' },
  { emoji: '😎', label: '자신감' },
];

// 임시 기록 데이터
const initialHistory = [
  {
    emoji: '😊',
    date: '2024.03.15',
    text: '오늘은 정말 좋은 하루였다. 아침에 일어나서 산책을 했고, 오후에는 친구를 만났다. 특히 저녁에 먹은 음식이 정말 맛있었다.',
  },
  {
    emoji: '😔',
    date: '2024.03.14',
    text: '오늘은 조금 우울했다. 날씨가 흐려서 그런지 기분이 좋지 않았다. 내일은 더 나아질 것 같다.',
  },
  {
    emoji: '😌',
    date: '2024.03.13',
    text: '오늘은 평온한 하루였다. 책을 읽고 음악을 들으며 시간을 보냈다. 마음이 차분해졌다.',
  },
];

const EmotionRecordPage = () => {
  const [selectedEmotion, setSelectedEmotion] = useState(null);
  const [text, setText] = useState('');
  const [history, setHistory] = useState([]);

  useEffect(() => {
    // 로컬 스토리지에서 기록 불러오기 (없으면 임시 데이터 사용)
    const savedHistory = JSON.parse(localStorage.getItem('emotionHistory')) || initialHistory;
    setHistory(savedHistory);
  }, []);

  const handleEmotionClick = (emotion) => {
    setSelectedEmotion(emotion);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!selectedEmotion) {
      alert('오늘의 감정을 선택해주세요.');
      return;
    }
    if (text.trim() === '') {
      alert('오늘의 생각과 느낌을 기록해주세요.');
      return;
    }

    const newRecord = {
      emoji: selectedEmotion.emoji,
      date: new Date().toLocaleDateString('ko-KR', { year: 'numeric', month: '2-digit', day: '2-digit' }).replace(/ /g, ''),
      text: text,
    };

    const newHistory = [newRecord, ...history];
    setHistory(newHistory);
    localStorage.setItem('emotionHistory', JSON.stringify(newHistory));

    // 폼 초기화
    setSelectedEmotion(null);
    setText('');
    alert('감정이 기록되었습니다!');
  };

  return (
    <>
      <header className={styles.header}>
        {/* 상담 페이지와 동일한 헤더를 사용한다고 가정합니다. */}
        {/* 실제로는 공통 Header 컴포넌트를 사용하는 것이 좋습니다. */}
        <div className={styles.headerInner}>
          <a href="/" className={styles.logoLink}>
            <div className={styles.logoWrap}>
              <span className={styles.logoText}>
                <span className={styles.logoTextBlue}>SEE</span>
                <span className={styles.logoTextDark}>MS</span>
              </span>
              <img src={images.logo} alt="SEE MS 로고" className={styles.logoImg} />
            </div>
          </a>
          <nav className={styles.nav}>
            <a href="/">홈</a>
            <a href="/counseling">상담</a>
            <a href="/record">기록</a>
            <a href="/test">심리 검사</a>
            <a href="/analysis">분석</a>
            <a href="/activity">활동</a>
            <a href="/simulation">시뮬레이션</a>
            <a href="/mypage">마이페이지</a>
            <a href="/login" className={styles.loginLink}>로그인/회원가입</a>
          </nav>
        </div>
      </header>

      <main className={styles.main}>
        <h1 className={styles.pageTitle}>감정 기록</h1>
        <div className={styles.recordGrid}>
          <div className={styles.recordCard}>
            <h3>오늘의 감정</h3>
            <div className={styles.cardHeader}>
              <button type="button" className={styles.cameraBtn} title="촬영" onClick={() => document.getElementById('cameraInput').click()}>
                <img src={images.camera} alt="촬영" />
              </button>
              <input type="file" accept="image/*" capture="user" id="cameraInput" className={styles.cameraInput} />
            </div>
            <div className={styles.emotionGrid}>
              {emotions.map((emotion) => (
                <div
                  key={emotion.label}
                  className={`${styles.emotionItem} ${selectedEmotion?.label === emotion.label ? styles.selected : ''}`}
                  onClick={() => handleEmotionClick(emotion)}
                >
                  <span className={styles.emotionEmoji}>{emotion.emoji}</span>
                  <span className={styles.emotionLabel}>{emotion.label}</span>
                </div>
              ))}
            </div>
            <form className={styles.recordForm} onSubmit={handleSubmit}>
              <div className={styles.formGroup}>
                <label htmlFor="record-text">오늘의 생각과 느낌</label>
                <textarea
                  id="record-text"
                  placeholder="오늘 있었던 일이나 느낀 감정을 자유롭게 적어보세요..."
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                ></textarea>
                <button type="button" className={styles.voiceBtn} title="음성 입력">
                  <img src={images.mic} alt="음성 입력" />
                </button>
              </div>
              <button type="submit" className={styles.submitBtn}>기록하기</button>
            </form>
          </div>

          <div className={styles.recordCard}>
            <h3>감정 통계</h3>
            <div className={styles.chartPlaceholder}>
              [감정 변화 그래프]
            </div>
            <div className={styles.statsGrid}>
              <div className={styles.statItem}>
                <div className={styles.statLabel}>가장 많은 감정</div>
                <div className={styles.statValue}>행복 😊</div>
              </div>
              <div className={styles.statItem}>
                <div className={styles.statLabel}>기록 일수</div>
                <div className={styles.statValue}>15일</div>
              </div>
            </div>
          </div>
        </div>

        <div className={styles.historySection}>
          <h3>최근 기록</h3>
          <div className={styles.historyList}>
            {history.map((item, index) => (
              <div key={index} className={styles.historyItem}>
                <div className={styles.historyEmoji}>{item.emoji}</div>
                <div className={styles.historyContent}>
                  <div className={styles.historyDate}>{item.date}</div>
                  <p className={styles.historyText}>{item.text}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </>
  );
};

export default EmotionRecordPage;
