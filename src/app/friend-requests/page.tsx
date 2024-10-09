"use client"

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Topbar from '@/components/Topbar';
import { FaCheck, FaTimes } from 'react-icons/fa';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

const FriendRequests = () => {
  const [friendRequests, setFriendRequests] = useState([]);
  const [error, setError] = useState('');
  const router = useRouter();
  const supabase = createClientComponentClient();

  useEffect(() => {
    fetchFriendRequests();
  }, []);

  const fetchFriendRequests = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('ユーザーが見つかりません');

      const { data, error } = await supabase
        .from('friends')
        .select('id, users!friends_friend_id_fkey(id, username)')
        .eq('user_id', user.id)
        .eq('status', 'pending');

      if (error) throw error;
      setFriendRequests(data);
    } catch (error) {
      console.error('友達リクエストの取得に失敗しました', error);
      setError('友達リクエストの取得に失敗しました');
    }
  };

  const handleApprove = async (requestId) => {
    try {
      const { error } = await supabase
        .from('friends')
        .update({ status: 'approved' })
        .eq('id', requestId);

      if (error) throw error;
      fetchFriendRequests();
    } catch (error) {
      console.error('友達リクエストの承認に失敗しました', error);
      setError('友達リクエストの承認に失敗しました');
    }
  };

  const handleReject = async (requestId) => {
    try {
      const { error } = await supabase
        .from('friends')
        .delete()
        .eq('id', requestId);

      if (error) throw error;
      fetchFriendRequests();
    } catch (error) {
      console.error('友達リクエストの拒否に失敗しました', error);
      setError('友達リクエストの拒否に失敗しました');
    }
  };

  return (
    <div className="min-h-screen h-full bg-gray-100">
      <Topbar />
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6 text-gray-800">友達リクエスト</h1>
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}
        {friendRequests.length === 0 ? (
          <p className="text-gray-600">友達リクエストはありません</p>
        ) : (
          <ul className="space-y-4">
            {friendRequests.map((request) => (
              <li key={request.id} className="bg-white shadow-md rounded-lg p-4 flex items-center justify-between">
                <span className="text-lg font-medium text-gray-700">{request.users.username}</span>
                <div className="space-x-2">
                  <button
                    onClick={() => handleApprove(request.id)}
                    className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded inline-flex items-center"
                  >
                    <FaCheck className="mr-2" />
                    承認
                  </button>
                  <button
                    onClick={() => handleReject(request.id)}
                    className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded inline-flex items-center"
                  >
                    <FaTimes className="mr-2" />
                    拒否
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default FriendRequests;