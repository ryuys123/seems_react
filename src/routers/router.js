// src/routers/router.js
import React from "react";
import { Routes, Route } from "react-router-dom";

import Login from "../pages/Login";

// 기능별로 작성한 라우터를 불러오기
import userRoutes from "./userRoutes";
import NoticeListPage from "../pages/notice/NoticeListPage";
import adminRoutes from "./adminRoutes";
import testRoutes from "./testRoutes";

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
      {/* {testRoutes} */}
      {/* {testRoutes.map((route) => (
        <Route key={route.path} path={route.path} element={route.element} />
      ))} */}
    </Routes>
  );
};

export default AppRouter;
