import React from "react";
import { formatCurrency, getCurrencyName } from "../../../utils/formatter";

interface ExchangeRate {
  curUnit: string;
  rate: number;
  updatedAt: string;
}

// Props 인터페이스 정의
interface FXTickerProps {
  rates: ExchangeRate[];
}

const FXTicker: React.FC<FXTickerProps> = ({ rates }) => {
  return (
    <div className="ticker-container">
      <h2 className="mb-4 text-xl font-bold">실시간 환율 정보</h2>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {rates.map((rate) => (
          <div
            key={rate.curUnit}
            className="p-4 transition-colors bg-white border rounded-lg shadow-sm hover:border-blue-200"
          >
            <div className="flex items-center justify-between">
              <div>
                <span className="text-lg font-semibold">
                  {rate.curUnit.split("(")[0]}
                </span>
                <p className="text-sm text-gray-500">
                  {getCurrencyName(rate.curUnit)}
                </p>
              </div>
              <div className="text-right">
                <span className="font-bold text-blue-600">
                  {formatCurrency(rate.rate, rate.curUnit)}
                </span>
                <p className="mt-1 text-xs text-gray-400">{rate.updatedAt}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default FXTicker;
