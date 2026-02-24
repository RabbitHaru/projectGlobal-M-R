import React from 'react';
// Member C님이 앞으로 하나씩 완성해 나갈 컴포넌트들을 불러옵니다.
import FXTicker from '../components/FXTicker';
import MiniConverter from '../components/MiniConverter';
import ExchangeRateTable from '../components/ExchangeRateTable';
// 시안에 있는 트레이딩뷰 차트 영역을 위한 컴포넌트 (가칭)
import RealTimeChart from '../components/RealTimeChart'; 

const LandingPage = () => {
  return (
    <div className="w-full flex flex-col min-h-screen bg-gray-50 font-sans">
      
      {/* 1. 최상단: 실시간 환율 바 (FX Ticker) */}
      <div className="w-full bg-slate-900 text-white">
        <FXTicker />
      </div>

      {/* 메인 컨텐츠 영역 (가운데 정렬 및 최대 너비 제한) */}
      <main className="flex-1 w-full max-w-5xl mx-auto px-4 py-8 flex flex-col gap-10">
        
        {/* 2. 상단 섹션: 실시간 환율 변동 차트 */}
        <section className="w-full bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          {/* 차트 헤더 (시안 참고) */}
          <div className="bg-teal-50 px-6 py-3 border-b border-gray-200 flex justify-between items-center">
            <h2 className="text-lg font-bold text-slate-800">실시간 환율 변동 차트 (USD/KRW)</h2>
            <select className="border border-gray-300 rounded px-2 py-1 text-sm bg-white">
              <option>1일 간격</option>
              <option>1주일 간격</option>
            </select>
          </div>
          <div className="p-4 h-[400px]">
            {/* 여기에 나중에 TradingView 라이브러리나 차트 컴포넌트가 들어갑니다 */}
            <RealTimeChart />
          </div>
        </section>

        {/* 3. 중앙 섹션: 간이 환전 계산기 (포인트!) */}
        <section className="w-full max-w-3xl mx-auto bg-white rounded-2xl shadow-lg border border-gray-100 p-8">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-extrabold text-slate-800 tracking-tight">간이 환전 계산기</h2>
            <p className="text-sm text-gray-500 mt-2">복잡한 인증 없이 실시간 환율로 미리 계산해보세요.</p>
          </div>
          {/* 환전 계산기 실제 컴포넌트 */}
          <MiniConverter />
        </section>

        {/* 4. 하단 섹션: 상세 환율 정보 테이블 */}
        <section className="w-full bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100">
            <h3 className="text-lg font-bold text-slate-800">국가별 상세 환율</h3>
          </div>
          <div className="p-0">
            {/* 환율표 실제 컴포넌트 */}
            <ExchangeRateTable />
          </div>
        </section>

      </main>
    </div>
  );
};

export default LandingPage;