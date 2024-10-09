"use client"

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Topbar from '@/components/Topbar';
import { createClient } from '@/supabase';
import { FiCopy } from 'react-icons/fi';

const GenerateShareLink = () => {
    const [expirationDate, setExpirationDate] = useState('');
    const [generatedLink, setGeneratedLink] = useState('');
    const [error, setError] = useState('');
    const router = useRouter();
    const supabase = createClient();

    const generateLink = async () => {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                setError('ユーザーが認証されていません');
                return;
            }

            const response = await fetch('/api/generate-share-link', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ expirationDate }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'リンクの生成に失敗しました');
            }

            const data = await response.json();
            setGeneratedLink(data.link);
            setError('');
        } catch (err) {
            setError(err.message);
        }
    };

    const copyToClipboard = () => {
        navigator.clipboard.writeText(generatedLink);
        alert('リンクがクリップボードにコピーされました');
    };

    return (
        <div className="min-h-screen h-full bg-gray-100">
            <Topbar />
            <div className="container mx-auto px-4 py-8">
                <h1 className="text-3xl font-bold mb-6 text-gray-800">スケジュール共有リンク生成</h1>
                <div className="bg-white rounded-lg shadow-md p-6">
                    <div className="mb-4">
                        <label htmlFor="expirationDate" className="block text-sm font-medium text-gray-700 mb-2">
                            有効期限
                        </label>
                        <input
                            type="date"
                            id="expirationDate"
                            value={expirationDate}
                            onChange={(e) => setExpirationDate(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                    <button
                        onClick={generateLink}
                        className="w-full bg-blue-600 text-white font-bold py-2 px-4 rounded-md hover:bg-blue-700 transition duration-300"
                    >
                        リンクを生成
                    </button>
                    {error && <p className="text-red-500 mt-4">{error}</p>}
                    {generatedLink && (
                        <div className="mt-6">
                            <h2 className="text-xl font-semibold mb-2">生成されたリンク</h2>
                            <div className="flex items-center">
                                <input
                                    type="text"
                                    value={generatedLink}
                                    readOnly
                                    className="flex-grow px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                                <button
                                    onClick={copyToClipboard}
                                    className="ml-2 bg-gray-200 text-gray-700 font-bold py-2 px-4 rounded-md hover:bg-gray-300 transition duration-300 flex items-center"
                                >
                                    <FiCopy className="mr-2" />
                                    コピー
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default GenerateShareLink;