const SystemHealth = () => {
    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold mb-4">시스템 상태 (Health Check)</h1>
            <p className="text-gray-600">DB 연결 상태, 서버 CPU/메모리, 기타 마이크로서비스 상태를 점검하는 대시보드입니다.</p>
        </div>
    );
};

export default SystemHealth;
