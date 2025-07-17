import React, { useState, useEffect, useContext, useRef } from 'react';
import styles from './EmotionRecordPage.module.css';
import UserHeader from '../../components/common/UserHeader';
import { AuthContext } from '../../AuthProvider';

const EmotionRecordPage = () => {
  const [selectedEmotion, setSelectedEmotion] = useState(null);
  const [recordText, setRecordText] = useState('');
  const [emotions, setEmotions] = useState([]);
  const [emotionLogs, setEmotionLogs] = useState([]); // 감정 기록 상태 추가
  const { isLoggedIn, userid, secureApiRequest } = useContext(AuthContext);

  // 음성 인식 상태 및 참조 추가
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef(null);

  // 감정 목록 가져오기
  useEffect(() => {
    const fetchEmotions = async () => {
      try {
        const response = await secureApiRequest('http://localhost:8888/seems/api/emotions');
        setEmotions(response.data);
      } catch (error) {
        console.error("감정 목록을 가져오는 데 실패했습니다:", error);
      }
    };

    fetchEmotions();
  }, [secureApiRequest]);

  // 사용자 감정 기록 가져오기
  useEffect(() => {
    const fetchEmotionLogs = async () => {
      if (isLoggedIn && userid) { // 로그인 상태이고 userId가 있을 때만 호출
        try {
          const response = await secureApiRequest(`http://localhost:8888/seems/api/emotion-logs/${userid}`);
          setEmotionLogs(response.data);
        } catch (error) {
          console.error("감정 기록을 가져오는 데 실패했습니다:", error);
        }
      } else {
        setEmotionLogs([]); // 로그아웃 상태면 기록 비움
      }
    };

    fetchEmotionLogs();
  }, [isLoggedIn, userid, secureApiRequest]); // 로그인 상태, userId, secureApiRequest 변경 시 재실행

  // 음성 인식 설정 useEffect
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      console.error("이 브라우저에서는 음성 인식을 지원하지 않습니다.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = 'ko-KR';
    recognition.continuous = false; // 한 문장이 끝나면 인식 종료
    recognition.interimResults = true;

    recognitionRef.current = recognition;

    recognition.onresult = (event) => {
      let interimTranscript = '';
      let finalTranscript = '';

      for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
          finalTranscript += event.results[i][0].transcript;
        } else {
          interimTranscript += event.results[i][0].transcript;
        }
      }
      setRecordText(finalTranscript || interimTranscript);
    };

    recognition.onerror = (event) => {
      console.error(`음성 인식 오류: ${event.error}`);
      if (event.error === 'no-speech') {
        // alert('음성이 감지되지 않았습니다. 마이크를 확인하고 다시 시도해주세요.');
      } else if (event.error === 'audio-capture') {
        alert('마이크 접근 권한이 없습니다. 브라우저 설정을 확인해주세요.');
      } else {
        alert('음성 인식 중 오류가 발생했습니다.');
      }
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

  }, []);

  const handleEmotionClick = (emotion) => {
    setSelectedEmotion(emotion);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!selectedEmotion) {
      alert('감정을 선택해주세요.');
      return;
    }
    if (!recordText.trim()) {
      alert('오늘의 생각과 느낌을 입력해주세요.');
      return;
    }
    if (!isLoggedIn) {
      alert('로그인 후 이용해주세요.');
      return;
    }

    try {
      await secureApiRequest('http://localhost:8888/seems/api/emotion-logs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        data: {
          userId: userid,
          emotionId: selectedEmotion.emotionId,
          textContent: recordText,
        },
      });

      alert('기록이 성공적으로 제출되었습니다!');
      setSelectedEmotion(null);
      setRecordText('');
      // 기록 제출 후 최신 기록을 다시 불러옴
      // fetchEmotionLogs(); // 이 함수는 useEffect 내부에 있으므로 직접 호출 불가
      // 대신, emotionLogs 상태를 직접 업데이트하거나, useEffect의 의존성 배열을 활용하여 재실행 유도
      // 여기서는 간단하게 다시 불러오는 로직을 추가
      const response = await secureApiRequest(`http://localhost:8888/seems/api/emotion-logs/${userid}`);
      setEmotionLogs(response.data);

    } catch (error) {
      console.error('기록 제출 실패:', error);
      alert('기록 제출에 실패했습니다.');
    }
  };

  const handleCameraClick = () => {
    document.getElementById('cameraInput').click();
  };

  const handleVoiceClick = () => {
    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      recognitionRef.current.start();
      setIsListening(true);
    }
  };

  return (
    <div className={styles.body}>
      <UserHeader />
      <main className={styles.main}>
        {/* <h1 className={styles['page-title']}>감정 기록</h1> */}
        <div className={styles['record-grid']}>
          <div className={styles['record-card']}>
            <h3>오늘의 감정</h3>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', marginBottom: '4px' }}>
              <button type="button" className={styles['camera-btn']} title="촬영" onClick={handleCameraClick}>
                <img src="/images/camera.png" alt="촬영" style={{ width: '22px', height: 'auto', display: 'block' }} />
              </button>
              <input type="file" accept="image/*" capture="user" id="cameraInput" className={styles['camera-input']} />
            </div>
            <div className={styles['emotion-grid']}>
              {emotions.map((emotion) => (
                <div
                  key={emotion.emotionId}
                  className={`${styles['emotion-item']} ${selectedEmotion && selectedEmotion.emotionId === emotion.emotionId ? styles.selected : ''}`}
                  onClick={() => handleEmotionClick(emotion)}
                >
                  <span className={styles['emotion-emoji']}>{emotion.emoji}</span>
                  <span className={styles['emotion-label']}>{emotion.emotionName}</span>
                </div>
              ))}
            </div>
            <form className={styles['record-form']} onSubmit={handleSubmit}>
              <div className={styles['form-group']}>
                <label htmlFor="record-text">오늘의 생각과 느낌</label>
                <textarea
                  id="record-text"
                  placeholder="오늘 있었던 일이나 느낀 감정을 자유롭게 적어보세요..."
                  value={recordText}
                  onChange={(e) => setRecordText(e.target.value)}
                ></textarea>
                <button type="button" className={`${styles['voice-btn']} ${isListening ? styles.listening : ''}`} title="음성 입력" onClick={handleVoiceClick}>
                  <img src={isListening ? "/images/stop_1.jpg" : "/images/rec_1.png"} alt={isListening ? "녹음 중지" : "음성 입력"} />
                </button>
              </div>
              <button type="submit" className={styles['submit-btn']}>기록하기</button>
            </form>
          </div>
        </div>
        <div className={styles['history-section']}>
          <h3>최근 기록</h3>
          <div className={styles['history-list']}>
            {emotionLogs.length > 0 ? (
              emotionLogs.map((log) => (
                <div key={log.emotionLogId} className={styles['history-item']}>
                  <div className={styles['history-emoji']}>{log.emotion.emoji}</div>
                  <div className={styles['history-content']}>
                    <div className={styles['history-date']}>
                      {new Date(log.createdAt).toLocaleDateString('ko-KR', { year: 'numeric', month: '2-digit', day: '2-digit' })}
                    </div>
                    <p className={styles['history-text']}>{log.textContent}</p>
                  </div>
                </div>
              ))
            ) : (
              <p>아직 기록된 감정이 없습니다.</p>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default EmotionRecordPage;