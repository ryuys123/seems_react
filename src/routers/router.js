// src/routers/router.js
import React from "react";
import { Routes, Route } from "react-router-dom";

import Login from "../pages/Login";
import PsychologyTestPage from "../pages/test/PsychologyTestPage";
import PsychologyTestResultPage from "../pages/test/PsychologyResultPage";
import AnalysisPage from "../pages/analysis/AnalysisPage"; // ⭐️ AnalysisPage 임포트
// 기능별로 작성한 라우터를 불러오기
import userRoutes from "./userRoutes";
import NoticeListPage from "./noticeRoutes";
import adminRoutes from "./adminRoutes";
import testRoutes from "./testRoutes";
import noticeRoutes from "./noticeRoutes";
import questRoutes from "./questRoutes";
import contentRoutes from "./contentRoutes";
import EmotionRecordPage from "../pages/emotion/EmotionPage"; // 감정 기록 페이지 추가
import CounselingRoutes from "./counselingRoutes"; // 상담 라우터 추가
import analysisRoutes from "./analysisRoutes"; // ⭐️ analysisRoutes 임포트
import faqRoutes from "./faqRoutes";

const AppRouter = () => {
  return (
    <Routes>
      <Route path="/" element={<Login />} />
      {/* {userRoutes} */}
      {userRoutes.map((route) => (
        <Route key={route.path} path={route.path} element={route.element} />
      ))}

      {noticeRoutes}
      {faqRoutes}
      {/*FAQ 라우트 */}
      {faqRoutes.map((route) => (
        <Route key={route.path} path={route.path} element={route.element} />
      ))}

      {adminRoutes.map((route) => (
        <Route key={route.path} path={route.path} element={route.element} />
      ))}

      {/* 상담 관련 라우트 */}
      <Route path="/counseling/*" element={<CounselingRoutes />} />

      {/* 감정 기록 페이지 라우트 */}
      <Route path="/record" element={<EmotionRecordPage />} />

      {/* ⭐️ analysisRoutes 매핑 */}
      {analysisRoutes.map((route) => (
        <Route key={route.path} path={route.path} element={route.element} />
      ))}

      {/* {testRoutes} */}
      {testRoutes.map((route) => (
        <Route key={route.path} path={route.path} element={route.element} />
      ))}
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
