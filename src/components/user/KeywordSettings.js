import React, { useState, useEffect, useContext } from 'react';
import styles from './KeywordSettings.module.css';
import { getUserKeywordsStatus, updateUserKeywords, getAvailableKeywords } from '../../services/fortuneService';
import { AuthContext } from '../../AuthProvider';

const KeywordSettings = () => {
  const { userid } = useContext(AuthContext);
  const [selectedKeywords, setSelectedKeywords] = useState([]);
  const [availableKeywords, setAvailableKeywords] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [selectedCount, setSelectedCount] = useState(0);

  useEffect(() => {
    console.log('KeywordSettings - userid 변경:', userid);
    if (userid) {
      loadKeywords();
    }
  }, [userid]);

  const loadKeywords = async () => {
    try {
      setIsInitialLoading(true);
      
      // 1. 사용 가능한 키워드 목록 조회
      const keywordsResponse = await getAvailableKeywords();
      console.log('KeywordSettings - 키워드 목록 응답:', keywordsResponse);
      console.log('키워드 목록 타입:', typeof keywordsResponse);
      console.log('키워드 목록 길이:', keywordsResponse?.keywords?.length || 0);
      
      if (keywordsResponse?.keywords) {
        console.log('받은 키워드 목록:', keywordsResponse.keywords);
        keywordsResponse.keywords.forEach((keyword, index) => {
          console.log(`키워드 ${index}:`, keyword, '타입:', typeof keyword);
        });
        setAvailableKeywords(keywordsResponse.keywords);
      } else {
        // 백엔드 API가 없을 때 기본 키워드 사용
        setAvailableKeywords([
          { id: 'happiness', name: '행복' },
          { id: 'love', name: '사랑' },
          { id: 'success', name: '성공' },
          { id: 'peace', name: '평온' },
          { id: 'hope', name: '희망' },
          { id: 'gratitude', name: '감사' },
          { id: 'growth', name: '성장' },
          { id: 'relationship', name: '관계' },
          { id: 'family', name: '가족' },
          { id: 'work', name: '직장' },
          { id: 'self_reflection', name: '자아성찰' },
          { id: 'stress', name: '스트레스' },
          { id: 'anxiety', name: '불안' },
          { id: 'sadness', name: '슬픔' },
          { id: 'anger', name: '분노' },
          { id: 'excitement', name: '설렘' }
        ]);
      }
      
      // 2. 사용자의 선택된 키워드 조회
      try {
        const userKeywordsResponse = await getUserKeywordsStatus(userid);
        console.log('KeywordSettings - 사용자 키워드 응답:', userKeywordsResponse);
        console.log('선택된 키워드 타입:', typeof userKeywordsResponse?.selectedKeywords);
        console.log('선택된 키워드 길이:', userKeywordsResponse?.selectedKeywords?.length || 0);
        
        if (userKeywordsResponse?.selectedKeywords) {
          console.log('받은 선택된 키워드 목록:', userKeywordsResponse.selectedKeywords);
          userKeywordsResponse.selectedKeywords.forEach((keyword, index) => {
            console.log(`선택된 키워드 ${index}:`, keyword, '타입:', typeof keyword);
          });
          setSelectedKeywords(userKeywordsResponse.selectedKeywords);
          setSelectedCount(userKeywordsResponse.selectedCount || userKeywordsResponse.selectedKeywords.length);
        } else {
          setSelectedKeywords([]);
          setSelectedCount(0);
        }
      } catch (userKeywordsError) {
        console.error('사용자 키워드 조회 실패:', userKeywordsError);
        // 사용자 키워드 조회 실패 시 빈 배열로 초기화
        setSelectedKeywords([]);
        setSelectedCount(0);
      }
      
    } catch (error) {
      console.error('키워드 로드 실패:', error);
      // 전체 실패 시 기본 키워드 사용
      setAvailableKeywords([
        { id: 'happiness', name: '행복' },
        { id: 'love', name: '사랑' },
        { id: 'success', name: '성공' },
        { id: 'peace', name: '평온' },
        { id: 'hope', name: '희망' },
        { id: 'gratitude', name: '감사' },
        { id: 'growth', name: '성장' },
        { id: 'relationship', name: '관계' },
        { id: 'family', name: '가족' },
        { id: 'work', name: '직장' },
        { id: 'self_reflection', name: '자아성찰' },
        { id: 'stress', name: '스트레스' },
        { id: 'anxiety', name: '불안' },
        { id: 'sadness', name: '슬픔' },
        { id: 'anger', name: '분노' },
        { id: 'excitement', name: '설렘' }
      ]);
      setSelectedKeywords([]);
      setSelectedCount(0);
    } finally {
      setIsInitialLoading(false);
    }
  };

  const handleKeywordToggle = (keyword) => {
    console.log('키워드 토글:', keyword, '타입:', typeof keyword);
    setSelectedKeywords(prev => {
      const newKeywords = prev.includes(keyword)
        ? prev.filter(k => k !== keyword)
        : [...prev, keyword];
      console.log('새로운 선택된 키워드:', newKeywords);
      setSelectedCount(newKeywords.length);
      return newKeywords;
    });
  };

  const handleSave = async () => {
    if (selectedKeywords.length === 0) {
      alert('최소 1개 이상의 키워드를 선택해주세요.');
      return;
    }

    try {
      setIsLoading(true);
      console.log('키워드 저장 요청:', { userid, selectedKeywords });
      
      const response = await updateUserKeywords(userid, selectedKeywords);
      console.log('키워드 저장 응답:', response);
      
      if (response.success) {
        alert('키워드가 성공적으로 저장되었습니다!');
        setSelectedCount(selectedKeywords.length);
      } else {
        alert(response.message || '키워드 저장에 실패했습니다.');
      }
    } catch (error) {
      console.error('키워드 저장 실패:', error);
      
      if (error.response?.status === 400) {
        alert(`저장 실패: ${error.response.data.message || '잘못된 요청입니다.'}`);
      } else if (error.response?.status === 401) {
        alert('로그인이 필요합니다.');
      } else if (error.response?.status === 404) {
        alert('서비스를 사용할 수 없습니다.');
      } else {
        alert('키워드 저장 중 오류가 발생했습니다.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (isInitialLoading) {
    return (
      <div className={styles.keywordSettings}>
        <div style={{ textAlign: 'center', padding: '20px', color: '#666' }}>
          키워드 설정을 불러오는 중...
        </div>
      </div>
    );
  }

  return (
    <div className={styles.keywordSettings}>
      <div className={styles.header}>
        <h3>관심 키워드 설정</h3>
        <p>선택한 키워드에 따라 맞춤형 행운의 메시지를 받을 수 있습니다.</p>
      </div>



      <div className={styles.keywordGrid}>
        {availableKeywords
          .filter(keyword => keyword !== '기타')
          .map((keyword, index) => (
          <button
            key={`keyword-${index}`}
            className={`${styles.keywordButton} ${
              selectedKeywords.includes(keyword) ? styles.selected : ''
            }`}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              console.log('키워드 클릭:', keyword, '타입:', typeof keyword);
              handleKeywordToggle(keyword);
            }}
          >
            {keyword}
            {selectedKeywords.includes(keyword) && (
              <span className={styles.checkmark}>✓</span>
            )}
          </button>
        ))}
      </div>

      <div className={styles.footer}>
        <div className={styles.selectedCount}>
          선택된 키워드: {selectedCount}개
        </div>
        <button
          className={styles.saveButton}
          onClick={handleSave}
          disabled={isLoading}
        >
          {isLoading ? '저장 중...' : '저장'}
        </button>
      </div>
    </div>
  );
};

export default KeywordSettings; 