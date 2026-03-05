import React, { useState, useEffect } from "react";
import { formatCurrency, getCurrencyName } from "../../../utils/formatter";
import type { ExchangeRate } from "../../../types/exchange";

interface MiniConverterProps {
  rates: ExchangeRate[];
}

const MiniConverter: React.FC<MiniConverterProps> = ({ rates }) => {
  const [selectedUnit, setSelectedUnit] = useState<string>("USD");
  const [amount, setAmount] = useState<number>(0);
  const [result, setResult] = useState<number>(0);

  useEffect(() => {
    const currentRate = rates.find((r) => r.curUnit === selectedUnit);
    if (currentRate) {
      let rateValue = currentRate.rate;
      // 🌟 담당자님의 JPY(100) 보정 로직
      if (selectedUnit.includes("(100)")) {
        rateValue = rateValue / 100;
      }
      setResult(amount * rateValue);
    }
  }, [amount, selectedUnit, rates]);

  return (
    <div className="p-6 bg-white border border-gray-100 shadow-md rounded-xl">
      <h3 className="mb-4 text-lg font-bold text-gray-800">
        실시간 환전 계산기
      </h3>
      <div className="space-y-4">
        <div className="flex gap-2">
          <select
            value={selectedUnit}
            onChange={(e) => setSelectedUnit(e.target.value)}
            className="p-2 text-sm border rounded-md bg-gray-50"
          >
            {rates.map((r) => (
              <option key={r.curUnit} value={r.curUnit}>
                {r.curUnit.split("(")[0]} ({getCurrencyName(r.curUnit)})
              </option>
            ))}
          </select>
          <input
            type="number"
            value={amount || ""}
            onChange={(e) => setAmount(Number(e.target.value))}
            className="flex-1 p-2 text-right border rounded-md"
            placeholder="0.00"
          />
        </div>
        <div className="pt-4 border-t border-dashed">
          <div className="text-2xl font-black text-right text-blue-700">
            {formatCurrency(result, "KRW")}
          </div>
          <p className="text-[10px] text-gray-400 mt-2 text-right">
            * 실거래 환율과 차이가 있을 수 있습니다.
          </p>
        </div>
      </div>
    </div>
  );
};

export default MiniConverter;
