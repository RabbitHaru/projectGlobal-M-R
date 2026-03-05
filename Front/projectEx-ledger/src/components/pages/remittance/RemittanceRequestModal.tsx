import React, { useState, useEffect } from "react";
import axios from "axios";
import { X, Info } from "lucide-react";

// 🌟 핵심: 인터페이스 이름을 ModalProps로 하고 initialReceiverName을 포함합니다.
interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialReceiverName: string;
}

const RemittanceRequestModal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  initialReceiverName,
}) => {
  const [amount, setAmount] = useState(0);
  const [recipientName, setRecipientName] = useState("");
  const [feeInfo, setFeeInfo] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  // 인증된 이름이 들어오면 수취인 필드에 자동 입력
  useEffect(() => {
    if (isOpen && initialReceiverName) {
      setRecipientName(initialReceiverName);
    }
  }, [isOpen, initialReceiverName]);

  // 수수료 계산 API 호출 (A님 엔진 연동)
  useEffect(() => {
    if (amount > 0) {
      const fetchFee = async () => {
        try {
          const res = await axios.post("/api/v1/remittance/fee/calculate", {
            amount,
            currency: "USD",
            exchangeRate: 1450,
            clientGrade: "VIP",
          });
          setFeeInfo(res.data);
        } catch (err) {
          console.error("수수료 계산 실패", err);
        }
      };
      fetchFee();
    }
  }, [amount]);

  const handleRemittanceSubmit = async () => {
    if (amount <= 0 || !recipientName)
      return alert("금액과 정보를 확인해주세요.");

    setLoading(true);
    try {
      // 🌟 실제 송금 신청 API (WAITING 상태로 저장됨)
      await axios.post("/api/v1/remittance/request", {
        recipientName,
        amount,
        currency: "USD",
        exchangeRate: 1450,
        feeAmount: feeInfo?.totalFeeAmount,
        totalPayment: feeInfo?.totalPayment,
      });
      alert("송금 신청이 완료되었습니다.");
      onClose();
    } catch (err) {
      alert("신청 중 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm">
      <div className="bg-white w-full max-w-lg rounded-[40px] p-10 shadow-2xl relative animate-in zoom-in duration-300">
        <button
          onClick={onClose}
          className="absolute text-gray-400 top-8 right-8 hover:text-gray-600"
        >
          <X size={24} />
        </button>

        <h2 className="mb-2 text-2xl font-black text-gray-800">새 송금 신청</h2>
        <p className="mb-8 text-sm font-medium text-gray-400">
          안전하고 빠른 해외 송금을 시작합니다.
        </p>

        <div className="space-y-6">
          <div>
            <label className="block mb-2 ml-1 text-sm font-bold text-gray-500">
              수취인 성명
            </label>
            <input
              type="text"
              value={recipientName}
              readOnly={!!initialReceiverName}
              className={`w-full p-4 border-none rounded-2xl text-lg font-bold outline-none ${
                initialReceiverName
                  ? "bg-blue-50 text-blue-700"
                  : "bg-gray-50 text-gray-800"
              }`}
            />
          </div>

          <div>
            <label className="block mb-2 ml-1 text-sm font-bold text-gray-500">
              송금 금액 (USD)
            </label>
            <div className="relative">
              <input
                type="number"
                className="w-full p-5 text-2xl font-black border-none outline-none bg-gray-50 rounded-2xl focus:ring-2 focus:ring-blue-500"
                placeholder="0.00"
                onChange={(e) => setAmount(Number(e.target.value))}
              />
              <span className="absolute font-black text-gray-400 -translate-y-1/2 right-5 top-1/2">
                USD
              </span>
            </div>
          </div>

          {feeInfo && (
            <div className="p-6 bg-slate-900 rounded-[24px] text-white space-y-3">
              <div className="flex items-end justify-between pt-2">
                <span className="text-sm font-bold text-slate-300">
                  최종 결제 금액
                </span>
                <span className="text-2xl font-black text-blue-400">
                  {feeInfo.totalPayment.toLocaleString()}{" "}
                  <small className="text-xs text-white">KRW</small>
                </span>
              </div>
            </div>
          )}

          <button
            onClick={handleRemittanceSubmit}
            disabled={loading}
            className="w-full py-5 text-lg font-black text-white transition-all bg-blue-600 shadow-xl rounded-2xl hover:bg-blue-700 disabled:bg-gray-400"
          >
            {loading ? "처리 중..." : "송금 신청 확정"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default RemittanceRequestModal;
