// src/pages/admin/AdminDashboard.js  : 관리자 대시보드 페이지
import React, { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./AdminDashboard.module.css";
import apiClient from "../../utils/axios";
import { AuthContext } from "../../AuthProvider";
import AdminHeader from "../../components/common/AdminHeader";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

// 몇월 몇주차인지 계산해주는 함수
function getStartDateOfIsoWeek(year, week) {
  const simple = new Date(year, 0, 1 + (week - 1) * 7);
  const dow = simple.getDay(); // 0 (일) ~ 6 (토)
  const ISOweekStart = new Date(simple);
  if (dow <= 4) ISOweekStart.setDate(simple.getDate() - simple.getDay() + 1);
  else ISOweekStart.setDate(simple.getDate() + 8 - simple.getDay());
  return ISOweekStart;
}

function getWeekOfMonth(date) {
  const firstDayOfMonth = new Date(date.getFullYear(), date.getMonth(), 1);
  const dayOfWeek = firstDayOfMonth.getDay() || 7; // 1~7
  const offsetDate = date.getDate() + dayOfWeek - 1;
  return Math.ceil(offsetDate / 7);
}

//지난주 대비 증감률 계산 함수
function calculateChangeRate(stats) {
  if (!stats || stats.length < 2) return null;

  const len = stats.length;

  const thisWeek = stats[len - 1].count;
  const lastWeek = stats[len - 2].count;

  if (lastWeek === 0) {
    return thisWeek === 0 ? 0 : 100;
  }

  const rate = Math.round(((thisWeek - lastWeek) / lastWeek) * 100);
  return rate;
}

//어제 대비 증감률 함수 (방문자수)
function calculateDailyChangeRate(todayCount, yesterdayCount) {
  if (yesterdayCount === 0) {
    return todayCount === 0 ? 0 : 100;
  }
  return Math.round(((todayCount - yesterdayCount) / yesterdayCount) * 100);
}

function AdminDashboard() {
  const [userStatsType, setUserStatsType] = useState("weekly"); // weekly | monthly
  const [userStats, setUserStats] = useState([]); // 그래프용 가입자 통계
  const [userSummary, setUserSummary] = useState({});
  const [visitorStats, setVisitorStats] = useState([]);
  const [visitorSummary, setVisitorSummary] = useState({});
  const [emotionSummary, setEmotionSummary] = useState(null);
  const [counselingSummary, setCounselingSummary] = useState(null);

  const emotionRate = calculateChangeRate(emotionSummary?.weeklyEmotionStats);
  const counselingRate = calculateChangeRate(
    counselingSummary?.weeklyCounselingStats
  );

  const { role, secureApiRequest } = useContext(AuthContext);
  const navigate = useNavigate();

  // 백엔드 API 호출
  useEffect(() => {
    const fetchData = async () => {
      try {
        const base = "/admindashboard";

        // ✅ API 호출
        const [u, v, e, c] = await Promise.all([
          secureApiRequest(`${base}/usercount?type=daily`, { method: "GET" }),
          secureApiRequest(`${base}/visitorcount?type=daily`, {
            method: "GET",
          }),
          secureApiRequest(`${base}/emotioncount?type=daily`, {
            method: "GET",
          }),
          secureApiRequest(`${base}/counselingcount?type=daily`, {
            method: "GET",
          }),
        ]);

        console.log("📊 가입자 통계 전체 응답:", u.data);
        console.log("📊 방문자 통계 전체 응답:", v.data);
        console.log("🧠 감정기록 응답:", e.data);
        console.log("💬 상담기록 응답:", c.data);

        setUserSummary(u.data);
        setVisitorSummary(v.data);
        setEmotionSummary(e.data);
        setCounselingSummary(c.data);

        // ✅ 가입자 통계 데이터 가공
        const joinData = u.data.weeklyJoinStats.map((item) => {
          const [yearStr, weekStr] = item.week.split("-");
          const year = parseInt(yearStr, 10);
          const week = parseInt(weekStr, 10);

          const startDate = getStartDateOfIsoWeek(year, week);
          const month = startDate.getMonth() + 1;
          const weekOfMonth = getWeekOfMonth(startDate);

          return {
            period: `${month}월 ${weekOfMonth}주차`,
            count: item.count,
          };
        });

        // ✅ 방문자 통계 데이터 가공
        const visitData = v.data.weeklyVisitorStats.map((item) => {
          const [yearStr, weekStr] = item.period.split("-"); // period = "2025-30"
          const year = parseInt(yearStr, 10);
          const week = parseInt(weekStr, 10);

          const startDate = getStartDateOfIsoWeek(year, week);
          const month = startDate.getMonth() + 1;
          const weekOfMonth = getWeekOfMonth(startDate);

          return {
            period: `${month}월 ${weekOfMonth}주차`,
            count: item.visitorCount,
          };
        });

        setUserStats(joinData);
        setVisitorStats(visitData);
      } catch (err) {
        console.error("❌ fetchData 에러:", err);
      }
    };

    fetchData();
  }, []);

  // 오늘 날짜 구하기 (형식 맞춰야 함: 'YYYY-MM-DD')
  const today = new Date().toISOString().split("T")[0]; // '2025-07-28' 형태

  // 오늘 방문자 수 찾기
  const todayVisitorData = visitorSummary.dailyVisitorStats?.find(
    (item) => item.period === today
  );
  const todayVisitorCount = todayVisitorData?.visitorCount ?? 0;

  // 어제 날짜 찾기
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = yesterday.toISOString().split("T")[0];
  //어제 방문자 수 찾기
  const yesterdayVisitorData = visitorSummary.dailyVisitorStats?.find(
    (item) => item.period === yesterdayStr
  );
  const yesterdayVisitorCount = yesterdayVisitorData?.visitorCount ?? 0;

  // 어제 대비 방문자 수 증감률 계산
  const visitorRate = calculateDailyChangeRate(
    todayVisitorCount,
    yesterdayVisitorCount
  );

  // 그래프 탭 전환
  const handleStatsTypeChange = (type) => {
    setUserStatsType(type);

    let newStats = [];

    if (type === "weekly") {
      const now = new Date();
      const fourWeeksAgo = new Date(now);
      fourWeeksAgo.setDate(fourWeeksAgo.getDate() - 7 * 4);

      newStats =
        userSummary.weeklyJoinStats
          ?.map((item) => {
            const [yearStr, weekStr] = item.week.split("-");
            const year = parseInt(yearStr, 10);
            const week = parseInt(weekStr, 10);
            const startDate = getStartDateOfIsoWeek(year, week);

            if (startDate < fourWeeksAgo) return null; // 🔥 4주 이내만

            const month = startDate.getMonth() + 1;
            const weekOfMonth = getWeekOfMonth(startDate);

            return {
              period: `${month}월 ${weekOfMonth}주차`,
              count: item.count,
            };
          })
          .filter(Boolean) || [];
    } else if (type === "monthly") {
      const now = new Date();
      const twelveMonthsAgo = new Date(now);
      twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 12);

      newStats =
        userSummary.monthlyJoinStats
          ?.map((item) => {
            const [year, month] = item.date.split("-");
            const statDate = new Date(parseInt(year), parseInt(month) - 1); // 0-based month

            if (statDate < twelveMonthsAgo) return null;

            return {
              period: `${year}년 ${parseInt(month, 10)}월`,
              count: item.count,
            };
          })
          .filter(Boolean) || [];
    }

    setUserStats(newStats);
  };

  const renderChart = (data, title, color) => (
    <div className={styles.chartContainer}>
      <div className={styles.chartTitle}>{title}</div>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="period" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Bar dataKey="count" fill={color} name={title} barSize={40} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
  return (
    <div className={styles.adminDashboard}>
      <AdminHeader />
      <h1 className={styles.pageTitle}>관리자 대시보드</h1>
      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <div className={styles.statTitle}>총 사용자 수</div>
          <div className={styles.statValue}>
            {userSummary.totalUsers?.toLocaleString() ?? "-"}
          </div>
          <div className={styles.statSub}>
            총 탈퇴자 수: {userSummary.totalWithdraws?.toLocaleString() ?? "-"}
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statTitle}>오늘 방문자 수</div>
          <div className={styles.statValue}>
            {todayVisitorCount.toLocaleString()}
          </div>
          <div className={styles.statSub}>
            {visitorRate === 0
              ? "어제 대비 : 변화 없음"
              : `어제 대비 ${visitorRate > 0 ? "+" : ""}${visitorRate}%`}
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statTitle}>전체 감정기록 수</div>
          <div className={styles.statValue}>
            {emotionSummary?.totalEmotionLogs?.toLocaleString() ?? "-"}
          </div>
          <div className={styles.statSub}>
            {emotionRate == null
              ? "지난주 대비 : 변화 없음"
              : emotionRate === 0
                ? "지난주 대비 : 변화 없음"
                : `지난주 대비 ${emotionRate > 0 ? "+" : ""}${emotionRate}%`}
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statTitle}>전체 상담기록 수</div>
          <div className={styles.statValue}>
            {counselingSummary?.totalCounselingLogs?.toLocaleString() ?? "-"}
          </div>
          <div className={styles.statSub}>
            {counselingRate == null
              ? "지난주 대비 : 변화 없음"
              : counselingRate === 0
                ? "지난주 대비 : 변화 없음"
                : `지난주 대비 ${counselingRate > 0 ? "+" : ""}${counselingRate}%`}
          </div>
        </div>
      </div>

      <main className={styles.main}>
        {/* 대시보드 섹션 */}
        <div style={{ padding: "20px" }}>
          <div style={{ margin: "10px 0" }}>
            <button onClick={() => handleStatsTypeChange("weekly")}>
              주별
            </button>
            <button onClick={() => handleStatsTypeChange("monthly")}>
              월별
            </button>
          </div>

          {renderChart(userStats, "가입자 수", "#8884d8")}
          {renderChart(visitorStats, "방문자 수", "#82ca9d")}
        </div>
      </main>
    </div>
  );
}

export default AdminDashboard;
