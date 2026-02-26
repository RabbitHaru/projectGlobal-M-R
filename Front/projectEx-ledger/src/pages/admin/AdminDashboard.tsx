import React, { useState, useEffect } from 'react';

// 1. 앞서 정의한 Settlement 타입 및 Mock 데이터
export interface Settlement {
  id: number;
  companyName: string;
  status: 'WAITING' | 'COMPLETED' | 'DISCREPANCY';
  originalAmount: number;
  settlementAmount: number;
  updatedAt: string;
}

const mockSettlements: Settlement[] = [
  { id: 1, companyName: '제노미아', status: 'COMPLETED', originalAmount: 5000000, settlementAmount: 4950000, updatedAt: '2023-10-27 14:00' },
  { id: 2, companyName: '테크스타트', status: 'DISCREPANCY', originalAmount: 1200000, settlementAmount: 0, updatedAt: '2023-10-27 15:30' },
  { id: 3, companyName: '글로벌파트너스', status: 'WAITING', originalAmount: 8500000, settlementAmount: 8415000, updatedAt: '2023-10-27 16:00' },
];

const AdminDashboard: React.FC = () => {
  // 2. 권한 및 상태 관리 (RBAC 로직의 시작점)
  const [isAdmin, setIsAdmin] = useState<boolean>(true); // 실제로는 JWT 토큰 파싱 결과 사용
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const [data, setData] = useState<Settlement[]>([]);

  useEffect(() => {
    // 실제 환경에서는 여기서 API 호출 (ex: axios.get('/api/admin/settlements'))
    setData(mockSettlements);
  }, []);

  if (!isAdmin) {
    return <div className="p-10 font-bold text-center text-red-600">접근 권한이 없습니다. (RBAC 적용)</div>;
  }

  const filteredData = filterStatus === 'ALL' ? data : data.filter(item => item.status === filterStatus);

  return (
    <div className="min-h-screen font-sans bg-slate-50">
      {/* GNB (Global Navigation Bar) - 시안의 상단바 디자인 반영 */}
      <header className="bg-white border-b border-gray-200 shadow-sm">
        <div className="flex items-center justify-between h-16 px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
          <div className="flex items-center gap-2">
            <div className="flex items-center justify-center w-6 h-6 font-bold text-white bg-teal-700 rounded">E</div>
            <span className="text-xl font-bold text-gray-900">Ex-Ledger <span className="ml-2 text-sm font-normal text-teal-700">Admin Center</span></span>
          </div>
          <nav className="hidden space-x-8 md:flex">
            <a href="#" className="font-semibold text-teal-700">정산 현황</a>
            <a href="#" className="text-gray-500 hover:text-gray-900">기업 관리</a>
            <a href="#" className="text-gray-500 hover:text-gray-900">환율/수수료 정책</a>
          </nav>
          <div>
            <button className="px-4 py-2 text-sm font-medium text-white transition bg-teal-700 rounded-md hover:bg-teal-800">
              관리자 로그아웃
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="px-4 py-8 mx-auto space-y-6 max-w-7xl sm:px-6 lg:px-8">
        
        {/* Top Section: 요약 대시보드 (시안의 '주요 통화 환율 추이' 자리) */}
        <section className="p-6 bg-white border border-gray-100 shadow-sm rounded-xl">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold text-gray-800">일일 정산 처리 현황</h2>
            <button className="px-3 py-1 text-sm font-medium text-teal-700 rounded-full bg-teal-50">실시간 동기화</button>
          </div>
          <div className="flex items-center justify-center h-40 border-2 border-gray-200 border-dashed rounded-lg bg-gray-50">
            <div className="text-center text-gray-400">
              <svg className="w-8 h-8 mx-auto mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              <p className="text-sm">정산 트렌드 차트 준비 중 (Recharts 연동 예정)</p>
            </div>
          </div>
        </section>

        {/* Bottom Section: 상세 정산 정보 (시안의 '상세 환율 정보' 테이블 자리) */}
        <section className="overflow-hidden bg-white border border-gray-100 shadow-sm rounded-xl">
          <div className="flex items-center justify-between p-6 border-b border-gray-100">
            <h3 className="text-lg font-bold text-gray-800">상세 정산 로그</h3>
            
            {/* 상태별 필터링 기능 (로드맵 1번 요구사항) */}
            <select 
              className="p-2 text-sm border border-gray-300 rounded-md outline-none focus:border-teal-500"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
            >
              <option value="ALL">전체 보기</option>
              <option value="WAITING">송금 대기 (WAITING)</option>
              <option value="COMPLETED">정산 완료 (COMPLETED)</option>
              <option value="DISCREPANCY">오차 발생 (DISCREPANCY)</option>
            </select>
          </div>
          
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="text-sm text-gray-500 border-b border-gray-200 bg-gray-50">
                <th className="p-4 font-medium">기업명</th>
                <th className="p-4 font-medium">원천 금액(KRW)</th>
                <th className="p-4 font-medium">최종 정산액(KRW)</th>
                <th className="p-4 font-medium">상태</th>
                <th className="p-4 font-medium">업데이트 시간</th>
              </tr>
            </thead>
            <tbody>
              {filteredData.map((row) => (
                <tr key={row.id} className="transition border-b border-gray-100 hover:bg-gray-50">
                  <td className="p-4 font-medium text-gray-800">{row.companyName}</td>
                  <td className="p-4 text-gray-600">{row.originalAmount.toLocaleString()}</td>
                  <td className="p-4 font-bold text-gray-800">{row.settlementAmount.toLocaleString()}</td>
                  <td className="p-4">
                    <span className={`px-2 py-1 text-xs font-bold rounded-full 
                      ${row.status === 'COMPLETED' ? 'bg-green-100 text-green-700' : 
                        row.status === 'DISCREPANCY' ? 'bg-red-100 text-red-700' : 
                        'bg-yellow-100 text-yellow-700'}`}>
                      {row.status}
                    </span>
                  </td>
                  <td className="p-4 text-sm text-gray-500">{row.updatedAt}</td>
                </tr>
              ))}
              {filteredData.length === 0 && (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-gray-500">해당 상태의 데이터가 없습니다.</td>
                </tr>
              )}
            </tbody>
          </table>
        </section>
      </main>
    </div>
  );
};

export default AdminDashboard;