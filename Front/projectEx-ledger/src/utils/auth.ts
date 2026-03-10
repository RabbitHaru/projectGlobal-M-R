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
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(atob(base64).split('').map((c) => {
            return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        }).join(''));
        return JSON.parse(jsonPayload);
    } catch (e) {
        return null;
    }
};

export const getUserRoles = (): string[] => {
    const token = getAuthToken();
    if (!token) return [];
    const decoded = parseJwt(token);
    if (!decoded || !decoded.auth) return [];

    // Spring Security usually returns "ROLE_USER,ROLE_ADMIN" or similar in 'auth' claim
    if (typeof decoded.auth === 'string') {
        return decoded.auth.split(',');
    }
    return Array.isArray(decoded.auth) ? decoded.auth : [];
};

export const hasRole = (role: string): boolean => {
    const roles = getUserRoles();
    const cleanRole = role.startsWith('ROLE_') ? role : `ROLE_${role}`;
    return roles.includes(role) || roles.includes(cleanRole);
};
