import { Routes, Route } from 'react-router-dom';
import RootLayout from '../components/layout/RootLayout';
import AuthLayout from '../components/layout/AuthLayout';
import { ProtectedRoute } from '../components/common/ProtectedRoute';

// Common Pages
import LandingPage from '../pages/common/LandingPage';

// Auth Pages
import LoginPage from '../pages/auth/LoginPage';
import SignupPage from '../pages/auth/SignupPage';
import MFASetup from '../pages/auth/MFASetup';

// Admin System Pages
import AdminLogList from '../pages/admin/system/AdminLogList';
import SystemHealth from '../pages/admin/system/SystemHealth';

// 임시 페이지 컴포넌트
const DummyHome = () => <div className="p-4">Home (Dashboard)</div>;

const AppRoutes = () => {
    return (
        <Routes>
            {/* 누구나 접근 가능한 기본 렌딩 페이지 */}
            <Route path="/" element={<LandingPage />} />

            {/* 인증 불필요 라우트 */}
            <Route element={<AuthLayout />}>
                <Route path="/login" element={<LoginPage />} />
                <Route path="/signup" element={<SignupPage />} />
                <Route path="/auth/mfa" element={<MFASetup />} />
            </Route>

            {/* 보안/인증 필요 라우트 (Foundation: 임시로 모두 허용 상태) */}
            <Route element={<ProtectedRoute />}>
                <Route element={<RootLayout />}>
                    <Route path="/dashboard" element={<DummyHome />} />
                    <Route path="/settlement" element={<div className="p-4">Settlement</div>} />

                    {/* 관리자(Admin) 전용 라우트 */}
                    <Route path="/admin/logs" element={<AdminLogList />} />
                    <Route path="/admin/health" element={<SystemHealth />} />
                </Route>
            </Route>
        </Routes>
    );
};

export default AppRoutes;
