import React, { useEffect, useState, useCallback } from "react";
import BaseLineChart from "../../pages/common/chart/BaseLineChart";
import { fetchExchangeRates } from "../../../api/exchangeApi";
import type { ExchangeRateResponse } from "../../../api/exchangeApi";

interface Props {
  curUnit: string;
  days?: number;
}

const ExchangeRateContainer: React.FC<Props> = ({ curUnit, days = 30 }) => {
  const [data, setData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // 데이터 로드 로직을 useCallback으로 감싸 메모리 최적화 및 재사용성 확보
  const loadExchangeData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const rawData: ExchangeRateResponse[] = await fetchExchangeRates(
        curUnit,
        days,
      );

      // [Data Transformation] 백엔드 DTO를 차트용 데이터로 변환
      const formattedData = rawData.map((item) => ({
        // 날짜 포맷: "2024-05-20" 형태로 변환하여 가독성 확보
        displayDate: new Date(item.updatedAt).toLocaleDateString("ko-KR", {
          month: "short",
          day: "numeric",
        }),
        rate: item.rate,
        originalDate: item.updatedAt, // 툴팁 등에서 상세 정보가 필요할 경우 대비
      }));

      setData(formattedData);
    } catch (err) {
      console.error("환율 데이터 로드 실패:", err);
      setError("환율 정보를 가져오는 중 오류가 발생했습니다.");
    } finally {
      setIsLoading(false);
    }
  }, [curUnit, days]);

  useEffect(() => {
    loadExchangeData();
  }, [loadExchangeData]);

  // 1. 로딩 상태 대응
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[300px] bg-gray-50 rounded-lg border border-dashed">
        <p className="text-gray-500 animate-pulse">데이터를 불러오는 중...</p>
      </div>
    );
  }

  // 2. 에러 상태 대응
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-[300px] bg-red-50 rounded-lg border border-red-100">
        <p className="mb-2 text-red-600">{error}</p>
        <button
          onClick={loadExchangeData}
          className="text-sm text-red-700 underline hover:text-red-800"
        >
          다시 시도
        </button>
      </div>
    );
  }

  // 3. 정상 렌더링
  return (
    <div className="p-6 bg-white border border-gray-100 shadow-sm rounded-xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-bold text-gray-800">
            {curUnit} 환율 추이
          </h3>
          <p className="text-sm text-gray-500">
            최근 {days}일 기준 매매 기준율
          </p>
        </div>
        <div className="text-right">
          <span className="text-2xl font-bold text-blue-600">
            {data.length > 0
              ? data[data.length - 1].rate.toLocaleString()
              : "-"}
          </span>
          <span className="ml-1 text-sm text-gray-400">KRW</span>
        </div>
      </div>

      <BaseLineChart
        data={data}
        dataKey="rate"
        xAxisKey="displayDate"
        lineColor="#2563eb"
        unit="원"
      />
    </div>
  );
};

export default ExchangeRateContainer;
