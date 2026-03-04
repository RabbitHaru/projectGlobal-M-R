import React, { useState } from "react";
import axios from "axios";

const AccountVerification: React.FC = () => {
  const [bankCode, setBankCode] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [isVerified, setIsVerified] = useState(false);
  const [ownerName, setOwnerName] = useState("");
  const [loading, setLoading] = useState(false);

  // 1. 포트원 API를 통한 계좌 실명 조회 로직
  const handleVerify = async () => {
    if (!bankCode || !accountNumber) {
      alert("은행과 계좌번호를 입력해주세요.");
      return;
    }

    setLoading(true);
    try {
      // 실제 구현 시 백엔드(Member A)를 거쳐 포트원 API를 호출합니다.
      const response = await axios.post(
        "http://localhost:8080/api/v1/account/verify",
        {
          bankCode,
          accountNumber,
        },
      );

      if (response.data.success) {
        setOwnerName(response.data.bankHolderName);
        setIsVerified(true);
        alert("계좌 소유주 확인에 성공했습니다.");
      }
    } catch (error) {
      console.error("인증 실패:", error);
      alert("계좌 정보를 확인해주세요.");
      setIsVerified(false);
    } finally {
      setLoading(false);
    }
  };

  // 2. 인증된 계좌를 정산용으로 등록
  const handleRegister = async () => {
    try {
      await axios.post("http://localhost:8080/api/v1/account/register", {
        bankCode,
        accountNumber,
        ownerName,
      });
      alert("정산 및 송금용 계좌로 등록되었습니다.");
    } catch (error) {
      alert("계좌 등록 중 오류가 발생했습니다.");
    }
  };

  return (
    <div className="max-w-xl p-6 mx-auto space-y-8">
      <header>
        <h1 className="text-2xl font-bold text-gray-900">계좌 실명 확인</h1>
        <p className="text-sm font-medium text-gray-500">
          안전한 송금을 위해 계좌 소유주를 확인합니다.
        </p>
      </header>

      <div className="p-8 space-y-6 bg-white border border-gray-100 shadow-sm rounded-3xl">
        <div className="space-y-2">
          <label className="ml-1 text-sm font-bold text-gray-700">
            은행 선택
          </label>
          <select
            className="w-full p-4 transition-all border-none outline-none bg-gray-50 rounded-2xl focus:ring-2 focus:ring-blue-500"
            value={bankCode}
            onChange={(e) => setBankCode(e.target.value)}
          >
            <option value="">은행을 선택하세요</option>
            <option value="004">KB국민은행</option>
            <option value="088">신한은행</option>
            <option value="020">우리은행</option>
            <option value="081">하나은행</option>
          </select>
        </div>

        <div className="space-y-2">
          <label className="ml-1 text-sm font-bold text-gray-700">
            계좌 번호
          </label>
          <input
            type="text"
            placeholder="'-' 없이 숫자만 입력"
            className="w-full p-4 transition-all border-none outline-none bg-gray-50 rounded-2xl focus:ring-2 focus:ring-blue-500"
            value={accountNumber}
            onChange={(e) => setAccountNumber(e.target.value)}
          />
        </div>

        <button
          onClick={handleVerify}
          disabled={loading || isVerified}
          className={`w-full py-4 rounded-2xl font-bold text-lg transition-all ${
            isVerified
              ? "bg-green-500 text-white"
              : "bg-gray-900 text-white hover:bg-black"
          }`}
        >
          {loading
            ? "조회 중..."
            : isVerified
              ? "✓ 인증 완료"
              : "실명 확인하기"}
        </button>

        {isVerified && (
          <div className="flex items-center justify-between p-4 border border-green-100 bg-green-50 rounded-2xl animate-fade-in">
            <span className="font-medium text-green-700">예금주 성함</span>
            <span className="text-lg font-bold text-green-900">
              {ownerName}
            </span>
          </div>
        )}
      </div>

      {isVerified && (
        <button
          onClick={handleRegister}
          className="w-full py-4 text-lg font-bold text-white transition-all bg-blue-600 shadow-lg rounded-2xl shadow-blue-100 hover:bg-blue-700"
        >
          이 계좌를 송금용으로 등록하기
        </button>
      )}
    </div>
  );
};

export default AccountVerification;
