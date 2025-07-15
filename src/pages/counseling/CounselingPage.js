import React, { useState, useEffect, useRef, useContext, useCallback } from 'react';
import { AuthContext } from '../../AuthProvider';
import UserHeader from '../../components/common/UserHeader';
import Footer from '../../components/common/Footer';

import styles from './CounselingPage.module.css';

// 이미지 경로를 정의합니다. public 폴더를 기준으로 합니다.
const images = {
  logo: '/images/logo.png',
  counselor: '/images/counseling_1.png',
  mic: '/images/rec_1.png',
  stop: '/images/stop_1.png', 
};

// Llama 3 API 연동을 위한 함수
const getLlamaResponse = async (secureApiRequest, messages, currentCoreQuestionIndex) => {
  console.log("스프링부트 API 호출: ", messages, currentCoreQuestionIndex);
  try {
    const response = await secureApiRequest("http://localhost:8888/seems/api/chat", { 
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      // 전체 대화 기록과 현재 핵심 질문 인덱스를 전송
      body: JSON.stringify({ messages, current_core_question_index: currentCoreQuestionIndex }),
    });

    // secureApiRequest는 이미 응답 데이터를 반환하므로, 여기서 다시 .json()을 호출할 필요가 없습니다.
    // secureApiRequest가 반환하는 데이터 구조에 따라 조정해야 합니다.
    // AuthProvider.js의 secureApiRequest를 보면 response 객체를 그대로 반환합니다.
    // 따라서 여기서 response.data를 사용해야 합니다.
    return response.data; 
  } catch (error) {
    console.error("스프링부트 API 호출 중 오류 발생:", error);
    throw error;
  }
};

const CounselingPage = () => {
  const { secureApiRequest } = useContext(AuthContext);
  // 상태 관리
  const [messages, setMessages] = useState([]);
  const messagesRef = useRef(messages); // Add this line
  const [inputValue, setInputValue] = useState('');
  const [history, setHistory] = useState([]);
  const [currentSessionId, setCurrentSessionId] = useState(null); // 현재 상담 세션 ID
  const [isLoading, setIsLoading] = useState(false);
  const chatMessagesRef = useRef(null);

  // 핵심 질문 관련 상태
  const [currentCoreQuestionIndex, setCurrentCoreQuestionIndex] = useState(0);
  const [showEndOptions, setShowEndOptions] = useState(false);
  const [isConsultationEnded, setIsConsultationEnded] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef(null);

  // 초기 메시지 요청 함수
  const fetchInitialMessage = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await getLlamaResponse(secureApiRequest, [], 0); 
      setMessages([{ type: 'ai', text: data.response }]);
      setCurrentCoreQuestionIndex(data.next_core_question_index);
      console.log("✅ 초기 AI 메시지 설정 완료. 현재 messages 상태:", [{ type: 'ai', text: data.response }]);
    } catch (error) {
      console.error("초기 메시지 로드 중 오류 발생:", error);
      setMessages([{ type: 'ai', text: '죄송해요, 초기 메시지를 불러오는 데 문제가 생겼어요.' }]);
    } finally {
      setIsLoading(false);
    }
  }, [secureApiRequest]);

  // 컴포넌트 마운트 시 초기 메시지 요청
  useEffect(() => {
    fetchInitialMessage();
  }, [fetchInitialMessage]); // fetchInitialMessage를 의존성 배열에 추가

  // 컴포넌트 마운트 시 DB에서 상담 기록 목록 불러오기
  useEffect(() => {
    const fetchHistory = async () => {
      if (!secureApiRequest) { // secureApiRequest가 아직 준비되지 않았다면 (로그인 전 등)
        return; 
      }
      try {
        const response = await secureApiRequest('http://localhost:8888/seems/api/counseling/history');
        console.log("상담 기록 목록 API 응답:", response.data); // 추가된 로그
        setHistory(response.data || []);
      } catch (error) {
        console.error('상담 기록 목록을 불러오는 중 오류 발생:', error);
        setHistory([]); 
      }
    };

    fetchHistory();
  }, [secureApiRequest]);

  // 메시지 목록이 변경될 때마다 스크롤을 맨 아래로 이동
  useEffect(() => {
    if (chatMessagesRef.current) {
      chatMessagesRef.current.scrollTop = chatMessagesRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  // messagesRef를 항상 최신 messages 상태로 업데이트
  useEffect(() => {
    messagesRef.current = messages;
  }, [messages]);

  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      console.error("이 브라우저에서는 음성 인식을 지원하지 않습니다.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = 'ko-KR';
    recognition.continuous = true; // 연속적으로 음성을 인식
    recognition.interimResults = true; // 중간 결과를 반환

    recognitionRef.current = recognition;

    recognition.onstart = () => {
      console.groupCollapsed("🎤 음성 인식 활성화됨");
      console.log("상태: 듣는 중...");
      console.groupEnd();
    };

    recognition.onresult = (event) => {
      console.groupCollapsed("📢 음성 인식 결과 수신");

      let interimTranscript = "";
      let finalTranscript = "";

      for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
          finalTranscript += event.results[i][0].transcript;
        } else {
          interimTranscript += event.results[i][0].transcript;
        }
      }
      
      console.log("중간 결과: %c%s", "color: gray;", interimTranscript);
      console.log("최종 결과: %c%s", "color: green; font-weight: bold;", finalTranscript);
      console.groupEnd();

      setInputValue(finalTranscript || interimTranscript);

      // 최종 결과가 나왔을 때만 자동으로 메시지 전송
      if (finalTranscript) {
        handleSendMessage(finalTranscript); // 메시지를 전송합니다.
      }
    };

    recognition.onerror = (event) => {
      console.groupCollapsed("❌ 음성 인식 오류");
      console.error("오류 코드:", event.error);
      console.groupEnd();

      if (event.error === "no-speech") {
        // 소리가 감지되지 않은 것은 흔한 경우이므로, 사용자에게 알리지 않음
      } else if (event.error === 'audio-capture') {
        alert("마이크를 찾을 수 없거나 접근 권한이 없습니다. 브라우저의 마이크 설정을 확인해주세요.");
      } else {
        alert(`음성 인식 오류가 발생했습니다: ${event.error}`);
      }
    };

    recognition.onend = () => {
      console.groupCollapsed("🎤 음성 인식 비활성화됨");
      console.log("상태: 종료됨");
      console.groupEnd();
      setIsListening(false);
    };

  }, []);

  const handleSaveHistory = async () => {
    if (messages.length <= 1) { // AI의 첫 메시지만 있는 경우 제외
      alert('저장할 상담 내용이 없습니다.');
      return;
    }

    // 사용자 첫 메시지를 기반으로 제목 생성
    const userFirstMessage = messages.find(m => m.type === 'user');
    const title = userFirstMessage ? userFirstMessage.text.substring(0, 40) + '...' : '새로운 상담';

    const requestBody = {
      topic: title,
      method: "TEXT",
      messages: messages,
    };

    if (currentSessionId) {
      requestBody.sessionId = currentSessionId; // 기존 세션 ID 추가
    }

    try {
      // 백엔드에 저장 요청
      const response = await secureApiRequest('http://localhost:8888/seems/api/counseling/save', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      // 성공적으로 저장되면, 새로운 기록을 history 상태에 추가
      // 백엔드에서 저장된 객체(id 포함)를 반환한다고 가정
      const newHistoryEntry = response.data; 
      // 기존 세션 업데이트 시 history 목록에서도 해당 항목 업데이트
      if (currentSessionId) {
        setHistory(prevHistory => prevHistory.map(item => 
          item.sessionId === currentSessionId ? newHistoryEntry : item
        ));
      } else {
        setHistory(prevHistory => [newHistoryEntry, ...prevHistory]);
      }

      setCurrentSessionId(newHistoryEntry.sessionId); // 저장 후 현재 세션 ID 업데이트

      alert(`상담 내용이 "${title}" 제목으로 저장되었습니다!`);

    } catch (error) {
      console.error('상담 기록 저장 중 오류 발생:', error);
      alert('상담 내용을 저장하는 데 실패했습니다.');
    }
  };

  // 새로운 상담 시작 함수
  const handleStartNewConsultation = () => {
    setMessages([]); // 메시지 초기화
    setCurrentSessionId(null); // 현재 세션 ID 초기화
    setInputValue(''); // 입력값 초기화
    setCurrentCoreQuestionIndex(0); // 핵심 질문 인덱스 초기화
    setShowEndOptions(false); // 종료 옵션 숨기기
    setIsConsultationEnded(false); // 상담 종료 상태 해제
    fetchInitialMessage(); // 초기 AI 메시지 다시 불러오기
  };

  // 상담 기록 불러오기 함수 (DB 연동)
  const handleLoadHistory = async (sessionId) => {
    if (isLoading) return;
    try {
      // 백엔드에서 특정 상담 기록 요청
      const response = await secureApiRequest(`http://localhost:8888/seems/api/counseling/history/${sessionId}`);
      console.log("특정 상담 기록 상세 API 응답:", response.data); // 추가된 로그
      const sessionToLoad = response.data;
      if (sessionToLoad && sessionToLoad.messages) {
        console.log("불러온 메시지:", sessionToLoad.messages); // 추가된 로그
        setMessages(sessionToLoad.messages);
        setCurrentSessionId(sessionId); // 현재 세션 ID 업데이트
        alert(`"${sessionToLoad.topic}" 상담 기록을 불러왔습니다.`);
      } else {
        throw new Error('불러올 상담 기록 데이터가 올바르지 않습니다.');
      }

    } catch (error) {
      console.error('상담 기록을 불러오는 중 오류 발생:', error);
      alert('상담 기록을 불러오는 데 실패했습니다.');
    }
  };

  // 메시지 전송 함수 (API 연동)
  const handleSendMessage = useCallback(async (voiceText = null) => {
    const messageToSend = (voiceText !== null ? voiceText : inputValue).trim();
    if (messageToSend === '' || isLoading || isConsultationEnded) return;

    // 사용자 메시지를 현재 메시지 목록에 추가
    const newUserMessage = { type: 'user', text: messageToSend };
    const currentMessages = messagesRef.current; // Get the latest messages from ref
    console.log("➡️ 사용자 메시지 추가 전 messages 상태 (ref):", currentMessages);
    const updatedMessages = [...currentMessages, newUserMessage];
    console.log("➡️ 사용자 메시지 추가 후 updatedMessages:", updatedMessages);
    setMessages(updatedMessages);
    setInputValue('');
    setIsLoading(true);

    try {
      // AI 모델에 보낼 메시지 형식 (role, content)
      const messagesForAI = updatedMessages.map(msg => ({
        role: msg.type === 'user' ? 'user' : 'assistant',
        content: msg.text
      }));

      console.groupCollapsed("➡️ AI에게 메시지 전송");
      console.log("전체 대화 기록 (AI 형식):", messagesForAI);
      console.log("현재 핵심 질문 인덱스:", currentCoreQuestionIndex);
      console.groupEnd();

      // currentCoreQuestionIndex를 함께 보냄
      const data = await getLlamaResponse(secureApiRequest, messagesForAI, currentCoreQuestionIndex);
      const aiResponse = data.response;
      const nextCoreQIndex = data.next_core_question_index;
      
      console.groupCollapsed("⬅️ AI 응답 수신");
      console.log("AI 응답 데이터:", data);
      console.log("다음 핵심 질문 인덱스:", nextCoreQIndex);
      console.groupEnd();

      let displayResponse = aiResponse;
      if (aiResponse.includes('[END_OF_CONSULTATION_CHOICE]')) {
        displayResponse = aiResponse.replace('[END_OF_CONSULTATION_CHOICE]', '').trim();
        setShowEndOptions(true);
        setIsConsultationEnded(true); // 입력창 비활성화를 위해 설정
      }
      
      // AI 응답을 메시지 목록에 추가
      setMessages(prevMessages => [...prevMessages, { type: 'ai', text: displayResponse }]);
      setCurrentCoreQuestionIndex(nextCoreQIndex);

    } catch (error) {
      console.error("AI 응답 생성 중 오류 발생:", error);
      setMessages(prevMessages => [...prevMessages, { type: 'ai', text: '죄송해요, 답변을 생성하는 데 문제가 생겼어요.' }]);
    } finally {
      setIsLoading(false);
    }
  }, [inputValue, isLoading, isConsultationEnded, secureApiRequest, currentCoreQuestionIndex]);

  // 상담 종료 또는 계속 버튼 핸들러
  const handleEndConsultation = () => {
    setMessages(prevMessages => [...prevMessages, { type: 'ai', text: '상담을 종료합니다. 오늘 대화해주셔서 감사합니다.' }]);
    setIsConsultationEnded(true);
    setShowEndOptions(false);
    setInputValue(''); // 입력창 비우기
  };

  const handleContinueConsultation = () => {
    setMessages(prevMessages => [...prevMessages, { type: 'ai', text: '상담을 계속합니다. 더 궁금한 점이나 나누고 싶은 이야기가 있으신가요?' }]);
    setIsConsultationEnded(false); // 입력창 다시 활성화
    setShowEndOptions(false);
    setInputValue(''); // 입력창 비우기
    // currentCoreQuestionIndex를 초기화하거나, 새로운 대화 흐름을 시작할 수 있음
    // 여기서는 단순히 자유 대화 모드로 전환한다고 가정
  };

  const handleInputChange = (e) => {
    setInputValue(e.target.value);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSendMessage();
    }
  };

  const handleVoiceInput = () => {
    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      recognitionRef.current.start();
      setIsListening(true);
    }
  };

  return (
    <>
      <UserHeader />

      {/* 메인 콘텐츠 */}
      <main className={styles.main}>
        <div className={styles.chatContainer}>
          <div className={styles.chatHeader}>
            <img src={images.counselor} alt="AI 상담사" />
            <h2>AI 심리스나이퍼</h2>
          </div>
          <div className={styles.chatMessages} ref={chatMessagesRef}>
            {messages.map((msg, index) => (
              <div key={index} className={`${styles.message} ${styles[msg.type]}`}>
                {msg.text}
              </div>
            ))}
            {isLoading && (
              <div className={`${styles.message} ${styles.ai} ${styles.loading}`}>
                AI가 답변을 생성 중입니다...
              </div>
            )}
          </div>
          <div className={styles.suggestionChips}>
            {showEndOptions ? (
              <>
                <button className={styles.suggestionChip} onClick={handleContinueConsultation}>상담 계속하기</button>
                <button className={styles.suggestionChip} onClick={handleEndConsultation}>상담 마무리하기</button>
              </>
            ) : (
              <>
              </>
            )}
          </div>
          <div className={styles.chatInput}>
            <input
              type="text"
              placeholder={isListening ? "음성 입력중입니다..." : (isConsultationEnded ? "상담이 종료되었습니다." : "메시지를 입력하세요...")}
              value={inputValue}
              onChange={handleInputChange}
              onKeyPress={handleKeyPress}
              disabled={isLoading || isConsultationEnded}
            />
            <button className={`${styles.voiceBtn} ${isListening ? styles.voiceBtnActive : ''}`} title={isListening ? "듣는 중... 클릭하여 중지" : "음성 입력"} onClick={handleVoiceInput} disabled={isLoading || isConsultationEnded}>
              <img src={isListening ? images.stop : images.mic} alt={isListening ? "정지" : "음성 입력"} />
            </button>
            <button onClick={() => handleSendMessage()} disabled={isLoading || isConsultationEnded}>
              {isLoading ? '전송중' : '전송'}
            </button>
          </div>
        </div>

        {/* 사이드바 */}
        <aside className={styles.sidebar}>
          <div className={styles.sidebarTitle}>상담 기록</div>
          <ul className={styles.historyList}>
            {history.length > 0 ? (
              history.map((item) => (
                <li key={item.sessionId} onClick={() => handleLoadHistory(item.sessionId)} title={item.topic} className={styles.historyItem}>
                  <span className={styles.historyTitle}>{item.topic}</span>
                </li>
              ))
            ) : (
              <li className={`${styles.noHistory} ${styles.historyItem}`}>저장된 상담 기록이 없습니다.</li>
            )}
          </ul>
          <button className={styles.saveHistoryBtn} onClick={handleSaveHistory} disabled={isLoading}>
            상담 내용 저장
          </button>
          <button className={styles.newConsultationBtn} onClick={handleStartNewConsultation} disabled={isLoading}>
            새로운 상담 시작
          </button>
        </aside>
      </main>
    </>
  );
};

export default CounselingPage;
