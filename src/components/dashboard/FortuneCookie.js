import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../AuthProvider';
import { getTodayMessage, generateDailyMessage, getUserKeywordsStatus } from '../../services/fortuneService';
import styles from './FortuneCookie.module.css';

const FortuneCookie = () => {
  const { userid } = useContext(AuthContext);
  const navigate = useNavigate();
  
  const [isEnabled, setIsEnabled] = useState(false);
  const [isCracked, setIsCracked] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [keyword, setKeyword] = useState('');
  const [selectedKeywords, setSelectedKeywords] = useState([]);

  // 키워드 상태 확인
  useEffect(() => {
    const loadTodayMessage = async () => {
      try {
        // 먼저 키워드 상태를 확인
        const keywordsResponse = await getUserKeywordsStatus(userid);
        console.log('키워드 상태 조회:', keywordsResponse);
        
        if (keywordsResponse.success && keywordsResponse.selectedKeywords && keywordsResponse.selectedKeywords.length > 0) {
          setSelectedKeywords(keywordsResponse.selectedKeywords);
          setIsEnabled(true);
          
          // 키워드가 있으면 오늘의 메시지 확인
          const todayResponse = await getTodayMessage(userid);
          console.log('오늘의 행운 메시지 조회:', todayResponse);
          
          if (todayResponse.success && todayResponse.dailyMessage) {
            // 현재 선택된 키워드와 저장된 메시지의 키워드가 다른지 확인
            const currentKeywords = keywordsResponse.selectedKeywords;
            const savedKeyword = todayResponse.selectedKeyword;
            
            console.log('현재 선택된 키워드:', currentKeywords);
            console.log('저장된 메시지 키워드:', savedKeyword);
            
            // 키워드가 변경되었거나 저장된 키워드가 현재 선택된 키워드에 없는 경우
            if (!currentKeywords.includes(savedKeyword)) {
              console.log('키워드가 변경되어 메시지를 초기화합니다.');
              setIsCracked(false);
              setMessage('');
              setKeyword('');
            } else {
              // 키워드가 동일하면 기존 메시지 표시
              setMessage(todayResponse.dailyMessage);
              setKeyword(todayResponse.selectedKeyword || '');
              setIsCracked(true);
            }
          } else {
            // 오늘 메시지가 없으면 새로 생성 가능
            setIsCracked(false);
            setMessage('');
            setKeyword('');
          }
        } else {
          // 키워드가 없으면 비활성화
          setIsEnabled(false);
          setIsCracked(false);
          setMessage('');
          setKeyword('');
        }
      } catch (error) {
        console.error('메시지 로드 실패:', error);
        setIsEnabled(false);
        setIsCracked(false);
        setMessage('');
        setKeyword('');
      }
    };

    if (userid) {
      loadTodayMessage();
    }
  }, [userid]); // selectedKeywords 의존성 제거

  const handleCrackCookie = async () => {
    if (!isEnabled) return;
    
    console.log('새로운 행운 메시지 요청 - 선택된 키워드:', selectedKeywords);
    
    setIsLoading(true);
    
    // 선택된 키워드 중 하나를 랜덤으로 선택
    const randomKeyword = selectedKeywords[Math.floor(Math.random() * selectedKeywords.length)];
    console.log('선택된 랜덤 키워드:', randomKeyword);
    
    try {
      // AI 서비스를 통한 맞춤형 메시지 생성
      const response = await generateDailyMessage(randomKeyword, 'gpt-3.5-turbo');
      console.log('AI 메시지 생성 성공:', response);
      
      setMessage(response.message);
      setKeyword(randomKeyword);
      setIsCracked(true);
    } catch (error) {
      console.log('AI 메시지 생성 실패:', error);
      
      // AI 서비스 실패 시 기본 메시지 사용
      const defaultMessages = {
        '행복': '오늘은 특별한 행복이 당신을 기다리고 있습니다.',
        '사랑': '사랑의 기적이 당신 주변에서 일어나고 있습니다.',
        '성공': '성공의 문이 당신 앞에 열리고 있습니다.',
        '평온': '마음의 평화가 당신을 감싸고 있습니다.',
        '희망': '희망의 빛이 당신의 길을 비추고 있습니다.',
        '감사': '감사하는 마음이 더 큰 기적을 만들어갑니다.',
        '성장': '오늘 하루도 당신은 한 걸음씩 성장하고 있습니다.',
        '관계': '소중한 관계들이 당신을 더욱 풍요롭게 만들어갑니다.',
        '가족': '가족의 사랑이 당신의 힘이 되어줍니다.',
        '직장': '직장에서의 노력이 곧 큰 성과로 이어집니다.',
        '자아성찰': '자신을 돌아보는 시간이 더 나은 내일을 만듭니다.',
        '스트레스': '스트레스는 당신을 더 강하게 만들어가는 과정입니다.',
        '불안': '불안을 넘어서면 더 큰 평화가 기다리고 있습니다.',
        '우울': '새로운 시작의 기회입니다. 과거에 얽매이지 마세요.',
        '분노': '분노를 내려놓으면 마음이 가벼워집니다.',
        '슬픔': '슬픔은 당신을 더 깊고 지혜롭게 만들어갑니다.',
        '감정 관리': '감정을 잘 다루는 당신은 이미 성공한 사람입니다.'
      };
      
      const message = defaultMessages[randomKeyword] || `오늘은 ${randomKeyword}한 하루가 될 것입니다.`;
      
      setMessage(message);
      setKeyword(randomKeyword);
      setIsCracked(true);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoToProfile = () => {
    navigate('/userprofile');
  };

  return (
    <div className={styles.fortuneCookie}>
      {!isEnabled ? (
        <div className={styles.disabledState}>
          <div style={{color: '#888', fontSize: '1.1rem', marginBottom: '8px'}}>
            키워드 설정 필요
          </div>
          <div style={{color: '#666', fontSize: '0.9rem', marginBottom: '12px'}}>
            키워드를 선택하면 맞춤형 메시지를 받을 수 있습니다
          </div>
          <button onClick={handleGoToProfile} className={styles.summaryBtn}>
            키워드 설정하기
          </button>
        </div>
      ) : (
        <div className={styles.cookieContainer}>
          {!isCracked ? (
            <div className={styles.cookieWrapper}>
              <button 
                className={styles.summaryBtn}
                onClick={handleCrackCookie}
                disabled={isLoading}
              >
                {isLoading ? '생성 중...' : '오늘의 행운 메시지'}
              </button>
            </div>
          ) : (
            <div className={styles.messageContainer}>
              <div style={{color: '#666', fontSize: '1.2rem', marginBottom: '12px', lineHeight: '1.5'}}>
                {keyword && <span style={{color: '#4b94d0', fontWeight: '600'}}>#{keyword}</span>} {message}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default FortuneCookie; 