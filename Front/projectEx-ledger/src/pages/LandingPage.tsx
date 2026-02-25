import React, { Suspense, lazy } from 'react';
import CommonLayout from '../components/layout/CommonLayout';
import FXTicker from '../components/finance/FXTicker';
import MiniConverter from '../components/finance/MiniConverter';
import ExchangeRateTable from '../components/finance/ExchangeRateTable';

// 차트 컴포넌트 지연 로딩 (Code Splitting)
const ExchangeRateChart = lazy(() => import('../components/finance/ExchangeRateChart'));

const ChartSkeleton = () => <div className="w-full h-96 bg-gray-100 animate-pulse rounded-xl border border-gray-200"></div>;
const TableSkeleton = () => <div className="w-full h-96 bg-gray-100 animate-pulse rounded-xl border border-gray-200"></div>;

const LandingPage: React.FC = () => {
  return (
    <CommonLayout>
      {/* 1. 상단 실시간 환율 흐름 바 (최상단 고정) */}
      <div className="w-full bg-slate-900 border-b border-slate-800 sticky top-0 z-10">
        <FXTicker />
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 flex flex-col gap-10 bg-gray-50 min-h-screen">
        
        {/* 2. 환율 차트 영역 (시장 흐름 파악) */}
        <section className="w-full flex flex-col bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-800">주요 통화 환율 추이</h2>
            <span className="text-sm font-medium text-blue-600 bg-blue-50 px-3 py-1.5 rounded-full">실시간 트렌드</span>
          </div>
          <div className="w-full h-96">
            <Suspense fallback={<ChartSkeleton />}>
              <ExchangeRateChart />
            </Suspense>
          </div>
        </section>

        {/* 3. 간이 환전 계산기 영역 (액션 유도) 
            - Note: 가로 폭이 너무 넓어지지 않도록 max-w-4xl로 제한 및 중앙 정렬 */}
        <section className="w-full max-w-4xl mx-auto flex flex-col bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-6 text-center">간이 환전 계산기</h2>
          <div className="w-full">
            <MiniConverter />
          </div>
        </section>

        {/* 4. 상세 환율 테이블 영역 (상세 데이터 확인) */}
        <section className="w-full flex flex-col bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-6">상세 환율 정보</h2>
          <Suspense fallback={<TableSkeleton />}>
            <ExchangeRateTable />
          </Suspense>
        </section>

      </main>
    </CommonLayout>
  );
};

export default LandingPage;