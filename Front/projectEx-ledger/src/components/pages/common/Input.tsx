import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label?: string;
}

const Input: React.FC<InputProps> = ({ label, className = '', ...props }) => {
    return (
        <div className="flex flex-col mb-4">
            {label && <label className="mb-1 text-sm font-medium text-gray-700">{label}</label>}
            <input
                className={`border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 ${className}`}
                {...props}
            />
        </div>
    );
};

export default Input;
