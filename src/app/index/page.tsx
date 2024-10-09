"use client"

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import Topbar from '@/components/Topbar';
import { FaPlus } from 'react-icons/fa';

const Home = () => {
    const router = useRouter();
    const [schedules, setSchedules] = useState([]);
    const [friendSchedules, setFriendSchedules] = useState([]);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchSchedules();
        fetchFriendSchedules();
    }, []);

    const fetchSchedules = async () => {
        try {
            const response = await axios.get('/api/get-schedules');
            setSchedules(response.data);
        } catch (error) {
            setError('スケジュールの取得に失敗しました');
            console.error('スケジュール取得エラー:', error);
        }
    };

    const fetchFriendSchedules = async () => {
        try {
            // フレンドのスケジュール取得APIがない場合はダミーデータを使用
            const dummyData = [
                { id: '3', username: '友達1', start_time: '2023-06-03T13:00:00', end_time: '2023-06-03T14:00:00' },
                { id: '4', username: '友達2', start_time: '2023-06-04T16:00:00', end_time: '2023-06-04T17:00:00' },
            ];
            setFriendSchedules(dummyData);
        } catch (error) {
            console.error('フレンドスケジュール取得エラー:', error);
        }
    };

    const handleAddSchedule = () => {
        router.push('/add-schedule');
    };

    return (
        <div className="min-h-screen h-full bg-gray-100">
            <Topbar />
            <div className="container mx-auto p-4">
                <h1 className="text-3xl font-bold mb-6 text-gray-800">ホーム画面</h1>

                {error && <p className="text-red-500 mb-4">{error}</p>}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-white rounded-lg shadow p-6">
                        <h2 className="text-2xl font-semibold mb-4 text-gray-700">あなたの予定</h2>
                        <ul>
                            {schedules.map((schedule) => (
                                <li key={schedule.id} className="mb-2 p-2 bg-gray-50 rounded">
                                    <p className="font-medium">{schedule.title}</p>
                                    <p className="text-sm text-gray-600">
                                        {new Date(schedule.start_time).toLocaleString()} - {new Date(schedule.end_time).toLocaleString()}
                                    </p>
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div className="bg-white rounded-lg shadow p-6">
                        <h2 className="text-2xl font-semibold mb-4 text-gray-700">友達の暇な時間</h2>
                        <ul>
                            {friendSchedules.map((schedule) => (
                                <li key={schedule.id} className="mb-2 p-2 bg-gray-50 rounded">
                                    <p className="font-medium">{schedule.username}</p>
                                    <p className="text-sm text-gray-600">
                                        {new Date(schedule.start_time).toLocaleString()} - {new Date(schedule.end_time).toLocaleString()}
                                    </p>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>

                <button
                    onClick={handleAddSchedule}
                    className="fixed bottom-6 right-6 bg-blue-500 text-white p-4 rounded-full shadow-lg hover:bg-blue-600 transition duration-300"
                >
                    <FaPlus size={24} />
                </button>
            </div>
        </div>
    );
};

export default Home;