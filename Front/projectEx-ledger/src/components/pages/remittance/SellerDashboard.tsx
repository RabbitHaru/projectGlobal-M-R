import React, { useState, useEffect } from "react";
import CommonLayout from "../../layout/CommonLayout";
import ExchangeRateChart from "../../widgets/finance/ExchangeRateChart";
import AccountVerification from "./AccountVerification";
import RemittanceTracking from "./Tracking/RemittanceTracking";
import RemittanceRequestModal from "./RemittanceRequestModal";
import RemittanceConsentModal from "./RemittanceConsentModal";
import { ArrowUpRight, Wallet, History, AlertCircle } from "lucide-react";

type RemittanceStatus =
  | "WAITING"
  | "DISCREPANCY"
  | "WAITING_USER_CONSENT"
  | "PENDING"
  | "COMPLETED"
  | "FAILED";

const SellerDashboard = () => {
  const [currentStatus, setCurrentStatus] =
    useState<RemittanceStatus>("WAITING");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isConsentModalOpen, setIsConsentModalOpen] = useState(false);
  const [verifiedName, setVerifiedName] = useState("");

  const handleVerificationSuccess = (ownerName: string) => {
    setVerifiedName(ownerName);
  };

  useEffect(() => {
    const eventSource = new EventSource("/api/v1/notifications/subscribe");

    eventSource.addEventListener("remittance_update", (e: any) => {
      const receivedStatus = e.data;
      const validStatuses: RemittanceStatus[] = [
        "WAITING",
        "DISCREPANCY",
        "WAITING_USER_CONSENT",
        "PENDING",
        "COMPLETED",
        "FAILED",
      ];

      if (validStatuses.includes(receivedStatus)) {
        setCurrentStatus(receivedStatus as RemittanceStatus);
      }
    });

    return () => eventSource.close();
  }, []);

  return (
    <CommonLayout>
      <div className="w-full p-6 mx-auto lg:p-10 max-w-7xl">
        <div className="flex flex-col justify-between gap-4 mb-12 md:flex-row md:items-center">
          <div>
            <h1 className="text-3xl italic font-black tracking-tight text-slate-900">
              Seller Dashboard
            </h1>
            <p className="mt-1 font-medium text-slate-500">
              실시간 환율 기반 정산 현황 및 송금 프로세스를 관리하세요.
            </p>
          </div>

          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 px-8 py-4 font-black text-white transition-all bg-teal-600 shadow-xl rounded-2xl hover:bg-teal-700 shadow-teal-100 active:scale-95"
          >
            <ArrowUpRight size={20} /> 새 송금 신청
          </button>
        </div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          <div className="space-y-8 lg:col-span-2">
            <div className="bg-white p-8 rounded-[40px] shadow-sm border border-slate-100 h-[480px]">
              <ExchangeRateChart selectedCurrency="USD" />
            </div>
            <AccountVerification
              onVerificationSuccess={handleVerificationSuccess}
            />
          </div>

          <div className="space-y-8">
            {currentStatus === "WAITING_USER_CONSENT" && (
              <div className="p-6 bg-amber-50 border border-amber-100 rounded-[32px] flex flex-col gap-4 shadow-sm animate-pulse">
                <div className="flex items-center gap-3">
                  <div className="p-2 text-white shadow-md rounded-xl bg-amber-500">
                    <AlertCircle size={24} />
                  </div>
                  <div>
                    <p className="text-sm font-black text-amber-900">
                      정산 금액 수정됨
                    </p>
                    <p className="text-[11px] font-bold text-amber-700 opacity-90 leading-tight">
                      관리자의 오차 수정을 확인하고 승인이 필요합니다.
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setIsConsentModalOpen(true)}
                  className="w-full py-4 text-xs font-black text-white transition-all shadow-lg bg-amber-500 rounded-2xl hover:bg-amber-600 shadow-amber-100"
                >
                  수정 금액 확인 및 동의
                </button>
              </div>
            )}

            <RemittanceTracking
              status={currentStatus}
              transactionId="TRX-20260305-88A2"
              updatedAt="2026-03-05 15:25"
            />

            <div className="bg-slate-900 p-8 rounded-[40px] text-white shadow-2xl relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-32 h-32 -mt-16 -mr-16 transition-transform rounded-full bg-teal-500/10 group-hover:scale-125"></div>
              <div className="flex items-center gap-3 mb-8 opacity-60">
                <Wallet size={20} />
                <span className="text-xs font-bold tracking-widest uppercase">
                  Settlement Summary
                </span>
              </div>
              <div className="mb-10">
                <h2 className="mb-2 text-4xl font-black tracking-tighter">
                  $ 12,450.00
                </h2>
                <p className="text-sm font-bold text-teal-400">
                  ≈ 18,142,500 KRW
                </p>
              </div>
              <button className="flex items-center justify-center w-full gap-2 py-4 text-sm font-bold transition-all bg-white/10 hover:bg-white/20 rounded-[20px] border border-white/5">
                <History size={16} /> 정산 내역 상세보기
              </button>
            </div>
          </div>
        </div>
      </div>

      <RemittanceRequestModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        initialReceiverName={verifiedName}
      />

      <RemittanceConsentModal
        isOpen={isConsentModalOpen}
        onClose={() => setIsConsentModalOpen(false)}
        transactionId="TRX-20260305-88A2"
        initialReceiverName={verifiedName}
        adjustedAmount={18130000}
        onSuccess={() => setCurrentStatus("PENDING")}
      />
    </CommonLayout>
  );
};

export default SellerDashboard;
