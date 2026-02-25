import React from 'react';
import { Outlet, Link, useNavigate } from 'react-router-dom';
import { isAuthenticated, removeAuthToken } from '../../utils/auth';
import { ROUTES } from '../../constants/routes';
import { Button } from '../ui/Button';

/**
 * 기본 라우트 레이아웃 (GNB, Footer 등 포함)
 */
export const CommonLayout: React.FC = () => {
    const navigate = useNavigate();
    const isAuth = isAuthenticated();

    const handleLogout = () => {
        removeAuthToken();
        navigate(ROUTES.LOGIN);
    };

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            {/* 전역 네비게이션 바 (GNB) */}
            <header className="bg-white shadow-sm sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between h-16 items-center">
                        <div className="flex-shrink-0 flex items-center">
                            <Link to={ROUTES.HOME} className="text-2xl font-bold text-blue-600">
                                Ex-Ledger
                            </Link>
                        </div>

                        <nav className="flex space-x-4 ml-6 flex-1">
                            {/* 메인 메뉴 링크 추가 영역 */}
                        </nav>

                        <div className="flex items-center space-x-4">
                            {isAuth ? (
                                <>
                                    <Button variant="ghost" size="sm" onClick={() => navigate('/admin/health')}>
                                        시스템 상태
                                    </Button>
                                    <Button variant="secondary" size="sm" onClick={handleLogout}>
                                        로그아웃
                                    </Button>
                                </>
                            ) : (
                                <>
                                    <Link to={ROUTES.LOGIN}>
                                        <Button variant="ghost" size="sm">로그인</Button>
                                    </Link>
                                    <Link to={ROUTES.SIGNUP}>
                                        <Button variant="primary" size="sm">회원가입</Button>
                                    </Link>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </header>

            {/* 메인 콘텐츠 */}
            <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex">
                <Outlet />
            </main>

            {/* 푸터 */}
            <footer className="bg-white border-t border-gray-200 py-8">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex flex-col md:flex-row justify-between items-center text-sm text-gray-500">
                        <p>&copy; {new Date().getFullYear()} Ex-Ledger Team. All rights reserved.</p>
                        <div className="flex space-x-4 mt-4 md:mt-0">
                            <Link to={ROUTES.POLICY} className="hover:text-gray-900">개인정보처리방침</Link>
                            <Link to={ROUTES.POLICY} className="hover:text-gray-900">이용약관</Link>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
};
