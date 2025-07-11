import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const BOT_TYPES = ['친절한', '직설적인', '유머러스한', '공감하는', '분석적인'];
const SCENARIOS = ['스트레스 상담', '진로 고민', '대인관계', '자기계발', '기타'];

const UserSimulationSettingsPage = () => {
  const [botType, setBotType] = useState('');
  const [scenario, setScenario] = useState('');
  const navigate = useNavigate();

  const handleStart = () => {
    if (!botType || !scenario) {
      alert('챗봇 성격과 시나리오를 모두 선택해주세요.');
      return;
    }
    const settings = { botType, scenario };
    localStorage.setItem('simulation-settings', JSON.stringify(settings));
    alert('시뮬레이션 설정이 저장되었습니다.');
    navigate(-1);
  };

  return (
    <div style={{ maxWidth: 500, margin: '40px auto', padding: 24, background: '#fff', borderRadius: 12, boxShadow: '0 2px 8px #eee' }}>
      <h2 style={{ marginBottom: 24 }}>시뮬레이션 설정</h2>
      <div style={{ marginBottom: 24 }}>
        <div style={{ marginBottom: 12 }}><b>챗봇 성격 선택</b></div>
        <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
          {BOT_TYPES.map(type => (
            <label key={type} style={{ display: 'flex', alignItems: 'center', gap: 4, border: '1px solid #ddd', borderRadius: 8, padding: '6px 12px', cursor: 'pointer', background: botType === type ? '#e6f0fa' : '#fafafa' }}>
              <input
                type="radio"
                name="botType"
                checked={botType === type}
                onChange={() => setBotType(type)}
                style={{ accentColor: '#4b94d0' }}
              />
              {type}
            </label>
          ))}
        </div>
      </div>
      <div style={{ marginBottom: 24 }}>
        <div style={{ marginBottom: 12 }}><b>시나리오 선택</b></div>
        <select value={scenario} onChange={e => setScenario(e.target.value)} style={{ width: '100%', padding: '10px', borderRadius: 8, border: '1px solid #bbb', fontSize: 16 }}>
          <option value="">시나리오를 선택하세요</option>
          {SCENARIOS.map(s => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
      </div>
      <button onClick={handleStart} style={{ background: '#4b94d0', color: '#fff', border: 'none', borderRadius: 8, padding: '12px 32px', fontWeight: 700, fontSize: 17, cursor: 'pointer' }}>
        시작
      </button>
      <button onClick={() => navigate(-1)} style={{ marginLeft: 12, background: '#fff', color: '#4b94d0', border: '1px solid #4b94d0', borderRadius: 8, padding: '12px 24px', fontWeight: 500, fontSize: 15, cursor: 'pointer' }}>
        돌아가기
      </button>
    </div>
  );
};

export default UserSimulationSettingsPage; 