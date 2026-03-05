import React, { useState } from "react";
import axios from "axios";
import { useToast } from "../../../components/notification/ToastProvider"; // 🌟 연동 포인트

const SupportRequest: React.FC = () => {
  const { showToast } = useToast(); // 🌟 전역 토스트 기능 호출
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [form, setForm] = useState({
    category: "REMITTANCE",
    title: "",
    content: "",
    remittanceId: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // 🌟 Member A님이 준비할 문의 접수 API 호출
      // const response = await axios.post("http://localhost:8080/api/v1/support/tickets", form);

      // 실제 API가 연결되었다고 가정하고 1초 뒤 성공 처리
      setTimeout(() => {
        // 🌟 빨간 줄 없이 작동하는 성공 토스트!
        showToast(
          "문의가 성공적으로 접수되었습니다. 곧 답변드릴게요!",
          "SUCCESS",
        );

        // 폼 초기화
        setForm({
          category: "REMITTANCE",
          title: "",
          content: "",
          remittanceId: "",
        });
        setIsSubmitting(false);
      }, 1000);
    } catch (err) {
      // 실패 시 에러 토스트
      showToast(
        "접수 중 오류가 발생했습니다. 담당자(Member A)에게 문의하세요.",
        "ERROR",
      );
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl p-6 mx-auto space-y-8 animate-fade-in">
      <header className="space-y-2">
        <h1 className="text-3xl font-black tracking-tight text-gray-900">
          Customer Support
        </h1>
        <p className="text-sm font-medium text-gray-500">
          송금 관련 문제나 계좌 인증 오류 등 도움이 필요하신가요?
        </p>
      </header>

      <form
        onSubmit={handleSubmit}
        className="p-10 bg-white border border-gray-100 shadow-2xl rounded-[2.5rem] space-y-8"
      >
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
          <div className="space-y-3">
            <label className="ml-2 text-xs font-black tracking-widest text-gray-400 uppercase">
              Category
            </label>
            <select
              className="w-full p-4 font-bold text-gray-700 transition-all border-none outline-none bg-gray-50 rounded-2xl focus:ring-2 focus:ring-blue-500"
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
            >
              <option value="REMITTANCE">해외 송금 문의</option>
              <option value="ACCOUNT">계좌 및 본인 인증</option>
              <option value="SETTLEMENT">판매 대금 정산</option>
              <option value="OTHER">기타 건의사항</option>
            </select>
          </div>
          <div className="space-y-3">
            <label className="ml-2 text-xs font-black tracking-widest text-gray-400 uppercase">
              Transaction ID (Optional)
            </label>
            <input
              placeholder="예: TRX-20260304"
              className="w-full p-4 font-medium transition-all border-none outline-none bg-gray-50 rounded-2xl focus:ring-2 focus:ring-blue-500"
              value={form.remittanceId}
              onChange={(e) =>
                setForm({ ...form, remittanceId: e.target.value })
              }
            />
          </div>
        </div>

        <div className="space-y-3">
          <label className="ml-2 text-xs font-black tracking-widest text-gray-400 uppercase">
            Subject
          </label>
          <input
            required
            placeholder="제목을 입력해 주세요"
            className="w-full p-4 font-bold transition-all border-none outline-none bg-gray-50 rounded-2xl focus:ring-2 focus:ring-blue-500"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
          />
        </div>

        <div className="space-y-3">
          <label className="ml-2 text-xs font-black tracking-widest text-gray-400 uppercase">
            Message
          </label>
          <textarea
            required
            rows={6}
            placeholder="도움이 필요하신 내용을 상세히 적어주세요."
            className="w-full p-4 font-medium transition-all border-none outline-none resize-none bg-gray-50 rounded-2xl focus:ring-2 focus:ring-blue-500"
            value={form.content}
            onChange={(e) => setForm({ ...form, content: e.target.value })}
          />
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className={`w-full py-5 text-lg font-black text-white transition-all rounded-3xl shadow-xl active:scale-[0.97] ${
            isSubmitting
              ? "bg-gray-300 cursor-not-allowed"
              : "bg-blue-600 hover:bg-blue-700 shadow-blue-100"
          }`}
        >
          {isSubmitting ? "전송 중..." : "문의하기"}
        </button>
      </form>
    </div>
  );
};

export default SupportRequest;
