import { Routes, Route, Navigate } from 'react-router-dom';
import RootLayout from '../components/layout/RootLayout';
import AuthLayout from '../components/layout/AuthLayout';

//  Named Export
import { ProtectedRoute } from '../pages/common/ProtectedRoute'; 

// 실제 페이지 컴포넌트 임포트
import AdminDashboard from '../pages/admin/AdminDashboard';
import LandingPage from '../pages/common/LandingPage';
import { ROUTES } from '../constants/routes'; // ROUTES.LOGIN 등을 사용하기 위함

const AppRoutes = () => {
    return (
        <Routes>
            {/* [인증 불필요 구역] 로그인 등 */}
            <Route element={<AuthLayout />}>
                <Route path="/login" element={<div>로그인 페이지 (작업 예정)</div>} />
            </Route>

            {/* [일반 인증 구역] 로그인만 하면 접근 가능 */}
            <Route element={<ProtectedRoute />}>
                <Route element={<RootLayout />}>
                    <Route path="/" element={<LandingPage />} />
                    <Route path="/settlement" element={<div>정산 내역 페이지</div>} />
                </Route>
            </Route>

            {/* [어드민 전용 구역] requireAdmin={true}를 전달하여 ROLE_ADMIN 체크 */}
            {/* requireAdmin={true} 테스트를 위해 뺌 */}
            <Route element={<ProtectedRoute  />}>
                <Route element={<RootLayout />}>
                    {/* Member A님 담당: 어드민 대시보드 */}
                    <Route path="/admin" element={<AdminDashboard />} />
                </Route>
            </Route>

            {/* 잘못된 경로 접근 시 메인으로 리다이렉트 */}
            <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
    );
};

export default AppRoutes;