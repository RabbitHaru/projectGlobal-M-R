import React from 'react';
import { Navigate, useLocation, Outlet } from 'react-router-dom';
import { isAuthenticated, parseJwt, getToken } from '../../config/auth';

interface ProtectedRouteProps {
    requireAdmin?: boolean;
}

/**
 * 인증/권한 기반 라우트 보호 컴포넌트
 */
export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ requireAdmin = false }) => {
    const location = useLocation();
    const token = getToken();
    const isAuth = isAuthenticated();

    if (!isAuth) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    if (requireAdmin && token) {
        const payload = parseJwt(token);
        const authorities = payload?.auth || '';
        if (!authorities.includes('ROLE_ADMIN')) {
            return <Navigate to="/" replace />;
        }
    }

    // 자식 라우트 컴포넌트를 렌더링하기 위해 Outlet을 사용합니다.
    return <Outlet />;
};
