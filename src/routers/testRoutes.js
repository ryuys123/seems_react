// src/routers/testRoutes.js
import React from "react";

// 심리 검사 관련 페이지 임포트 (경로: src/pages/test 폴더 안)
import SelectTestPage from "../pages/test/SelectTestPage";
import PersonalityTestPage from "../pages/test/PersonalityTestPage";
import PsychologyTestPage from "../pages/test/PsychologyTestPage";
import PsychologyResultPage from "../pages/test/PsychologyResultPage";
const testRoutes = [
  {
    path: "/SelectTestPage", // 검사 선택 페이지 경로
    element: <SelectTestPage />,
  },
  {
    path: "/PersonalityTestPage", // 성격 검사 페이지 경로
    element: <PersonalityTestPage />,
  },
  {
    path: "/psychologyTestPage", // 심리 검사 페이지 경로
    element: <PsychologyTestPage />,
  },
  {
    path: "/psychological-test/result/:resultId", // :resultId는 동적 파라미터
    element: <PsychologyResultPage />,
  },
];

export default testRoutes;
