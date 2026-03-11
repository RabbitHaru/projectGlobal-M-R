import React, { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { getAuthToken, parseJwt } from "../../utils/auth";
import {
  LayoutDashboard,
  X,
  ListChecks,
  ShieldAlert,
  Building2,
  SendHorizontal,
  Activity,
  BarChart2,
  History,
  ArrowDownLeft,
  Users,
} from "lucide-react";

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const location = useLocation();
  const [userRole, setUserRole] = useState<string | null>(null);

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
        {/* 공통 서비스 */}
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

        {/* 🌟 Financial Services 섹션 (USER, COMPANY_USER, COMPANY_ADMIN) */}
        {(hasRole("ROLE_USER") ||
          hasRole("ROLE_COMPANY_USER") ||
          hasRole("ROLE_COMPANY_ADMIN")) && (
          <>
            <div className="px-4 pt-10 pb-2 mt-6 border-t border-slate-50">
              <p className="text-[10px] font-black text-teal-600/50 uppercase tracking-widest italic">
                Financial Services
              </p>
            </div>

            {/* 🏠 셀러 대시보드: 정산 현황 및 자산 관리 */}
            <Link
              to="/seller/dashboard"
              onClick={onClose}
              className={`flex items-center gap-3 px-4 py-3 text-sm font-black transition-all rounded-xl ${
                isActive("/seller/dashboard")
                  ? "bg-teal-50 text-teal-600"
                  : "text-slate-400 hover:bg-slate-50 hover:text-slate-600"
              }`}
            >
              <LayoutDashboard size={18} /> 셀러 대시보드
            </Link>

            {/* 💸 해외 송금: 기존 기능 (경로 변경 반영) */}
            <Link
              to="/exchange/dashboard"
              onClick={onClose}
              className={`flex items-center gap-3 px-4 py-3 text-sm font-black transition-all rounded-xl ${
                isActive("/exchange/dashboard")
                  ? "bg-teal-50 text-teal-600"
                  : "text-slate-400 hover:bg-slate-50 hover:text-slate-600"
              }`}
            >
              <SendHorizontal size={18} /> 해외 송금 (Payout)
            </Link>

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
                isActive("/seller/history") || isActive("/list")
                  ? "bg-teal-50 text-teal-600"
                  : "text-slate-400 hover:bg-slate-50 hover:text-slate-600"
              }`}
            >
              <History size={18} /> 정산 상세 내역
            </Link>

            {!hasRole("ROLE_COMPANY_ADMIN") &&
              !hasRole("ROLE_COMPANY_USER") && (
                <Link
                  to="/company/join"
                  onClick={onClose}
                  className={`flex items-center gap-3 px-4 py-3 text-sm font-black transition-all rounded-xl ${
                    isActive("/company/join")
                      ? "bg-teal-50 text-teal-600"
                      : "text-slate-400 hover:bg-slate-50 hover:text-slate-600"
                  }`}
                >
                  <Building2 size={18} /> 소속 기업 인증하기
                </Link>
              )}
          </>
        )}

        {/* 🌟 Corporate Management 및 Integrated Admin 섹션은 동일 유지 */}
        {/* ... (생략) ... */}
      </nav>
    </div>
  );
};

export default Sidebar;
