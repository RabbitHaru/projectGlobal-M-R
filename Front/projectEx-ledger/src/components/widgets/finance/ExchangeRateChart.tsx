import React, { useState, useEffect } from "react";
import axios from "axios";
import BaseLineChart from "../../pages/common/chart/BaseLineChart";
import type { ExchangeRate } from "../../../types/exchange"; // 타입 임포트

// 🌟 LandingPage에서 전달하는 props를 받기 위한 정의
interface ExchangeRateChartProps {
  rates: ExchangeRate[];
}

interface WeeklyRate {
  date: string;
  rate: number;
  [key: string]: string | number;
}

const ExchangeRateChart: React.FC<ExchangeRateChartProps> = ({ rates }) => {
  const [weeklyHistory, setWeeklyHistory] = useState<WeeklyRate[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadRealData = async () => {
      try {
        setLoading(true);
        console.log("=== [DEBUG] 환율 데이터 요청 시작 ===");

        const response = await axios.get(
          "http://localhost:8080/api/v1/exchange/history/USD",
          { params: { days: 7 } },
        );

        console.log("1. 서버 응답 원본:", response);
        console.log("2. 수신된 데이터 배열:", response.data);

        if (response.data && response.data.length > 0) {
          // 🌟 담당자님의 꼼꼼한 null 체크 로직 복구
          const validData = response.data.filter(
            (item: any) => item.date !== null && item.rate !== null,
          );
          console.log("3. 필터링 후 최종 데이터:", validData);
          setWeeklyHistory(validData);
        } else {
          console.warn("⚠️ 경고: 서버로부터 빈 배열이 반환되었습니다.");
        }
      } catch (error) {
        console.error("❌ [DEBUG] API 호출 중 에러 발생:", error);
      } finally {
        setLoading(false);
      }
    };

    loadRealData();
  }, []);

  // 로딩 및 데이터 부족 처리 UI (담당자님 원본 로직)
  if (loading)
    return (
      <div className="flex items-center justify-center w-full h-full bg-gray-50 animate-pulse">
        데이터 분석 중...
      </div>
    );
  if (weeklyHistory.length < 2)
    return (
      <div className="p-6 text-center border-2 border-dashed rounded-xl">
        데이터 부족 ({weeklyHistory.length}개)
      </div>
    );

  return (
    <div className="w-full h-full">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <span className="flex w-2 h-2 bg-blue-500 rounded-full animate-ping"></span>
          <span className="text-xs font-bold text-gray-700">
            실시간 데이터 연동 중
          </span>
        </div>
      </div>
      <div className="w-full h-[calc(100%-3rem)]">
        <BaseLineChart
          data={weeklyHistory}
          dataKey="rate"
          xAxisKey="date"
          lineColor="#2563eb"
          unit="원"
        />
      </div>
    </div>
  );
};

export default ExchangeRateChart;
