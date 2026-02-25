import React from 'react';

interface MoneyFormatterProps {
    amount: number;
    currency?: string;
}

const MoneyFormatter: React.FC<MoneyFormatterProps> = ({ amount, currency = 'KRW' }) => {
    const formattedAmount = new Intl.NumberFormat('ko-KR').format(amount);

    return (
        <span className="font-mono">
            {formattedAmount} <span className="text-xs text-gray-500">{currency}</span>
        </span>
    );
};

export default MoneyFormatter;
