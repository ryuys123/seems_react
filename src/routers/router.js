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

const AppRouter = () => {
  return (
    <Routes>
      <Route path="/" element={<Login />} />
      {/* {userRoutes} */}
      {userRoutes.map((route) => (
        <Route key={route.path} path={route.path} element={route.element} />
      ))}
      {noticeRoutes}
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
