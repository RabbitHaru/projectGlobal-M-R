import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import CommonLayout from "../../../layout/CommonLayout";
import {
  CheckCircle2,
  Search,
  PlaneTakeoff,
  Landmark,
  ShieldCheck,
  ArrowLeft,
  FileText,
  AlertCircle,
  Clock,
} from "lucide-react";
// 🌟 1. 'verbatimModuleSyntax' 대응: 타입은 'import type'으로 가져와야 합니다.
import type { LucideIcon } from "lucide-react";

interface RemittanceTrackingProps {
  status?: string;
  transactionId?: string;
  updatedAt?: string;
}

// 🌟 2. steps 배열의 개별 요소 타입을 정의합니다.
interface TrackingStep {
  key: string;
  label: string;
  desc: string;
  icon: LucideIcon; // 🌟 여기서 LucideIcon 타입을 사용하여 "읽히지 않음" 에러를 해결합니다.
}

const RemittanceTracking: React.FC<RemittanceTrackingProps> = ({
  status: propsStatus,
  transactionId: propsTxId,
  updatedAt: propsUpdatedAt,
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const isWidgetMode = Boolean(propsStatus);

  const txData = location.state?.transaction || {
    id: propsTxId || "TRX-20260305-88A2",
    status: propsStatus || "TRANSFERRING",
    currency: "USD",
    amount: 12450.0,
    rate: 1456.2,
    finalAmount: 18130000,
    requestDate: "2026-03-05 15:25",
  };

  // 🌟 3. steps 배열에 타입을 명시적으로 지정합니다.
  const steps: TrackingStep[] = [
    {
      key: "REVIEWING",
      label: "검토 중",
      desc: "정산 서류를 확인 중입니다.",
      icon: Search,
    },
    {
      key: "EXCHANGED",
      label: "환전 완료",
      desc: "실시간 환율로 환전되었습니다.",
      icon: Landmark,
    },
    {
      key: "TRANSFERRING",
      label: "해외 송금 중",
      desc: "국제 송금이 진행 중입니다.",
      icon: PlaneTakeoff,
    },
    {
      key: "COMPLETED",
      label: "완료",
      desc: "계좌 입금이 완료되었습니다.",
      icon: CheckCircle2,
    },
  ];

  const getActiveIndex = (statusName: string) => {
    if (["REVIEWING", "WAITING"].includes(statusName)) return 0;
    if (statusName === "EXCHANGED") return 1;
    if (["TRANSFERRING", "PENDING", "IN_PROGRESS"].includes(statusName))
      return 2;
    if (statusName === "COMPLETED") return 3;
    return 0;
  };

  const currentStepIndex = getActiveIndex(txData.status);

  // --- 🌟 레이아웃 A: 대시보드용 위젯 (컴팩트 버전) ---
  const renderWidget = () => (
    <div className="bg-white p-8 rounded-[40px] shadow-sm border border-slate-100">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <ShieldCheck className="text-teal-600" size={20} />
          <h3 className="font-black tracking-tight text-slate-800">
            송금 진행 현황
          </h3>
        </div>
        <span className="text-[10px] font-bold text-slate-300 uppercase">
          {txData.id}
        </span>
      </div>

      <div className="relative flex justify-between px-2">
        <div className="absolute top-4 left-0 w-full h-0.5 bg-slate-50 -z-0" />
        {steps.map((step, index) => {
          const isDone = index <= currentStepIndex;
          const StepIcon = step.icon; // 🌟 대문자로 시작하는 변수에 할당하여 컴포넌트로 사용
          return (
            <div
              key={step.key}
              className="relative z-10 flex flex-col items-center gap-2"
            >
              <div
                className={`w-8 h-8 rounded-xl flex items-center justify-center transition-all ${
                  isDone
                    ? "bg-teal-600 text-white shadow-lg shadow-teal-100"
                    : "bg-white border-2 border-slate-100 text-slate-200"
                }`}
              >
                {index < currentStepIndex || txData.status === "COMPLETED" ? (
                  <CheckCircle2 size={16} />
                ) : (
                  <StepIcon size={16} />
                )}
              </div>
              <span
                className={`text-[10px] font-black ${isDone ? "text-teal-600" : "text-slate-300"}`}
              >
                {step.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );

  // --- 🌟 레이아웃 B: 전체 페이지용 (상세 버전) ---
  const renderPage = () => (
    <CommonLayout>
      <div className="max-w-6xl px-6 py-12 mx-auto">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-slate-400 hover:text-teal-600 font-black text-[13px] mb-10 transition-all"
        >
          <ArrowLeft size={16} /> 대시보드로 돌아가기
        </button>
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <div className="bg-white p-10 md:p-14 rounded-[48px] shadow-sm border border-slate-100">
              <div className="flex items-center justify-between mb-16">
                <div className="flex items-center gap-4">
                  <div className="flex items-center justify-center w-12 h-12 bg-teal-600 shadow-lg rounded-2xl shadow-teal-100">
                    <ShieldCheck className="text-white" size={26} />
                  </div>
                  <div>
                    <h2 className="text-2xl italic font-black tracking-tighter text-slate-800">
                      송금 진행 현황
                    </h2>
                    <p className="mt-1 text-xs font-bold tracking-widest uppercase text-slate-300">
                      Status Tracking
                    </p>
                  </div>
                </div>
              </div>
              <div className="relative ml-6 space-y-16">
                {steps.map((step, index) => {
                  const StepIcon = step.icon;
                  return (
                    <div key={step.key} className="relative flex gap-10 group">
                      {index !== steps.length - 1 && (
                        <div
                          className={`absolute left-7 top-14 w-0.5 h-[calc(100%+8px)] ${index < currentStepIndex ? "bg-teal-600" : "bg-slate-100"}`}
                        />
                      )}
                      <div
                        className={`relative z-10 w-14 h-14 rounded-[20px] flex items-center justify-center ${index < currentStepIndex ? "bg-teal-600 text-white" : index === currentStepIndex ? "bg-slate-900 text-white scale-110" : "bg-slate-50 text-slate-200"}`}
                      >
                        {index < currentStepIndex ? (
                          <CheckCircle2 size={24} />
                        ) : (
                          <StepIcon size={24} />
                        )}
                      </div>
                      <div className="flex flex-col justify-center">
                        <span
                          className={`text-lg font-black ${index === currentStepIndex ? "text-slate-900" : index < currentStepIndex ? "text-teal-600" : "text-slate-300"}`}
                        >
                          {step.label}
                        </span>
                        <p className="text-sm font-bold mt-1.5 text-slate-500">
                          {step.desc}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
          <div className="space-y-8">
            <div className="bg-slate-900 p-8 rounded-[40px] text-white shadow-2xl relative overflow-hidden">
              <div className="flex items-center gap-3 mb-10 opacity-40">
                <FileText size={18} />
                <span className="text-[11px] font-bold uppercase tracking-widest">
                  Summary
                </span>
              </div>
              <div className="relative z-10 space-y-8">
                <div>
                  <p className="text-[11px] font-black text-slate-500 uppercase">
                    트랜잭션 ID
                  </p>
                  <p className="font-mono text-sm font-bold text-slate-200">
                    {txData.id}
                  </p>
                </div>
                <div className="pt-8 border-t border-white/5">
                  <p className="text-[11px] font-black text-slate-500 uppercase">
                    최종 정산 수령액
                  </p>
                  <h3 className="mt-1 text-3xl font-black tracking-tighter text-teal-400">
                    {Math.floor(txData.finalAmount).toLocaleString()}{" "}
                    <span className="text-sm">KRW</span>
                  </h3>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </CommonLayout>
  );

  return isWidgetMode ? renderWidget() : renderPage();
};

export default RemittanceTracking;
