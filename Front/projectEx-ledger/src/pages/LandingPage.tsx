<<<<<<< HEAD
const LandingPage = () => {
    return (
        <div className="p-4">
            <h1 className="text-2xl font-bold mb-4">파운데이션 랜딩 페이지</h1>
            <p>여기는 Member A와 C의 위젯이 없는 뼈대 페이지입니다.</p>
        </div>
    );
};

export default LandingPage;
=======
import React, { Suspense, lazy } from 'react';
import CommonLayout from '../components/layout/CommonLayout';
import FXTicker from '../components/finance/FXTicker';
import MiniConverter from '../components/finance/MiniConverter';
import ExchangeRateTable from '../components/finance/ExchangeRateTable';

// 차트 컴포넌트 지연 로딩 (Code Splitting)
const ExchangeRateChart = lazy(() => import('../components/finance/ExchangeRateChart'));

const ChartSkeleton = () => <div className="w-full bg-gray-100 border border-gray-200 h-96 animate-pulse rounded-xl"></div>;
const TableSkeleton = () => <div className="w-full bg-gray-100 border border-gray-200 h-96 animate-pulse rounded-xl"></div>;

const LandingPage: React.FC = () => {
  return (
    <CommonLayout>
      {/* 1. 상단 실시간 환율 흐름 바 (최상단 고정) */}
      <div className="sticky top-0 z-10 w-full border-b bg-slate-900 border-slate-800">
        <FXTicker />
      </div>

      <main className="flex flex-col min-h-screen gap-10 px-4 py-10 mx-auto max-w-7xl sm:px-6 lg:px-8 bg-gray-50">
        
        {/* 2. 환율 차트 영역 (시장 흐름 파악) */}
        <section className="flex flex-col w-full p-6 bg-white border border-gray-200 shadow-sm rounded-xl">
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
        <section className="flex flex-col w-full max-w-4xl p-6 mx-auto bg-white border border-gray-200 shadow-sm rounded-xl">
          <h2 className="mb-6 text-xl font-bold text-center text-gray-800">간이 환전 계산기</h2>
          <div className="w-full">
            <MiniConverter />
          </div>
        </section>

        {/* 4. 상세 환율 테이블 영역 (상세 데이터 확인) */}
        <section className="flex flex-col w-full p-6 bg-white border border-gray-200 shadow-sm rounded-xl">
          <h2 className="mb-6 text-xl font-bold text-gray-800">상세 환율 정보</h2>
          <Suspense fallback={<TableSkeleton />}>
            <ExchangeRateTable />
          </Suspense>
        </section>

      </main>
    </CommonLayout>
  );
};

export default LandingPage;

>>>>>>> common
