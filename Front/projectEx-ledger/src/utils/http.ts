import axios from 'axios';
import { getAuthToken, removeAuthToken } from './auth';

/**
 * Axios 인스턴스 및 인터셉터 설정
 */
const http = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
    timeout: 10000,
});

http.interceptors.request.use(
    (config) => {
        const token = getAuthToken();
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

http.interceptors.response.use(
    (response) => response.data,
    (error) => {
        if (error.response?.status === 401) {
            removeAuthToken();
            window.location.href = '/auth/login'; // Redirect to login on unauthorized
        }
        return Promise.reject(error);
    }
);

export default http;
