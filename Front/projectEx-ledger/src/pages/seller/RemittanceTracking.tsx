import React, { useState, useEffect } from "react";
import axios from "axios";

// 송금 상태 타입 정의
type RemittanceStatus = "REVIEW" | "EXCHANGE_DONE" | "SENDING" | "COMPLETED";

interface Remittance {
  id: string;
  recipientName: string;
  amount: number;
  currency: string;
  status: RemittanceStatus;
  requestedAt: string;
}

const RemittanceTracking: React.FC = () => {
  const [remittances, setRemittances] = useState<Remittance[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRemittances = async () => {
      try {
        const response = await axios.get(
          "http://localhost:8080/api/v1/remittance/my",
        );
        setRemittances(response.data);
      } catch (error) {
        console.error("송금 내역 로드 실패:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchRemittances();
  }, []);

  const steps = [
    { key: "REVIEW", label: "검토 중" },
    { key: "EXCHANGE_DONE", label: "환전 완료" },
    { key: "SENDING", label: "해외 송금 중" },
    { key: "COMPLETED", label: "완료" },
  ];

  return (
    <div className="max-w-4xl p-6 mx-auto space-y-8">
      <header className="pb-6 border-b border-gray-100">
        <h1 className="text-2xl font-extrabold text-gray-900">
          송금 추적 및 이력
        </h1>
        <p className="mt-1 text-sm text-gray-500">
          신청하신 송금 건의 실시간 진행 상태입니다.
        </p>
      </header>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="w-8 h-8 border-b-2 border-blue-600 rounded-full animate-spin"></div>
        </div>
      ) : (
        <div className="grid gap-6">
          {remittances.map((item) => (
            <div
              key={item.id}
              className="p-6 transition-shadow bg-white border border-gray-200 shadow-sm rounded-3xl hover:shadow-md"
            >
              {/* 상단 간략 정보 */}
              <div className="flex items-center justify-between mb-8">
                <div>
                  <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded-full uppercase tracking-tighter mb-2 inline-block">
                    Transaction ID: {item.id}
                  </span>
                  <h3 className="text-lg font-bold text-gray-800">
                    {item.recipientName}님께 송금
                  </h3>
                </div>
                <div className="text-right">
                  <p className="text-xl font-black text-gray-900">
                    {item.amount.toLocaleString()} {item.currency}
                  </p>
                  <p className="text-xs text-gray-400">
                    {new Date(item.requestedAt).toLocaleDateString()}
                  </p>
                </div>
              </div>

              {/* 실시간 스테퍼 UI */}
              <div className="relative">
                <div className="absolute left-0 w-full h-1 -translate-y-1/2 bg-gray-100 top-1/2"></div>
                <div className="relative flex justify-between">
                  {steps.map((step, index) => {
                    const statusIndex = steps.findIndex(
                      (s) => s.key === item.status,
                    );
                    const isActive = index <= statusIndex;
                    const isCurrent = index === statusIndex;

                    return (
                      <div
                        key={step.key}
                        className="flex flex-col items-center gap-3 px-2 bg-white"
                      >
                        <div
                          className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-500 z-10 ${
                            isActive
                              ? "bg-blue-600 text-white ring-4 ring-blue-100"
                              : "bg-gray-100 text-gray-400"
                          } ${isCurrent ? "animate-pulse" : ""}`}
                        >
                          {isActive ? "✓" : index + 1}
                        </div>
                        <span
                          className={`text-[11px] font-bold ${isActive ? "text-blue-600" : "text-gray-300"}`}
                        >
                          {step.label}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default RemittanceTracking;
