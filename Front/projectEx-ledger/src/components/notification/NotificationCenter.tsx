import React, { useState, useEffect, useCallback } from "react";

// 1. 알림 데이터 타입 정의
interface Notification {
  id: number;
  message: string;
  type: "SUCCESS" | "ERROR" | "INFO"; // 송금 성공/실패 및 보안 알림
  timestamp: string;
}

const NotificationCenter: React.FC = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [activeToast, setActiveToast] = useState<Notification | null>(null);

  // 2. 실시간 알림 수신 (SSE 연결)
  useEffect(() => {
    // SecurityConfig에서 허용한 SSE 엔드포인트로 연결합니다.
    const eventSource = new EventSource("http://localhost:8080/api/connect");

    eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);

        const newNoti: Notification = {
          id: Date.now(),
          message: data.message || "새로운 알림이 있습니다.",
          type: data.type || "INFO",
          timestamp: new Date().toLocaleTimeString(),
        };

        // 상태 업데이트: 목록에 추가 및 토스트 노출
        setNotifications((prev) => [newNoti, ...prev]);
        setActiveToast(newNoti);

        // 5초 후 토스트 자동 소멸
        setTimeout(() => setActiveToast(null), 5000);
      } catch (err) {
        console.error("알림 데이터 파싱 오류:", err);
      }
    };

    eventSource.onerror = (err) => {
      console.error("SSE 연결 끊김. 재연결 시도 중...", err);
      // 브라우저가 자동으로 재연결을 시도하지만, 에러 로그를 남겨 관리자가 확인할 수 있게 합니다.
    };

    return () => {
      eventSource.close(); // 컴포넌트 언마운트 시 연결 종료
    };
  }, []);

  return (
    <>
      {/* 3. 실시간 토스트 UI (화면 우측 상단 고정) */}
      {activeToast && (
        <div
          className={`fixed top-6 right-6 z-[9999] min-w-[300px] p-4 rounded-2xl shadow-2xl border-2 flex items-center gap-4 animate-fade-in-down transition-all ${
            activeToast.type === "SUCCESS"
              ? "bg-green-50 border-green-200 text-green-800"
              : activeToast.type === "ERROR"
                ? "bg-red-50 border-red-200 text-red-800"
                : "bg-blue-50 border-blue-200 text-blue-800"
          }`}
        >
          <div className="text-2xl">
            {activeToast.type === "SUCCESS"
              ? "✅"
              : activeToast.type === "ERROR"
                ? "🚨"
                : "📢"}
          </div>
          <div className="flex-1">
            <h4 className="text-sm font-black tracking-tight">
              {activeToast.type} Notification
            </h4>
            <p className="text-sm font-medium leading-tight">
              {activeToast.message}
            </p>
          </div>
          <button
            onClick={() => setActiveToast(null)}
            className="text-gray-400 hover:text-gray-600"
          >
            ✕
          </button>
        </div>
      )}

      {/* 4. 알림 내역 아이콘 (우측 하단) */}
      <div className="fixed bottom-8 right-8 z-[9000]">
        <button className="relative p-4 text-white transition-all bg-gray-900 rounded-full shadow-xl hover:scale-110 active:scale-95">
          <span className="text-xl">🔔</span>
          {notifications.length > 0 && (
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold w-6 h-6 rounded-full flex items-center justify-center border-2 border-white">
              {notifications.length > 99 ? "99+" : notifications.length}
            </span>
          )}
        </button>
      </div>
    </>
  );
};

export default NotificationCenter;
