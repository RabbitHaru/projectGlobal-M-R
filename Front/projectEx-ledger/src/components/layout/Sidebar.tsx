import React, { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { getAuthToken, parseJwt } from "../../utils/auth";
import { useWallet } from "../../context/WalletContext"; // 🌟 전역 데이터 구독
import {
  LayoutDashboard,
  X,
  Building2,
  SendHorizontal,
  Activity,
  BarChart2,
  History,
  ArrowDownLeft,
  Wallet,
  Copy,
  Users,
  ShieldAlert,
} from "lucide-react";
import { useToast } from "../notification/ToastProvider";

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const location = useLocation();
  const { showToast } = useToast();
  const [userRole, setUserRole] = useState<string | null>(null);

  // 🌟 WalletContext 데이터 구독
  const { hasAccount, userAccount, balances } = useWallet();

  useEffect(() => {
    const token = getAuthToken();
    if (token) {
      const decoded = parseJwt(token);
      if (decoded && decoded.auth) {
        setUserRole(decoded.auth);
      }
    }
  }, []);

  const hasRole = (role: string) => {
    if (!userRole) return false;
    const cleanRole = role.replace("ROLE_", "");
    return userRole.includes(role) || userRole.includes(cleanRole);
  };

  // 🌟 [권한 필터링] Integrated Admin 및 비회원 제외
  const isFinanceTarget =
    !hasRole("ROLE_INTEGRATED_ADMIN") &&
    (hasRole("ROLE_USER") ||
      hasRole("ROLE_COMPANY_USER") ||
      hasRole("ROLE_COMPANY_ADMIN"));

  const isActive = (path: string) => location.pathname === path;

  const copyAccount = () => {
    if (!userAccount) return;
    navigator.clipboard.writeText(userAccount);
    showToast("계좌번호가 복사되었습니다.", "SUCCESS");
  };

  // 🌟 [방어 로직] 오염된 데이터를 숫자로 강제 정제
  const formatBalance = (val: any) => {
    const num =
      typeof val === "number"
        ? val
        : parseFloat(String(val).replace(/[^0-9.-]+/g, ""));
    return isNaN(num) ? 0 : num;
  };

  return (
    <div
      className={`fixed inset-y-0 left-0 z-50 w-72 bg-white border-r border-slate-100 shadow-2xl transform transition-transform duration-300 ease-in-out flex flex-col ${
        isOpen ? "translate-x-0" : "-translate-x-full"
      }`}
    >
      {/* 로고 섹션 */}
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

      <nav className="flex-1 px-4 space-y-1 overflow-y-auto custom-scrollbar">
        <Link
          to="/"
          onClick={onClose}
          className={`flex items-center gap-3 px-4 py-3 text-sm font-black transition-all rounded-xl ${isActive("/") ? "bg-teal-50 text-teal-600" : "text-slate-400 hover:bg-slate-50"}`}
        >
          <BarChart2 size={18} /> 실시간 환율 정보
        </Link>

        {isFinanceTarget && (
          <>
            <div className="px-4 pt-10 pb-2 mt-6 border-t border-slate-50">
              <p className="text-[10px] font-black text-teal-600/50 uppercase tracking-widest italic">
                Financial Services
              </p>
            </div>
            <Link
              to="/seller/dashboard"
              onClick={onClose}
              className={`flex items-center gap-3 px-4 py-3 text-sm font-black transition-all rounded-xl ${isActive("/seller/dashboard") ? "bg-teal-50 text-teal-600" : "text-slate-400 hover:bg-slate-50"}`}
            >
              <LayoutDashboard size={18} /> 셀러 대시보드
            </Link>
            <Link
              to="/exchange/dashboard"
              onClick={onClose}
              className={`flex items-center gap-3 px-4 py-3 text-sm font-black transition-all rounded-xl ${isActive("/exchange/dashboard") ? "bg-teal-50 text-teal-600" : "text-slate-400 hover:bg-slate-50"}`}
            >
              <SendHorizontal size={18} /> 해외 송금 (Payout)
            </Link>
            <Link
              to="/settlement"
              onClick={onClose}
              className={`flex items-center gap-3 px-4 py-3 text-sm font-black transition-all rounded-xl ${isActive("/settlement") ? "bg-teal-50 text-teal-600" : "text-slate-400 hover:bg-slate-50"}`}
            >
              <ArrowDownLeft size={18} /> 수익 정산 (Settlement)
            </Link>
            <Link
              to="/seller/history"
              onClick={onClose}
              className={`flex items-center gap-3 px-4 py-3 text-sm font-black transition-all rounded-xl ${isActive("/seller/history") ? "bg-teal-50 text-teal-600" : "text-slate-400 hover:bg-slate-50"}`}
            >
              <History size={18} /> 거래 상세 내역
            </Link>
          </>
        )}

        {hasRole("ROLE_INTEGRATED_ADMIN") && (
          <div className="mt-8 space-y-1">
            <div className="px-4 py-2 border-t border-slate-50">
              <p className="text-[10px] font-black text-red-400 uppercase tracking-widest italic">
                System Management
              </p>
            </div>
            <Link
              to="/admin/users"
              onClick={onClose}
              className="flex items-center gap-3 px-4 py-3 text-sm font-black text-slate-400 hover:bg-slate-50 rounded-xl"
            >
              <Users size={18} /> 사용자 관리
            </Link>
            <Link
              to="/admin/audit"
              onClick={onClose}
              className="flex items-center gap-3 px-4 py-3 text-sm font-black text-slate-400 hover:bg-slate-50 rounded-xl"
            >
              <ShieldAlert size={18} /> 시스템 감사
            </Link>
          </div>
        )}
      </nav>

      {/* 🌟 [수정] 지갑 카드 레이아웃 보강: 텍스트 겹침 절대 방지 */}
      {isFinanceTarget && hasAccount && (
        <div className="p-6 m-4 bg-slate-900 rounded-[32px] text-white shadow-2xl space-y-4 overflow-hidden border border-white/5 animate-in slide-in-from-bottom-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-teal-500 rounded-lg">
                <Wallet size={14} className="text-white" />
              </div>
              <span className="text-[10px] font-black uppercase tracking-widest text-teal-400">
                Ex-Wallet
              </span>
            </div>
            <button
              onClick={copyAccount}
              className="transition-colors text-slate-500 hover:text-white"
            >
              <Copy size={14} />
            </button>
          </div>

          <div className="space-y-1">
            <p className="text-[10px] font-bold text-slate-500 font-mono tracking-tighter uppercase truncate">
              {userAccount}
            </p>
            {/* 🌟 숫자가 아무리 길어도 레이아웃을 깨지 않게 폰트 크기 조절 및 줄바꿈 방지 */}
            <h3 className="block font-sans text-xl italic font-black leading-tight tracking-tighter truncate">
              ₩ {formatBalance(balances.KRW).toLocaleString()}
            </h3>
          </div>

          <Link
            to="/seller/dashboard"
            onClick={onClose}
            className="block w-full py-3 bg-white/10 hover:bg-white/20 rounded-xl text-center text-[10px] font-black uppercase tracking-widest transition-all"
          >
            Manage Assets
          </Link>
        </div>
      )}
    </div>
  );
};

export default Sidebar;
