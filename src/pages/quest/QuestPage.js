import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import styles from './QuestPage.module.css';

const QuestPage = () => {
  const [ongoingActivities, setOngoingActivities] = useState([
    {
      id: 1,
      level: 'Level 1',
      title: '마음의 평화 찾기',
      progress: 60,
      completed: 3,
      total: 5,
      steps: [
        { id: 1, text: '아침 명상 10분', completed: true },
        { id: 2, text: '감사 일기 작성', completed: true },
        { id: 3, text: '스트레칭 15분', completed: false, current: true },
        { id: 4, text: '심호흡 5분', completed: false },
        { id: 5, text: '저녁 명상 10분', completed: false }
      ],
      reward: '마음의 평화 +10'
    },
    {
      id: 2,
      level: 'Level 2',
      title: '건강한 습관 만들기',
      progress: 40,
      completed: 2,
      total: 5,
      steps: [
        { id: 1, text: '물 2L 마시기', completed: true },
        { id: 2, text: '30분 걷기', completed: true },
        { id: 3, text: '과일 1개 먹기', completed: false, current: true },
        { id: 4, text: '스트레칭 10분', completed: false },
        { id: 5, text: '일찍 자기', completed: false }
      ],
      reward: '건강 +15'
    }
  ]);

  const [recommendations] = useState([
    {
      id: 1,
      title: '스트레스 해소 명상',
      duration: '10분',
      reward: '스트레스 -20',
      description: '오늘의 감정 기록을 분석한 결과, 스트레스 수준이 높습니다. 명상을 통해 마음의 평화를 찾아보세요.',
      added: false
    },
    {
      id: 2,
      title: '기분 전환 산책',
      duration: '20분',
      reward: '기분 +15',
      description: '최근 우울감이 증가하는 추세입니다. 가벼운 산책을 통해 기분을 전환해보세요.',
      added: false
    },
    {
      id: 3,
      title: '감사 일기 작성',
      duration: '5분',
      reward: '행복감 +10',
      description: '오늘 하루 감사한 일들을 기록하며 긍정적인 마인드를 키워보세요.',
      added: false
    }
  ]);

  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  const showToastMessage = (message) => {
    setToastMessage(message);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 2000);
  };

  const addActivity = (recommendation) => {
    const newActivity = {
      id: Date.now(),
      level: 'New',
      title: recommendation.title,
      progress: 0,
      completed: 0,
      total: 1,
      steps: [
        {
          id: 1,
          text: `${recommendation.title} (${recommendation.duration})`,
          completed: false,
          current: true
        }
      ],
      reward: `보상: ${recommendation.reward}`
    };

    setOngoingActivities(prev => [newActivity, ...prev]);
    showToastMessage('활동이 추가되었습니다!');
  };

  const completeStep = (activityId, stepId) => {
    setOngoingActivities(prev => prev.map(activity => {
      if (activity.id === activityId) {
        const updatedSteps = activity.steps.map(step => {
          if (step.id === stepId) {
            return { ...step, completed: !step.completed, current: !step.completed };
          }
          return step;
        });

        const completedCount = updatedSteps.filter(step => step.completed).length;
        const progress = (completedCount / updatedSteps.length) * 100;

        return {
          ...activity,
          steps: updatedSteps,
          completed: completedCount,
          progress: progress
        };
      }
      return activity;
    }));
  };

  const editStepText = (activityId, stepId, newText) => {
    setOngoingActivities(prev => prev.map(activity => {
      if (activity.id === activityId) {
        const updatedSteps = activity.steps.map(step => {
          if (step.id === stepId) {
            return { ...step, text: newText };
          }
          return step;
        });
        return { ...activity, steps: updatedSteps };
      }
      return activity;
    }));
  };

  const deleteStep = (activityId, stepId) => {
    setOngoingActivities(prev => prev.map(activity => {
      if (activity.id === activityId) {
        const updatedSteps = activity.steps.filter(step => step.id !== stepId);
        const completedCount = updatedSteps.filter(step => step.completed).length;
        const progress = updatedSteps.length > 0 ? (completedCount / updatedSteps.length) * 100 : 0;

        return {
          ...activity,
          steps: updatedSteps,
          completed: completedCount,
          total: updatedSteps.length,
          progress: progress
        };
      }
      return activity;
    }));
  };

  const addStep = (activityId) => {
    setOngoingActivities(prev => prev.map(activity => {
      if (activity.id === activityId) {
        const newStep = {
          id: Date.now(),
          text: '새 항목',
          completed: false
        };
        const updatedSteps = [...activity.steps, newStep];
        return {
          ...activity,
          steps: updatedSteps,
          total: updatedSteps.length
        };
      }
      return activity;
    }));
  };

  const addQuestCard = () => {
    const newCard = {
      id: Date.now(),
      level: 'New',
      title: '새 활동',
      progress: 0,
      completed: 0,
      total: 1,
      steps: [
        {
          id: 1,
          text: '새 항목',
          completed: false
        }
      ],
      reward: '보상: 직접 입력'
    };
    setOngoingActivities(prev => [newCard, ...prev]);
  };

  const editCardTitle = (activityId, newTitle) => {
    setOngoingActivities(prev => prev.map(activity => {
      if (activity.id === activityId) {
        return { ...activity, title: newTitle };
      }
      return activity;
    }));
  };

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
            <Link to="/simulation">시뮬레이션</Link>
            <Link to="/faq">FAQ</Link>
            <Link to="/mypage">마이페이지</Link>
            <Link to="/login" style={{ color: 'var(--main-accent)', fontWeight: 900 }}>로그인/회원가입</Link>
          </nav>
        </div>
      </header>

      <main className={styles.main}>
        <div className={styles.pageHeader}>
          <h1 className={styles.pageTitle}>활동</h1>
          <button className={styles.storeBtn} onClick={() => window.location.href = '/quest-store'}>
            🏪 퀘스트 상점
          </button>
        </div>

        {/* 사용자 통계 */}
        <div className={styles.userStats}>
          <div className={styles.statCard}>
            <div className={styles.statLabel}>현재 레벨</div>
            <div className={styles.statValue}>5</div>
            <div className={styles.statLabel}>다음 레벨까지 200XP</div>
          </div>
          <div className={styles.statCard}>
            <div className={styles.statLabel}>완료한 퀘스트</div>
            <div className={styles.statValue}>12</div>
            <div className={styles.statLabel}>총 20개 중</div>
          </div>
          <div className={styles.statCard}>
            <div className={styles.statLabel}>연속 달성</div>
            <div className={styles.statValue}>7일</div>
            <div className={styles.statLabel}>최고 기록: 15일</div>
          </div>
        </div>

        {/* 맞춤형 활동 추천 */}
        <div className={styles.recommendationSection}>
          <div className={styles.recommendationHeader}>
            <h2 className={styles.recommendationTitle}>맞춤형 활동 추천</h2>
          </div>
          <div className={styles.recommendationGrid}>
            {recommendations.map(recommendation => (
              <div key={recommendation.id} className={styles.recommendationCard}>
                <h3>{recommendation.title}</h3>
                <div className={styles.recommendationMeta}>
                  <span>{recommendation.duration}</span>
                  <span className={styles.recommendationReward}>{recommendation.reward}</span>
                </div>
                <p>{recommendation.description}</p>
                <button 
                  className={`${styles.activityButton} ${recommendation.added ? styles.added : ''}`}
                  onClick={() => addActivity(recommendation)}
                  disabled={recommendation.added}
                >
                  {recommendation.added ? '추가됨' : '시작하기'}
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* 진행 중인 활동 */}
        <div className={styles.questSection}>
          <button className={styles.addCardBtn} onClick={addQuestCard}>
            + 활동 추가
          </button>
          <div className={styles.questHeader}>
            <h2 className={styles.questTitle}>진행 중인 활동</h2>
          </div>
          <div className={styles.questGrid}>
            {ongoingActivities.map(activity => (
              <div 
                key={activity.id} 
                className={`${styles.questCard} ${activity.completed === activity.total ? styles.disabled : ''}`}
              >
                {activity.completed === activity.total && (
                  <div className={styles.completeBadge}>완료!</div>
                )}
                <span className={styles.questLevel}>{activity.level}</span>
                <h3>{activity.title}</h3>
                <div className={styles.questProgress}>
                  <div className={styles.progressBar}>
                    <div 
                      className={styles.progress} 
                      style={{ width: `${activity.progress}%` }}
                    ></div>
                  </div>
                  <div className={styles.progressText}>{activity.completed}/{activity.total} 완료</div>
                </div>
                <div className={styles.questSteps}>
                  {activity.steps.map(step => (
                    <div 
                      key={step.id} 
                      className={`${styles.step} ${step.completed ? 'completed' : step.current ? 'current' : 'pending'}`}
                    >
                      <label className={styles.customCheckbox}>
                        <input 
                          type="checkbox" 
                          checked={step.completed}
                          onChange={() => completeStep(activity.id, step.id)}
                          disabled={activity.completed === activity.total}
                        />
                        <span className={styles.checkmark}></span>
                      </label>
                      <span 
                        className="step-text" 
                        onDoubleClick={() => {
                          const newText = prompt('단계 이름을 입력하세요:', step.text);
                          if (newText !== null) {
                            editStepText(activity.id, step.id, newText);
                          }
                        }}
                      >
                        {step.text}
                      </span>
                      <button 
                        className={styles.deleteBtn} 
                        onClick={() => deleteStep(activity.id, step.id)}
                      >
                        🗑️
                      </button>
                    </div>
                  ))}
                  <button className={styles.addStepBtn} onClick={() => addStep(activity.id)}>
                    +
                  </button>
                </div>
                <div className={styles.questRewards}>
                  <span className={styles.reward}>{activity.reward}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>

      {showToast && (
        <div className={styles.toast} style={{ display: 'block' }}>
          {toastMessage}
        </div>
      )}
    </div>
  );
};

export default QuestPage;
