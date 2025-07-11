
import React from 'react';
import { Route, Routes } from 'react-router-dom';
import CounselingPage from '../pages/counseling/CounselingPage';

/**
 * 상담 관련 페이지들의 라우팅을 관리하는 컴포넌트입니다.
 * 
 * - `/counseling`: AI 상담 페이지
 * - 향후 관련 서브 페이지들을 여기에 추가할 수 있습니다.
 */
const CounselingRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<CounselingPage />} />
      {/* 예시: <Route path="/history" element={<CounselingHistoryPage />} /> */}
    </Routes>
  );
};

export default CounselingRoutes;
