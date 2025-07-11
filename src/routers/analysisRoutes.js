// src/routers/analysisroutes.js

import AnalysisPage from "../pages/analysis/AnalysisPage"; // AnalysisPage 임포트

// 분석 페이지 관련 라우트들을 배열로 정의
const analysisRoutes = [
  {
    path: "/analysis-dashboard", // 사용자가 접근할 경로
    element: <AnalysisPage />, // 해당 경로에서 렌더링할 컴포넌트
    name: "AnalysisDashboard", // 라우트 이름 (필요시 사용)
  },
  // 향후 다른 분석 관련 페이지가 있다면 여기에 추가
];

export default analysisRoutes;
