import { Outlet } from 'react-router-dom';

const AuthLayout = () => {
    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100">
            <div className="w-full max-w-md bg-white p-8 rounded-lg shadow">
                <div className="text-center mb-6">
                    <h1 className="text-2xl font-bold text-gray-800">Ex-Ledger</h1>
                    <p className="text-sm text-gray-500">인증 (Foundation 임시)</p>
                </div>
                <Outlet />
            </div>
        </div>
    );
};

export default AuthLayout;
