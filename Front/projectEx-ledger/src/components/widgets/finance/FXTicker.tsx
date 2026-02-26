import React from "react";
import { formatCurrency } from "../../../utils/formatter";
import type { ExchangeRate } from "../../../types/exchange";

interface FXTickerProps {
  rates: ExchangeRate[];
}

const FXTicker: React.FC<FXTickerProps> = ({ rates }) => {
  if (!rates || !Array.isArray(rates) || rates.length === 0) {
    return <div className="w-full h-10 bg-white border-b border-gray-200" />;
  }

  // 2. 주요 3대 통화 필터링
  const displayRates = rates
    .filter((r) => {
      const unit = r.curUnit.toUpperCase();
      return (
        unit.includes("USD") || unit.includes("JPY") || unit.includes("EUR")
      );
    })
    .slice(0, 3);

  if (displayRates.length === 0) return null;

  // 3. 무한 스크롤을 위한 복제
  const duplicatedRates = [...displayRates, ...displayRates, ...displayRates];

  return (
    <div className="relative flex items-center w-full h-10 overflow-hidden bg-white border-b border-gray-200">
      <style>
        {`
          @keyframes ticker-slide {
            0% { transform: translateX(0); }
            100% { transform: translateX(-33.33%); }
          }
          .ticker-track {
            display: flex;
            width: max-content;
            animation: ticker-slide 25s linear infinite;
          }
          .ticker-track:hover { animation-play-state: paused; }
        `}
      </style>

      <div className="ticker-track">
        {duplicatedRates.map((rate, index) => {
          // 🌟 [핵심] 실제 데이터를 기반으로 한 등락 판별 로직
          const amount = rate.changeAmount || 0;
          const isUp = amount > 0;
          const isDown = amount < 0;

          // 색상 및 기호 결정
          const colorClass = isUp
            ? "text-red-500"
            : isDown
              ? "text-blue-500"
              : "text-gray-500";
          const arrow = isUp ? "▲" : isDown ? "▼" : "-";

          const currencyName = rate.curUnit.includes("USD")
            ? "미국 달러"
            : rate.curUnit.includes("JPY")
              ? "일본 엔"
              : "유로";

          return (
            <div
              key={`${rate.curUnit}-${index}`}
              className="flex items-center px-12 whitespace-nowrap"
            >
              <span className="mr-3 text-sm font-medium text-gray-500">
                {currencyName}
              </span>

              <span className="mr-3 text-base font-bold text-slate-800">
                {formatCurrency(rate.rate, rate.curUnit)}
              </span>

              {/* 🌟 백엔드에서 계산해준 실제 수치 출력 */}
              <span
                className={`flex items-center text-sm font-semibold ${colorClass}`}
              >
                {arrow} {Math.abs(amount).toFixed(2)}
                <span className="ml-1 text-xs">
                  ({(rate.changeRate || 0).toFixed(2)}%)
                </span>
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default FXTicker;
