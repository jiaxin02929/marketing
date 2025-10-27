// src/pages/MemberCenter.jsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useLocation } from 'react-router-dom';
import OrderHistory from '../components/OrderHistory';
import ProfileEdit from '../components/ProfileEdit';
import PasswordChange from '../components/PasswordChange';

const MemberCenter = () => {
    const { user, isAuthenticated } = useAuth();
    const location = useLocation();
    const [activeTab, setActiveTab] = useState('orders');

    // 檢查 URL 參數來設定初始標籤
    useEffect(() => {
        const searchParams = new URLSearchParams(location.search);
        const tab = searchParams.get('tab');
        if (tab && ['orders', 'profile', 'password'].includes(tab)) {
            setActiveTab(tab);
        }
    }, [location]);

    // 如果用戶未登入，重定向到登入頁面
    useEffect(() => {
        console.log('MemberCenter - checking authentication');
        console.log('isAuthenticated:', isAuthenticated);
        console.log('user:', user);
        if (!isAuthenticated) {
            console.log('User not authenticated, redirecting to /account');
            window.location.href = '/account';
        }
    }, [isAuthenticated]);

    if (!isAuthenticated || !user) {
        return (
            <div className="container mx-auto px-4 py-16 text-center">
                <h2 className="text-2xl font-bold text-gray-800 mb-4">請先登入會員</h2>
                <p className="text-gray-600">您需要登入才能查看會員中心</p>
            </div>
        );
    }

    const tabs = [
        { id: 'orders', name: '訂單紀錄', icon: '📋' },
        { id: 'profile', name: '個人資料', icon: '👤' },
        { id: 'password', name: '密碼變更', icon: '🔐' }
    ];

    const renderTabContent = () => {
        switch (activeTab) {
            case 'orders':
                return <OrderHistory />;
            case 'profile':
                return <ProfileEdit />;
            case 'password':
                return <PasswordChange />;
            default:
                return <OrderHistory />;
        }
    };

    return (
        <div className="bg-gray-50 min-h-screen">
            <div className="container mx-auto px-4 py-8">
                {/* 會員歡迎區塊 */}
                <div className="bg-white rounded-lg shadow-md p-6 mb-8">
                    <div className="flex items-center">
                        <div className="bg-blue-100 p-3 rounded-full mr-4">
                            <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-gray-800">會員中心</h1>
                            <p className="text-gray-600">歡迎回來，{user.username || user.email}</p>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                    {/* 側邊欄選單 */}
                    <div className="lg:col-span-1">
                        <div className="bg-white rounded-lg shadow-md overflow-hidden">
                            <div className="bg-blue-600 text-white p-4">
                                <h2 className="font-bold text-lg">功能選單</h2>
                            </div>
                            <nav className="p-0">
                                {tabs.map((tab) => (
                                    <button
                                        key={tab.id}
                                        onClick={() => setActiveTab(tab.id)}
                                        className={`w-full text-left px-6 py-4 border-b border-gray-100 hover:bg-gray-50 transition-colors duration-200 flex items-center ${
                                            activeTab === tab.id 
                                                ? 'bg-blue-50 text-blue-600 border-r-4 border-blue-600' 
                                                : 'text-gray-700'
                                        }`}
                                    >
                                        <span className="mr-3 text-xl">{tab.icon}</span>
                                        <span className="font-medium">{tab.name}</span>
                                    </button>
                                ))}
                            </nav>
                        </div>

                        {/* 會員資訊卡片 */}
                        <div className="bg-white rounded-lg shadow-md p-6 mt-6">
                            <h3 className="font-bold text-gray-800 mb-4">會員資訊</h3>
                            <div className="space-y-2 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-gray-600">會員等級</span>
                                    <span className="font-medium text-gray-800">一般會員</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600">註冊時間</span>
                                    <span className="font-medium text-gray-800">
                                        {user.createdAt ? new Date(user.createdAt).toLocaleDateString('zh-TW') : '---'}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* 主要內容區域 */}
                    <div className="lg:col-span-3">
                        <div className="bg-white rounded-lg shadow-md">
                            {/* 內容標題 */}
                            <div className="border-b border-gray-200 p-6">
                                <h2 className="text-xl font-bold text-gray-800 flex items-center">
                                    <span className="mr-2 text-2xl">
                                        {tabs.find(tab => tab.id === activeTab)?.icon}
                                    </span>
                                    {tabs.find(tab => tab.id === activeTab)?.name}
                                </h2>
                            </div>

                            {/* 動態內容 */}
                            <div className="p-6">
                                {renderTabContent()}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MemberCenter;