// src/components/finance/ExchangeRateTable.tsx
import React from 'react';

const ExchangeRateTable: React.FC = () => {
  return (
    <div className="w-full overflow-x-auto">
      <table className="min-w-full text-sm text-left text-gray-600">
        <thead className="bg-gray-100 text-gray-700 font-semibold border-b border-gray-200">
          <tr>
            <th className="py-3 px-4">Currency</th>
            <th className="py-3 px-4 text-right">Buy</th>
            <th className="py-3 px-4 text-right">Sell</th>
            <th className="py-3 px-4 text-right">Trend</th>
          </tr>
        </thead>
        <tbody>
          <tr className="border-b border-gray-100 hover:bg-gray-50">
            <td className="py-3 px-4 font-medium text-gray-900 flex items-center gap-2">
              <span>🇺🇸</span> USD/KRW
            </td>
            <td className="py-3 px-4 text-right">1,350.50</td>
            <td className="py-3 px-4 text-right">1,290.50</td>
            <td className="py-3 px-4 text-right text-red-500 font-medium">▲ 3.36%</td>
          </tr>
          {/* 추가 데이터 렌더링 예정 */}
        </tbody>
      </table>
    </div>
  );
};

export default ExchangeRateTable;