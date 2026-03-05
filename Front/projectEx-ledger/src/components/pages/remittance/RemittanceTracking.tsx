import React from "react";
import { CheckCircle, Clock, Send, AlertCircle, Package } from "lucide-react";

type StatusType = "REQUESTED" | "PENDING" | "COMPLETED" | "FAILED" | "REJECTED";

interface TrackingProps {
  status: StatusType;
  transactionId?: string;
  updatedAt?: string;
}

const RemittanceTracking: React.FC<TrackingProps> = ({
  status,
  transactionId,
  updatedAt,
}) => {
  const steps = [
    { key: "REQUESTED", label: "송금 신청", icon: <Package size={20} /> },
    { key: "PENDING", label: "은행 심사", icon: <Clock size={20} /> },
    { key: "SENDING", label: "송금 중", icon: <Send size={20} /> }, // PENDING의 세부 단계로 표현 가능
    { key: "COMPLETED", label: "송금 완료", icon: <CheckCircle size={20} /> },
  ];

  const getActiveStep = () => {
    switch (status) {
      case "REQUESTED":
        return 0;
      case "PENDING":
        return 1;
      case "COMPLETED":
        return 3;
      default:
        return -1; // FAILED, REJECTED
    }
  };

  const activeIndex = getActiveStep();
  const isError = status === "FAILED" || status === "REJECTED";

  return (
    <div className="w-full p-8 bg-white border border-gray-100 shadow-xl rounded-3xl">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h3 className="text-xl font-black text-gray-800">송금 진행 현황</h3>
          <p className="text-sm font-medium text-gray-400">
            거래번호: {transactionId || "TRX-000000"}
          </p>
        </div>
        {isError && (
          <div className="flex items-center gap-2 px-4 py-2 text-xs font-bold text-red-600 rounded-full bg-red-50 animate-pulse">
            <AlertCircle size={14} />
            {status === "REJECTED" ? "관리자 반려" : "송금 실패"}
          </div>
        )}
      </div>

      <div className="relative flex items-center justify-between w-full">
        <div className="absolute left-0 w-full h-1 bg-gray-100 top-5 -z-0"></div>
        <div
          className="absolute left-0 h-1 transition-all duration-1000 bg-blue-500 top-5 -z-0"
          style={{ width: `${(activeIndex / (steps.length - 1)) * 100}%` }}
        ></div>

        {steps.map((step, index) => {
          const isCompleted = index < activeIndex || status === "COMPLETED";
          const isActive = index === activeIndex;

          return (
            <div
              key={step.key}
              className="relative z-10 flex flex-col items-center"
            >
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-500 ${
                  isCompleted
                    ? "bg-blue-600 text-white shadow-lg shadow-blue-200"
                    : isActive
                      ? "bg-white border-4 border-blue-600 text-blue-600 scale-110"
                      : "bg-white border-2 border-gray-200 text-gray-300"
                }`}
              >
                {isCompleted && index !== activeIndex ? (
                  <CheckCircle size={20} />
                ) : (
                  step.icon
                )}
              </div>
              <span
                className={`mt-3 text-xs font-bold ${
                  isActive
                    ? "text-blue-600"
                    : isCompleted
                      ? "text-gray-800"
                      : "text-gray-400"
                }`}
              >
                {step.label}
              </span>
              {isActive && (
                <span className="absolute -bottom-6 w-max text-[10px] text-blue-400 animate-bounce">
                  처리 중...
                </span>
              )}
            </div>
          );
        })}
      </div>

      <div className="mt-16 pt-6 border-t border-gray-50 flex justify-between items-center text-[11px] text-gray-400">
        <span>최종 업데이트: {updatedAt || "방금 전"}</span>
        <button className="px-3 py-1 transition-colors rounded-lg bg-gray-50 hover:bg-gray-100">
          상세 내역 보기
        </button>
      </div>
    </div>
  );
};

export default RemittanceTracking;
