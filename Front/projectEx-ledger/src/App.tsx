// src/App.tsx
import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import LandingPage from "./pages/common/LandingPage";
// import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/admin/AdminDashboard';

const App: React.FC = () => {
  return (
    <BrowserRouter>
      <Routes>
        {/* 주소창에 '/' (루트) 입력 시 LandingPage 렌더링 */}
        <Route path="/" element={<LandingPage />} />

        {/* 추후 추가될 라우트들 */}
        {/* <Route path="/login" element={<LoginPage />} /> */}
        <Route path="/admin" element={<DashboardPage />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
