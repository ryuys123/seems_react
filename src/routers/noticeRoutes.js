// src/routes/noticeRoutes.js
import React from "react";
import { Route } from "react-router-dom";

import NoticeListPage from "../pages/notice/NoticeListPage";
import NoticeDetailPage from "../pages/notice/NoticeDetailPage";
import NoticeUpdatePage from "../pages/notice/NoticeUpdatePage";
import NoticeWritePage from "../pages/notice/NoticeWritePage";

const noticeRoutes = [
  <Route path="/notice" element={<NoticeListPage />} />,
  <Route path="/noticed/:noticeNo" element={<NoticeDetailPage />} />,
  <Route path="/noticeu/:noticeNo" element={<NoticeUpdatePage />} />,
  <Route path="/noticew" element={<NoticeWritePage />} />,
];

export default noticeRoutes;
