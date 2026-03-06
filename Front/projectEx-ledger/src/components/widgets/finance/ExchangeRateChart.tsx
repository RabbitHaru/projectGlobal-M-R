import React, { useEffect, useState } from "react";
import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
} from "recharts";
import axios from "axios";
import { ChevronDown, AlertCircle, RefreshCw } from "lucide-react";
import type { ExchangeRate } from "../../../types/exchange";

interface Props {
  rates: ExchangeRate[];
}

const ExchangeRateChart: React.FC<Props> = ({ rates = [] }) => {
  const [chartCurrency, setChartCurrency] = useState("USD");
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  const fetchHistory = async () => {
    setLoading(true);
    setHasError(false);
    try {
      const res = await axios.get(
        `http://localhost:8080/api/v1/exchange/history/${chartCurrency}?days=14`,
      );

      if (res.data && Array.isArray(res.data)) {
        setData(res.data);
      } else {
        throw new Error("Invalid format");
      }
    } catch (err) {
      console.error("차트 데이터 로드 실패:", err);
      setHasError(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, [chartCurrency]);

  return (
    <div className="flex flex-col w-full h-full">
      {/* 🌟 최후의 수단: Recharts 내부 클래스들의 모든 포커스 테두리를 강제로 제거합니다 */}
      <style>
        {`
          .recharts-wrapper:focus,
          .recharts-surface:focus,
          .recharts-container:focus,
          path.recharts-rectangle:focus {
            outline: none !important;
            box-shadow: none !important;
          }
        `}
      </style>

      <div className="flex flex-col justify-between gap-4 mb-8 sm:flex-row sm:items-center">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-blue-600 rounded-full shadow-[0_0_10px_rgba(37,99,235,0.4)]" />
          <h3 className="text-lg font-black text-slate-800">
            {chartCurrency} 환율 트렌드
            <span className="ml-2 text-xs font-bold text-slate-300">
              (최근 14 영업일)
            </span>
          </h3>
        </div>

        <div className="relative group">
          <select
            value={chartCurrency}
            onChange={(e) => setChartCurrency(e.target.value)}
            className="appearance-none pl-4 pr-10 py-2.5 bg-slate-50 border border-slate-100 rounded-2xl text-xs font-black text-slate-700 outline-none focus:outline-none focus:ring-0 transition-all cursor-pointer"
          >
            {rates.length > 0 ? (
              rates.map((rate) => (
                <option key={rate.curUnit} value={rate.curUnit}>
                  {rate.curUnit} - {rate.curNm}
                </option>
              ))
            ) : (
              <option value="USD">USD - 미국 달러</option>
            )}
          </select>
          <ChevronDown
            size={14}
            className="absolute transition-colors -translate-y-1/2 pointer-events-none right-4 top-1/2 text-slate-400 group-hover:text-blue-500"
          />
        </div>
      </div>

      <div className="flex-1 w-full min-h-[300px] relative">
        {loading && !hasError && (
          <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-white/50 backdrop-blur-[2px]">
            <RefreshCw className="mb-2 text-blue-500 animate-spin" size={24} />
            <span className="text-xs font-bold text-slate-400">
              데이터를 가져오고 있습니다...
            </span>
          </div>
        )}

        {hasError ? (
          <div className="w-full h-full flex flex-col items-center justify-center bg-slate-50 rounded-[24px] border border-dashed border-slate-200 p-6 text-center">
            <AlertCircle className="mb-3 text-red-400" size={32} />
            <p className="text-sm font-black text-slate-600">
              데이터 서버에 연결할 수 없습니다
            </p>
            <button
              onClick={fetchHistory}
              className="px-4 py-2 mt-4 text-xs font-black transition-all bg-white border shadow-sm border-slate-200 rounded-xl text-slate-600 hover:bg-slate-50 active:scale-95"
            >
              다시 시도
            </button>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            {/* 🌟 차트 컴포넌트 자체에서도 모든 아웃라인 방지 속성을 적용합니다 */}
            <AreaChart data={data} style={{ outline: "none", border: "none" }}>
              <defs>
                <linearGradient id="colorRate" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#2563eb" stopOpacity={0.1} />
                  <stop offset="95%" stopColor="#2563eb" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid
                strokeDasharray="3 3"
                vertical={false}
                stroke="#f1f5f9"
              />
              <XAxis
                dataKey="date"
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 11, fontWeight: 700, fill: "#cbd5e1" }}
                dy={10}
              />
              <YAxis
                domain={["auto", "auto"]}
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 11, fontWeight: 700, fill: "#cbd5e1" }}
                tickFormatter={(val) => val.toLocaleString()}
              />
              <Tooltip
                contentStyle={{
                  borderRadius: "16px",
                  border: "none",
                  boxShadow: "0 10px 15px -3px rgba(0,0,0,0.1)",
                }}
                labelStyle={{ fontWeight: 900, marginBottom: "4px" }}
                formatter={(value: any) => [
                  Number(value).toLocaleString() + " KRW",
                  "환율",
                ]}
              />
              <Area
                type="monotone"
                dataKey="rate"
                stroke="#2563eb"
                strokeWidth={3}
                fillOpacity={1}
                fill="url(#colorRate)"
                dot={{ r: 4, fill: "#fff", stroke: "#2563eb", strokeWidth: 2 }}
                activeDot={{ r: 6, strokeWidth: 0 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
};

export default ExchangeRateChart;
