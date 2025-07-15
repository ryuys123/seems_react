import React from "react";
import SelectSimulationPage from "../pages/simulation/SelectSimulationPage";
import SimulationTestPage from "../pages/simulation/SimulationTestPage";

const simulationRoutes = [
  {
    path: "/simulation",
    element: <SelectSimulationPage />,
  },
  {
    path: "/simulation/test",
    element: <SimulationTestPage />,
  },
];

export default simulationRoutes;
