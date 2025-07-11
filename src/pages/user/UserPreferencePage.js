import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const PREFERENCE_QUESTIONS = [
  {
    category: '취미/관심사',
    items: ['운동', '음악', '독서', '여행', '요리', '영화', '게임', '미술', '명상', '기타']
  },
  {
    category: '성격/성향',
    items: ['외향적', '내향적', '감정적', '이성적', '계획적', '즉흥적', '신중함', '도전적']
  },
  {
    category: '심리/정신 건강',
    items: ['스트레스에 민감', '감정 표현이 어려움', '긍정적 사고', '불안이 잦음', '자기 돌봄 실천']
  },
  {
    category: '생활 습관',
    items: ['아침형', '저녁형', '규칙적 식사', '운동 습관', '수면 관리', '디지털 디톡스 실천']
  },
  {
    category: '상담 선호',
    items: ['대면 상담', '비대면(온라인) 상담', '집단 상담', '1:1 상담', '짧은 상담', '장기 상담']
  }
];

const EXERCISE_TYPES = ['축구', '수영', '헬스', '요가', '러닝', '기타'];
const ONLINE_COUNSEL_TYPES = ['채팅', '음성', '영상'];

const RATING_ITEMS = [
  ...PREFERENCE_QUESTIONS.find(q => q.category === '성격/성향').items,
  ...PREFERENCE_QUESTIONS.find(q => q.category === '심리/정신 건강').items
];

const UserPreferencePage = () => {
  const [selected, setSelected] = useState([]);
  const [exerciseTypes, setExerciseTypes] = useState([]);
  const [exerciseEtc, setExerciseEtc] = useState('');
  const [etcInputs, setEtcInputs] = useState({});
  const [ratings, setRatings] = useState({});
  const [onlineCounselTypes, setOnlineCounselTypes] = useState([]);
  const [history, setHistory] = useState([]);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const navigate = useNavigate();

  // 체크박스 선택
  const handleCheck = (item) => {
    setSelected((prev) =>
      prev.includes(item)
        ? prev.filter((i) => i !== item)
        : [...prev, item]
    );
    // 하위 선택 해제
    if (item === '운동' && selected.includes('운동')) setExerciseTypes([]);
    if (item === '비대면(온라인) 상담' && selected.includes('비대면(온라인) 상담')) setOnlineCounselTypes([]);
  };

  // 운동 종류 체크
  const handleExerciseType = (type) => {
    setExerciseTypes((prev) =>
      prev.includes(type)
        ? prev.filter((i) => i !== type)
        : [...prev, type]
    );
  };

  // 운동 기타 입력
  const handleExerciseEtc = (e) => setExerciseEtc(e.target.value);

  // 기타 입력
  const handleEtcInput = (item, value) => {
    setEtcInputs((prev) => ({ ...prev, [item]: value }));
  };

  // 1~5점 척도
  const handleRating = (item, value) => {
    setRatings((prev) => ({ ...prev, [item]: value }));
  };

  // 온라인 상담 방식 체크
  const handleOnlineCounselType = (type) => {
    setOnlineCounselTypes((prev) =>
      prev.includes(type)
        ? prev.filter((i) => i !== type)
        : [...prev, type]
    );
  };

  const handleSave = () => {
    if (selected.length === 0) {
      alert('하나 이상의 항목을 선택해주세요.');
      return;
    }
    const detail = {
      선택: [...selected],
      운동_종류: selected.includes('운동') ? [...exerciseTypes, exerciseTypes.includes('기타') ? exerciseEtc : null].filter(Boolean) : undefined,
      기타_입력: Object.keys(etcInputs).length > 0 ? etcInputs : undefined,
      성향_점수: ratings,
      온라인_상담_방식: selected.includes('비대면(온라인) 상담') ? onlineCounselTypes : undefined
    };
    setHistory((prev) => [
      { date: new Date().toLocaleString(), preferences: detail },
      ...prev
    ]);
    alert('성향 정보가 저장되었습니다.');
  };

  return (
    <div style={{ maxWidth: 700, margin: '40px auto', padding: 24, background: '#fff', borderRadius: 12, boxShadow: '0 2px 8px #eee' }}>
      <h2 style={{ marginBottom: 24 }}>회원 기호·성향 입력</h2>
      {PREFERENCE_QUESTIONS.map((group) => (
        <div key={group.category} style={{ marginBottom: 24 }}>
          <h4 style={{ marginBottom: 10, color: '#4b94d0' }}>{group.category}</h4>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12 }}>
            {group.items.map((item) => (
              <div key={item} style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: 4, border: '1px solid #ddd', borderRadius: 8, padding: '6px 12px', cursor: 'pointer', background: selected.includes(item) ? '#e6f0fa' : '#fafafa', minWidth: 120 }}>
                  <input
                    type="checkbox"
                    checked={selected.includes(item)}
                    onChange={() => handleCheck(item)}
                    style={{ accentColor: '#4b94d0' }}
                  />
                  {item}
                </label>
                {/* 운동 선택 시 하위 운동 종류 */}
                {item === '운동' && selected.includes('운동') && (
                  <div style={{ marginLeft: 16, marginTop: 6, display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                    {EXERCISE_TYPES.map((type) => (
                      <label key={type} style={{ display: 'flex', alignItems: 'center', gap: 2, border: '1px solid #eee', borderRadius: 6, padding: '3px 8px', background: exerciseTypes.includes(type) ? '#d6eafc' : '#f7f7f7' }}>
                        <input
                          type="checkbox"
                          checked={exerciseTypes.includes(type)}
                          onChange={() => handleExerciseType(type)}
                          style={{ accentColor: '#4b94d0' }}
                        />
                        {type}
                        {/* 기타 선택 시 입력란 */}
                        {type === '기타' && exerciseTypes.includes('기타') && (
                          <input
                            type="text"
                            value={exerciseEtc}
                            onChange={handleExerciseEtc}
                            placeholder="직접 입력"
                            style={{ marginLeft: 4, border: '1px solid #bbb', borderRadius: 4, padding: '2px 6px', fontSize: 13 }}
                          />
                        )}
                      </label>
                    ))}
                  </div>
                )}
                {/* 기타 선택 시 입력란 */}
                {item === '기타' && selected.includes('기타') && (
                  <input
                    type="text"
                    value={etcInputs[item] || ''}
                    onChange={e => handleEtcInput(item, e.target.value)}
                    placeholder="직접 입력"
                    style={{ marginLeft: 8, marginTop: 4, border: '1px solid #bbb', borderRadius: 4, padding: '2px 6px', fontSize: 13 }}
                  />
                )}
                {/* 성격/성향, 심리/정신 건강 문항에 1~5점 척도 */}
                {RATING_ITEMS.includes(item) && selected.includes(item) && (
                  <div style={{ marginLeft: 8, marginTop: 4, display: 'flex', alignItems: 'center', gap: 6 }}>
                    {[1,2,3,4,5].map((num) => (
                      <label key={num} style={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <input
                          type="radio"
                          name={`rating-${item}`}
                          checked={ratings[item] === num}
                          onChange={() => handleRating(item, num)}
                        />
                        {num}
                      </label>
                    ))}
                    <span style={{ fontSize: 13, color: '#888', marginLeft: 4 }}>점수</span>
                  </div>
                )}
                {/* 비대면(온라인) 상담 선택 시 세부 방식 */}
                {item === '비대면(온라인) 상담' && selected.includes('비대면(온라인) 상담') && (
                  <div style={{ marginLeft: 16, marginTop: 6, display: 'flex', gap: 8 }}>
                    {ONLINE_COUNSEL_TYPES.map((type) => (
                      <label key={type} style={{ display: 'flex', alignItems: 'center', gap: 2, border: '1px solid #eee', borderRadius: 6, padding: '3px 8px', background: onlineCounselTypes.includes(type) ? '#d6eafc' : '#f7f7f7' }}>
                        <input
                          type="checkbox"
                          checked={onlineCounselTypes.includes(type)}
                          onChange={() => handleOnlineCounselType(type)}
                          style={{ accentColor: '#4b94d0' }}
                        />
                        {type}
                      </label>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      ))}
      <button onClick={handleSave} style={{ background: '#4b94d0', color: '#fff', border: 'none', borderRadius: 8, padding: '10px 24px', fontWeight: 700, fontSize: 16, cursor: 'pointer', marginRight: 12 }}>저장</button>
      <button onClick={() => setIsHistoryOpen((v) => !v)} style={{ background: '#eee', color: '#333', border: 'none', borderRadius: 8, padding: '10px 18px', fontWeight: 500, fontSize: 15, cursor: 'pointer' }}>
        변경 이력 보기
      </button>
      <button onClick={() => navigate(-1)} style={{ marginLeft: 12, background: '#fff', color: '#4b94d0', border: '1px solid #4b94d0', borderRadius: 8, padding: '10px 18px', fontWeight: 500, fontSize: 15, cursor: 'pointer' }}>
        돌아가기
      </button>
      {isHistoryOpen && (
        <div style={{ marginTop: 32, background: '#f8f9fa', borderRadius: 8, padding: 16 }}>
          <h4 style={{ marginBottom: 12 }}>변경 이력</h4>
          {history.length === 0 ? (
            <div style={{ color: '#888' }}>변경 이력이 없습니다.</div>
          ) : (
            <ul style={{ paddingLeft: 0, listStyle: 'none', fontSize: 15 }}>
              {history.map((item, idx) => (
                <li key={idx} style={{ marginBottom: 10, borderBottom: '1px solid #eee', paddingBottom: 6 }}>
                  <div style={{ fontSize: 13, color: '#666' }}>{item.date}</div>
                  <pre style={{ fontWeight: 500, background: '#f4f4f4', borderRadius: 6, padding: 8, margin: 0, whiteSpace: 'pre-wrap' }}>{JSON.stringify(item.preferences, null, 2)}</pre>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
};

export default UserPreferencePage; 