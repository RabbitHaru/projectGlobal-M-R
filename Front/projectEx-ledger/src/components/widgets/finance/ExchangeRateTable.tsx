import React from "react";
import { formatCurrency, getCurrencyName } from "../../../utils/formatter";
import type { ExchangeRate } from "../../../types/exchange";

const ExchangeRateTable: React.FC<{ rates: ExchangeRate[] }> = ({ rates }) => {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm text-left text-gray-500">
        <thead className="text-xs text-gray-700 uppercase bg-gray-50">
          <tr>
            <th className="px-6 py-3">통화 코드</th>
            <th className="px-6 py-3">통화명</th>
            <th className="px-6 py-3 text-right">현재 환율</th>
            <th className="px-6 py-3 text-center">업데이트 시간</th>
          </tr>
        </thead>
        <tbody>
          {rates.map((rate) => (
            <tr
              key={rate.curUnit}
              className="bg-white border-b hover:bg-gray-50"
            >
              <td className="px-6 py-4 font-medium text-gray-900">
                {rate.curUnit.split("(")[0]}
              </td>
              <td className="px-6 py-4">{getCurrencyName(rate.curUnit)}</td>
              <td className="px-6 py-4 font-bold text-right text-blue-600">
                {formatCurrency(rate.rate, rate.curUnit)}
              </td>
              <td className="px-6 py-4 text-xs text-center text-gray-400">
                {rate.updatedAt}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ExchangeRateTable;
