import React, { useState, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from '../common/Button';
import { Input } from '../common/Input';
import http from '../../../config/http';
import { Turnstile } from '@marsidev/react-turnstile';

const SignupPage: React.FC = () => {
    const navigate = useNavigate();
    const [turnstileToken, setTurnstileToken] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState<'COMPANY_ADMIN' | 'USER'>('USER');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');
    const [businessNumber, setBusinessNumber] = useState('');
    const [isBusinessVerified, setIsBusinessVerified] = useState(false);
    const [verifying, setVerifying] = useState(false);
    const [error, setError] = useState('');

    const [termsRequired, setTermsRequired] = useState(false);
    const [termsOptional, setTermsOptional] = useState(false);

    const emailRef = useRef<HTMLInputElement>(null);
    const passwordRef = useRef<HTMLInputElement>(null);
    const nameRef = useRef<HTMLInputElement>(null);
    const businessRef = useRef<HTMLInputElement>(null);
    const termsRef = useRef<HTMLInputElement>(null);

    const handleVerifyBusiness = async () => {
        if (!businessNumber || businessNumber.length !== 10) {
            setError('사업자등록번호 10자리를 정확히 입력해주세요.');
            businessRef.current?.focus();
            return;
        }
        setVerifying(true);
        setError('');
        try {
            const res = await http.post('/auth/verify-business', { businessNumber });
            if (res.data.status === 'SUCCESS') {
                setIsBusinessVerified(true);
                alert('사업자 인증이 완료되었습니다.');
            } else {
                setError(res.data.message || '사업자 인증에 실패했습니다.');
            }
        } catch (err: any) {
            setError(err.response?.data?.message || '사업자 인증에 실패했습니다.');
        } finally {
            setVerifying(false);
        }
    };

    const handleSignup = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (!email) {
            setError('이메일을 입력해주세요.');
            emailRef.current?.focus();
            return;
        }
        if (!password) {
            setError('비밀번호를 입력해주세요.');
            passwordRef.current?.focus();
            return;
        }
        if (!name) {
            setError('이름을 입력해주세요.');
            nameRef.current?.focus();
            return;
        }

        if (activeTab === 'COMPANY_ADMIN' && (!businessNumber || businessNumber.length !== 10)) {
            setError('사업자등록번호 10자리를 정확히 입력해주세요.');
            businessRef.current?.focus();
            return;
        }

        if (activeTab === 'COMPANY_ADMIN' && !isBusinessVerified) {
            setError('사업자등록번호 인증을 먼저 완료해주세요.');
            businessRef.current?.focus();
            return;
        }

        if (!termsRequired) {
            setError('필수 약관에 동의해주세요.');
            termsRef.current?.focus();
            return;
        }

        if (!turnstileToken) {
            setError('Turnstile (봇 방지) 인증이 완료되지 않았습니다.');
            return;
        }

        try {
            await http.post('/auth/signup', {
                email,
                password,
                name,
                roleType: activeTab,
                businessNumber: activeTab === 'COMPANY_ADMIN' ? businessNumber : undefined,
                turnstileToken
            });
            alert('회원가입이 완료되었습니다. 로그인해주세요.');
            navigate('/login');
        } catch (err: any) {
            setError(err.response?.data?.message || '회원가입에 실패했습니다.');
        }
    };

    return (
        <div className="w-full">
            <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">회원가입</h2>

            <div className="flex mb-6 border-b border-gray-200">
                <button
                    type="button"
                    className={`flex-1 py-2 text-sm font-semibold text-center border-b-2 transition-colors ${activeTab === 'USER'
                        ? 'border-teal-600 text-teal-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700'
                        }`}
                    onClick={() => setActiveTab('USER')}
                >
                    기업 일반회원
                </button>
                <button
                    type="button"
                    className={`flex-1 py-2 text-sm font-semibold text-center border-b-2 transition-colors ${activeTab === 'COMPANY_ADMIN'
                        ? 'border-teal-600 text-teal-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700'
                        }`}
                    onClick={() => setActiveTab('COMPANY_ADMIN')}
                >
                    기업 관리자
                </button>
            </div>

            {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                    {error}
                </div>
            )}

            <form onSubmit={handleSignup} className="space-y-4">
                <Input
                    ref={emailRef}
                    label="이메일"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                />
                <Input
                    ref={passwordRef}
                    label="비밀번호"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                />
                <Input
                    ref={nameRef}
                    label="이름"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                />

                {activeTab === 'COMPANY_ADMIN' && (
                    <div className="space-y-1">
                        <div className="flex items-end gap-2">
                            <div className="flex-1">
                                <Input
                                    ref={businessRef}
                                    label="사업자등록번호 (10자리 숫자)"
                                    type="text"
                                    value={businessNumber}
                                    onChange={(e) => {
                                        setBusinessNumber(e.target.value.replace(/[^0-9]/g, ''));
                                        setIsBusinessVerified(false);
                                    }}
                                    maxLength={10}
                                    required
                                    disabled={isBusinessVerified}
                                />
                            </div>
                            <Button
                                type="button"
                                onClick={handleVerifyBusiness}
                                disabled={isBusinessVerified || verifying || businessNumber.length !== 10}
                                className={isBusinessVerified ? "bg-slate-400 cursor-not-allowed" : "bg-slate-600 hover:bg-slate-700"}
                            >
                                {verifying ? '확인 중...' : isBusinessVerified ? '인증됨' : '진위확인'}
                            </Button>
                        </div>
                        <p className="text-xs text-gray-500">
                            * 가입 시 국세청(공공데이터포털) 진위확인을 거칩니다.
                        </p>
                    </div>
                )}

                <div className="mt-6 p-4 border rounded-md space-y-3 bg-gray-50 text-sm">
                    <label className="flex items-center space-x-2 cursor-pointer font-medium text-gray-700">
                        <input
                            type="checkbox"
                            checked={termsRequired && termsOptional}
                            onChange={(e) => {
                                setTermsRequired(e.target.checked);
                                setTermsOptional(e.target.checked);
                            }}
                            className="w-4 h-4 text-teal-600 rounded border-gray-300 focus:ring-teal-500"
                        />
                        <span>전체 약관에 동의합니다.</span>
                    </label>
                    <hr className="border-gray-200" />
                    <label className="flex items-center space-x-2 cursor-pointer text-gray-600">
                        <input
                            ref={termsRef}
                            type="checkbox"
                            checked={termsRequired}
                            onChange={(e) => setTermsRequired(e.target.checked)}
                            className="w-4 h-4 text-teal-600 rounded border-gray-300 focus:ring-teal-500"
                        />
                        <span>[필수] 서비스 이용약관 및 개인정보 처리방침 동의</span>
                    </label>
                    <label className="flex items-center space-x-2 cursor-pointer text-gray-600">
                        <input
                            type="checkbox"
                            checked={termsOptional}
                            onChange={(e) => setTermsOptional(e.target.checked)}
                            className="w-4 h-4 text-teal-600 rounded border-gray-300 focus:ring-teal-500"
                        />
                        <span>[선택] 혜택 및 이벤트 알림 수신 동의</span>
                    </label>
                </div>

                <div className="flex justify-center my-4">
                    <Turnstile
                        siteKey="1x00000000000000000000AA"
                        onSuccess={(token) => setTurnstileToken(token)}
                    />
                </div>

                <Button type="submit" className="w-full mt-4">
                    {activeTab === 'COMPANY_ADMIN' ? '기업 관리자 가입하기' : '기업 회원 가입하기'}
                </Button>
            </form>

            <div className="mt-6 text-center text-sm text-gray-600">
                이미 계정이 있으신가요?{' '}
                <Link to="/login" className="text-blue-600 hover:text-blue-800">
                    로그인
                </Link>
            </div>
        </div>
    );
};

export default SignupPage;
