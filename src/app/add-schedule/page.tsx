"use client"

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Topbar from '@/components/Topbar';
import { supabase } from '@/supabase';
import { FiCalendar, FiClock, FiCheck, FiSave, FiX } from 'react-icons/fi';

const AddSchedule = () => {
    const router = useRouter();
    const [startTime, setStartTime] = useState('');
    const [endTime, setEndTime] = useState('');
    const [isFreeTime, setIsFreeTime] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (!startTime || !endTime) {
            setError('開始時間と終了時間を入力してください');
            return;
        }

        if (new Date(endTime) <= new Date(startTime)) {
            setError('終了時間は開始時間より後に設定してください');
            return;
        }

        try {
            const { data, error } = await supabase
                .from('schedules')
                .insert([
                    {
                        start_time: startTime,
                        end_time: endTime,
                        is_free_time: isFreeTime,
                    },
                ])
                .select();

            if (error) throw error;

            router.push('/');
        } catch (error) {
            setError('スケジュールの保存に失敗しました。もう一度お試しください。');
        }
    };

    return (
        <div className="min-h-screen h-full bg-gray-100">
            <Topbar />
            <div className="container mx-auto px-4 py-8">
                <h1 className="text-3xl font-bold mb-8 text-center text-gray-800">新しい予定を追加</h1>
                <form onSubmit={handleSubmit} className="max-w-md mx-auto bg-white p-6 rounded-lg shadow-md">
                    <div className="mb-4">
                        <label htmlFor="startTime" className="block text-gray-700 font-bold mb-2">
                            <FiCalendar className="inline-block mr-2" />
                            開始時間
                        </label>
                        <input
                            type="datetime-local"
                            id="startTime"
                            value={startTime}
                            onChange={(e) => setStartTime(e.target.value)}
                            className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                    <div className="mb-4">
                        <label htmlFor="endTime" className="block text-gray-700 font-bold mb-2">
                            <FiClock className="inline-block mr-2" />
                            終了時間
                        </label>
                        <input
                            type="datetime-local"
                            id="endTime"
                            value={endTime}
                            onChange={(e) => setEndTime(e.target.value)}
                            className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                    <div className="mb-6">
                        <label className="flex items-center text-gray-700 font-bold">
                            <input
                                type="checkbox"
                                checked={isFreeTime}
                                onChange={(e) => setIsFreeTime(e.target.checked)}
                                className="mr-2"
                            />
                            <FiCheck className="inline-block mr-2" />
                            暇な時間
                        </label>
                    </div>
                    {error && <p className="text-red-500 mb-4">{error}</p>}
                    <div className="flex justify-between">
                        <button
                            type="submit"
                            className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline flex items-center"
                        >
                            <FiSave className="mr-2" />
                            保存
                        </button>
                        <button
                            type="button"
                            onClick={() => router.push('/')}
                            className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline flex items-center"
                        >
                            <FiX className="mr-2" />
                            キャンセル
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AddSchedule;