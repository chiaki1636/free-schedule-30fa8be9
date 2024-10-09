"use client"

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import Link from 'next/link';
import { FaUser, FaLock, FaSignInAlt } from 'react-icons/fa';
import Topbar from '@/components/Topbar';

const LoginPage = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const router = useRouter();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const response = await axios.post('/api/login', { username, password });
            if (response.data.token) {
                localStorage.setItem('token', response.data.token);
                router.push('/dashboard');
            }
        } catch (err) {
            setError('認証に失敗しました');
        }
    };

    return (
        <div className="min-h-screen h-full bg-gray-100">
            <Topbar />
            <div className="flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
                <div className="max-w-md w-full space-y-8">
                    <div>
                        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
                            アカウントにログイン
                        </h2>
                    </div>
                    <form className="mt-8 space-y-6" onSubmit={handleLogin}>
                        <div className="rounded-md shadow-sm -space-y-px">
                            <div>
                                <label htmlFor="username" className="sr-only">ユーザー名またはメールアドレス</label>
                                <div className="flex items-center">
                                    <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500 text-sm">
                                        <FaUser />
                                    </span>
                                    <input
                                        id="username"
                                        name="username"
                                        type="text"
                                        autoComplete="username"
                                        required
                                        className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-r-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                                        placeholder="ユーザー名またはメールアドレス"
                                        value={username}
                                        onChange={(e) => setUsername(e.target.value)}
                                    />
                                </div>
                            </div>
                            <div className="mt-4">
                                <label htmlFor="password" className="sr-only">パスワード</label>
                                <div className="flex items-center">
                                    <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500 text-sm">
                                        <FaLock />
                                    </span>
                                    <input
                                        id="password"
                                        name="password"
                                        type="password"
                                        autoComplete="current-password"
                                        required
                                        className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-r-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                                        placeholder="パスワード"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center justify-between">
                            <div className="text-sm">
                                <Link href="/forgot-password" className="font-medium text-blue-600 hover:text-blue-500">
                                    パスワードを忘れた場合
                                </Link>
                            </div>
                        </div>

                        <div>
                            <button
                                type="submit"
                                className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                            >
                                <span className="absolute left-0 inset-y-0 flex items-center pl-3">
                                    <FaSignInAlt className="h-5 w-5 text-blue-500 group-hover:text-blue-400" aria-hidden="true" />
                                </span>
                                ログイン
                            </button>
                        </div>
                    </form>
                    {error && <p className="mt-2 text-center text-sm text-red-600">{error}</p>}
                    <div className="text-center">
                        <Link href="/register" className="font-medium text-blue-600 hover:text-blue-500">
                            新規登録
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;