// src/routers/testRoutes.js
import React from "react";

// 심리 검사 관련 페이지 임포트 (경로: src/pages/test 폴더 안)
import SelectTestPage from "../pages/test/SelectTestPage";
import PersonalityTestPage from "../pages/test/PersonalityTestPage";
import PsychologyTestPage from "../pages/test/PsychologyTestPage";

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
    path: "/PsychologyTestPage", // 심리 검사 페이지 경로
    element: <PsychologyTestPage />,
  },
];

export default testRoutes;
