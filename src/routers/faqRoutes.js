import React from "react";
import { Route } from "react-router-dom";

import FaqListPage from "../pages/faq/FaqListPage";
import FaqDetailPage from "../pages/faq/FaqDetailPage";
import FaqUpdatePage from "../pages/faq/FaqUpdatePage";
import FaqWritePage from "../pages/faq/FaqWritePage";

const faqRoutes = [
  <Route path="/faq" element={<FaqListPage />} />,
  <Route path="/faqd/:faqNo" element={<FaqDetailPage />} />,
  <Route path="/faqu/:faqNo" element={<FaqUpdatePage />} />,
  <Route path="/faqw" element={<FaqWritePage />} />,
];

export default faqRoutes;
