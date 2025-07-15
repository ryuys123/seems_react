import React, { useState } from 'react';
import UserHeader from '../../components/common/UserHeader';
import Footer from '../../components/common/Footer';
import styles from './EmotionRecordPage.module.css';

const emotions = [
  { label: '행복', emoji: '😊' },
  { label: '슬픔', emoji: '😔' },
  { label: '화남', emoji: '😡' },
  { label: '평온', emoji: '😌' },
  { label: '불안', emoji: '😰' },
  { label: '피곤', emoji: '😴' },
  { label: '고민', emoji: '🤔' },
  { label: '자신감', emoji: '😎' },
];

const EmotionRecordPage = () => {
  const [selectedEmotion, setSelectedEmotion] = useState(null);
  const [recordText, setRecordText] = useState('');
  const [history, setHistory] = useState([]); // 기록된 감정 일기 목록

  const handleEmotionSelect = (emotion) => {
    setSelectedEmotion(emotion);
  };

  const handleTextChange = (e) => {
    setRecordText(e.target.value);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!selectedEmotion) {
      alert('오늘의 감정을 선택해주세요.');
      return;
    }
    if (!recordText.trim()) {
      alert('오늘의 생각과 느낌을 작성해주세요.');
      return;
    }

    const newRecord = {
      id: Date.now(), // 임시 ID
      date: new Date().toLocaleDateString('ko-KR'),
      emotion: selectedEmotion,
      text: recordText.trim(),
    };

    setHistory(prevHistory => [newRecord, ...prevHistory]);
    setSelectedEmotion(null);
    setRecordText('');
    alert('감정 기록이 저장되었습니다!');
    // TODO: 실제 백엔드 API 연동
  };

  return (
    <>
      <UserHeader />
      <main className={styles.main}>
        <h1 className={styles.pageTitle}>감정 기록</h1>
        <div className={styles.recordGrid}>
          <div className={styles.recordCard}>
            <h3>오늘의 감정</h3>
            {/* 카메라 버튼은 일단 제외 */}
            <div className={styles.emotionGrid}>
              {emotions.map((emotion) => (
                <div
                  key={emotion.label}
                  className={`${styles.emotionItem} ${selectedEmotion && selectedEmotion.label === emotion.label ? styles.selected : ''}`}
                  onClick={() => handleEmotionSelect(emotion)}
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
                  value={recordText}
                  onChange={handleTextChange}
                ></textarea>
                {/* 음성 입력 버튼은 일단 제외 */}
              </div>
              <button type="submit" className={styles.submitBtn}>기록하기</button>
            </form>
          </div>
          {/* 감정 통계 부분은 제외 */}
        </div>
        <div className={styles.historySection}>
          <h3>최근 기록</h3>
          <div className={styles.historyList}>
            {history.length > 0 ? (
              history.map((item) => (
                <div key={item.id} className={styles.historyItem}>
                  <div className={styles.historyEmoji}>{item.emotion.emoji}</div>
                  <div className={styles.historyContent}>
                    <div className={styles.historyDate}>{item.date}</div>
                    <p className={styles.historyText}>{item.text}</p>
                  </div>
                </div>
              ))
            ) : (
              <p>저장된 감정 기록이 없습니다.</p>
            )}
          </div>
        </div>
      </main>
    </>
  );
};

export default EmotionRecordPage;
