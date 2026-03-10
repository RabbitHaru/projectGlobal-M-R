import React, { useEffect, useState } from "react";
import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
  ReferenceDot,
} from "recharts";
import axios from "axios";

interface Props {
  rates?: any[];
  selectedCurrency?: string;
}

const ExchangeRateChart: React.FC<Props> = ({
  rates = [],
  selectedCurrency,
}) => {
  const [chartCurrency, setChartCurrency] = useState(selectedCurrency || "USD");
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (selectedCurrency) setChartCurrency(selectedCurrency);
  }, [selectedCurrency]);

  // 🌟 [수정] 외부 데이터(rates) 우선순위 로직 강화
  useEffect(() => {
    // rates가 [{date, rate}, ...] 형태의 차트용 데이터인지 확인
    const isChartData = rates.length > 0 && "rate" in rates[0];

    if (isChartData) {
      setData(rates); // 부모가 준 데이터를 사용
      setLoading(false);
    } else {
      fetchHistory(); // 데이터가 없으면 기존 API 호출
    }
  }, [rates, chartCurrency]);

  const fetchHistory = async () => {
    if (rates.length > 0 && "rate" in rates[0]) return; // 이미 데이터가 있으면 스킵
    setLoading(true);
    try {
      const res = await axios.get(
        `http://localhost:8080/api/v1/exchange/history/${chartCurrency}?days=14`,
      );
      if (res.data && Array.isArray(res.data)) setData(res.data);
    } catch (err) {
      console.error("차트 fetch 에러:", err);
    } finally {
      setLoading(false);
    }
  };

  const maxPoint =
    data.length > 0
      ? [...data].reduce((prev, cur) => (prev.rate > cur.rate ? prev : cur))
      : null;
  const minPoint =
    data.length > 0
      ? [...data].reduce((prev, cur) => (prev.rate < cur.rate ? prev : cur))
      : null;

  return (
    <div className="flex flex-col w-full h-full">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-blue-600 rounded-full shadow-[0_0_10px_rgba(37,99,235,0.4)]" />
          <h3 className="text-lg font-black tracking-tighter text-slate-800">
            {chartCurrency} 환율 트렌드
          </h3>
        </div>

        {/* 🌟 [유령 리스트 해결] 차트용 데이터가 들어올 때는 상단 선택 드롭다운(Select)를 그리지 않습니다. */}
        {!(rates.length > 0 && "rate" in rates[0]) && (
          <select
            value={chartCurrency}
            onChange={(e) => setChartCurrency(e.target.value)}
            className="appearance-none pl-4 pr-10 py-2.5 bg-slate-50 border rounded-2xl text-xs font-black text-slate-700 outline-none"
          >
            {rates.map((r: any) => (
              <option key={r.curUnit} value={r.curUnit}>
                {r.curUnit}
              </option>
            ))}
          </select>
        )}
      </div>

      <div className="relative flex-1 w-full p-4 bg-slate-50 rounded-2xl min-h-[300px]">
        {loading ? (
          <div className="flex items-center justify-center w-full h-full font-bold text-slate-200">
            데이터 수집 중...
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={data}
              margin={{ top: 50, right: 20, left: 0, bottom: 10 }}
            >
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
              />
              <YAxis
                domain={["dataMin - 10", "dataMax + 10"]}
                axisLine={false}
                tickLine={false}
                tickFormatter={(v) => v.toLocaleString()}
                tick={{ fontSize: 11, fontWeight: 700, fill: "#cbd5e1" }}
              />
              <Tooltip
                contentStyle={{
                  borderRadius: "16px",
                  border: "none",
                  boxShadow: "0 10px 15px -3px rgb(0 0 0 / 0.1)",
                }}
              />
              <Area
                type="monotone"
                dataKey="rate"
                stroke="#2563eb"
                strokeWidth={3}
                fill="none"
                dot={{ r: 2, fill: "#2563eb" }}
              />
              {maxPoint && (
                <ReferenceDot
                  x={maxPoint.date}
                  y={maxPoint.rate}
                  r={6}
                  fill="#ef4444"
                  label={{
                    position: "top",
                    value: `최고 ${maxPoint.rate}`,
                    fill: "#ef4444",
                    fontSize: 10,
                    fontWeight: 900,
                    dy: -10,
                  }}
                  stroke="#fff"
                  strokeWidth={3}
                />
              )}
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
};

export default ExchangeRateChart;
