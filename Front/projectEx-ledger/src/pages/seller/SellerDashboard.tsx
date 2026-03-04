import React, { useState, useEffect } from "react";
import axios from "axios";
import FXTicker from "../../components/widgets/finance/FXTicker";
import ExchangeRateChart from "../../components/widgets/finance/ExchangeRateChart";

const SellerDashboard: React.FC = () => {
  const [summary, setSummary] = useState({
    totalSales: 0,
    totalRemittance: 0,
    pendingCount: 0,
  });
  const [rates, setRates] = useState([]);

  // 1. 대시보드 요약 데이터 로드
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const res = await axios.get(
          "http://localhost:8080/api/v1/seller/summary",
        );
        setSummary(res.data);
      } catch (err) {
        console.error("요약 데이터 로드 실패");
      }
    };

    const fetchRates = async () => {
      const res = await axios.get("http://localhost:8080/api/exchange/latest");
      setRates(res.data);
    };

    fetchDashboardData();
    fetchRates();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 1. 최상단 실시간 환율 바 */}
      <FXTicker rates={rates} />

      <div className="p-6 mx-auto space-y-6 max-w-7xl">
        <header className="flex items-end justify-between">
          <div>
            <h1 className="text-3xl font-black text-gray-900">Dashboard</h1>
            <p className="mt-1 font-medium text-gray-500">
              셀러님의 실시간 매출 및 송금 현황입니다.
            </p>
          </div>
          <button className="px-6 py-3 font-bold text-white transition-all bg-blue-600 shadow-lg rounded-2xl shadow-blue-100 hover:bg-blue-700">
            새 송금 신청하기
          </button>
        </header>

        {/* 2. 요약 카드 섹션 */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          <div className="p-6 bg-white border border-gray-100 shadow-sm rounded-3xl">
            <p className="text-sm font-bold tracking-wider text-gray-400 uppercase">
              누적 매출액
            </p>
            <p className="mt-2 text-2xl font-black text-gray-900">
              ₩ {summary.totalSales.toLocaleString()}
            </p>
          </div>
          <div className="p-6 bg-white border border-gray-100 shadow-sm rounded-3xl">
            <p className="text-sm font-bold tracking-wider text-gray-400 uppercase">
              누적 송금액
            </p>
            <p className="mt-2 text-2xl font-black text-blue-600">
              ₩ {summary.totalRemittance.toLocaleString()}
            </p>
          </div>
          <div className="p-6 bg-white border border-gray-100 shadow-sm rounded-3xl">
            <p className="text-sm font-bold tracking-wider text-gray-400 uppercase">
              진행 중인 송금
            </p>
            <p className="mt-2 text-2xl font-black text-orange-500">
              {summary.pendingCount} 건
            </p>
          </div>
        </div>

        {/* 3. 차트 섹션 (우리가 공들여 살려낸 그 녀석!) */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <div className="p-8 bg-white border border-gray-100 shadow-sm rounded-3xl">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-800">
                주요 통화 환율 추이
              </h2>
              <span className="px-2 py-1 text-xs font-bold text-blue-600 rounded-md bg-blue-50">
                LIVE
              </span>
            </div>
            <div className="h-[300px]">
              <ExchangeRateChart />
            </div>
          </div>

          <div className="flex flex-col items-center justify-center p-8 text-center bg-white border border-gray-100 shadow-sm rounded-3xl">
            <div className="flex items-center justify-center w-16 h-16 mb-4 rounded-full bg-gray-50">
              <span className="text-2xl">📈</span>
            </div>
            <h2 className="text-xl font-bold text-gray-800">
              매출 대비 송금 비율
            </h2>
            <p className="mt-2 text-sm text-gray-400">
              Member A님의 정산 엔진 데이터가 연동되면
              <br />
              여기에 매출 분석 차트가 표시됩니다.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SellerDashboard;
