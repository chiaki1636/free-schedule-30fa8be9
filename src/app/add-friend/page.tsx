"use client"

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/supabase';
import Topbar from '@/components/Topbar';
import { FaSearch, FaUserPlus } from 'react-icons/fa';

const AddFriend = () => {
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [selectedUser, setSelectedUser] = useState(null);
    const [message, setMessage] = useState('');
    const router = useRouter();
    const supabase = createClient();

    useEffect(() => {
        if (searchQuery.length > 2) {
            searchUsers();
        } else {
            setSearchResults([]);
        }
    }, [searchQuery]);

    const searchUsers = async () => {
        try {
            const { data, error } = await supabase
                .from('users')
                .select('id, username, email')
                .or(`username.ilike.%${searchQuery}%,email.ilike.%${searchQuery}%`)
                .limit(10);

            if (error) throw error;
            setSearchResults(data);
        } catch (error) {
            setMessage(`エラーが発生しました：${error.message}`);
        }
    };

    const sendFriendRequest = async () => {
        if (!selectedUser) return;

        try {
            const { data: { user } } = await supabase.auth.getUser();
            const { error } = await supabase
                .from('friends')
                .insert({
                    user_id: user.id,
                    friend_id: selectedUser.id,
                    status: 'pending'
                });

            if (error) throw error;
            setMessage('友達リクエストを送信しました');
            setTimeout(() => router.push('/friend-list'), 2000);
        } catch (error) {
            setMessage(`エラーが発生しました：${error.message}`);
        }
    };

    return (
        <div className="min-h-screen h-full bg-gray-100">
            <Topbar />
            <div className="container mx-auto px-4 py-8">
                <h1 className="text-3xl font-bold mb-6 text-gray-800">友達追加</h1>
                <div className="bg-white rounded-lg shadow-md p-6">
                    <div className="mb-4">
                        <div className="relative">
                            <input
                                type="text"
                                placeholder="ユーザー名またはメールアドレスを入力"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                            <FaSearch className="absolute right-3 top-3 text-gray-400" />
                        </div>
                    </div>
                    <ul className="divide-y divide-gray-200">
                        {searchResults.map((user) => (
                            <li
                                key={user.id}
                                className={`py-3 cursor-pointer hover:bg-gray-50 ${selectedUser?.id === user.id ? 'bg-blue-100' : ''}`}
                                onClick={() => setSelectedUser(user)}
                            >
                                <p className="font-semibold">{user.username}</p>
                                <p className="text-sm text-gray-600">{user.email}</p>
                            </li>
                        ))}
                    </ul>
                    {selectedUser && (
                        <button
                            onClick={sendFriendRequest}
                            className="mt-4 w-full bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 flex items-center justify-center"
                        >
                            <FaUserPlus className="mr-2" />
                            友達リクエスト送信
                        </button>
                    )}
                    {message && (
                        <p className="mt-4 text-center text-sm font-semibold text-green-600">{message}</p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AddFriend;