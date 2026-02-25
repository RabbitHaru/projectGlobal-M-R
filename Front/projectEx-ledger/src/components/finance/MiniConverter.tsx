// src/components/finance/MiniConverter.tsx
import React from 'react';

const MiniConverter: React.FC = () => {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex gap-4">
        <input 
          type="text" 
          placeholder="금액 입력" 
          className="flex-1 border p-3 rounded-md outline-none focus:ring-2 focus:ring-teal-600"
        />
        <select className="border p-3 rounded-md w-32 outline-none focus:ring-2 focus:ring-teal-600">
          <option>🇺🇸 USD</option>
          <option>🇯🇵 JPY</option>
        </select>
      </div>
      <button className="w-full bg-teal-700 text-white font-bold py-3 rounded-md hover:bg-teal-800 transition">
        환전하기 (환전신청페이지가기)
      </button>
    </div>
  );
};

export default MiniConverter;