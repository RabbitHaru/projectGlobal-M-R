import React, { useState, useEffect } from "react";
import axios from "axios";

const TransactionHistory: React.FC = () => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  // 필터 상태 관리
  const [filters, setFilters] = useState({
    period: "1month",
    status: "ALL",
    currency: "ALL",
  });

  // 1. 거래 내역 조회 API 호출
  const fetchHistory = async () => {
    setLoading(true);
    try {
      const response = await axios.get(
        "http://localhost:8080/api/v1/remittance/history",
        {
          params: filters, // 필터 조건을 쿼리 파라미터로 전송
        },
      );
      setHistory(response.data);
    } catch (error) {
      console.error("내역 로드 실패:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, [filters]);

  return (
    <div className="max-w-6xl p-6 mx-auto space-y-6">
      <header>
        <h1 className="text-2xl font-bold text-gray-900">거래 내역 조회</h1>
        <p className="text-sm text-gray-500">
          모든 송금 및 결제 내역을 상세하게 확인하실 수 있습니다.
        </p>
      </header>

      {/* 2. 필터 섹션 */}
      <div className="flex flex-wrap items-center gap-4 p-4 bg-white border border-gray-100 shadow-sm rounded-2xl">
        <select
          className="p-2 text-sm font-medium rounded-lg outline-none bg-gray-50"
          value={filters.period}
          onChange={(e) => setFilters({ ...filters, period: e.target.value })}
        >
          <option value="today">오늘</option>
          <option value="1week">최근 1주</option>
          <option value="1month">최근 1달</option>
        </select>

        <select
          className="p-2 text-sm font-medium rounded-lg outline-none bg-gray-50"
          value={filters.status}
          onChange={(e) => setFilters({ ...filters, status: e.target.value })}
        >
          <option value="ALL">모든 상태</option>
          <option value="COMPLETED">송금 완료</option>
          <option value="PENDING">진행 중</option>
          <option value="FAILED">실패</option>
        </select>

        <select
          className="p-2 text-sm font-medium rounded-lg outline-none bg-gray-50"
          value={filters.currency}
          onChange={(e) => setFilters({ ...filters, currency: e.target.value })}
        >
          <option value="ALL">모든 통화</option>
          <option value="USD">USD (미국)</option>
          <option value="JPY">JPY (일본)</option>
          <option value="EUR">EUR (유럽)</option>
        </select>

        <button
          onClick={fetchHistory}
          className="px-4 py-2 ml-auto text-sm font-bold text-white transition-all bg-gray-900 rounded-lg hover:bg-black"
        >
          조회하기
        </button>
      </div>

      {/* 3. 데이터 테이블 섹션 */}
      <div className="overflow-hidden bg-white border border-gray-100 shadow-sm rounded-2xl">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50">
              <th className="p-4 text-xs font-bold text-gray-400 uppercase">
                날짜
              </th>
              <th className="p-4 text-xs font-bold text-gray-400 uppercase">
                수취인
              </th>
              <th className="p-4 text-xs font-bold text-right text-gray-400 uppercase">
                송금액
              </th>
              <th className="p-4 text-xs font-bold text-right text-gray-400 uppercase">
                결제금액(KRW)
              </th>
              <th className="p-4 text-xs font-bold text-center text-gray-400 uppercase">
                상태
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {loading ? (
              <tr>
                <td colSpan={5} className="p-10 text-center text-gray-400">
                  데이터를 불러오는 중입니다...
                </td>
              </tr>
            ) : history.length === 0 ? (
              <tr>
                <td colSpan={5} className="p-10 text-center text-gray-400">
                  거래 내역이 없습니다.
                </td>
              </tr>
            ) : (
              history.map((item: any) => (
                <tr
                  key={item.id}
                  className="transition-colors hover:bg-gray-50"
                >
                  <td className="p-4 text-sm text-gray-600">
                    {new Date(item.requestedAt).toLocaleDateString()}
                  </td>
                  <td className="p-4 text-sm font-bold text-gray-900">
                    {item.recipientName}
                  </td>
                  <td className="p-4 text-sm font-bold text-right text-gray-900">
                    {item.amount.toLocaleString()} {item.currency}
                  </td>
                  <td className="p-4 text-sm font-black text-right text-blue-600">
                    ₩ {item.totalPayment.toLocaleString()}
                  </td>
                  <td className="p-4 text-center">
                    <span
                      className={`px-2 py-1 rounded-md text-[10px] font-bold ${
                        item.status === "COMPLETED"
                          ? "bg-green-100 text-green-600"
                          : item.status === "FAILED"
                            ? "bg-red-100 text-red-600"
                            : "bg-orange-100 text-orange-600"
                      }`}
                    >
                      {item.status}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default TransactionHistory;
