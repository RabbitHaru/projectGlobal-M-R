import axios from 'axios';

// 기초 Axios 인스턴스 (Foundation 단계: JWT 및 보안 인터셉터 제외)
const http = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api',
    timeout: 10000,
    headers: {
        'Content-Type': 'application/json',
    },
});

export default http;
