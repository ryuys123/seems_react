import QuestPage from "../pages/quest/QuestPage";
import QuestStorePage from "../pages/quest/QuestStorePage";

const questRoutes = [
  {
    path: "/quest",
    element: <QuestPage />
  },
  {
    path: "/quest-store",
    element: <QuestStorePage />
  }
];

export default questRoutes;
