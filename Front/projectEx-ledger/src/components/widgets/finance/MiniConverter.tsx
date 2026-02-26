import React, { useState, useEffect } from "react";
import { formatCurrency, getCurrencyName } from "../../../utils/formatter";

interface ExchangeRate {
  curUnit: string;
  rate: number;
}

// Props 인터페이스 정의
interface MiniConverterProps {
  rates: ExchangeRate[];
}

const MiniConverter: React.FC<MiniConverterProps> = ({ rates }) => {
  const [selectedUnit, setSelectedUnit] = useState<string>("USD");
  const [amount, setAmount] = useState<number>(0);
  const [result, setResult] = useState<number>(0);

  // 입력값 또는 선택 통화 변경 시 실시간 계산 (rates가 부모로부터 업데이트되면 즉시 반응)
  useEffect(() => {
    const currentRate = rates.find((r) => r.curUnit === selectedUnit);
    if (currentRate) {
      let rateValue = currentRate.rate;

      // JPY(100) 등 100단위 통화 보정 로직
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
        <div>
          <label className="block mb-1 text-sm font-medium text-gray-600">
            외화 금액
          </label>
          <div className="flex gap-2">
            <select
              value={selectedUnit}
              onChange={(e) => setSelectedUnit(e.target.value)}
              className="p-2 text-sm border rounded-md outline-none bg-gray-50 focus:ring-2 focus:ring-blue-500"
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
              placeholder="0.00"
              className="flex-1 p-2 text-right border rounded-md outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <div className="pt-4 border-t border-dashed">
          <label className="block mb-1 text-sm font-medium text-gray-600">
            원화 환산 금액 (예상)
          </label>
          <div className="text-2xl font-black text-right text-blue-700">
            {formatCurrency(result, "KRW")}
          </div>
          <p className="text-[10px] text-gray-400 mt-2 text-right">
            * 실제 송금 시 수수료 등에 따라 금액이 달라질 수 있습니다.
          </p>
        </div>
      </div>
    </div>
  );
};

export default MiniConverter;
