// src/routers/testRoutes.js
import React from "react";

// 심리 검사 관련 페이지 임포트 (경로: src/pages/test 폴더 안)
import SelectTestPage from "../pages/test/SelectTestPage";
import PersonalityTestPage from "../pages/test/PersonalityTestPage";
import PsychologyTestPage from "../pages/test/PsychologyTestPage";
import DepressionTestPage from "../pages/test/DepressionTestPage"; // <<-- 추가
import StressTestPage from "../pages/test/StressTestPage"; // <<-- 추가
import PsychologyResultPage from "../pages/test/PsychologyResultPage";
import PersonalityResultPage from "../pages/test/PersonalityResultPage"; // ✨ 1. 결과 페이지 컴포넌트 임포트
import TestHistoryPage from "../pages/test/TestHistoryPage"; // ✨ 히스토리 페이지 임포트
const testRoutes = [
  {
    path: "/SelectTestPage", // 검사 선택 페이지 경로
    element: <SelectTestPage />,
  },
  {
    path: "/personality-test/:testId", // 성격 검사 페이지 경로
    element: <PersonalityTestPage />,
  },
  {
    path: "/psychologyTestPage", // 심리 검사 페이지 경로
    element: <PsychologyTestPage />,
  },
  {
    path: "/psychological-test/depression", // <<-- 우울증 검사 페이지 라우트
    element: <DepressionTestPage />,
  },
  {
    path: "/psychological-test/stress", // <<-- 스트레스 검사 페이지 라우트
    element: <StressTestPage />,
  },
  {
    path: "/psychology-result/:resultId", // :resultId 추가
    element: <PsychologyResultPage />,
  },
  {
    path: "/personality-test/result/:userId", // :userId는 동적 파라미터입니다.
    element: <PersonalityResultPage />,
  },
  {
    path: "/personality-test/history/:userId",
    element: <TestHistoryPage />,
  },
];

export default testRoutes;
