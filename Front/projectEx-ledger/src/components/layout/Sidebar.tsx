import { Link } from 'react-router-dom';

const Sidebar = () => {
    return (
        <div className="w-64 bg-gray-900 text-white h-full flex flex-col">
            <div className="p-6">
                <h1 className="text-2xl font-bold tracking-wider">EX-LEDGER</h1>
            </div>
            <nav className="flex-1 px-4 space-y-2">
                {/* 권한(A/C)에 따른 동적 메뉴 렌더링 예정 */}
                <Link to="/" className="block px-4 py-2 rounded bg-gray-800 hover:bg-gray-700">홈</Link>
                <Link to="/settlement" className="block px-4 py-2 rounded hover:bg-gray-800">정산 (Member A)</Link>
                <Link to="/finance" className="block px-4 py-2 rounded hover:bg-gray-800">환율 (Member C)</Link>
            </nav>
        </div>
    );
};

export default Sidebar;
