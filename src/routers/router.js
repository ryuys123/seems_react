// src/routers/router.js
import React from "react";
import { Routes, Route } from "react-router-dom";

import Login from "../pages/Login";
import EmotionRecordPage from '../pages/emotion/EmotiontPage'; // 감정 기록 페이지 추가
// 기능별로 작성한 라우터를 불러오기
import userRoutes from "./userRoutes";
import NoticeListPage from "../pages/notice/NoticeListPage";
import adminRoutes from "./adminRoutes";
import CounselingRoutes from './counselingRoutes'; // 상담 라우터 추가
const AppRouter = () => {
  return (
    <Routes>
      <Route path="/" element={<Login />} />
      {/* {userRoutes} */}
      {userRoutes.map((route) => (
        <Route key={route.path} path={route.path} element={route.element} />
      ))}
      {/* {noticeRoutes} */}
      <Route path="/notice" element={<NoticeListPage />} />
      {adminRoutes.map((route) => (
        <Route key={route.path} path={route.path} element={route.element} />
      ))}
              {/* 상담 관련 라우트 */}
            <Route path="/counseling/*" element={<CounselingRoutes />} />

            {/* 감정 기록 페이지 라우트 */}
            <Route path="/record" element={<EmotionRecordPage />} />
    </Routes>
  );
};

export default AppRouter;
