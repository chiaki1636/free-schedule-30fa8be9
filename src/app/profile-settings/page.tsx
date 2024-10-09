"use client"

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/supabase';
import Topbar from '@/components/Topbar';
import { FiUser, FiMail, FiLock, FiSave } from 'react-icons/fi';

const ProfileSettings = () => {
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [message, setMessage] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();
    const supabase = createClient();

    useEffect(() => {
        const fetchUserProfile = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                const { data, error } = await supabase
                    .from('users')
                    .select('username, email')
                    .eq('id', user.id)
                    .single();
                if (data) {
                    setUsername(data.username);
                    setEmail(data.email);
                }
            }
        };
        fetchUserProfile();
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setMessage('');

        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
            setMessage('ユーザーが見つかりません。');
            setIsLoading(false);
            return;
        }

        const updates = {
            id: user.id,
            username,
            email,
            updated_at: new Date(),
        };

        const { error } = await supabase.from('users').upsert(updates);

        if (error) {
            setMessage('プロフィールの更新に失敗しました');
        } else {
            setMessage('プロフィールが更新されました');
            if (password) {
                const { error: passwordError } = await supabase.auth.updateUser({ password });
                if (passwordError) {
                    setMessage('パスワードの更新に失敗しました');
                } else {
                    setMessage('プロフィールとパスワードが更新されました');
                }
            }
        }

        setIsLoading(false);
    };

    return (
        <div className="min-h-screen h-full bg-gray-100">
            <Topbar />
            <div className="container mx-auto px-4 py-8">
                <h1 className="text-3xl font-bold mb-8 text-center">プロフィール設定</h1>
                <form onSubmit={handleSubmit} className="max-w-md mx-auto bg-white p-8 rounded-lg shadow-md">
                    <div className="mb-4">
                        <label htmlFor="username" className="block text-gray-700 font-bold mb-2">
                            ユーザー名
                        </label>
                        <div className="relative">
                            <span className="absolute inset-y-0 left-0 flex items-center pl-3">
                                <FiUser className="text-gray-500" />
                            </span>
                            <input
                                type="text"
                                id="username"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                className="w-full pl-10 pr-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:border-blue-500"
                                required
                            />
                        </div>
                    </div>
                    <div className="mb-4">
                        <label htmlFor="email" className="block text-gray-700 font-bold mb-2">
                            メールアドレス
                        </label>
                        <div className="relative">
                            <span className="absolute inset-y-0 left-0 flex items-center pl-3">
                                <FiMail className="text-gray-500" />
                            </span>
                            <input
                                type="email"
                                id="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full pl-10 pr-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:border-blue-500"
                                required
                            />
                        </div>
                    </div>
                    <div className="mb-6">
                        <label htmlFor="password" className="block text-gray-700 font-bold mb-2">
                            新しいパスワード
                        </label>
                        <div className="relative">
                            <span className="absolute inset-y-0 left-0 flex items-center pl-3">
                                <FiLock className="text-gray-500" />
                            </span>
                            <input
                                type="password"
                                id="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full pl-10 pr-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:border-blue-500"
                            />
                        </div>
                    </div>
                    <button
                        type="submit"
                        className="w-full bg-blue-500 text-white font-bold py-2 px-4 rounded-lg hover:bg-blue-600 focus:outline-none focus:shadow-outline flex items-center justify-center"
                        disabled={isLoading}
                    >
                        {isLoading ? (
                            <span className="spinner"></span>
                        ) : (
                            <>
                                <FiSave className="mr-2" />
                                保存
                            </>
                        )}
                    </button>
                </form>
                {message && (
                    <p className={`mt-4 text-center ${message.includes('失敗') ? 'text-red-500' : 'text-green-500'}`}>
                        {message}
                    </p>
                )}
            </div>
        </div>
    );
};

export default ProfileSettings;