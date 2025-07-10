// src/routers/router.js
import React from "react";
import { Routes, Route } from "react-router-dom";

import Login from "../pages/Login";

// 기능별로 작성한 라우터를 불러오기
import userRoutes from "./userRoutes";
import NoticeListPage from "./noticeRoutes";
import adminRoutes from "./adminRoutes";
import testRoutes from "./testRoutes";
import noticeRoutes from "./noticeRoutes";
import questRoutes from "./questRoutes";
import contentRoutes from "./contentRoutes";
import EmotionRecordPage from '../pages/emotion/EmotionPage'; // 감정 기록 페이지 추가
import CounselingRoutes from './counselingRoutes'; // 상담 라우터 추가

const AppRouter = () => {
  return (
    <Routes>
      <Route path="/" element={<Login />} />
      {/* {userRoutes} */}
      {userRoutes.map((route) => (
        <Route key={route.path} path={route.path} element={route.element} />
      ))}
      {noticeRoutes}
      {adminRoutes.map((route) => (
        <Route key={route.path} path={route.path} element={route.element} />
      ))}

      {/* 상담 관련 라우트 */}
      <Route path="/counseling/*" element={<CounselingRoutes />} />
      
      {/* 감정 기록 페이지 라우트 */}
      <Route path="/record" element={<EmotionRecordPage />} />

      {/* {testRoutes} */}
      {/* {testRoutes.map((route) => (
        <Route key={route.path} path={route.path} element={route.element} />
      ))} */}
      {/* Quest Routes
      {questRoutes.map((route) => (
        <Route key={route.path} path={route.path} element={route.element} />
      ))} */}
      {/* Content Routes
      {contentRoutes.map((route) => (
        <Route key={route.path} path={route.path} element={route.element} />
      ))} */}
    </Routes>
  );
};

export default AppRouter;
