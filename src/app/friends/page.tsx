"use client"

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { FaSearch, FaUserPlus } from 'react-icons/fa';
import Topbar from '@/components/Topbar';

const Friends = () => {
    const router = useRouter();
    const [friends, setFriends] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [error, setError] = useState('');

    useEffect(() => {
        fetchFriends();
    }, []);

    const fetchFriends = async () => {
        try {
            const response = await axios.get('/api/get-friends');
            setFriends(response.data);
        } catch (error) {
            setError('友達リストの取得に失敗しました');
            console.error('Error fetching friends:', error);
        }
    };

    const filteredFriends = friends.filter(friend =>
        friend.username.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="min-h-screen h-full bg-gray-100">
            <Topbar />
            <div className="container mx-auto px-4 py-8">
                <h1 className="text-3xl font-bold mb-6 text-gray-800">友達リスト</h1>
                <div className="mb-6 flex items-center">
                    <div className="relative flex-grow">
                        <input
                            type="text"
                            placeholder="友達を検索"
                            className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                        <FaSearch className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    </div>
                    <button
                        onClick={() => router.push('/add-friend')}
                        className="ml-4 px-4 py-2 bg-blue-500 text-white rounded-lg flex items-center hover:bg-blue-600 transition duration-300"
                    >
                        <FaUserPlus className="mr-2" />
                        友達を追加
                    </button>
                </div>
                {error && <p className="text-red-500 mb-4">{error}</p>}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredFriends.map((friend) => (
                        <div
                            key={friend.id}
                            className="bg-white rounded-lg shadow-md p-6 cursor-pointer hover:shadow-lg transition duration-300"
                            onClick={() => router.push(`/friend/${friend.id}`)}
                        >
                            <img
                                src={`https://placehold.co/100x100?text=${friend.username[0]}`}
                                alt={friend.username}
                                className="w-20 h-20 rounded-full mx-auto mb-4"
                            />
                            <h2 className="text-xl font-semibold text-center text-gray-800">{friend.username}</h2>
                        </div>
                    ))}
                </div>
                {filteredFriends.length === 0 && (
                    <p className="text-center text-gray-500 mt-8">友達が見つかりません</p>
                )}
            </div>
        </div>
    );
};

export default Friends;