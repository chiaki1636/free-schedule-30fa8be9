"use client"

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import Topbar from '@/components/Topbar';
import { FiClock, FiCalendar, FiCheck, FiTrash2, FiX } from 'react-icons/fi';

export default function EditSchedule({ params }: { params: { scheduleId: string } }) {
    const router = useRouter();
    const supabase = createClientComponentClient();
    const [startTime, setStartTime] = useState('');
    const [endTime, setEndTime] = useState('');
    const [isFreeTime, setIsFreeTime] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchSchedule = async () => {
            const { data, error } = await supabase
                .from('schedules')
                .select('*')
                .eq('id', params.scheduleId)
                .single();

            if (error) {
                setError('スケジュールの取得に失敗しました');
            } else if (data) {
                setStartTime(data.start_time);
                setEndTime(data.end_time);
                setIsFreeTime(data.is_free_time);
            }
        };

        fetchSchedule();
    }, [params.scheduleId]);

    const handleUpdate = async () => {
        const { data, error } = await supabase
            .from('schedules')
            .update({
                start_time: startTime,
                end_time: endTime,
                is_free_time: isFreeTime,
                updated_at: new Date().toISOString()
            })
            .eq('id', params.scheduleId);

        if (error) {
            setError('スケジュールの更新に失敗しました');
        } else {
            router.push('/');
        }
    };

    const handleDelete = async () => {
        const { error } = await supabase
            .from('schedules')
            .delete()
            .eq('id', params.scheduleId);

        if (error) {
            setError('スケジュールの削除に失敗しました');
        } else {
            router.push('/');
        }
    };

    return (
        <div className="min-h-screen h-full bg-gray-100">
            <Topbar />
            <div className="container mx-auto px-4 py-8">
                <h1 className="text-3xl font-bold mb-8 text-gray-800">予定編集</h1>
                {error && (
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4" role="alert">
                        <p>{error}</p>
                    </div>
                )}
                <div className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4">
                    <div className="mb-4">
                        <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="startTime">
                            開始時間
                        </label>
                        <div className="flex items-center">
                            <FiClock className="text-gray-500 mr-2" />
                            <input
                                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                                id="startTime"
                                type="datetime-local"
                                value={startTime}
                                onChange={(e) => setStartTime(e.target.value)}
                            />
                        </div>
                    </div>
                    <div className="mb-4">
                        <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="endTime">
                            終了時間
                        </label>
                        <div className="flex items-center">
                            <FiCalendar className="text-gray-500 mr-2" />
                            <input
                                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                                id="endTime"
                                type="datetime-local"
                                value={endTime}
                                onChange={(e) => setEndTime(e.target.value)}
                            />
                        </div>
                    </div>
                    <div className="mb-4">
                        <label className="flex items-center">
                            <input
                                type="checkbox"
                                checked={isFreeTime}
                                onChange={(e) => setIsFreeTime(e.target.checked)}
                                className="form-checkbox h-5 w-5 text-blue-600"
                            />
                            <span className="ml-2 text-gray-700">暇な時間</span>
                        </label>
                    </div>
                    <div className="flex items-center justify-between">
                        <button
                            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline flex items-center"
                            onClick={handleUpdate}
                        >
                            <FiCheck className="mr-2" />
                            更新
                        </button>
                        <button
                            className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline flex items-center"
                            onClick={handleDelete}
                        >
                            <FiTrash2 className="mr-2" />
                            削除
                        </button>
                        <button
                            className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline flex items-center"
                            onClick={() => router.back()}
                        >
                            <FiX className="mr-2" />
                            キャンセル
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}