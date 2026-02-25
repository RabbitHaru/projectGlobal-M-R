import React from 'react';
import { Navigate, useLocation, Outlet } from 'react-router-dom';
import { isAuthenticated, parseJwt } from '../../../utils/auth';
import { ROUTES } from '../../../constants/routes';

interface ProtectedRouteProps {
    requireAdmin?: boolean;
}

/**
 * 인증/권한 기반 라우트 보호 컴포넌트
 */
export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ requireAdmin = false }) => {
    const location = useLocation();
    const token = localStorage.getItem('access_token');
    const isAuth = isAuthenticated();

    if (!isAuth) {
        return <Navigate to={ROUTES.LOGIN} state={{ from: location }} replace />;
    }

    if (requireAdmin && token) {
        const payload = parseJwt(token);
        const authorities = payload?.auth || '';
        if (!authorities.includes('ROLE_ADMIN')) {
            return <Navigate to={ROUTES.HOME} replace />;
        }
    }

    // 자식 라우트 컴포넌트를 렌더링하기 위해 Outlet을 사용합니다.
    return <Outlet />;
};
