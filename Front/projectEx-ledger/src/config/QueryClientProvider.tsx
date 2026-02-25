import { QueryClient, QueryClientProvider as ReactQueryProvider } from '@tanstack/react-query';
import React from 'react';

const queryClient = new QueryClient();

export const QueryClientProvider = ({ children }: { children: React.ReactNode }) => {
    return (
        <ReactQueryProvider client={queryClient}>
            {children}
        </ReactQueryProvider>
    );
};
