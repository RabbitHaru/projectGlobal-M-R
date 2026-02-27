import React from 'react';

interface StatusBadgeProps {
    status: 'SUCCESS' | 'ERROR' | 'PENDING' | 'WARN';
    label: string;
}

const StatusBadge: React.FC<StatusBadgeProps> = ({ status, label }) => {
    const styles = {
        SUCCESS: 'bg-green-100 text-green-800',
        ERROR: 'bg-red-100 text-red-800',
        PENDING: 'bg-gray-100 text-gray-800',
        WARN: 'bg-yellow-100 text-yellow-800',
    };

    return (
        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${styles[status]}`}>
            {label}
        </span>
    );
};

export default StatusBadge;
