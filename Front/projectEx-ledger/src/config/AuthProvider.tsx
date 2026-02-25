import React, { createContext, useContext, useState } from 'react';

// 전역 로그인 상태 컨텍스트 빈 껍데기
interface AuthContextType {
    user: any;
    login: () => void;
    logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const [user, setUser] = useState<{ id: string } | null>({ id: 'dummy_user' }); // 임시 사용자

    const login = () => setUser({ id: 'dummy_user' });
    const logout = () => setUser(null);

    return (
        <AuthContext.Provider value={{ user, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) throw new Error('useAuth must be used within an AuthProvider');
    return context;
};
