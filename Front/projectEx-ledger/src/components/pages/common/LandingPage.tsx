import type { ExchangeRate } from "../../../types/exchange";
import React, { Suspense, lazy, useState, useEffect } from "react";
import CommonLayout from "../../layout/CommonLayout";
import FXTicker from "../../widgets/finance/FXTicker";
import MiniConverter from "../../widgets/finance/MiniConverter";
import ExchangeRateTable from "../../widgets/finance/ExchangeRateTable";
import { BarChart3 } from "lucide-react";

// 차트 컴포넌트 레이지 로딩
const ExchangeRateChart = lazy(
  () => import("../../widgets/finance/ExchangeRateChart"),
);

const ChartSkeleton = () => (
  <div className="w-full bg-slate-50 border border-slate-100 h-96 animate-pulse rounded-[32px] flex items-center justify-center">
    <span className="text-xs font-bold text-slate-400">
      차트 데이터를 불러오는 중...
    </span>
  </div>
);

const LandingPage: React.FC = () => {
  const [rates, setRates] = useState<ExchangeRate[]>([]);
  // selectedCurrency는 이제 테이블의 하이라이트 및 팝업용으로만 사용됩니다.
  const [selectedCurrency, setSelectedCurrency] = useState("USD");

  useEffect(() => {
    // 초기 환율 데이터 로드
    fetch("http://localhost:8080/api/exchange/latest")
      .then((res) => res.json())
      .then((data) => setRates(Array.isArray(data) ? data : []))
      .catch((err) => console.error("데이터 로드 실패:", err));

    // 실시간 데이터 업데이트 (SSE)
    const eventSource = new EventSource("http://localhost:8080/api/connect");
    eventSource.addEventListener("exchange-update", (event: any) => {
      try {
        const newData = JSON.parse(event.data);
        setRates(Array.isArray(newData) ? newData : []);
      } catch (e) {
        console.error("데이터 파싱 에러:", e);
      }
    });

    return () => eventSource.close();
  }, []);

  return (
    <CommonLayout>
      {/* 1. 상단 티커 섹션 */}
      <div className="sticky top-0 z-20 w-full border-b bg-slate-900 border-slate-800">
        <FXTicker rates={rates || []} />
      </div>

      <main className="flex flex-col min-h-screen gap-10 px-4 py-10 mx-auto max-w-7xl bg-slate-50/50">
        {/* 2. 환율 트렌드 차트 섹션 (독립 작동) */}
        <section className="p-8 bg-white border border-slate-100 shadow-sm rounded-[32px]">
          <h2 className="flex items-center gap-2 mb-8 text-xl font-black text-slate-800">
            <BarChart3 className="text-blue-600" size={20} /> 주요 통화 환율
            추이
          </h2>
          <div className="w-full h-96">
            <Suspense fallback={<ChartSkeleton />}>
              {/* 🌟 수정: rates만 전달하여 차트 내부에서 스스로 국가를 선택하게 합니다. */}
              <ExchangeRateChart rates={rates || []} />
            </Suspense>
          </div>
        </section>

        {/* 3. 환율 변환기 섹션 */}
        <section className="flex flex-col w-full max-w-4xl p-2 mx-auto">
          <div className="p-8 bg-white border border-slate-100 shadow-sm rounded-[32px]">
            <MiniConverter rates={rates || []} />
          </div>
        </section>

        {/* 4. 상세 환율 정보 테이블 섹션 */}
        <section className="p-8 bg-white border border-slate-100 shadow-sm rounded-[32px]">
          <div className="flex items-center justify-between mb-8">
            <div className="space-y-1">
              <h2 className="text-xl font-black tracking-tight text-slate-800">
                상세 환율 정보
              </h2>
              <p className="text-xs font-bold text-slate-400">
                환율 정보를 클릭하면 7일간의 히스토리를 바로 확인할 수 있습니다.
              </p>
            </div>
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest bg-slate-50 px-3 py-1 rounded-full">
              Live Updates
            </span>
          </div>

          <ExchangeRateTable
            rates={rates || []}
            selectedCurrency={selectedCurrency}
            onRowClick={setSelectedCurrency} // 이제 테이블 내의 상태만 변경합니다.
          />
        </section>
      </main>
    </CommonLayout>
  );
};

export default LandingPage;
