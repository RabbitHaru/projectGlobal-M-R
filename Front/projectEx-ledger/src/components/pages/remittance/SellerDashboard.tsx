import React, { useState, useEffect } from "react";
import { useToast } from "../../notification/ToastProvider";
import { hasRole } from "../../../utils/auth";
import {
  Building2,
  Send,
  Wallet,
  CheckCircle2,
  Loader2,
} from "lucide-react";

// 백엔드 명세에 맞춘 수취인 데이터 (실제 데이터 연동 전 초기값)
const RECIPIENTS = [
  {
    id: "REC_001",
    name: "Global Supply Co.",
    bank: "Chase Bank",
    currency: "USD",
    country: "미국",
  },
  {
    id: "REC_002",
    name: "Tech Parts Ltd.",
    bank: "MUFG Bank",
    currency: "JPY",
    country: "일본",
  },
  {
    id: "REC_003",
    name: "Euro Trading GmbH",
    bank: "Deutsche Bank",
    currency: "유럽연합",
  },
  {
    id: "REC_004",
    name: "London Logistics",
    bank: "HSBC Bank",
    currency: "영국",
  },
  {
    id: "REC_005",
    name: "Beijing Tech",
    bank: "Bank of China",
    currency: "중국",
  },
  {
    id: "REC_006",
    name: "Asia Pacific Ltd.",
    bank: "DBS Bank",
    currency: "싱가포르",
  },
  {
    id: "REC_007",
    name: "HK Trading",
    bank: "Standard Chartered",
    currency: "홍콩",
  },
];

const STEPS = ["접수", "환전", "송금", "완료"];

const SellerDashboard: React.FC = () => {
  const { showToast } = useToast();
  const [selectedRecipient, setSelectedRecipient] = useState(RECIPIENTS[0]);
  const [amount, setAmount] = useState<string>("");
  const [currentRate, setCurrentRate] = useState<number>(1350);
  const [balance, setBalance] = useState<number>(0);

  const [isRemitModalOpen, setIsRemitModalOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [remitStep, setRemitStep] = useState(0);

  const fetchBalance = async () => {
    try {
      const res = await fetch("/api/v1/user/balance");
      if (!res.ok) throw new Error("잔액 로드 실패");
      const data = await res.json();
      setBalance(data.krwBalance);
    } catch (error) {
      console.error("잔액 동기화 에러:", error);
    }
  };

  useEffect(() => {
    fetchBalance();
    const fetchLatestRate = async () => {
      try {
        const response = await fetch(
          `https://api.frankfurter.app/latest?from=KRW&to=${selectedRecipient.currency}`,
        );
        const data = await response.json();
        const rawRate = data.rates[selectedRecipient.currency];
        const multiplier = selectedRecipient.currency === "JPY" ? 100 : 1;
        setCurrentRate(Number(((1 / rawRate) * multiplier).toFixed(2)));
      } catch (error) {
        console.error("환율 로드 실패");
      }
    };
    fetchLatestRate();
  }, [selectedRecipient.currency]);

  const executeRemittanceAPI = async () => {
    const totalCost = Number(amount) * currentRate;
    const requestBody = {
      receiverId: selectedRecipient.id,
      targetCurrency: selectedRecipient.currency,
      targetAmount: Number(amount),
      appliedExchangeRate: currentRate,
      totalKrwAmount: totalCost,
    };

    try {
      const res = await fetch("/api/v1/remittance/execute", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestBody),
      });

      if (!res.ok) {
        const error = await res.json();
        if (error.code === "INSUFFICIENT_BALANCE") {
          showToast("잔액이 부족하여 송금을 진행할 수 없습니다.", "ERROR");
        } else {
          showToast("송금 요청 중 서버 오류가 발생했습니다.", "ERROR");
        }
        return false;
      }
      return true;
    } catch (err) {
      showToast("네트워크 연결을 확인해 주세요.", "ERROR");
      return false;
    }
  };

  const confirmRemittance = async () => {
    const totalCost = Number(amount) * currentRate;

    if (balance < totalCost) {
      showToast("잔액이 부족합니다.", "ERROR");
      return;
    }

    setIsRemitModalOpen(false);
    const apiSuccess = await executeRemittanceAPI();
    if (!apiSuccess) return;

    setIsProcessing(true);
    setRemitStep(0);

    let currentStep = 0;
    const interval = setInterval(() => {
      currentStep += 1;
      if (currentStep >= 3) {
        clearInterval(interval);
        setRemitStep(3);
        fetchBalance();
        showToast("송금이 성공적으로 완료되었습니다.", "SUCCESS");
        setTimeout(() => setIsProcessing(false), 8000);
      } else {
        setRemitStep(currentStep);
      }
    }, 4000);
  };

  return (
    <div className="max-w-6xl mx-auto p-6 md:p-10 space-y-8 bg-[#fcfdfe] min-h-screen animate-in fade-in duration-500">
      {/* 상단 잔액 요약 */}
      <header className="bg-white p-10 rounded-[40px] shadow-sm border border-slate-100 flex flex-col md:flex-row justify-between items-center gap-6">
        <div className="flex items-center gap-6">
          <div className="flex items-center justify-center text-teal-400 shadow-xl w-14 h-14 bg-slate-900 rounded-2xl">
            <Wallet size={28} />
          </div>
          <div className="space-y-1">
            <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest">
              Available KRW Balance
            </p>
            <h1 className="text-5xl font-black tracking-tighter text-slate-900">
              {balance.toLocaleString()}{" "}
              <span className="ml-1 font-sans text-xl font-medium text-slate-200">
                KRW
              </span>
            </h1>
          </div>
        </div>
        {hasRole("ROLE_USER") || hasRole("ROLE_COMPANY_ADMIN") || hasRole("ROLE_COMPANY_USER") ? (
          <button
            onClick={() => showToast("원화 충전 기능을 실행합니다.", "INFO")}
            className="w-full px-10 py-5 text-sm font-black text-white transition-all shadow-2xl md:w-auto bg-slate-900 rounded-2xl hover:bg-slate-800 active:scale-95 shadow-slate-200"
          >
            자금 충전하기
          </button>
        ) : (
          <div className="px-6 py-4 bg-slate-50 rounded-2xl text-[11px] font-bold text-slate-400">
            충전 권한 없음
          </div>
        )}
      </header>

      <main className="grid items-start grid-cols-1 gap-8 lg:grid-cols-12">
        <div className="space-y-6 lg:col-span-7">
          <section className="bg-white p-10 rounded-[48px] shadow-sm border border-slate-100">
            <div className="flex items-center justify-between px-2 mb-10">
              <h2 className="text-2xl font-black tracking-tighter text-slate-900">
                해외 수취인 선택
              </h2>
              <div className="px-4 py-2 bg-slate-50 rounded-xl text-[10px] font-bold text-slate-400 uppercase">
                Global Network Active
              </div>
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {RECIPIENTS.map((r) => (
                <button
                  key={r.id}
                  onClick={() => {
                    setSelectedRecipient(r);
                    setIsProcessing(false);
                  }}
                  className={`p-6 rounded-[32px] border-2 transition-all text-left flex items-center gap-5 ${selectedRecipient.id === r.id ? "border-blue-500 bg-blue-50/20 shadow-md" : "border-slate-50 hover:border-slate-100 bg-white"}`}
                >
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${selectedRecipient.id === r.id ? "bg-blue-500 text-white shadow-lg" : "bg-slate-50 text-slate-300"}`}>
                    <Building2 size={24} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-black text-slate-800 text-[15px] tracking-tight truncate">
                      {r.name}
                    </h4>
                    <p className="text-[10px] font-bold text-slate-400 uppercase mt-0.5">
                      {r.currency} · {r.country}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          </section>

          <div className="p-8 bg-blue-50/50 rounded-[40px] border border-blue-100/30 flex items-center gap-6">
            <div className="flex items-center justify-center w-12 h-12 text-blue-600 bg-white shadow-sm rounded-2xl">
              <CheckCircle2 size={24} />
            </div>
            <p className="text-xs font-black leading-relaxed tracking-tight text-blue-900/70">
              KOREAEXIM 규격에 맞춰 전세계 주요 7개국 실시간 송금 네트워크가 활성화되어 있습니다.
            </p>
          </div>
        </div>

        <aside className="sticky space-y-6 lg:col-span-5 top-10">
          <div className="bg-slate-900 rounded-[56px] p-12 space-y-10 shadow-2xl">
            <div className="space-y-8">
              <div className="flex items-center gap-4 text-white">
                <div className="p-4 bg-blue-600 shadow-xl rounded-2xl shadow-blue-500/20">
                  <Send size={24} />
                </div>
                <h3 className="text-2xl font-black tracking-tighter uppercase">
                  Send Money
                </h3>
              </div>
              <div className="space-y-4">
                <label className="text-[11px] font-black text-slate-500 uppercase tracking-[0.2em] ml-2">
                  Amount ({selectedRecipient.currency})
                </label>
                <div className="bg-white/5 rounded-[32px] p-10 border border-white/10 focus-within:border-blue-500 transition-all">
                  <input
                    type="text"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="w-full text-6xl font-black tracking-tighter text-white bg-transparent outline-none"
                    placeholder="0"
                  />
                </div>
              </div>
              <div className="flex items-center justify-between px-6 py-4 text-xs font-bold border bg-white/5 rounded-2xl border-white/5">
                <span className="text-slate-500 uppercase tracking-widest text-[9px]">
                  Current Rate
                </span>
                <span className="font-black tracking-tighter text-teal-400">
                  1 {selectedRecipient.currency} = {currentRate} KRW
                </span>
              </div>
            </div>

            {isProcessing && (
              <div className="p-8 bg-white/5 rounded-[32px] border border-white/10 space-y-8 animate-in slide-in-from-bottom-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-black text-white">
                    실시간 처리 상태
                  </h4>
                  <Loader2 className="text-blue-500 animate-spin" size={16} />
                </div>
                <div className="relative flex items-center justify-between px-2">
                  <div className="absolute top-1.5 left-4 right-4 h-[1px] bg-white/10 -z-10" />
                  {STEPS.map((step, idx) => (
                    <div key={idx} className="flex flex-col items-center gap-3">
                      <div className={`w-3 h-3 rounded-full transition-all duration-700 ${idx <= remitStep ? "bg-teal-400 shadow-[0_0_15px_rgba(45,212,191,0.8)] scale-125" : "bg-white/10"}`} />
                      <span className={`text-[10px] font-black tracking-tighter ${idx <= remitStep ? "text-white" : "text-slate-600"}`}>
                        {step}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
            {hasRole("ROLE_USER") || hasRole("ROLE_COMPANY_ADMIN") || hasRole("ROLE_COMPANY_USER") ? (
              <button
                onClick={() => setIsRemitModalOpen(true)}
                className="w-full bg-blue-600 hover:bg-blue-500 text-white py-8 rounded-[36px] font-black text-xl transition-all shadow-2xl active:scale-95"
              >
                해외 송금 실행
              </button>
            ) : (
              <div className="w-full py-8 text-center bg-slate-800 rounded-[36px] text-slate-500 font-bold">
                송금 권한이 없습니다
              </div>
            )}
          </div>
        </aside>
      </main>

      {isRemitModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-900/70 backdrop-blur-md animate-in fade-in">
          <div className="bg-white w-full max-w-md rounded-[56px] p-12 space-y-12 shadow-2xl animate-in zoom-in-95">
            <h3 className="text-3xl font-black tracking-tighter text-center text-slate-900">
              송금을 시작할까요?
            </h3>
            <div className="py-8 space-y-5 font-sans text-sm font-bold border-y border-slate-100">
              <div className="flex justify-between text-slate-400">
                <span>수취인</span>
                <span className="text-slate-900">{selectedRecipient.name}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>최종 결제액</span>
                <span className="text-2xl font-black text-blue-600">
                  {(Number(amount) * currentRate).toLocaleString()} KRW
                </span>
              </div>
            </div>
            <div className="flex gap-4">
              <button
                onClick={() => setIsRemitModalOpen(false)}
                className="flex-1 py-5 font-black transition-all text-slate-400 hover:bg-slate-50 rounded-2xl"
              >
                취소
              </button>
              <button
                onClick={confirmRemittance}
                className="flex-[2] bg-slate-900 text-white py-5 rounded-2xl font-black shadow-xl active:scale-95 transition-all"
              >
                승인 및 송금
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SellerDashboard;
