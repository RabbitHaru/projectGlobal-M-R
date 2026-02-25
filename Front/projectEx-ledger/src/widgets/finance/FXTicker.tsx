// src/components/finance/FXTicker.tsx
import React from 'react';

const FXTicker: React.FC = () => {
  return (
    <div className="w-full bg-slate-900 text-gray-200 py-2 overflow-hidden flex items-center justify-center text-sm font-medium">
      {/* 임시 하드코딩 데이터 - 추후 애니메이션 추가 필요 */}
      <div className="flex space-x-8">
        <span>USD/KRW <span className="text-red-400">1350.50 ▲ 5.36%</span></span>
        <span className="text-gray-600">|</span>
        <span>JPY/KRW <span className="text-blue-400">912.30 ▼ 1.39%</span></span>
        <span className="text-gray-600">|</span>
        <span>EUR/KRW <span className="text-red-400">1450.20 ▲ 3.86%</span></span>
      </div>
    </div>
  );
};

export default FXTicker;