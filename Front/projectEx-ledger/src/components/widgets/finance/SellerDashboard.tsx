import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import CommonLayout from "../../layout/CommonLayout";
import { useToast } from "../../notification/ToastProvider";
import { useWallet } from "../../../context/WalletContext";
import { hasRole } from "../../../utils/auth";

import AccountVerification from "../../pages/remittance/AccountVerification";
import RemittanceTracking from "../../pages/remittance/Tracking/RemittanceTracking";

import {
  ArrowLeftRight,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Briefcase,
  User,
  Coins,
  Globe,
  Wallet,
  ArrowLeft,
  Sparkles,
  Search,
  Loader2,
} from "lucide-react";

const SellerDashboard: React.FC = () => {
  const { showToast } = useToast();
  const navigate = useNavigate();

  // 🌟 분리된 데이터 구독
  const {
    hasPersonalAccount,
    personalAccount,
    personalBalances,
    hasCorporateAccount,
    corporateAccount,
    corporateBalances,
    executeTransfer,
  } = useWallet();

  // 권한 확인
  const isIndividual = hasRole("ROLE_USER");
  const isCorpAdmin = hasRole("ROLE_COMPANY_ADMIN");
  const isCorpStaff = hasRole("ROLE_COMPANY_USER");

  const [activeTab, setActiveTab] = useState<"PERSONAL" | "BUSINESS">(
    isIndividual ? "PERSONAL" : "BUSINESS",
  );

  // 🌟 현재 탭에 맞는 데이터 스위칭
  const currentUserAccount =
    activeTab === "PERSONAL" ? personalAccount : corporateAccount;
  const currentBalances =
    activeTab === "PERSONAL" ? personalBalances : corporateBalances;
  const hasCurrentAccount =
    activeTab === "PERSONAL" ? hasPersonalAccount : hasCorporateAccount;

  const [currencyMode, setCurrencyMode] = useState<"KRW" | "FOREIGN">("KRW");
  const [targetCurrency, setTargetCurrency] = useState("USD");
  const [recipientAccount, setRecipientAccount] = useState("");
  const [recipientName, setRecipientName] = useState("");
  const [isAccountVerified, setIsAccountVerified] = useState(false);
  const [transferAmount, setTransferAmount] = useState<string>("");
  const [currentRate, setCurrentRate] = useState<number>(1);
  const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const currentAvailableBalance =
    currencyMode === "KRW"
      ? currentBalances.KRW || 0
      : currentBalances[targetCurrency] || 0;

  const isSelfTransfer = recipientAccount === currentUserAccount;

  // 수수료 및 인출액 계산 로직
  const baseKrw =
    currencyMode === "KRW"
      ? Math.floor(Number(transferAmount))
      : Math.floor(Number(transferAmount) * currentRate);
  const commission =
    activeTab === "BUSINESS"
      ? { network: 200, serviceRate: 0.003 }
      : { network: 500, serviceRate: 0.0005 };
  const calculatedFee =
    baseKrw > 0
      ? commission.network + Math.floor(baseKrw * commission.serviceRate)
      : 0;
  const totalRequiredKrw = baseKrw + calculatedFee;

  useEffect(() => {
    if (currencyMode === "FOREIGN") fetchLatestRate();
    else setCurrentRate(1);
  }, [targetCurrency, currencyMode]);

  const fetchLatestRate = async () => {
    try {
      const res = await fetch(
        `https://api.frankfurter.app/latest?from=KRW&to=${targetCurrency}`,
      );
      const data = await res.json();
      setCurrentRate(Number((1 / data.rates[targetCurrency]).toFixed(2)));
    } catch (err) {
      setCurrentRate(1350);
    }
  };

  const handleExecuteTransfer = () => {
    if (Number(transferAmount) <= 0) {
      showToast("금액을 확인하세요.", "ERROR");
      return;
    }
    if (currentBalances.KRW < totalRequiredKrw) {
      showToast("잔액이 부족합니다.", "ERROR");
      return;
    }

    setIsTransferModalOpen(false);
    setIsProcessing(true);

    setTimeout(() => {
      try {
        executeTransfer(
          recipientAccount,
          Number(transferAmount),
          currencyMode === "KRW" ? "KRW" : targetCurrency,
          currentRate,
          totalRequiredKrw,
          baseKrw,
          recipientName,
          activeTab,
        );
        showToast("이체 완료", "SUCCESS");
        setTransferAmount("");
        setIsAccountVerified(false);
        setRecipientAccount("");
      } catch (error: any) {
        showToast(error.message, "ERROR");
      } finally {
        setIsProcessing(false);
      }
    }, 2500);
  };

  if (!hasCurrentAccount)
    return (
      <CommonLayout>
        <div className="max-w-4xl px-6 py-24 mx-auto space-y-8 text-center animate-in fade-in">
          <div className="flex items-center justify-center w-20 h-20 mx-auto bg-slate-50 rounded-3xl text-slate-400">
            <Wallet size={32} />
          </div>
          <h1 className="text-3xl italic font-black tracking-tighter uppercase text-slate-900">
            {activeTab} 지갑 비활성화
          </h1>
          <p className="text-slate-500 font-bold uppercase text-[10px] tracking-widest">
            해당 지갑 계좌를 먼저 발급받아야 이용 가능합니다.
          </p>
        </div>
      </CommonLayout>
    );

  return (
    <CommonLayout>
      <div className="max-w-4xl p-10 mx-auto animate-in fade-in">
        <header className="flex items-center justify-between mb-12">
          <button
            onClick={() => navigate(-1)}
            className="text-slate-400 font-black text-[10px] uppercase tracking-widest flex items-center gap-2 hover:text-slate-600 transition-colors"
          >
            <ArrowLeft size={14} /> Back
          </button>
          <div className="text-right">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 block">
              Active Account ({activeTab})
            </span>
            <span className="px-5 py-2 font-mono text-xs font-bold text-white shadow-lg bg-slate-900 rounded-2xl">
              {currentUserAccount}
            </span>
          </div>
        </header>

        <div className="space-y-8">
          <RemittanceTracking
            status={isProcessing ? "PROCESSING" : "READY"}
            transactionId="TX-LIVE-88"
            updatedAt="실시간"
          />

          <div className="bg-slate-900 rounded-[56px] p-12 text-white shadow-2xl space-y-12 border border-white/5 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 -mt-20 -mr-20 rounded-full bg-blue-500/5 blur-3xl" />

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="flex gap-2 p-1.5 bg-white/5 rounded-3xl">
                <button
                  onClick={() =>
                    (isIndividual || isCorpAdmin) && setActiveTab("PERSONAL")
                  }
                  className={`flex-1 py-4 rounded-2xl text-[10px] font-black transition-all ${activeTab === "PERSONAL" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500"} ${!(isIndividual || isCorpAdmin) && "opacity-20 cursor-not-allowed"}`}
                >
                  <User size={14} className="inline mr-2" /> 개인 거래
                </button>
                <button
                  onClick={() =>
                    (isCorpStaff || isCorpAdmin) && setActiveTab("BUSINESS")
                  }
                  className={`flex-1 py-4 rounded-2xl text-[10px] font-black transition-all ${activeTab === "BUSINESS" ? "bg-blue-600 text-white shadow-sm" : "text-slate-500"} ${!(isCorpStaff || isCorpAdmin) && "opacity-20 cursor-not-allowed"}`}
                >
                  <Briefcase size={14} className="inline mr-2" /> 기업 거래
                </button>
              </div>
              <div className="flex gap-2 p-1.5 bg-white/5 rounded-3xl">
                <button
                  onClick={() => setCurrencyMode("KRW")}
                  className={`flex-1 py-4 rounded-2xl text-[10px] font-black transition-all ${currencyMode === "KRW" ? "bg-slate-800 text-teal-400" : "text-slate-500"}`}
                >
                  <Coins size={14} className="inline mr-2" /> 원화
                </button>
                <button
                  onClick={() => setCurrencyMode("FOREIGN")}
                  className={`flex-1 py-4 rounded-2xl text-[10px] font-black transition-all ${currencyMode === "FOREIGN" ? "bg-slate-800 text-teal-400" : "text-slate-500"}`}
                >
                  <Globe size={14} className="inline mr-2" /> 외화
                </button>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between px-2">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
                  {activeTab === "BUSINESS"
                    ? "수취 기업 ID"
                    : "수취인 계좌 번호"}
                </label>
                <div className="text-teal-400 font-bold text-[11px] flex items-center gap-1.5">
                  <Wallet size={12} />
                  <span>
                    Balance: {currentAvailableBalance.toLocaleString()}{" "}
                    {currencyMode === "KRW" ? "KRW" : targetCurrency}
                  </span>
                </div>
              </div>
              <div className="flex gap-3">
                <input
                  type="text"
                  value={recipientAccount}
                  onChange={(e) => {
                    setRecipientAccount(e.target.value);
                    setIsAccountVerified(false);
                  }}
                  placeholder="EX-XXXX-XXXX"
                  className={`flex-1 p-6 font-sans font-bold border outline-none bg-white/5 rounded-[24px] transition-all ${isSelfTransfer ? "border-red-500/50" : "border-white/10 focus:border-blue-500"}`}
                />
                <button
                  onClick={() => setIsAccountVerified(true)}
                  className="px-8 text-xs font-black bg-white/10 hover:bg-white/20 rounded-[24px] transition-colors"
                >
                  조회
                </button>
              </div>
              {isAccountVerified && (
                <div className="flex items-center gap-3 p-5 border bg-teal-500/10 rounded-[24px] border-teal-500/20 animate-in slide-in-from-top-2">
                  <CheckCircle2 size={18} className="text-teal-400" />
                  <span className="text-base italic font-black text-white">
                    Verified Account
                  </span>
                </div>
              )}
            </div>

            <div className="space-y-6">
              <div
                className={`bg-white/5 rounded-[40px] p-10 border transition-all ${isAccountVerified ? "border-white/10 focus-within:border-blue-500" : "border-white/5 opacity-50"}`}
              >
                <div className="flex items-center justify-between mb-6">
                  <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
                    Amount
                  </p>
                  <span className="text-xl italic font-black opacity-30">
                    {currencyMode === "KRW" ? "KRW" : targetCurrency}
                  </span>
                </div>
                <input
                  type="number"
                  min="0"
                  value={transferAmount}
                  onKeyDown={(e) =>
                    ["-", "+", "e", "E"].includes(e.key) && e.preventDefault()
                  }
                  onChange={(e) => setTransferAmount(e.target.value)}
                  className="w-full text-6xl italic font-black tracking-tighter bg-transparent outline-none"
                  placeholder="0"
                  disabled={!isAccountVerified}
                />
              </div>

              <div className="p-8 bg-blue-600/5 rounded-[32px] border border-white/5 flex justify-between items-end">
                <div className="space-y-1">
                  <span className="text-[10px] font-black text-blue-400 uppercase tracking-widest">
                    Total Withdrawal
                  </span>
                  <p className="text-[10px] text-slate-500 font-bold tracking-tight">
                    {activeTab === "BUSINESS"
                      ? "Business Fee (0.3%)"
                      : "Personal Fee (0.05%)"}{" "}
                    적용
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-4xl italic font-black tracking-tighter">
                    {totalRequiredKrw.toLocaleString()}
                  </span>
                  <span className="ml-2 text-xs font-bold uppercase text-slate-500">
                    KRW
                  </span>
                </div>
              </div>
            </div>

            <button
              onClick={() => setIsTransferModalOpen(true)}
              disabled={!transferAmount || !isAccountVerified || isProcessing}
              className={`w-full py-8 rounded-[32px] font-black text-xl shadow-2xl active:scale-95 disabled:opacity-10 transition-all italic uppercase tracking-widest ${activeTab === "BUSINESS" ? "bg-blue-600 hover:bg-blue-500 shadow-blue-500/20" : "bg-teal-600 hover:bg-teal-500 shadow-teal-500/20"}`}
            >
              Execute {activeTab}
            </button>
          </div>
        </div>
      </div>

      {/* 최종 확인 모달 생략 - 로직은 동일 */}
    </CommonLayout>
  );
};

export default SellerDashboard;
