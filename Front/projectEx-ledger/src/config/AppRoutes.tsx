import { Routes, Route } from 'react-router-dom';
import RootLayout from '../components/layout/RootLayout';
import AuthLayout from '../components/layout/AuthLayout';
import ProtectedRoute from '../components/pages/common/ProtectedRoute';

// 임시 페이지 컴포넌트
const DummyHome = () => <div className="p-4">Home (Dashboard)</div>;
const DummyLogin = () => <div className="p-4">Login Page</div>;

const AppRoutes = () => {
    return (
        <Routes>
            {/* 인증 불필요 라우트 */}
            <Route element={<AuthLayout />}>
                <Route path="/login" element={<DummyLogin />} />
            </Route>

            {/* 보안/인증 필요 라우트 (Foundation: 임시로 모두 허용 상태) */}
            <Route element={<ProtectedRoute />}>
                <Route element={<RootLayout />}>
                    <Route path="/" element={<DummyHome />} />
                    <Route path="/settlement" element={<div className="p-4">Settlement</div>} />
                </Route>
            </Route>
        </Routes>
    );
};

export default AppRoutes;
