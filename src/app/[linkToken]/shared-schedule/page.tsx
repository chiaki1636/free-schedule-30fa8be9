"use client"

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Topbar from '@/components/Topbar';
import { FaArrowLeft } from 'react-icons/fa';
import { format } from 'date-fns';
import { ja } from 'date-fns/locale';

const SharedSchedule = () => {
    const router = useRouter();
    const [schedules, setSchedules] = useState([]);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchSchedules = async () => {
            try {
                const response = await fetch(`/api/get-shared-schedule?linkToken=${router.query.linkToken}`);
                if (!response.ok) {
                    throw new Error('スケジュールの取得に失敗しました');
                }
                const data = await response.json();
                setSchedules(data.schedules);
            } catch (err) {
                setError('スケジュールの取得中にエラーが発生しました。');
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchSchedules();
    }, [router.query.linkToken]);

    const formatDateTime = (dateTime) => {
        return format(new Date(dateTime), 'yyyy年M月d日 HH:mm', { locale: ja });
    };

    return (
        <div className="min-h-screen h-full bg-gray-100">
            <Topbar />
            <div className="container mx-auto px-4 py-8">
                <button
                    onClick={() => router.push('/')}
                    className="flex items-center text-blue-600 mb-4"
                >
                    <FaArrowLeft className="mr-2" />
                    戻る
                </button>
                <h1 className="text-3xl font-bold mb-6 text-gray-800">共有スケジュール</h1>
                {loading ? (
                    <p>読み込み中...</p>
                ) : error ? (
                    <p className="text-red-500">{error}</p>
                ) : (
                    <div className="bg-white shadow-md rounded-lg p-6">
                        {schedules.length > 0 ? (
                            schedules.map((schedule, index) => (
                                <div key={index} className="mb-4 p-4 border-b border-gray-200 last:border-b-0">
                                    <p className="text-lg font-semibold text-gray-700">
                                        {formatDateTime(schedule.startTime)} - {formatDateTime(schedule.endTime)}
                                    </p>
                                    <p className="text-sm text-gray-600">
                                        {schedule.isFreeTime ? '空き時間' : '予定あり'}
                                    </p>
                                </div>
                            ))
                        ) : (
                            <p>共有されているスケジュールはありません。</p>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default SharedSchedule;