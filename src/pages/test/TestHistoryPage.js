// src/pages/test/TestHistoryPage.js

import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import styles from "./TestHistoryPage.module.css"; // 아래에 제공될 CSS 파일
import UserHeader from "../../components/common/UserHeader";

function TestHistoryPage() {
  const [historyData, setHistoryData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { userId } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchHistory = async () => {
      if (!userId) {
        setError("사용자 ID가 없습니다.");
        setLoading(false);
        return;
      }
      try {
        // ✨ 1. localStorage에서 토큰을 가져옵니다.
        const token = localStorage.getItem("accessToken");
        if (!token)
          throw new Error("인증 토큰이 없습니다. 로그인이 필요합니다.");

        // ✨ 2. axios.get 요청에 headers 옵션을 추가하여 토큰을 함께 보냅니다.
        const response = await axios.get(
          `/seems/api/personality-test/history/${userId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        setHistoryData(response.data);
      } catch (err) {
        setError("검사 기록을 불러오는 데 실패했습니다.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, [userId]);

  if (loading)
    return (
      <div>
        <UserHeader />
        <p>로딩 중...</p>
      </div>
    );
  if (error)
    return (
      <div>
        <UserHeader />
        <p>{error}</p>
      </div>
    );

  return (
    <div className={styles.historyContainer}>
      <UserHeader />
      <h1>나의 검사 기록</h1>
      {historyData.length > 0 ? (
        <ul className={styles.historyList}>
          {historyData.map((item, index) => (
            <li key={index} className={styles.historyItem}>
              <div className={styles.itemDate}>
                {new Date(item.createdAt).toLocaleDateString("ko-KR")}
              </div>
              <div className={styles.itemResult}>{item.result}</div>
              <div className={styles.itemTitle}>{item.mbtiTitle}</div>
            </li>
          ))}
        </ul>
      ) : (
        <p>아직 검사 기록이 없습니다.</p>
      )}
      <button onClick={() => navigate("/SelectTestPage")}>검사 선택으로</button>
    </div>
  );
}

export default TestHistoryPage;
