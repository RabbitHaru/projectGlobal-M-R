import React, { useState, useEffect } from "react";
import CommonLayout from "../../../components/layout/CommonLayout";
import { useWallet, type Transaction } from "../../../context/WalletContext";
import {
  Wallet,
  Plus,
  History,
  CreditCard,
  Filter,
  ArrowUpRight,
  ArrowDownLeft,
  X,
  Loader2,
  Sparkles,
  ShieldCheck,
  UserCheck,
} from "lucide-react";
import { useToast } from "../../../components/notification/ToastProvider";

// 🌟 포트원 V2 타입 선언
declare global {
  interface Window {
    PortOne: any;
  }
}

const CURRENCY_NAMES: Record<string, string> = {
  KRW: "대한민국 원",
  AED: "아랍에미리트 디르함",
  AUD: "호주 달러",
  BHD: "바레인 디나르",
  BND: "브루나이 달러",
  CAD: "캐나다 달러",
  CHF: "스위스 프랑",
  CNH: "위안화",
  DKK: "덴마크 크로네",
  EUR: "유로",
  GBP: "영국 파운드",
  HKD: "홍콩 달러",
  IDR: "인도네시아 루피아",
  JPY: "일본 엔",
  KWD: "쿠웨이트 디나르",
  MYR: "말레이시아 링깃",
  NOK: "노르웨이 크로네",
  NZD: "뉴질랜드 달러",
  SAR: "사우디 리얄",
  SEK: "스웨덴 크로나",
  SGD: "싱가포르 달러",
  THB: "태국 바트",
  USD: "미국 달러",
};

const WalletOverview: React.FC = () => {
  const { showToast } = useToast();
  const {
    personalBalances,
    transactions,
    chargeKrw,
    personalAccount,
    setPersonalAccount,
  } = useWallet();

  const [isChargeModalOpen, setIsChargeModalOpen] = useState(false);
  const [chargeAmount, setChargeAmount] = useState("");
  const [isActivating, setIsActivating] = useState(false);
  const [realName, setRealName] = useState<string>(
    localStorage.getItem("user_real_name") || "",
  );

  const activePockets = (
    Object.entries(personalBalances) as [string, number][]
  ).filter(([cur, bal]) => bal > 0 && cur !== "KRW");

  /**
   * 🌟 본인인증 실행 함수 (이전 단계에서 해결됨)
   */
  const handleVerifyAndActivate = async () => {
    if (!window.PortOne) {
      showToast("인증 모듈을 불러올 수 없습니다.", "ERROR");
      return;
    }

    setIsActivating(true);

    try {
      const response = await window.PortOne.requestIdentityVerification({
        storeId: import.meta.env.VITE_PORTONE_STORE_ID,
        channelKey: import.meta.env.VITE_PORTONE_AUTH_CHANNEL_KEY,
        identityVerificationId: `auth-${Date.now()}`,
      });

      if (response.code != null) {
        showToast(response.message || "본인인증에 실패하였습니다.", "ERROR");
        setIsActivating(false);
        return;
      }

      const verifiedName = "홍길동"; // 실제 환경에서는 인증 결과에서 추출
      const newAccount = `EX-1002-${Math.floor(1000 + Math.random() * 9000)}`;

      setPersonalAccount(newAccount);
      setRealName(verifiedName);
      localStorage.setItem("user_real_name", verifiedName);

      setIsActivating(false);
      showToast(`${verifiedName}님, 계좌 발급이 완료되었습니다.`, "SUCCESS");
    } catch (error) {
      showToast("인증 과정 중 오류가 발생했습니다.", "ERROR");
      setIsActivating(false);
    }
  };

  /**
   * 🌟 [에러 수정] 원화 충전 결제 함수
   * 400 에러 해결: 통화 단위를 "CURRENCY_KRW"에서 "KRW"로 변경하고 결제 채널 키를 확인합니다.
   */
  const handlePortOnePayment = async () => {
    const amount = Number(chargeAmount);
    if (amount <= 0) {
      showToast("금액을 확인해 주세요.", "ERROR");
      return;
    }

    if (!window.PortOne) {
      showToast("결제 모듈을 불러올 수 없습니다.", "ERROR");
      return;
    }

    try {
      const response = await window.PortOne.requestPayment({
        storeId: import.meta.env.VITE_PORTONE_STORE_ID,
        // 🌟 중요: 인증용(AUTH)이 아닌 '결제용' 채널 키를 사용해야 합니다.
        channelKey: import.meta.env.VITE_PORTONE_CHANNEL_KEY,
        paymentId: `payment-${Date.now()}`,
        orderName: "Ex-Ledger 지갑 충전",
        totalAmount: amount,
        // 🌟 수정: V2 표준 규격에 맞춰 "KRW"로 변경
        currency: "KRW",
        payMethod: "CARD",
        customer: {
          fullName: realName || "미인증 사용자",
          phoneNumber: "010-0000-0000",
        },
      });

      if (response.code != null) {
        showToast(response.message || "결제 실패", "ERROR");
        return;
      }

      chargeKrw(amount, "PERSONAL");
      showToast(`${amount.toLocaleString()}원 충전 완료!`, "SUCCESS");
      setIsChargeModalOpen(false);
      setChargeAmount("");
    } catch (error) {
      showToast("결제 오류가 발생했습니다.", "ERROR");
    }
  };

  const personalTxs = transactions.filter((tx) => tx.category === "PERSONAL");

  if (!personalAccount) {
    return (
      <CommonLayout>
        <div className="max-w-4xl px-6 py-32 mx-auto space-y-12 text-center animate-in fade-in">
          <div className="space-y-6">
            <div className="bg-teal-50 w-24 h-24 rounded-[32px] flex items-center justify-center mx-auto text-teal-600 shadow-xl shadow-teal-100/50">
              <ShieldCheck size={48} />
            </div>
            <h1 className="text-4xl italic font-black tracking-tighter uppercase text-slate-900">
              Identity Verification
            </h1>
            <p className="max-w-md mx-auto font-bold leading-relaxed text-slate-500">
              안전한 금융 거래를 위해 <strong>KG이니시스 본인인증</strong>이
              필요합니다. <br />
              인증 완료 후 개인 계좌가 발급됩니다.
            </p>
          </div>
          <button
            onClick={handleVerifyAndActivate}
            disabled={isActivating}
            className="px-12 py-6 bg-slate-900 text-white rounded-[24px] font-black uppercase tracking-widest shadow-2xl transition-all hover:scale-105 active:scale-95 disabled:opacity-50"
          >
            {isActivating ? (
              <Loader2 className="mx-auto animate-spin" size={24} />
            ) : (
              "본인인증 후 지갑 활성화"
            )}
          </button>
        </div>
      </CommonLayout>
    );
  }

  return (
    <CommonLayout>
      <div className="p-10 mx-auto space-y-12 font-sans max-w-7xl animate-in fade-in">
        <header className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          <div className="lg:col-span-2 bg-slate-900 rounded-[48px] p-12 text-white shadow-2xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-64 h-64 -mt-20 -mr-20 rounded-full pointer-events-none bg-teal-500/10 blur-3xl" />
            <div className="relative z-10 flex flex-col justify-between h-full gap-10">
              <div className="flex items-start justify-between">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 mb-1">
                    <UserCheck size={14} className="text-teal-400" />
                    <p className="text-[10px] font-black text-teal-400 uppercase tracking-[0.3em]">
                      {realName}님의 자산 가치
                    </p>
                  </div>
                  <h2 className="text-5xl italic font-black tracking-tighter">
                    ₩ {personalBalances.KRW?.toLocaleString() || 0}{" "}
                    <span className="text-lg not-italic opacity-30">KRW</span>
                  </h2>
                </div>
                <div className="p-4 bg-white/10 rounded-2xl backdrop-blur-md">
                  <Wallet className="text-teal-400" size={24} />
                </div>
              </div>
              <div className="flex items-center gap-6 pt-6 border-t border-white/5">
                <div>
                  <p className="text-[9px] font-bold text-slate-500 uppercase mb-1">
                    나의 개인 계좌
                  </p>
                  <p className="font-mono text-sm font-bold text-slate-300">
                    {personalAccount}
                  </p>
                </div>
                <button
                  onClick={() => setIsChargeModalOpen(true)}
                  className="px-8 py-4 ml-auto font-sans text-xs italic font-black tracking-widest text-white uppercase transition-all bg-teal-500 shadow-lg hover:bg-teal-400 rounded-2xl active:scale-95"
                >
                  <Plus size={16} className="inline mr-1" /> 원화 충전하기
                </button>
              </div>
            </div>
          </div>
          <div className="bg-white border border-slate-100 rounded-[48px] p-10 shadow-sm flex flex-col">
            <h3 className="flex items-center gap-2 mb-8 text-xs font-black tracking-widest uppercase text-slate-400">
              <Filter size={14} /> 보유 중인 외화 자산
            </h3>
            <div className="flex-1 space-y-4 overflow-y-auto max-h-[220px] custom-scrollbar pr-2">
              {activePockets.length > 0 ? (
                activePockets.map(([cur, bal]) => (
                  <div
                    key={cur}
                    className="flex items-center justify-between p-5 transition-colors border bg-slate-50 rounded-2xl border-slate-100 group hover:border-teal-200"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-xl italic font-black">{cur}</span>
                      <p className="text-[10px] font-bold text-slate-400">
                        {CURRENCY_NAMES[cur]}
                      </p>
                    </div>
                    <p className="text-lg italic font-black text-slate-900">
                      {bal.toLocaleString()}
                    </p>
                  </div>
                ))
              ) : (
                <div className="flex flex-col items-center justify-center h-full space-y-2 italic font-black text-center opacity-30">
                  <CreditCard size={32} />
                  <p className="text-[10px]">보유 외화 없음</p>
                </div>
              )}
            </div>
          </div>
        </header>

        <section className="space-y-6">
          <div className="flex items-center justify-between px-2">
            <h3 className="font-sans text-2xl italic font-black tracking-tighter uppercase text-slate-900">
              최근 활동 내역
            </h3>
          </div>
          <div className="bg-white border border-slate-100 rounded-[56px] p-12 shadow-sm">
            <div className="space-y-4">
              {personalTxs.length > 0 ? (
                personalTxs.map((tx: Transaction) => (
                  <div
                    key={tx.id}
                    className="flex items-center justify-between p-6 rounded-[32px] hover:bg-slate-50 transition-all border border-transparent hover:border-slate-100 group"
                  >
                    <div className="flex items-center gap-6">
                      <div
                        className={`p-4 rounded-2xl ${tx.amount > 0 ? "bg-teal-50 text-teal-600" : "bg-red-50 text-red-600"}`}
                      >
                        {tx.amount > 0 ? (
                          <ArrowDownLeft size={22} />
                        ) : (
                          <ArrowUpRight size={22} />
                        )}
                      </div>
                      <div>
                        <p className="text-lg italic font-black text-slate-800">
                          {tx.title}
                        </p>
                        <p className="mt-1 text-xs font-bold tracking-widest uppercase text-slate-300">
                          {tx.date} • {tx.type}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p
                        className={`text-xl font-black font-sans italic ${tx.amount > 0 ? "text-teal-600" : "text-slate-900"}`}
                      >
                        {tx.amount > 0 ? "+" : ""}
                        {tx.amount.toLocaleString()}{" "}
                        <span className="text-xs uppercase opacity-40">
                          {tx.currency}
                        </span>
                      </p>
                      <p className="text-[10px] font-black text-slate-300 uppercase mt-1 tracking-widest">
                        {tx.status}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="py-24 italic font-black text-center text-slate-200">
                  기록된 내역이 없습니다.
                </div>
              )}
            </div>
          </div>
        </section>
      </div>

      {isChargeModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-900/80 backdrop-blur-lg animate-in fade-in">
          <div className="bg-white w-full max-w-md rounded-[56px] p-12 space-y-10 shadow-2xl text-center animate-in zoom-in-95">
            <div className="mx-auto w-20 h-20 bg-teal-50 text-teal-600 rounded-[28px] flex items-center justify-center shadow-lg">
              <CreditCard size={40} />
            </div>
            <div className="space-y-2">
              <h3 className="text-3xl italic font-black tracking-tighter uppercase text-slate-900">
                개인 지갑 충전
              </h3>
              <p className="text-[10px] font-bold text-slate-400">
                결제 시 본인인증 실명({realName})이 자동 반영됩니다.
              </p>
            </div>
            <div className="relative">
              <input
                type="number"
                min="0"
                onKeyDown={(e) =>
                  ["-", "+", "e", "E"].includes(e.key) && e.preventDefault()
                }
                value={chargeAmount}
                onChange={(e) => setChargeAmount(e.target.value)}
                placeholder="0"
                className="w-full pb-6 text-6xl italic font-black tracking-tighter text-center transition-all border-b-4 outline-none border-slate-50 focus:border-teal-500"
                autoFocus
              />
              <span className="absolute right-0 text-xl italic font-black bottom-8 text-slate-300">
                KRW
              </span>
            </div>
            <div className="flex gap-4 pt-4 text-xs font-black uppercase">
              <button
                onClick={() => setIsChargeModalOpen(false)}
                className="flex-1 py-6 text-slate-400 hover:text-slate-600"
              >
                Cancel
              </button>
              <button
                onClick={handlePortOnePayment}
                className="flex-[2] bg-slate-900 text-white py-6 rounded-[24px] shadow-2xl active:scale-95 transition-all"
              >
                Charge Now
              </button>
            </div>
          </div>
        </div>
      )}
    </CommonLayout>
  );
};

export default WalletOverview;
