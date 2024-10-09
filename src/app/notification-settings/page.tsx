"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { Switch, Select, Button, message } from 'antd';
import { IoMail, IoBell } from 'react-icons/io5';
import Topbar from '@/components/Topbar';

const { Option } = Select;

const NotificationSettings = () => {
    const [emailNotification, setEmailNotification] = useState(false);
    const [pushNotification, setPushNotification] = useState(false);
    const [frequency, setFrequency] = useState('daily');
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleSave = async () => {
        setLoading(true);
        try {
            const response = await axios.post('/api/update-notification-settings', {
                emailNotification,
                pushNotification,
                frequency
            });
            if (response.data.success) {
                message.success('設定が保存されました。');
            } else {
                throw new Error('API error');
            }
        } catch (error) {
            console.error('Error saving settings:', error);
            message.error('設定の保存に失敗しました。');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen h-full bg-gray-100">
            <Topbar />
            <div className="max-w-2xl mx-auto mt-10 p-6 bg-white rounded-lg shadow-md">
                <h1 className="text-2xl font-bold mb-6 text-gray-800">通知設定</h1>
                <div className="space-y-6">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                            <IoMail className="text-blue-500 text-xl" />
                            <span className="text-lg">メール通知</span>
                        </div>
                        <Switch
                            checked={emailNotification}
                            onChange={setEmailNotification}
                            aria-label="メール通知"
                        />
                    </div>
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                            <IoBell className="text-blue-500 text-xl" />
                            <span className="text-lg">プッシュ通知</span>
                        </div>
                        <Switch
                            checked={pushNotification}
                            onChange={setPushNotification}
                            aria-label="プッシュ通知"
                        />
                    </div>
                    <div>
                        <label htmlFor="frequency" className="block text-lg mb-2">通知頻度</label>
                        <Select
                            id="frequency"
                            value={frequency}
                            onChange={setFrequency}
                            style={{ width: '100%' }}
                            aria-label="通知頻度"
                        >
                            <Option value="daily">毎日</Option>
                            <Option value="weekly">毎週</Option>
                            <Option value="monthly">毎月</Option>
                        </Select>
                    </div>
                    <Button
                        type="primary"
                        onClick={handleSave}
                        loading={loading}
                        className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded"
                    >
                        保存
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default NotificationSettings;