import React, { useState, useEffect } from 'react';
// import { useNavigate } from 'react-router-dom'; // 상세 페이지 이동을 위해 향후 필요
import axios from 'axios';

// 1. 대사 데이터 인터페이스 정의 (DTO와 1:1 매핑)
export interface ReconciliationData {
  reconciliationId: number;
  portoneTxId: string;       // 포트원 결제 고유 번호
  internalRemitId: string;   // 내부 송금 요청 고유 번호
  portoneAmount: number;     // 포트원 결제 금액 (KRW)
  internalAmount: number;    // 내부 DB 송금 요청 금액 (KRW)
  status: 'MATCHED' | 'DISCREPANCY' | 'PENDING'; // 대사 상태
  processedAt: string;
}

// 개발/테스트용 Mock 데이터 (API 연동 전 시각화용)
const mockReconciliationData: ReconciliationData[] = [
  { reconciliationId: 101, portoneTxId: 'imp_987654321', internalRemitId: 'RMT-20231027-01', portoneAmount: 5000000, internalAmount: 5000000, status: 'MATCHED', processedAt: '2023-10-27 09:15' },
  { reconciliationId: 102, portoneTxId: 'imp_123456789', internalRemitId: 'RMT-20231027-02', portoneAmount: 1200000, internalAmount: 1100000, status: 'DISCREPANCY', processedAt: '2023-10-27 09:16' },
  { reconciliationId: 103, portoneTxId: 'imp_456123789', internalRemitId: 'RMT-20231027-03', portoneAmount: 8500000, internalAmount: 8500000, status: 'PENDING', processedAt: '2023-10-27 09:20' },
];

const ReconciliationList: React.FC = () => {
  // const navigate = useNavigate();
  const [data, setData] = useState<ReconciliationData[]>([]);
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // 2. 백엔드 API 연동 함수 (RBAC 기반의 A의 O(N) 대사 결과 호출)
  const fetchReconciliationData = async () => {
    setIsLoading(true);
    try {
      // 실제 환경: B가 구축한 보안 필터를 통과하기 위해 헤더에 JWT가 자동 포함됨
      // const response = await axios.get('/api/admin/reconciliation', { params: { status: filterStatus } });
      // setData(response.data);
      
      // Mock Data 딜레이 시뮬레이션
      setTimeout(() => {
        setData(mockReconciliationData);
        setIsLoading(false);
      }, 500);
    } catch (error) {
      console.error("대사 데이터를 불러오는 중 오류 발생:", error);
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchReconciliationData();
  }, []);

  // 3. 상태에 따른 뱃지 색상 렌더링 함수
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'MATCHED':
        return <span className="px-2 py-1 text-xs font-bold text-green-700 bg-green-100 rounded-full">정상 (MATCHED)</span>;
      case 'DISCREPANCY':
        return <span className="px-2 py-1 text-xs font-bold text-red-700 animate-pulse bg-red-100 rounded-full">불일치 (DISCREPANCY)</span>;
      case 'PENDING':
        return <span className="px-2 py-1 text-xs font-bold text-gray-700 bg-gray-200 rounded-full">대기중 (PENDING)</span>;
      default:
        return null;
    }
  };

  // 상세 페이지 이동 핸들러
  const handleDetailClick = (id: number) => {
    // navigate(`/admin/settlement/reconciliation/${id}`);
    alert(`오차 발생 건 수정 화면(ReconciliationDetail.tsx)으로 이동합니다. ID: ${id}`);
  };

  // 프론트엔드 임시 필터링 (실제로는 백엔드에서 쿼리로 처리하는 것이 대용량 처리에 적합함)
  const filteredData = filterStatus === 'ALL' ? data : data.filter(d => d.status === filterStatus);

  return (
    <div className="p-6 bg-white border border-gray-100 rounded-xl shadow-sm">
      {/* 상단 헤더 및 필터 */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-gray-800">포트원 결제 대사 리스트</h2>
          <p className="text-sm text-gray-500 mt-1">포트원(V2) 결제 내역과 내부 송금 DB를 대조합니다.</p>
        </div>
        
        <div className="flex gap-3">
          <select 
            className="p-2 text-sm border border-gray-300 rounded-md outline-none focus:border-teal-500 bg-white"
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
          >
            <option value="ALL">전체 상태 보기</option>
            <option value="MATCHED">정상 (MATCHED)</option>
            <option value="DISCREPANCY">불일치 (DISCREPANCY)</option>
            <option value="PENDING">대기중 (PENDING)</option>
          </select>
          <button 
            onClick={fetchReconciliationData}
            className="px-4 py-2 text-sm font-medium text-white transition bg-teal-700 rounded-md hover:bg-teal-800"
          >
            대사 로직 재실행
          </button>
        </div>
      </div>

      {/* 데이터 테이블 */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="text-sm text-gray-600 border-b-2 border-gray-200 bg-gray-50">
              <th className="p-4 font-semibold">대사 ID</th>
              <th className="p-4 font-semibold">포트원 결제 번호</th>
              <th className="p-4 font-semibold">내부 송금 번호</th>
              <th className="p-4 font-semibold text-right">포트원 결제액(A)</th>
              <th className="p-4 font-semibold text-right">내부 송금액(B)</th>
              <th className="p-4 font-semibold text-center">대사 상태</th>
              <th className="p-4 font-semibold text-center">관리</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr><td colSpan={7} className="p-8 text-center text-gray-500">데이터를 불러오는 중입니다...</td></tr>
            ) : filteredData.length === 0 ? (
              <tr><td colSpan={7} className="p-8 text-center text-gray-500">조회된 대사 내역이 없습니다.</td></tr>
            ) : (
              filteredData.map((row) => (
                <tr key={row.reconciliationId} className={`transition border-b border-gray-100 hover:bg-gray-50 ${row.status === 'DISCREPANCY' ? 'bg-red-50/30' : ''}`}>
                  <td className="p-4 text-sm text-gray-600">#{row.reconciliationId}</td>
                  <td className="p-4 font-mono text-sm text-gray-800">{row.portoneTxId}</td>
                  <td className="p-4 font-mono text-sm text-gray-800">{row.internalRemitId}</td>
                  <td className="p-4 font-medium text-right text-gray-800">{row.portoneAmount.toLocaleString()}원</td>
                  <td className="p-4 font-medium text-right text-gray-800">{row.internalAmount.toLocaleString()}원</td>
                  <td className="p-4 text-center">{getStatusBadge(row.status)}</td>
                  <td className="p-4 text-center">
                    {/* 불일치 건에 대해서만 조치 버튼 활성화 */}
                    {row.status === 'DISCREPANCY' ? (
                      <button 
                        onClick={() => handleDetailClick(row.reconciliationId)}
                        className="px-3 py-1 text-xs font-semibold text-white bg-red-600 rounded shadow-sm hover:bg-red-700"
                      >
                        원인 분석 / 수정
                      </button>
                    ) : (
                      <button className="px-3 py-1 text-xs font-medium text-gray-400 bg-gray-100 rounded cursor-not-allowed">
                        조회
                      </button>
                    )}
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

export default ReconciliationList;