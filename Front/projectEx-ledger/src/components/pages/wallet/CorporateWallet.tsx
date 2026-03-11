import React, { useState } from "react";
import CommonLayout from "../../../components/layout/CommonLayout";
import { useWallet } from "../../../context/WalletContext";
import {
  Building2,
  Download,
  Briefcase,
  Copy,
  Sparkles,
  Loader2,
  Search,
  ArrowUpRight,
  ArrowDownLeft,
} from "lucide-react";
import { useToast } from "../../../components/notification/ToastProvider";

const CorporateWallet: React.FC = () => {
  const { showToast } = useToast();
  const {
    corporateBalances,
    transactions,
    corporateAccount,
    setCorporateAccount,
  } = useWallet();
  const [isActivating, setIsActivating] = useState(false);

  const handleActivateCorporateAccount = () => {
    setIsActivating(true);
    setTimeout(() => {
      const newCorpAccount = `EX-2003-${Math.floor(1000 + Math.random() * 9000)}`;
      setCorporateAccount(newCorpAccount);
      setIsActivating(false);
      showToast("기업 마스터 계좌가 발급되었습니다.", "SUCCESS");
    }, 2000);
  };

  const businessTxs = transactions.filter((tx) => tx.category === "BUSINESS");

  if (!corporateAccount) {
    return (
      <CommonLayout>
        <div className="max-w-4xl px-6 py-32 mx-auto space-y-12 text-center animate-in fade-in">
          <div className="space-y-6">
            <div className="bg-indigo-50 w-24 h-24 rounded-[32px] flex items-center justify-center mx-auto text-indigo-600 shadow-xl shadow-indigo-100/50">
              <Building2 size={48} />
            </div>
            <h1 className="text-4xl italic font-black tracking-tighter uppercase text-slate-900">
              Corporate Activation
            </h1>
            <p className="max-w-md mx-auto font-bold leading-relaxed text-slate-500">
              기업 정보를 확인했습니다. 정산 데이터를 생성하고 관리하기 위한{" "}
              <br />
              <strong>기업 전용 마스터 계좌</strong>를 발급해 주세요.
            </p>
          </div>
          <button
            onClick={handleActivateCorporateAccount}
            disabled={isActivating}
            className="group relative px-12 py-6 bg-slate-900 text-white rounded-[24px] font-black text-sm uppercase tracking-widest shadow-2xl transition-all hover:scale-105 active:scale-95"
          >
            {isActivating ? (
              <Loader2 className="animate-spin" size={24} />
            ) : (
              <span className="flex items-center gap-3">
                <Sparkles size={18} className="text-indigo-400" /> 기업 계좌
                즉시 발급하기
              </span>
            )}
          </button>
        </div>
      </CommonLayout>
    );
  }

  return (
    <CommonLayout>
      <div className="p-8 mx-auto space-y-10 max-w-7xl animate-in fade-in font-sans bg-[#F8FAFC]">
        <header className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 bg-white p-10 rounded-[40px] border border-slate-100 shadow-sm flex flex-col justify-between relative overflow-hidden">
            <div className="relative z-10 space-y-4">
              <div className="flex items-center gap-2">
                <span className="px-3 py-1 bg-indigo-600 text-white text-[10px] font-black rounded-lg uppercase">
                  Corporate
                </span>
                <span className="text-slate-400 text-[10px] font-bold">
                  사업자 전용 자산 관리
                </span>
              </div>
              <h2 className="text-4xl italic font-black tracking-tighter uppercase text-slate-900">
                (주) 글로벌 파트너스
              </h2>
              <div className="flex items-center gap-4 text-[11px] font-bold text-slate-400">
                <p>
                  사업자 번호{" "}
                  <span className="ml-1 font-black text-slate-900">
                    123-45-67890
                  </span>
                </p>
                <div className="w-1.5 h-1.5 bg-slate-200 rounded-full"></div>
                <p>
                  대표자{" "}
                  <span className="ml-1 font-black text-slate-900">홍길동</span>
                </p>
              </div>
            </div>
            <Building2
              size={180}
              className="absolute top-0 right-0 p-10 opacity-[0.03] text-slate-900 pointer-events-none"
            />
          </div>
          <div className="bg-slate-900 rounded-[40px] p-10 text-white shadow-2xl relative overflow-hidden flex flex-col justify-between">
            <div className="relative z-10">
              <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-4">
                Corporate Dedicated ID
              </p>
              <div className="flex items-center justify-between">
                <h3 className="font-mono text-3xl italic font-bold tracking-tighter">
                  {corporateAccount}
                </h3>
                <button className="p-2 transition-colors bg-white/10 rounded-xl hover:bg-white/20">
                  <Copy size={14} />
                </button>
              </div>
            </div>
            <div className="relative z-10 flex items-end justify-between pt-6 border-t border-white/5">
              <p className="text-2xl italic font-black">
                ₩ {corporateBalances.KRW?.toLocaleString() || 0}
              </p>
              <div className="p-3 bg-indigo-600 shadow-lg rounded-2xl shadow-indigo-500/20">
                <Briefcase size={20} />
              </div>
            </div>
          </div>
        </header>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
          <section className="space-y-6 lg:col-span-8">
            <div className="flex items-center justify-between px-2">
              <div className="space-y-1">
                <h3 className="text-xl italic font-black uppercase text-slate-900">
                  Business Transactions
                </h3>
                <p className="text-[10px] font-bold text-slate-400 uppercase">
                  정산 원천 데이터 (Raw Ledger)
                </p>
              </div>
              <div className="relative">
                <Search
                  className="absolute -translate-y-1/2 left-4 top-1/2 text-slate-300"
                  size={14}
                />
                <input
                  type="text"
                  placeholder="거래 번호 검색..."
                  className="pl-10 pr-6 py-3 bg-white border border-slate-100 rounded-2xl text-[11px] font-bold outline-none focus:border-indigo-500 w-64 shadow-sm"
                />
              </div>
            </div>
            <div className="bg-white border border-slate-100 rounded-[40px] shadow-sm overflow-hidden">
              <table className="w-full text-left border-collapse">
                <thead className="bg-slate-50 text-[10px] font-black uppercase text-slate-400 tracking-widest border-b border-slate-100">
                  <tr>
                    <th className="px-8 py-5">Date</th>
                    <th className="px-8 py-5">Title</th>
                    <th className="px-8 py-5 text-right">Amount</th>
                    <th className="px-8 py-5 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {businessTxs.length > 0 ? (
                    businessTxs.map((tx) => (
                      <tr
                        key={tx.id}
                        className="transition-colors hover:bg-slate-50/50 group"
                      >
                        <td className="px-8 py-6 text-[11px] font-bold text-slate-400 font-mono">
                          {tx.date}
                        </td>
                        <td className="px-8 py-6">
                          <div className="flex items-center gap-3">
                            <div
                              className={`p-2 rounded-lg ${tx.amount > 0 ? "bg-teal-50 text-teal-600" : "bg-red-50 text-red-600"}`}
                            >
                              {tx.amount > 0 ? (
                                <ArrowDownLeft size={14} />
                              ) : (
                                <ArrowUpRight size={14} />
                              )}
                            </div>
                            <span className="text-sm italic font-black text-slate-800">
                              {tx.title}
                            </span>
                          </div>
                        </td>
                        <td
                          className={`px-8 py-6 text-right font-black italic ${tx.amount > 0 ? "text-teal-600" : "text-slate-900"}`}
                        >
                          {tx.amount > 0 ? "+" : ""}
                          {tx.amount.toLocaleString()} {tx.currency}
                        </td>
                        <td className="px-8 py-6 text-center">
                          <span className="px-3 py-1 bg-slate-100 text-slate-400 text-[9px] font-black rounded-lg uppercase tracking-tighter">
                            {tx.status}
                          </span>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td
                        colSpan={4}
                        className="py-32 text-xs italic font-black tracking-widest text-center uppercase text-slate-300"
                      >
                        정산 대상 거래 데이터가 없습니다.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>
          <aside className="space-y-6 lg:col-span-4">
            <div className="bg-indigo-600 rounded-[40px] p-10 text-white shadow-xl shadow-indigo-100 relative overflow-hidden group">
              <Download
                size={100}
                className="absolute top-0 right-0 p-8 transition-transform opacity-10 group-hover:scale-110"
              />
              <p className="text-[10px] font-black uppercase mb-6 text-indigo-200">
                Data Export Tool
              </p>
              <p className="mb-10 text-2xl italic font-black leading-tight tracking-tighter">
                정산 담당자를 위한
                <br />
                Raw Data 추출
              </p>
              <button className="w-full py-5 text-xs font-black tracking-widest text-indigo-600 uppercase transition-all bg-white shadow-lg rounded-2xl active:scale-95">
                CSV 데이터 내보내기
              </button>
            </div>
          </aside>
        </div>
      </div>
    </CommonLayout>
  );
};

export default CorporateWallet;
