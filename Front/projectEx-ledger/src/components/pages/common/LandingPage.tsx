import type { ExchangeRate } from "../../../types/exchange";
import React, { Suspense, lazy, useState, useEffect } from "react";
import CommonLayout from "../../layout/CommonLayout";
import FXTicker from "../../widgets/finance/FXTicker";
import MiniConverter from "../../widgets/finance/MiniConverter";
import ExchangeRateTable from "../../widgets/finance/ExchangeRateTable";

// 차트 컴포넌트 지연 로딩
const ExchangeRateChart = lazy(
  () => import("../../widgets/finance/ExchangeRateChart"),
);

const ChartSkeleton = () => (
  <div className="w-full bg-gray-100 border border-gray-200 h-96 animate-pulse rounded-xl"></div>
);
const TableSkeleton = () => (
  <div className="w-full bg-gray-100 border border-gray-200 h-96 animate-pulse rounded-xl"></div>
);

const LandingPage: React.FC = () => {
  const [rates, setRates] = useState<ExchangeRate[]>([]);

  useEffect(() => {
    // 🌟 1. 백엔드 주소(8080) 다시 부활!
    fetch("http://localhost:8080/api/exchange/latest")
      .then((res) => res.json())
      .then((data) => setRates(data))
      .catch((err) => console.error("데이터 로드 실패:", err));

    // 🌟 2. SSE 연결도 백엔드 주소(8080) 부활!
    const eventSource = new EventSource("http://localhost:8080/api/connect");
    eventSource.addEventListener("exchange-update", (event: any) => {
      const updatedRates = JSON.parse(event.data);
      setRates(updatedRates);
    });

    return () => eventSource.close();
  }, []);

  return (
    <CommonLayout>
      {/* 1. 상단 실시간 환율 흐름 바 (최상단 고정) 
          - 우리가 수정한 대로 rates를 전달합니다. */}
      <div className="sticky top-0 z-10 w-full border-b bg-slate-900 border-slate-800">
        <FXTicker rates={rates} />
      </div>

      <main className="flex flex-col min-h-screen gap-10 px-4 py-10 mx-auto max-w-7xl sm:px-6 lg:px-8 bg-gray-50">
        {/* 2. 환율 차트 영역 */}
        <section className="flex flex-col w-full p-6 bg-white border border-gray-200 shadow-sm rounded-xl">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-800">
              주요 통화 환율 추이
            </h2>
            <span className="text-sm font-medium text-blue-600 bg-blue-50 px-3 py-1.5 rounded-full animate-pulse">
              실시간 트렌드
            </span>
          </div>
          <div className="w-full h-96">
            <Suspense fallback={<ChartSkeleton />}>
              <ExchangeRateChart rates={rates} />
            </Suspense>
          </div>
        </section>

        {/* 3. 간이 환전 계산기 영역
            - 중앙 집중형 데이터를 사용하여 FXTicker와 실시간 동기화됨 */}
        <section className="flex flex-col w-full max-w-4xl p-6 mx-auto bg-white border border-gray-200 shadow-sm rounded-xl">
          <h2 className="mb-6 text-xl font-bold text-center text-gray-800">
            간이 환전 계산기
          </h2>
          <div className="w-full">
            <MiniConverter rates={rates} />
          </div>
        </section>

        {/* 4. 상세 환율 테이블 영역 */}
        <section className="flex flex-col w-full p-6 bg-white border border-gray-200 shadow-sm rounded-xl">
          <h2 className="mb-6 text-xl font-bold text-gray-800">
            상세 환율 정보
          </h2>
          <Suspense fallback={<TableSkeleton />}>
            <ExchangeRateTable rates={rates} />
          </Suspense>
        </section>
      </main>
    </CommonLayout>
  );
};

export default LandingPage;
