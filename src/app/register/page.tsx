"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@supabase/supabase-js';
import Topbar from '@/components/Topbar';
import { FaUser, FaEnvelope, FaLock, FaEye, FaEyeSlash } from 'react-icons/fa';

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);

export default function Register() {
    const router = useRouter();
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [error, setError] = useState('');

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (!username || !email || !password || !confirmPassword) {
            setError('すべてのフィールドを入力してください。');
            return;
        }

        if (password !== confirmPassword) {
            setError('パスワードが一致しません。');
            return;
        }

        try {
            const { data, error } = await supabase.auth.signUp({
                email,
                password,
            });

            if (error) throw error;

            if (data.user) {
                await supabase.from('users').insert({
                    id: data.user.id,
                    username,
                    email,
                });
                router.push('/');
            }
        } catch (error: any) {
            setError(error.message || '登録に失敗しました。');
        }
    };

    return (
        <div className="min-h-screen h-full bg-gray-100">
            <Topbar />
            <div className="container mx-auto px-4 py-8">
                <div className="max-w-md mx-auto bg-white rounded-lg shadow-md p-8">
                    <h1 className="text-3xl font-bold text-center mb-6 text-blue-600">新規登録</h1>
                    <form onSubmit={handleRegister}>
                        <div className="mb-4">
                            <label htmlFor="username" className="block text-gray-700 text-sm font-bold mb-2">
                                ユーザー名
                            </label>
                            <div className="relative">
                                <span className="absolute inset-y-0 left-0 flex items-center pl-3">
                                    <FaUser className="text-gray-400" />
                                </span>
                                <input
                                    type="text"
                                    id="username"
                                    className="w-full pl-10 pr-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:border-blue-500"
                                    placeholder="ユーザー名"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                />
                            </div>
                        </div>
                        <div className="mb-4">
                            <label htmlFor="email" className="block text-gray-700 text-sm font-bold mb-2">
                                メールアドレス
                            </label>
                            <div className="relative">
                                <span className="absolute inset-y-0 left-0 flex items-center pl-3">
                                    <FaEnvelope className="text-gray-400" />
                                </span>
                                <input
                                    type="email"
                                    id="email"
                                    className="w-full pl-10 pr-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:border-blue-500"
                                    placeholder="メールアドレス"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                />
                            </div>
                        </div>
                        <div className="mb-4">
                            <label htmlFor="password" className="block text-gray-700 text-sm font-bold mb-2">
                                パスワード
                            </label>
                            <div className="relative">
                                <span className="absolute inset-y-0 left-0 flex items-center pl-3">
                                    <FaLock className="text-gray-400" />
                                </span>
                                <input
                                    type={showPassword ? "text" : "password"}
                                    id="password"
                                    className="w-full pl-10 pr-10 py-2 rounded-lg border border-gray-300 focus:outline-none focus:border-blue-500"
                                    placeholder="パスワード"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                />
                                <button
                                    type="button"
                                    className="absolute inset-y-0 right-0 flex items-center pr-3"
                                    onClick={() => setShowPassword(!showPassword)}
                                >
                                    {showPassword ? <FaEyeSlash className="text-gray-400" /> : <FaEye className="text-gray-400" />}
                                </button>
                            </div>
                        </div>
                        <div className="mb-6">
                            <label htmlFor="confirmPassword" className="block text-gray-700 text-sm font-bold mb-2">
                                パスワード確認
                            </label>
                            <div className="relative">
                                <span className="absolute inset-y-0 left-0 flex items-center pl-3">
                                    <FaLock className="text-gray-400" />
                                </span>
                                <input
                                    type={showConfirmPassword ? "text" : "password"}
                                    id="confirmPassword"
                                    className="w-full pl-10 pr-10 py-2 rounded-lg border border-gray-300 focus:outline-none focus:border-blue-500"
                                    placeholder="パスワード確認"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                />
                                <button
                                    type="button"
                                    className="absolute inset-y-0 right-0 flex items-center pr-3"
                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                >
                                    {showConfirmPassword ? <FaEyeSlash className="text-gray-400" /> : <FaEye className="text-gray-400" />}
                                </button>
                            </div>
                        </div>
                        {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
                        <button
                            type="submit"
                            className="w-full bg-blue-500 text-white font-bold py-2 px-4 rounded-lg hover:bg-blue-600 transition duration-300"
                        >
                            登録
                        </button>
                    </form>
                    <p className="mt-4 text-center text-sm">
                        既にアカウントをお持ちですか？{' '}
                        <Link href="/login" className="text-blue-500 hover:text-blue-600">
                            ログイン画面へ
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}