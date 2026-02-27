import React from 'react';
import { Navigate, useLocation, Outlet } from 'react-router-dom';
import { isAuthenticated, parseJwt, getToken } from '../../../config/auth';

interface ProtectedRouteProps {
    allowedRoles?: string[];
}

/**
 * 인증/권한 기반 라우트 보호 컴포넌트
 */
export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ allowedRoles }) => {
    const location = useLocation();
    const token = getToken();
    const isAuth = isAuthenticated();

    if (!isAuth) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    if (allowedRoles && allowedRoles.length > 0 && token) {
        const payload = parseJwt(token);
        const authorities: string = payload?.auth || '';
        const userRoles = authorities.split(',');

        const hasRequiredRole = allowedRoles.some(role => userRoles.includes(role));
        if (!hasRequiredRole) {
            // 권한이 없으면 루트 경로(또는 렌딩 페이지)로 이동
            return <Navigate to="/" replace />;
        }
    }

    // 자식 라우트 컴포넌트를 렌더링하기 위해 Outlet을 사용합니다.
    return <Outlet />;
};
