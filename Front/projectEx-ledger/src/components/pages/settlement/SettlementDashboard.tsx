import React, { useState, useEffect } from "react";
import CommonLayout from "../../layout/CommonLayout";
import { useToast } from "../../notification/ToastProvider";
import { ArrowDownLeft, Wallet, Globe, Landmark, Loader2 } from "lucide-react";

const SETTLE_STEPS = ["정산 신청", "수익 검토", "원화 환산", "입금 완료"];

const SettlementDashboard: React.FC = () => {
  const { showToast } = useToast();
  const [krwBalance, setKrwBalance] = useState<number>(0);
  const [pendingList, setPendingList] = useState<any[]>([]); // 🌟 실제 서버 데이터 로드
  const [selectedRevenue, setSelectedRevenue] = useState<any>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [settleStep, setSettleStep] = useState(0);

  // 1. 초기 데이터 로드 (잔액 + 정산 대기 리스트)
  const loadData = async () => {
    try {
      const [balRes, listRes] = await Promise.all([
        fetch("/api/v1/user/balance"),
        fetch("/api/v1/settlement/pending"),
      ]);
      const balData = await balRes.json();
      const listData = await listRes.json();

      setKrwBalance(balData.krwBalance);
      setPendingList(listData);
      if (listData.length > 0) setSelectedRevenue(listData[0]);
    } catch (error) {
      console.error("데이터 로드 실패");
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // 2. 정산 신청 실행
  const handleSettlementRequest = async () => {
    if (!selectedRevenue) return;

    try {
      const res = await fetch("/api/v1/settlement/claim", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ settlementIds: [selectedRevenue.id] }), // 명세에 따른 리스트 구조
      });

      if (!res.ok) throw new Error("정산 신청에 실패했습니다.");

      // 🌟 성공 시 애니메이션 시작
      setIsProcessing(true);
      setSettleStep(0);
      let currentStep = 0;
      const interval = setInterval(() => {
        currentStep += 1;
        if (currentStep >= 3) {
          clearInterval(interval);
          setSettleStep(3);
          loadData(); // 🌟 잔액 및 리스트 최신화
          showToast("원화 계좌로 정산 입금이 완료되었습니다.", "SUCCESS");
          setTimeout(() => setIsProcessing(false), 8000);
        } else {
          setSettleStep(currentStep);
        }
      }, 4000);
    } catch (err: any) {
      showToast(err.message, "ERROR");
    }
  };

  return (
    <CommonLayout>
      <div className="max-w-6xl mx-auto p-10 space-y-10 bg-[#fcfdfe] min-h-screen animate-in fade-in duration-500">
        <header className="bg-white p-10 rounded-[40px] shadow-sm border border-slate-100 flex justify-between items-center">
          <div className="flex items-center gap-6">
            <div className="flex items-center justify-center text-teal-400 shadow-xl w-14 h-14 bg-slate-900 rounded-2xl">
              <Wallet size={28} />
            </div>
            <div className="space-y-1">
              <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest">
                Available KRW Balance
              </p>
              <h1 className="text-5xl font-black tracking-tighter text-slate-900">
                {krwBalance.toLocaleString()}{" "}
                <span className="ml-1 text-xl font-medium text-slate-200">
                  KRW
                </span>
              </h1>
            </div>
          </div>
        </header>

        <main className="grid items-start grid-cols-1 gap-8 lg:grid-cols-12">
          <div className="space-y-6 lg:col-span-7">
            <section className="bg-white p-10 rounded-[48px] shadow-sm border border-slate-100 min-h-[400px]">
              <h2 className="px-2 mb-8 text-2xl font-black tracking-tighter text-slate-900">
                정산 가능 수익 내역
              </h2>
              <div className="grid grid-cols-1 gap-4">
                {pendingList.length > 0 ? (
                  pendingList.map((rev) => (
                    <button
                      key={rev.id}
                      onClick={() => {
                        setSelectedRevenue(rev);
                        setIsProcessing(false);
                      }}
                      className={`w-full p-6 rounded-[32px] border-2 transition-all flex justify-between items-center ${selectedRevenue?.id === rev.id ? "border-teal-500 bg-teal-50/20 shadow-md" : "border-slate-50 bg-white hover:border-slate-100"}`}
                    >
                      <div className="flex items-center gap-4 text-left">
                        <div className="p-3 bg-slate-50 rounded-xl text-slate-400">
                          <Globe size={20} />
                        </div>
                        <div>
                          <h4 className="text-sm font-black text-slate-800">
                            {rev.source}
                          </h4>
                          <p className="text-[10px] font-bold text-blue-500 uppercase">
                            {rev.status || "정산 가능"}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-black text-slate-900">
                          {rev.amount.toLocaleString()} {rev.currency}
                        </p>
                        {rev.settlementAvailableDate && (
                          <p className="text-[9px] text-slate-400 font-bold mt-1">
                            정산 가능일: {rev.settlementAvailableDate}
                          </p>
                        )}
                      </div>
                    </button>
                  ))
                ) : (
                  <div className="flex flex-col items-center justify-center h-48 font-black tracking-widest text-slate-300">
                    대기 중인 정산 내역이 없습니다.
                  </div>
                )}
              </div>
            </section>
          </div>

          <aside className="sticky space-y-6 lg:col-span-5 top-10">
            <div className="bg-slate-900 rounded-[56px] p-12 space-y-10 shadow-2xl">
              <div className="flex items-center gap-4 text-white">
                <div className="p-4 bg-teal-500 shadow-xl rounded-2xl shadow-teal-500/20">
                  <Landmark size={24} />
                </div>
                <h3 className="text-2xl font-black tracking-tighter uppercase">
                  Settlement
                </h3>
              </div>

              <div className="p-8 space-y-6 bg-white/5 rounded-[32px] border border-white/10 text-white">
                <div className="flex items-center justify-between text-xs font-bold text-slate-500">
                  <span>정산 대상</span>
                  <span>{selectedRevenue?.source || "-"}</span>
                </div>
                <div className="flex items-center justify-between text-xs font-bold text-slate-500">
                  <span>정산 예정 금액</span>
                  <span className="text-lg text-teal-400">
                    {selectedRevenue?.amount.toLocaleString() || "0"}{" "}
                    {selectedRevenue?.currency || ""}
                  </span>
                </div>
              </div>

              {isProcessing && (
                <div className="p-6 space-y-6 border bg-white/5 rounded-3xl border-white/5 animate-in fade-in">
                  <div className="flex items-center justify-between text-white">
                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
                      Process Tracking
                    </span>
                    <Loader2 className="text-teal-400 animate-spin" size={14} />
                  </div>
                  <div className="relative flex items-center justify-between px-2">
                    <div className="absolute top-1.5 left-4 right-4 h-[1px] bg-white/10 -z-10" />
                    {SETTLE_STEPS.map((step, idx) => (
                      <div
                        key={idx}
                        className="flex flex-col items-center gap-2"
                      >
                        <div
                          className={`w-2.5 h-2.5 rounded-full transition-all duration-700 ${idx <= settleStep ? "bg-teal-400 shadow-[0_0_10px_rgba(45,212,191,0.8)]" : "bg-white/10"}`}
                        />
                        <span
                          className={`text-[8px] font-black tracking-tighter ${idx <= settleStep ? "text-white" : "text-white/20"}`}
                        >
                          {step}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              <button
                onClick={handleSettlementRequest}
                disabled={isProcessing || !selectedRevenue}
                className="w-full bg-teal-500 hover:bg-teal-400 text-white py-8 rounded-[36px] font-black text-xl transition-all shadow-2xl active:scale-95"
              >
                {isProcessing ? "정산 처리 중..." : "정산 신청하기"}
              </button>
            </div>
          </aside>
        </main>
      </div>
    </CommonLayout>
  );
};

export default SettlementDashboard;
