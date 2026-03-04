import React, { useState, useEffect } from "react";
import axios from "axios";
// 만약 라우터를 사용 중이라면 아래 주석을 해제하고 navigate를 사용
// import { useNavigate } from "react-router-dom";

const RemittanceRequest: React.FC = () => {
  // const navigate = useNavigate();

  // 1. 상태 관리 (State)
  const [currency, setCurrency] = useState("USD");
  const [amount, setAmount] = useState<number | "">("");
  const [exchangeRate, setExchangeRate] = useState(1345.5);
  const [isSubmitting, setIsSubmitting] = useState(false); // 🌟 중복 클릭 방지용 상태
  const [recipient, setRecipient] = useState({
    name: "",
    bank: "",
    account: "",
  });

  // 2. 실시간 계산 로직
  const totalKrw = amount ? Math.floor(Number(amount) * exchangeRate) : 0;
  const fee = 5000; // 수수료 정책 API 연동 예정 (A 담당자 영역)

  // 실시간 환율 연동: 통화가 변경될 때마다 최신 환율을 가져옵니다.

  useEffect(() => {
    const fetchCurrentRate = async () => {
      try {
        const response = await axios.get(
          "http://localhost:8080/api/exchange/latest",
        );
        const targetRate = response.data.find(
          (r: any) => r.curUnit === currency,
        );
        if (targetRate) {
          setExchangeRate(targetRate.rate);
        }
      } catch (error) {
        console.error("환율 정보 로드 실패:", error);
      }
    };

    fetchCurrentRate();
  }, [currency]);

  /**
   * 송금 신청 제출 함수
   */
  const handleSubmit = async () => {
    // 유효성 검사
    if (!amount || !recipient.name || !recipient.bank || !recipient.account) {
      alert("모든 정보를 정확히 입력해주세요.");
      return;
    }

    setIsSubmitting(true); // 로딩 시작

    const requestData = {
      ...recipient,
      currency,
      amount,
      exchangeRate,
      totalPayment: totalKrw + fee,
      requestedAt: new Date().toISOString(),
    };

    try {
      const response = await axios.post(
        "http://localhost:8080/api/v1/remittance/request",
        requestData,
      );

      if (response.status === 200 || response.status === 201) {
        alert("🎉 송금 신청이 완료되었습니다!");
        // navigate('/pages/seller/remittance/tracking');
      }
    } catch (error) {
      console.error("송금 신청 실패:", error);
      alert(
        "서버 오류로 신청에 실패했습니다. (A 담당자님의 백엔드 설정을 확인하세요)",
      );
    } finally {
      setIsSubmitting(false); // 로딩 종료
    }
  };

  return (
    <div className="max-w-2xl p-6 mx-auto space-y-8">
      {/* 헤더 섹션 */}
      <header>
        <h1 className="text-2xl font-bold text-gray-900">해외 송금 신청</h1>
        <p className="text-sm font-medium text-gray-500">
          실시간 환율을 반영하여 빠르고 안전하게 송금합니다.
        </p>
      </header>

      {/* STEP 1: 송금 금액 입력 */}
      <section className="p-6 space-y-4 bg-white border border-gray-100 shadow-sm rounded-2xl">
        <h2 className="flex items-center gap-2 text-lg font-semibold text-gray-800">
          <span className="flex items-center justify-center w-6 h-6 text-xs text-white bg-blue-600 rounded-full">
            1
          </span>
          송금 금액 설정
        </h2>

        <div className="flex gap-4">
          <select
            value={currency}
            onChange={(e) => setCurrency(e.target.value)}
            className="w-1/3 p-3 font-medium border border-gray-200 outline-none rounded-xl focus:ring-2 focus:ring-blue-500"
          >
            <option value="USD">미국 달러 (USD)</option>
            <option value="JPY">일본 엔 (JPY)</option>
            <option value="EUR">유로 (EUR)</option>
          </select>
          <input
            type="number"
            placeholder="송금할 금액 입력"
            value={amount}
            onChange={(e) =>
              setAmount(e.target.value === "" ? "" : Number(e.target.value))
            }
            className="w-2/3 p-3 border border-gray-200 outline-none rounded-xl focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="p-4 space-y-2 border border-blue-100 bg-blue-50 rounded-xl">
          <div className="flex justify-between text-sm">
            <span className="text-xs font-medium tracking-wider text-blue-600 uppercase">
              적용 환율
            </span>
            <span className="font-bold text-blue-900">
              1 {currency} = {exchangeRate.toLocaleString()} KRW
            </span>
          </div>
          <div className="flex justify-between text-lg">
            <span className="font-bold text-gray-600">최종 결제 금액</span>
            <span className="font-extrabold text-blue-700">
              {(totalKrw + fee).toLocaleString()} KRW
            </span>
          </div>
          <p className="text-[10px] text-gray-400 text-right">
            * 수수료 {fee.toLocaleString()}원 포함
          </p>
        </div>
      </section>

      {/* STEP 2: 수취인 정보 입력 */}
      <section className="p-6 space-y-4 bg-white border border-gray-100 shadow-sm rounded-2xl">
        <h2 className="flex items-center gap-2 text-lg font-semibold text-gray-800">
          <span className="flex items-center justify-center w-6 h-6 text-xs text-white bg-blue-600 rounded-full">
            2
          </span>
          수취인 정보
        </h2>
        <div className="grid grid-cols-1 gap-4">
          <input
            placeholder="수취인 실명"
            value={recipient.name}
            className="p-3 border border-gray-200 outline-none rounded-xl focus:ring-2 focus:ring-blue-500"
            onChange={(e) =>
              setRecipient({ ...recipient, name: e.target.value })
            }
          />
          <input
            placeholder="수취 은행 (예: CHASE, MUFG 등)"
            value={recipient.bank}
            className="p-3 border border-gray-200 outline-none rounded-xl focus:ring-2 focus:ring-blue-500"
            onChange={(e) =>
              setRecipient({ ...recipient, bank: e.target.value })
            }
          />
          <input
            placeholder="계좌 번호 (Account Number)"
            value={recipient.account}
            className="p-3 border border-gray-200 outline-none rounded-xl focus:ring-2 focus:ring-blue-500"
            onChange={(e) =>
              setRecipient({ ...recipient, account: e.target.value })
            }
          />
        </div>
      </section>

      {/* 신청 버튼 */}
      <button
        onClick={handleSubmit}
        disabled={isSubmitting}
        className={`w-full py-4 text-lg font-bold text-white transition-all shadow-lg rounded-2xl shadow-blue-100 
          ${isSubmitting ? "bg-gray-400 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700 active:scale-[0.98]"}`}
      >
        {isSubmitting ? (
          <span className="flex items-center justify-center gap-2">
            <div className="w-5 h-5 border-2 border-white rounded-full border-t-transparent animate-spin"></div>
            요청 처리 중...
          </span>
        ) : (
          "송금 신청하기"
        )}
      </button>
    </div>
  );
};

export default RemittanceRequest;
