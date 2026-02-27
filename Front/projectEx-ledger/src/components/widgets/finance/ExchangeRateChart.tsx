import React from "react";

const ExchangeRateChart: React.FC<{ rates: any[] }> = ({ rates }) => {
  return (
    <div className="flex flex-col items-center justify-center w-full h-full border-2 border-gray-200 border-dashed bg-gray-50 rounded-xl">
      <svg
        className="w-16 h-16 mb-4 text-gray-300"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z"
        />
      </svg>
      <p className="font-medium text-gray-500">실시간 환율 변동 차트 준비 중</p>
      <p className="mt-1 text-xs text-gray-400">
        {rates.length}개의 통화 데이터 수신됨
      </p>
    </div>
  );
};

export default ExchangeRateChart;
