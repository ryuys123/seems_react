import React from "react";
import SelectSimulationPage from "../pages/simulation/SelectSimulationPage";
import SimulationTestPage from "../pages/simulation/SimulationTestPage";
import SimulationResultPage from "../pages/simulation/SimulationResultPage"; // ✅ 추가 임포트
const simulationRoutes = [
  {
    path: "/simulation",
    element: <SelectSimulationPage />,
  },
  {
    path: "/simulation/test",
    element: <SimulationTestPage />,
  },

  {
    // ✅ 결과 상세 보기 페이지 라우트: 특정 settingId의 상세 결과를 보여줍니다.
    // SelectSimulationPage에서 '결과 상세 보기' 클릭 시 이동하는 페이지가 될 수 있습니다.
    path: "/simulation/result-details/:settingId", // ✅ 경로 변경: /simulation/result 대신 상세 ID를 받도록
    element: <SimulationResultPage />,
  },
];

export default simulationRoutes;
