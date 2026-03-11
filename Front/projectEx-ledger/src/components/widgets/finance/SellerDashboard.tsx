import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import CommonLayout from "../../layout/CommonLayout";
import { useToast } from "../../notification/ToastProvider";
import { useWallet, type Transaction } from "../../../context/WalletContext";
import ExchangeRateChart from "./ExchangeRateChart";

import AccountVerification from "../../pages/remittance/AccountVerification";
import RemittanceTracking from "../../pages/remittance/Tracking/RemittanceTracking"; // 🌟 다시 배치

import {
  ArrowLeftRight,
  ShieldCheck,
  CheckCircle2,
  ArrowDownLeft,
  ArrowUpRight,
  ChevronRight,
  Loader2,
  Sparkles,
  AlertTriangle,
  Briefcase,
  User,
} from "lucide-react";

const FLAGS: Record<string, string> = {
  KRW: "🇰🇷",
  USD: "🇺🇸",
  JPY: "🇯🇵",
  EUR: "🇪🇺",
};

const SellerDashboard: React.FC = () => {
  const { showToast } = useToast();
  const navigate = useNavigate();
  const {
    hasAccount,
    setHasAccount,
    userAccount,
    setUserAccount,
    balances,
    transactions,
    executeTransfer,
  } = useWallet();

  const [userRole, setUserRole] = useState<string>("");
  const [activeTab, setActiveTab] = useState<"PERSONAL" | "BUSINESS">(
    "PERSONAL",
  );

  useEffect(() => {
    // 🌟 실제 환경에선 parseJwt(token).auth 사용
    const role = "ROLE_USER";
    setUserRole(role);
    if (role.includes("COMPANY")) setActiveTab("BUSINESS");
  }, []);

  const [loading, setLoading] = useState(false);
  const [recipientAccount, setRecipientAccount] = useState("");
  const [recipientName, setRecipientName] = useState("");
  const [targetCurrency, setTargetCurrency] = useState("USD");
  const [isAccountVerified, setIsAccountVerified] = useState(false);
  const [transferAmount, setTransferAmount] = useState<string>("");
  const [currentRate, setCurrentRate] = useState<number>(1350);
  const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const isSelfTransfer = recipientAccount === userAccount;
  const baseKrw = Math.floor(
    Number(transferAmount) * (targetCurrency === "KRW" ? 1 : currentRate),
  );
  const feeRate = activeTab === "BUSINESS" ? 0.0005 : 0.001;
  const totalRequiredKrw =
    baseKrw > 0
      ? (activeTab === "BUSINESS" ? 3000 : 5000) + Math.floor(baseKrw * feeRate)
      : 0;

  useEffect(() => {
    if (targetCurrency !== "KRW") fetchLatestRate();
    else setCurrentRate(1);
  }, [targetCurrency]);

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

  const handleAccountCreationSuccess = (ownerName: string) => {
    setLoading(true);
    setTimeout(() => {
      setUserAccount(`EX-1002-${Math.floor(1000 + Math.random() * 9000)}`);
      setHasAccount(true);
      setLoading(false);
      showToast(`${ownerName}님의 계좌가 발급되었습니다.`, "SUCCESS");
    }, 2000);
  };

  const handleVerifyAccount = () => {
    if (isSelfTransfer) {
      showToast("본인 계좌 송금 불가", "ERROR");
      return;
    }
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      setRecipientName(
        recipientAccount.includes("2003")
          ? "(주) 글로벌파트너스"
          : "인증된 외부 사용자",
      );
      setIsAccountVerified(true);
    }, 800);
  };

  const handleExecuteTransfer = () => {
    setIsTransferModalOpen(false);
    setIsProcessing(true);
    setTimeout(() => {
      executeTransfer(
        recipientAccount,
        Number(transferAmount),
        targetCurrency,
        currentRate,
        totalRequiredKrw,
        baseKrw,
        recipientName,
        activeTab,
      );
      showToast(
        `${activeTab === "BUSINESS" ? "정산" : "송금"} 완료`,
        "SUCCESS",
      );
      setIsProcessing(false);
      setTransferAmount("");
      setIsAccountVerified(false);
      setRecipientAccount("");
    }, 3000);
  };

  if (!hasAccount)
    return (
      <CommonLayout>
        <div className="max-w-4xl px-6 py-24 mx-auto space-y-16 text-center animate-in fade-in">
          <div className="space-y-6">
            <div className="bg-teal-50 w-24 h-24 rounded-[32px] flex items-center justify-center mx-auto text-teal-600 shadow-xl shadow-teal-100/50">
              <Sparkles size={40} />
            </div>
            <h1 className="font-sans text-4xl italic font-black tracking-tighter uppercase text-slate-900">
              Activate Ex-Wallet
            </h1>
            <p className="font-bold text-slate-500">
              통합인증 후 가상계좌를 발급받으세요.
            </p>
          </div>
          <AccountVerification
            onVerificationSuccess={handleAccountCreationSuccess}
          />
        </div>
      </CommonLayout>
    );

  return (
    <CommonLayout>
      <div className="p-10 mx-auto space-y-10 max-w-7xl animate-in fade-in">
        <header className="flex items-center justify-between">
          <h2 className="flex items-center gap-2 font-sans text-xl italic font-black tracking-tighter uppercase text-slate-800">
            <ShieldCheck className="text-teal-500" size={24} /> Verified Assets
          </h2>
          <div className="flex flex-col items-end">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">
              Account ID
            </span>
            <span className="px-5 py-2 font-mono text-xs font-bold tracking-tighter text-white shadow-lg bg-slate-900 rounded-2xl">
              {userAccount}
            </span>
          </div>
        </header>

        <main className="grid grid-cols-1 gap-10 lg:grid-cols-12">
          <div className="space-y-10 lg:col-span-7">
            <div className="bg-white p-10 rounded-[48px] shadow-sm border border-slate-100 h-[500px] overflow-hidden">
              <ExchangeRateChart rates={[]} selectedCurrency={targetCurrency} />
            </div>

            <div className="bg-white border border-slate-100 rounded-[40px] p-8 shadow-sm">
              <h2 className="mb-8 font-sans text-lg italic font-black tracking-tighter uppercase">
                Recent Activity
              </h2>
              <div className="space-y-4">
                {transactions.length > 0 ? (
                  transactions.slice(0, 3).map((tx: any) => (
                    <div
                      key={tx.id}
                      className="flex items-center justify-between p-4 transition-all rounded-2xl hover:bg-slate-50"
                    >
                      <div className="flex items-center gap-4">
                        <div
                          className={`p-3 rounded-xl ${tx.amount > 0 ? "bg-teal-50 text-teal-600" : "bg-red-50 text-red-600"}`}
                        >
                          {tx.amount > 0 ? (
                            <ArrowDownLeft size={16} />
                          ) : (
                            <ArrowUpRight size={16} />
                          )}
                        </div>
                        <div>
                          <p className="flex items-center gap-2 text-sm font-black text-slate-800">
                            {tx.title}{" "}
                            <span
                              className={`text-[8px] px-1.5 py-0.5 rounded font-black ${tx.category === "BUSINESS" ? "bg-blue-100 text-blue-600" : "bg-slate-100 text-slate-400"}`}
                            >
                              {tx.category}
                            </span>
                          </p>
                          <p className="text-[10px] font-bold text-slate-400">
                            {tx.date}
                          </p>
                        </div>
                      </div>
                      <p
                        className={`font-black font-sans ${tx.amount > 0 ? "text-teal-600" : "text-slate-900"}`}
                      >
                        {tx.amount > 0 ? "+" : ""}
                        {Math.abs(tx.amount).toLocaleString()}{" "}
                        <span className="text-[10px] opacity-40 uppercase">
                          {tx.currency}
                        </span>
                      </p>
                    </div>
                  ))
                ) : (
                  <div className="py-10 font-bold text-center text-slate-300">
                    표시할 거래 내역이 없습니다.
                  </div>
                )}
              </div>
            </div>
          </div>

          <aside className="lg:col-span-5">
            <div className="sticky space-y-6 top-10">
              {/* 🌟 [수정] 진행 현황 바를 거래 폼 영역 최상단으로 이동 */}
              <RemittanceTracking
                status={isProcessing ? "PROCESSING" : "READY"}
                transactionId="TX-LIVE-88"
                updatedAt="실시간"
              />

              {/* 🌟 거래/정산 폼 박스 */}
              <div className="bg-slate-900 rounded-[56px] p-12 text-white shadow-2xl space-y-10 border border-white/5 transition-all">
                <div className="flex gap-2 p-1.5 bg-white/5 rounded-3xl">
                  <button
                    onClick={() => setActiveTab("PERSONAL")}
                    className={`flex-1 py-4 rounded-2xl text-[10px] font-black transition-all flex items-center justify-center gap-2 ${activeTab === "PERSONAL" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-white"}`}
                  >
                    <User size={14} /> 개인 송금
                  </button>
                  <button
                    onClick={() => setActiveTab("BUSINESS")}
                    className={`flex-1 py-4 rounded-2xl text-[10px] font-black transition-all flex items-center justify-center gap-2 ${activeTab === "BUSINESS" ? "bg-blue-600 text-white shadow-lg" : "text-slate-500 hover:text-white"}`}
                  >
                    <Briefcase size={14} /> 기업 정산
                  </button>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div
                      className={`p-4 rounded-[20px] shadow-lg ${activeTab === "BUSINESS" ? "bg-blue-600" : "bg-teal-600"}`}
                    >
                      <ArrowLeftRight size={24} />
                    </div>
                    <h3 className="font-sans text-2xl italic font-black tracking-tighter uppercase">
                      {activeTab === "BUSINESS" ? "Settlement" : "Transfer"}
                    </h3>
                  </div>
                </div>

                <div className="space-y-4">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-2">
                    {activeTab === "BUSINESS" ? "Partner ID" : "Recipient ID"}
                  </label>
                  <div className="flex gap-3">
                    <input
                      type="text"
                      value={recipientAccount}
                      onChange={(e) => {
                        setRecipientAccount(e.target.value);
                        setIsAccountVerified(false);
                      }}
                      placeholder="EX-0000-0000"
                      className={`flex-1 p-5 font-sans font-bold border outline-none bg-white/5 rounded-2xl transition-all ${isSelfTransfer ? "border-red-500" : "border-white/10 focus:border-blue-500"}`}
                    />
                    <button
                      onClick={handleVerifyAccount}
                      className="px-6 text-xs font-black bg-white/10 hover:bg-white/20 rounded-2xl"
                    >
                      조회
                    </button>
                  </div>
                  {isSelfTransfer && (
                    <div className="flex items-center gap-2 p-4 text-xs font-bold text-red-400 border bg-red-500/10 border-red-500/20 rounded-2xl animate-pulse">
                      <AlertTriangle size={14} /> 본인 계좌 송금 차단
                    </div>
                  )}
                  {isAccountVerified && !isSelfTransfer && (
                    <div className="flex items-center gap-3 p-4 border bg-teal-500/10 rounded-2xl border-teal-500/20 animate-in slide-in-from-top-2">
                      <CheckCircle2 size={16} className="text-teal-400" />
                      <span className="text-sm font-black text-white">
                        {recipientName}
                      </span>
                    </div>
                  )}
                </div>

                <div className="space-y-6">
                  <div className="bg-white/5 rounded-[32px] p-8 border border-white/10 focus-within:border-blue-500 font-sans">
                    <div className="flex items-center justify-between mb-4">
                      <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
                        Amount ({targetCurrency})
                      </p>
                      <span className="text-xl">{FLAGS[targetCurrency]}</span>
                    </div>
                    <input
                      type="number"
                      value={transferAmount}
                      onChange={(e) => setTransferAmount(e.target.value)}
                      className="w-full text-5xl font-black tracking-tighter bg-transparent outline-none"
                      placeholder="0"
                      disabled={!isAccountVerified || isSelfTransfer}
                    />
                  </div>
                  <div className="p-6 bg-blue-600/5 rounded-[28px] border border-white/5 flex justify-between items-end">
                    <span className="text-[10px] font-black text-blue-400 uppercase tracking-widest">
                      Total Out (KRW)
                    </span>
                    <span className="text-3xl font-black">
                      {totalRequiredKrw.toLocaleString()}
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => setIsTransferModalOpen(true)}
                  disabled={
                    !transferAmount || !isAccountVerified || isSelfTransfer
                  }
                  className={`w-full py-7 rounded-[30px] font-black text-lg shadow-xl active:scale-95 disabled:opacity-20 font-sans uppercase transition-all ${activeTab === "BUSINESS" ? "bg-blue-600 hover:bg-blue-500" : "bg-teal-600 hover:bg-teal-500"}`}
                >
                  {activeTab === "BUSINESS" ? "정산하기" : "이체하기"}
                </button>
              </div>
            </div>
          </aside>
        </main>
      </div>

      {/* 최종 승인 모달 */}
      {isTransferModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-900/80 backdrop-blur-lg">
          <div className="bg-white w-full max-w-md rounded-[56px] p-12 space-y-8 shadow-2xl text-center">
            <h3 className="font-sans text-3xl italic font-black tracking-tighter uppercase">
              Confirmation
            </h3>
            <div className="p-6 bg-slate-50 rounded-3xl">
              <p className="text-xl font-black">{recipientName}</p>
              <p className="font-mono text-xs font-bold tracking-widest uppercase">
                {recipientAccount}
              </p>
            </div>
            <div className="flex gap-4 pt-6 font-sans">
              <button
                onClick={() => setIsTransferModalOpen(false)}
                className="flex-1 py-5 font-black text-slate-400 hover:bg-slate-50 rounded-2xl"
              >
                Cancel
              </button>
              <button
                onClick={handleExecuteTransfer}
                className={`flex-[2] text-white py-5 rounded-2xl font-black shadow-xl font-sans uppercase ${activeTab === "BUSINESS" ? "bg-blue-600" : "bg-teal-600"}`}
              >
                Approve
              </button>
            </div>
          </div>
        </div>
      )}
    </CommonLayout>
  );
};

export default SellerDashboard;
