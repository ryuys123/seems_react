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
    path: "/simulation/result", // ✅ 새로운 결과 페이지 라우트
    element: <SimulationResultPage />,
  },
];

export default simulationRoutes;

