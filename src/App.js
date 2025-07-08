import React, { useState } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import "./App.css";

// 사용할 컴포넌트 불러오기 : 모든 페이지에 적용됨
import Footer from "./components/common/Footer";

// 별도로 작성된 라우터 등록 설정 파일을 불러오기함
import AppRouter from "./routers/router";
import NoticeListPage from "./pages/notice/NoticeListPage";

function App() {
  return (
    <Router>
      <AppRouter />
      {/* <Footer /> */}
    </Router>
  );
}

export default App;
