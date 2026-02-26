import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import http from '../../config/http';
import { setToken } from '../../config/auth';
import { Turnstile } from '@marsidev/react-turnstile';

const LoginPage: React.FC = () => {
    const [turnstileToken, setTurnstileToken] = useState<string | null>(null);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (!turnstileToken) {
            setError('Turnstile (봇 방지) 인증이 완료되지 않았습니다.');
            return;
        }

        try {
            const response = await http.post('/auth/login', { email, password, turnstileToken });
            if (response.data && response.data.data) {
                const { accessToken } = response.data.data;
                setToken(accessToken);
                window.location.href = '/';
            }
        } catch (err: any) {
            setError(err.response?.data?.message || '로그인에 실패했습니다.');
        }
    };

    return (
        <div className="w-full max-w-md bg-white p-8 rounded-lg shadow-md">
            <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">로그인</h2>

            {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                    {error}
                </div>
            )}

            <form onSubmit={handleLogin} className="space-y-4">
                <Input
                    label="이메일"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                />
                <Input
                    label="비밀번호"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                />

                <div className="flex justify-center my-4">
                    <Turnstile
                        siteKey="1x00000000000000000000AA"
                        onSuccess={(token) => setTurnstileToken(token)}
                    />
                </div>

                <Button type="submit" className="w-full mt-4">
                    로그인
                </Button>
            </form>

            <div className="mt-6 text-center text-sm text-gray-600">
                계정이 없으신가요?{' '}
                <Link to="/signup" className="text-blue-600 hover:text-blue-800">
                    회원가입
                </Link>
            </div>
        </div>
    );
};

export default LoginPage;
