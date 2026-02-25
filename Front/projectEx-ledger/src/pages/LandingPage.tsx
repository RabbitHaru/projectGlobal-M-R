import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '../constants/routes';
import { Button } from '../components/ui/Button';
import { FXTicker } from '../components/widgets/FXTicker';
import { TotalSettlementWidget } from '../components/widgets/TotalSettlementWidget';
import { MiniConverter } from '../components/widgets/MiniConverter';

/**
 * 서비스 메인 랜딩 페이지
 */
export const LandingPage: React.FC = () => {
    const navigate = useNavigate();

    return (
        <div className="flex flex-col min-h-screen bg-slate-50">
            {/* 실시간 환율 티커 (최상단 배치) */}
            <FXTicker />

            {/* 메인 콘텐츠 영역 */}
            <main className="flex-1 w-full max-w-7xl mx-auto px-4 py-8 md:py-12 space-y-12">

                {/* 1. 로그인 관문 (Hero Section) */}
                <section className="text-center py-16 bg-white rounded-2xl shadow-sm border border-gray-100 px-4">
                    <h1 className="text-4xl md:text-5xl font-extrabold text-blue-900 mb-6 tracking-tight">
                        Ex-Ledger: 스마트한 수출입 정산의 시작
                    </h1>
                    <p className="text-lg md:text-xl text-gray-500 mb-10 max-w-2xl mx-auto">
                        복잡한 외환 거래와 세무 정산을 하나의 플랫폼에서 안전하고 간편하게 관리하세요.
                    </p>
                    <div className="flex flex-col sm:flex-row justify-center gap-4">
                        <Button
                            variant="primary"
                            size="lg"
                            onClick={() => navigate(ROUTES.LOGIN)}
                            className="w-full sm:w-auto px-8"
                        >
                            로그인
                        </Button>
                        <Button
                            variant="secondary"
                            size="lg"
                            onClick={() => navigate(ROUTES.SIGNUP)}
                            className="w-full sm:w-auto px-8"
                        >
                            회원가입
                        </Button>
                    </div>
                </section>

                {/* 2. 보안 배너 */}
                <section className="bg-blue-50 border border-blue-100 rounded-xl p-6 flex flex-col md:flex-row items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-blue-100 rounded-full text-blue-600">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                            </svg>
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-blue-900">철저한 보안 시스템</h3>
                            <p className="text-sm text-blue-700">모든 금융 데이터는 국제 보안 표준 규격에 맞춰 암호화되어 안전하게 보관됩니다.</p>
                        </div>
                    </div>
                    <Button variant="secondary" size="sm" className="whitespace-nowrap">보안 정책 보기</Button>
                </section>

                {/* 3. 위젯 영역 (누적 정산액 & 간이 환전기) */}
                <section className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <TotalSettlementWidget />
                    <MiniConverter />
                </section>

            </main>
        </div>
    );
};
