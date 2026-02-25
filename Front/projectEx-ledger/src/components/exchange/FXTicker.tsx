import React, { useEffect, useState } from "react";
import { formatCurrency, getCurrencyName } from "../../utils/formatter";

interface ExchangeRate {
  curUnit: string;
  rate: number;
  updatedAt: string;
}

const FXTicker: React.FC = () => {
  const [rates, setRates] = useState<ExchangeRate[]>([]);

  useEffect(() => {
    // 1. 초기 데이터 로드 (백엔드 API 호출)
    fetch("/api/exchange/latest")
      .then((res) => res.json())
      .then((data) => setRates(data));

    // 2. SSE 연결 (실시간 업데이트 수신)
    const eventSource = new EventSource("/api/connect");
    eventSource.addEventListener("exchange-update", (event: any) => {
      const updatedRates = JSON.parse(event.data);
      setRates(updatedRates);
    });

    return () => eventSource.close();
  }, []);
.
  return (
    <div className="ticker-container">
      <h2 className="text-xl font-bold mb-4">실시간 환율 정보</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {rates.map((rate) => (
          <div
            key={rate.curUnit}
            className="p-4 border rounded-lg shadow-sm bg-white"
          >
            <div className="flex justify-between items-center">
              <div>
                <span className="font-semibold text-lg">
                  {rate.curUnit.split("(")[0]}
                </span>
                <p className="text-sm text-gray-500">
                  {getCurrencyName(rate.curUnit)}
                </p>
              </div>
              <div className="text-right">
                {/* 우리가 만든 포맷터 적용 부분 */}
                <span className="text-blue-600 font-bold">
                  {formatCurrency(rate.rate, rate.curUnit)}
                </span>
                <p className="text-xs text-gray-400">{rate.updatedAt}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default FXTicker;
