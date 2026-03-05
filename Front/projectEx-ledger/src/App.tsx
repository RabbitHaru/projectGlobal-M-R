import React from "react";
import { BrowserRouter } from "react-router-dom";
import AppRoutes from "./config/AppRoutes";
import { ToastProvider } from "./components/notification/ToastProvider";
import NotificationCenter from "./components/notification/NotificationCenter";

const App: React.FC = () => {
  return (
    <BrowserRouter>
      <ToastProvider>
        {/* 알림 리스너는 백그라운드에서 SSE 신호를 항상 감시합니다. */}
        <NotificationCenter />
        <AppRoutes />
      </ToastProvider>
    </BrowserRouter>
  );
};

export default App;
