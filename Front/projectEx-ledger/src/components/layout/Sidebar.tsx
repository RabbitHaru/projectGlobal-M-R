import React from "react";
import { Link, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Home,
  X,
  ListChecks,
  ShieldAlert,
  Building2,
  SendHorizontal,
  Activity,
  BarChart2,
  History,
  ArrowLeftRight,
  ArrowDownLeft,
} from "lucide-react";

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const location = useLocation();
  const isActive = (path: string) => location.pathname === path;

  return (
    <div
      className={`fixed inset-y-0 left-0 z-50 w-72 bg-white border-r border-slate-100 shadow-2xl transform transition-transform duration-300 ease-in-out ${
        isOpen ? "translate-x-0" : "-translate-x-full"
      }`}
    >
      {/* 🌟 로고 섹션 */}
      <div className="flex items-center justify-between p-8">
        <Link
          to="/"
          onClick={onClose}
          className="flex items-center gap-3 group"
        >
          <div className="flex items-center justify-center transition-all bg-teal-600 shadow-lg w-9 h-9 rounded-xl shadow-teal-100 group-hover:-rotate-12">
            <Activity className="text-white" size={20} strokeWidth={3} />
          </div>
          <div>
            <h1 className="text-xl font-black tracking-tighter uppercase text-slate-800">
              Ex-<span className="text-teal-600">Ledger</span>
            </h1>
            <p className="text-[9px] text-slate-300 font-bold uppercase tracking-[0.2em] leading-none mt-1">
              Cross-border System
            </p>
          </div>
        </Link>
        <button
          onClick={onClose}
          className="p-2 transition-colors text-slate-300 hover:text-slate-600"
        >
          <X size={20} />
        </button>
      </div>

      <nav className="flex-1 px-4 space-y-1 overflow-y-auto max-h-[calc(100vh-120px)] custom-scrollbar">
        {/* 기본 홈 */}
        <Link
          to="/"
          onClick={onClose}
          className={`flex items-center gap-3 px-4 py-3 text-sm font-black transition-all rounded-xl ${
            isActive("/") && !location.pathname.includes("exchange")
              ? "bg-teal-50 text-teal-600"
              : "text-slate-400 hover:bg-slate-50 hover:text-slate-600"
          }`}
        >
          <Home size={18} /> 홈
        </Link>

        {/* 🌟 User Service 섹션 */}
        <div className="px-4 pt-6 pb-2">
          <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest">
            User Service
          </p>
        </div>
        <Link
          to="/"
          onClick={onClose}
          className={`flex items-center gap-3 px-4 py-3 text-sm font-black transition-all rounded-xl ${
            isActive("/")
              ? "bg-teal-50 text-teal-600"
              : "text-slate-400 hover:bg-slate-50 hover:text-slate-600"
          }`}
        >
          <BarChart2 size={18} /> 실시간 환율 정보
        </Link>
        <Link
          to="/exchange"
          onClick={onClose}
          className={`flex items-center gap-3 px-4 py-3 text-sm font-black transition-all rounded-xl ${
            isActive("/exchange")
              ? "bg-teal-600 text-white shadow-lg shadow-teal-100"
              : "text-slate-400 hover:bg-slate-50 hover:text-slate-600"
          }`}
        >
          <ArrowLeftRight size={18} /> 실시간 환전 및 출금
        </Link>

        {/* 🌟 Corporate Service 섹션 (개편됨) */}
        <div className="px-4 pt-10 pb-2 mt-6 border-t border-slate-50">
          <p className="text-[10px] font-black text-teal-600/50 uppercase tracking-widest italic">
            Corporate Service
          </p>
        </div>

        {/* 해외 송금 메뉴 */}
        <Link
          to="/seller/dashboard"
          onClick={onClose}
          className={`flex items-center gap-3 px-4 py-3 text-sm font-black transition-all rounded-xl ${
            isActive("/seller/dashboard")
              ? "bg-teal-50 text-teal-600"
              : "text-slate-400 hover:bg-slate-50 hover:text-slate-600"
          }`}
        >
          <SendHorizontal size={18} /> 해외 송금 (Payout)
        </Link>

        {/* 수익 정산 메뉴 (신규 추가) */}
        <Link
          to="/settlement"
          onClick={onClose}
          className={`flex items-center gap-3 px-4 py-3 text-sm font-black transition-all rounded-xl ${
            isActive("/settlement")
              ? "bg-teal-50 text-teal-600"
              : "text-slate-400 hover:bg-slate-50 hover:text-slate-600"
          }`}
        >
          <ArrowDownLeft size={18} /> 수익 정산 (Settlement)
        </Link>

        <Link
          to="/seller/history"
          onClick={onClose}
          className={`flex items-center gap-3 px-4 py-3 text-sm font-black transition-all rounded-xl ${
            isActive("/seller/history")
              ? "bg-teal-50 text-teal-600"
              : "text-slate-400 hover:bg-slate-50 hover:text-slate-600"
          }`}
        >
          <History size={18} /> 정산 상세 내역
        </Link>

        {/* 🌟 Company Admin Area */}
        <div className="px-4 pt-10 pb-2 mt-6 border-t border-slate-50">
          <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest">
            Company Admin Area
          </p>
        </div>
        {[
          {
            to: "/dashboard",
            label: "정산 요약 대시보드",
            icon: <ShieldAlert size={18} />,
          },
          {
            to: "/client",
            label: "가맹점 및 수수료 관리",
            icon: <Building2 size={18} />,
          },
          {
            to: "/admin/list",
            label: "결제 정산 대사",
            icon: <ListChecks size={18} />,
          },
          {
            to: "/remittance",
            label: "자금 이체 프로세싱",
            icon: <SendHorizontal size={18} />,
          },
        ].map((item) => (
          <Link
            key={item.to}
            to={item.to}
            onClick={onClose}
            className={`flex items-center gap-3 px-4 py-3 text-sm font-black transition-all rounded-xl ${
              isActive(item.to)
                ? "bg-teal-50 text-teal-600"
                : "text-slate-400 hover:bg-slate-50 hover:text-slate-600"
            }`}
          >
            {item.icon} {item.label}
          </Link>
        ))}
      </nav>
    </div>
  );
};

export default Sidebar;
