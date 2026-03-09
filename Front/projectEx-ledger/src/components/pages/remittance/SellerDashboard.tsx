import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import CommonLayout from "../../layout/CommonLayout"; // 🌟 다시 추가된 레이아웃
import ExchangeRateChart from "../../widgets/finance/ExchangeRateChart";
import AccountVerification from "./AccountVerification";
import RemittanceTracking from "./Tracking/RemittanceTracking";
import RemittanceRequestModal from "./RemittanceRequestModal";
import RemittanceConsentModal from "./RemittanceConsentModal";
import {
  Wallet,
  ArrowLeftRight,
  Coins,
  ArrowUpRight,
  Activity,
  ClipboardCheck,
} from "lucide-react";
import type { ExchangeRate } from "../../../types/exchange";

const SellerDashboard = () => {
  const location = useLocation();
  const targetCurrency = location.state?.currencyCode || "USD";

  const [rates, setRates] = useState<ExchangeRate[]>([]);

  // 🌟 [비즈니스 분리] 보유 잔액(정산 완료) vs 환전 신청 금액
  const [availableBalance, setAvailableBalance] = useState<number>(12450.0);
  const [exchangeAmount, setExchangeAmount] = useState<number>(0);

  const [currentStatus, setCurrentStatus] = useState<any>("WAITING");
  const [currentTxId, setCurrentTxId] = useState<string>("NEW-REQ");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isConsentModalOpen, setIsConsentModalOpen] = useState(false);
  const [verifiedName, setVerifiedName] = useState("");

  useEffect(() => {
    fetch("http://localhost:8080/api/exchange/latest")
      .then((res) => res.json())
      .then((data) => setRates(Array.isArray(data) ? data : []))
      .catch((err) => console.error("환율 로드 실패:", err));
  }, []);

  const currentRateInfo = rates.find((r) => r.curUnit.includes(targetCurrency));
  const currentRate = currentRateInfo?.rate || 0;

  const totalKRW = exchangeAmount * currentRate;
  const platformFee = Math.floor(totalKRW * 0.015);
  const finalWithdrawAmount = Math.max(0, Math.floor(totalKRW - platformFee));

  const handleRequestSuccess = (transactionId: string) => {
    setCurrentTxId(transactionId);
    setCurrentStatus("PENDING");
  };

  return (
    // 🌟 CommonLayout으로 전체 페이지를 감싸 사이드바와 헤더를 보여줍니다.
    <CommonLayout>
      <div className="w-full p-6 mx-auto lg:p-10 max-w-7xl">
        {/* --- 상단 섹션: 기업 정산 현황 (Settlement) --- */}
        <div className="grid grid-cols-1 gap-6 mb-12 md:grid-cols-3">
          {/* 잔액 카드 */}
          <div className="md:col-span-2 bg-gradient-to-br from-teal-600 to-teal-700 p-10 rounded-[48px] text-white shadow-2xl shadow-teal-100 flex justify-between items-center relative overflow-hidden group">
            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-3 opacity-80">
                <Coins size={16} />
                <p className="text-[11px] font-black uppercase tracking-[0.2em]">
                  Settled Balance
                </p>
              </div>
              <h2 className="text-5xl font-black tracking-tighter">
                {availableBalance.toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                })}
                <span className="ml-2 text-2xl font-bold opacity-50">
                  {targetCurrency}
                </span>
              </h2>
              <div className="flex items-center gap-4 mt-8">
                <span className="px-4 py-2 bg-white/10 rounded-2xl text-[12px] font-bold">
                  정산 완료
                </span>
                <p className="text-sm italic font-medium opacity-60">
                  최종 업데이트: 2026-03-09 10:27
                </p>
              </div>
            </div>
            <Activity
              size={120}
              className="absolute transition-all duration-700 -right-4 -bottom-4 text-white/5 group-hover:text-white/10"
            />
          </div>

          {/* 현재 진행 중인 정산 요약 */}
          <div className="bg-white p-8 rounded-[40px] border border-slate-100 shadow-sm flex flex-col justify-between">
            <div>
              <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest mb-6">
                Current Settlement
              </p>
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-amber-50 text-amber-600">
                  <ClipboardCheck size={18} />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase">
                    검토 중인 대금
                  </p>
                  <h4 className="text-xl font-black text-slate-900">
                    4,120.00 {targetCurrency}
                  </h4>
                </div>
              </div>
            </div>
            <div className="pt-4 border-t border-slate-50">
              <div className="w-full h-1.5 overflow-hidden rounded-full bg-slate-50">
                <div className="bg-teal-500 h-full w-[45%]" />
              </div>
            </div>
          </div>
        </div>

        {/* --- 하단 섹션: 환율 분석 및 환전 신청 (Exchange) --- */}
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-3">
          <div className="space-y-8 lg:col-span-2">
            <div className="bg-white p-8 rounded-[48px] shadow-sm border border-slate-100 h-[480px]">
              <ExchangeRateChart
                rates={rates}
                selectedCurrency={targetCurrency}
              />
            </div>
            <AccountVerification onVerificationSuccess={setVerifiedName} />
          </div>

          <div className="space-y-8">
            {/* 환전 계산기 */}
            <div className="bg-slate-900 p-9 rounded-[48px] text-white shadow-2xl relative overflow-hidden group border border-white/5">
              <div className="flex items-center gap-3 mb-10 opacity-60">
                <ArrowLeftRight size={20} className="text-teal-400" />
                <span className="text-[11px] font-bold tracking-widest uppercase">
                  실시간 환전 계산기
                </span>
              </div>

              <div className="mb-10 space-y-8">
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-[11px] font-bold text-slate-500 uppercase tracking-tight">
                      환전 신청 금액 ({targetCurrency})
                    </p>
                    <button
                      onClick={() => setExchangeAmount(availableBalance)}
                      className="text-[10px] font-black text-teal-400 hover:text-teal-300 transition-colors"
                    >
                      MAX
                    </button>
                  </div>
                  <input
                    type="number"
                    placeholder="0.00"
                    value={exchangeAmount || ""}
                    onChange={(e) => setExchangeAmount(Number(e.target.value))}
                    className="w-full px-6 py-5 text-3xl font-black border outline-none bg-white/5 border-white/10 rounded-3xl focus:ring-2 focus:ring-teal-500/50"
                  />
                </div>

                <div className="pt-8 space-y-5 border-t border-white/5">
                  <div className="flex justify-between text-[14px] font-bold">
                    <span className="text-slate-500">실시간 적용 환율</span>
                    <span className="text-teal-400">
                      {currentRate.toLocaleString()} KRW
                    </span>
                  </div>
                  <div className="flex items-end justify-between pt-4">
                    <span className="text-[11px] font-black text-slate-500 uppercase tracking-widest">
                      최종 출금 예상액
                    </span>
                    <h2 className="text-4xl font-black tracking-tighter text-white">
                      {finalWithdrawAmount.toLocaleString()}{" "}
                      <span className="text-sm font-bold text-slate-500">
                        KRW
                      </span>
                    </h2>
                  </div>
                </div>
              </div>

              <button
                onClick={() => setIsModalOpen(true)}
                disabled={
                  !exchangeAmount ||
                  exchangeAmount <= 0 ||
                  exchangeAmount > availableBalance
                }
                className="flex items-center justify-center w-full gap-3 py-6 text-[16px] font-black bg-teal-500 hover:bg-teal-600 rounded-[28px] disabled:opacity-20 shadow-xl shadow-teal-900/40 active:scale-95"
              >
                <ArrowUpRight size={20} strokeWidth={3} /> 실시간 환전 신청하기
              </button>
            </div>

            <RemittanceTracking
              status={currentStatus}
              transactionId={currentTxId}
              updatedAt="실시간 업데이트 중"
            />
          </div>
        </div>
      </div>

      <RemittanceRequestModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        initialReceiverName={verifiedName}
        onSuccess={handleRequestSuccess}
        settlementData={{
          amount: exchangeAmount,
          currency: targetCurrency,
          rate: currentRate,
          fee: platformFee,
          finalAmount: finalWithdrawAmount,
        }}
      />

      <RemittanceConsentModal
        isOpen={isConsentModalOpen}
        onClose={() => setIsConsentModalOpen(false)}
        transactionId={currentTxId}
        initialReceiverName={verifiedName}
        adjustedAmount={0}
        onSuccess={() => setCurrentStatus("PENDING")}
      />
    </CommonLayout>
  );
};

export default SellerDashboard;
