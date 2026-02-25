const Header = () => {
    return (
        <header className="bg-white border-b px-6 py-4 flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-800">대시보드</h2>
            <div className="flex items-center space-x-4">
                {/* SSE 알림 영역 (Member C 알림 표시 예정) */}
                <div className="text-gray-500 text-sm">알림 (0)</div>
                {/* 유저 프로필 */}
                <div className="w-8 h-8 rounded-full bg-blue-500 text-white flex items-center justify-center font-bold">
                    A
                </div>
            </div>
        </header>
    );
};

export default Header;
