import { Outlet } from 'react-router-dom';

const ProtectedRoute = () => {
    // Foundation 모드: 현재는 권한 상관없이 무조건 렌더링하도록 임시 허용
    // 원본: if (!user) return <Navigate to="/login" replace />;

    return <Outlet />;
};

export default ProtectedRoute;
