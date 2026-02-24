/**
 * 인증 토큰 관리 유틸리티
 */
export const getAuthToken = () => {
    return localStorage.getItem('access_token');
};

export const setAuthToken = (token: string) => {
    localStorage.setItem('access_token', token);
};

export const removeAuthToken = () => {
    localStorage.removeItem('access_token');
};

export const isAuthenticated = () => {
    return !!getAuthToken();
};

export const parseJwt = (token: string) => {
    try {
        return JSON.parse(atob(token.split('.')[1]));
    } catch (e) {
        return null;
    }
};
