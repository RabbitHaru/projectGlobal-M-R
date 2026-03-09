import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import ExchangeRateChart from "../../widgets/finance/ExchangeRateChart";
import RemittanceTracking from "../../pages/remittance/Tracking/RemittanceTracking";
import RemittanceRequestModal from "../../pages/remittance/RemittanceRequestModal";
import { ArrowLeftRight, Coins, ArrowUpRight, Wallet } from "lucide-react";
import type { ExchangeRate } from "../../../types/exchange";

const ExchangePage = () => {
  const location = useLocation();
  const targetCurrency = location.state?.currencyCode || "USD";

  const [rates, setRates] = useState<ExchangeRate[]>([]);
  const [availableBalance, setAvailableBalance] = useState<number>(12450.0);
  const [exchangeAmount, setExchangeAmount] = useState<number>(0);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [verifiedName, setVerifiedName] = useState("Member C");

  useEffect(() => {
    fetch("http://localhost:8080/api/exchange/latest")
      .then((res) => res.json())
      .then((data) => setRates(Array.isArray(data) ? data : []))
      .catch((err) => console.error("환율 로드 실패:", err));
  }, []);

  const currentRate =
    rates.find((r) => r.curUnit.includes(targetCurrency))?.rate || 0;
  const finalAmount = Math.floor(exchangeAmount * currentRate * 0.985); // 수수료 반영

  return (
    <div className="w-full p-6 mx-auto lg:p-10 max-w-7xl">
      <div className="mb-10">
        <h1 className="text-3xl italic font-black text-slate-900">
          실시간 환전 및 출금
        </h1>
        <p className="mt-2 font-medium text-slate-500">
          보유하신 외화를 실시간 환율로 안전하게 원화 출금하세요.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        <div className="space-y-8 lg:col-span-2">
          {/* 잔액 카드 */}
          <div className="bg-teal-600 p-8 rounded-[40px] text-white shadow-xl shadow-teal-100 flex justify-between items-center">
            <div>
              <p className="text-[11px] font-black opacity-60 uppercase tracking-widest mb-2">
                Available to Exchange
              </p>
              <h2 className="text-4xl font-black">
                {availableBalance.toLocaleString()} {targetCurrency}
              </h2>
            </div>
            <div className="p-4 bg-white/10 rounded-3xl">
              <Wallet size={40} />
            </div>
          </div>
          {/* 차트 위젯 */}
          <div className="bg-white p-8 rounded-[40px] border border-slate-100 h-[450px]">
            <ExchangeRateChart
              rates={rates}
              selectedCurrency={targetCurrency}
            />
          </div>
        </div>

        {/* 환전 계산기 */}
        <div className="space-y-8">
          <div className="bg-slate-900 p-8 rounded-[40px] text-white shadow-2xl">
            <div className="flex items-center gap-3 mb-8 opacity-60">
              <ArrowLeftRight size={20} className="text-teal-400" />
              <span className="text-[11px] font-bold uppercase tracking-widest">
                Exchange Calculator
              </span>
            </div>
            <div className="space-y-6">
              <input
                type="number"
                value={exchangeAmount || ""}
                onChange={(e) => setExchangeAmount(Number(e.target.value))}
                className="w-full px-6 py-5 text-2xl font-black border outline-none bg-white/5 border-white/10 rounded-2xl"
                placeholder="0.00"
              />
              <div className="pt-6 space-y-4 border-t border-white/5">
                <div className="flex justify-between text-sm font-bold text-slate-500">
                  <span>수령 예상액</span>
                  <span className="text-white">
                    {finalAmount.toLocaleString()} KRW
                  </span>
                </div>
                <button
                  onClick={() => setIsModalOpen(true)}
                  disabled={
                    exchangeAmount <= 0 || exchangeAmount > availableBalance
                  }
                  className="w-full py-5 font-black transition-all bg-teal-500 hover:bg-teal-600 rounded-2xl disabled:opacity-20"
                >
                  환전 신청하기
                </button>
              </div>
            </div>
          </div>
          <RemittanceTracking status="WAITING" transactionId="NEW-EXC" />
        </div>
      </div>

      <RemittanceRequestModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        initialReceiverName={verifiedName}
        onSuccess={() => alert("환전 신청 완료!")}
        settlementData={{
          amount: exchangeAmount,
          currency: targetCurrency,
          rate: currentRate,
          fee: 0,
          finalAmount: finalAmount,
        }}
      />
    </div>
  );
};

export default ExchangePage;
