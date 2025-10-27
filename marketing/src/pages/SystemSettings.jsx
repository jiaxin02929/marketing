// src/pages/SystemSettings.jsx
import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';

const SystemSettings = () => {
    const { user, isAdmin } = useAuth();
    const [settings, setSettings] = useState({
        siteName: '珍珠首飾購物網',
        siteDescription: '專業的珍珠首飾購物平台',
        currency: 'TWD',
        taxRate: 5,
        shippingFee: 100,
        freeShippingThreshold: 1000,
        enableEmailNotifications: true,
        enableSMSNotifications: false,
        maintenanceMode: false
    });

    // 檢查權限
    if (!user || !isAdmin()) {
        return (
            <div className="container mx-auto px-4 py-8">
                <div className="text-center">
                    <h1 className="text-2xl font-bold text-red-600 mb-4">權限不足</h1>
                    <p className="text-gray-600">您需要管理員權限才能訪問此頁面</p>
                </div>
            </div>
        );
    }

    const handleSettingChange = (key, value) => {
        setSettings(prev => ({
            ...prev,
            [key]: value
        }));
    };

    const handleSave = () => {
        // 這裡可以實現保存功能到後端
        alert('系統設定已保存（示範功能）');
    };

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="bg-white rounded-lg shadow-md">
                {/* 標題 */}
                <div className="p-6 border-b border-gray-200">
                    <h1 className="text-2xl font-bold text-gray-800 mb-2">系統設定</h1>
                    <p className="text-gray-600">管理系統的基本參數和配置</p>
                </div>

                <div className="p-6 space-y-8">
                    {/* 基本設定 */}
                    <div className="bg-gray-50 rounded-lg p-6">
                        <h2 className="text-lg font-semibold text-gray-800 mb-4">基本設定</h2>
                        <div className="grid md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    網站名稱
                                </label>
                                <input
                                    type="text"
                                    value={settings.siteName}
                                    onChange={(e) => handleSettingChange('siteName', e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    貨幣單位
                                </label>
                                <select
                                    value={settings.currency}
                                    onChange={(e) => handleSettingChange('currency', e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                    <option value="TWD">台幣 (TWD)</option>
                                    <option value="USD">美元 (USD)</option>
                                    <option value="HKD">港幣 (HKD)</option>
                                </select>
                            </div>
                        </div>
                        <div className="mt-4">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                網站描述
                            </label>
                            <textarea
                                value={settings.siteDescription}
                                onChange={(e) => handleSettingChange('siteDescription', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                rows="3"
                            />
                        </div>
                    </div>

                    {/* 商業設定 */}
                    <div className="bg-blue-50 rounded-lg p-6">
                        <h2 className="text-lg font-semibold text-gray-800 mb-4">商業設定</h2>
                        <div className="grid md:grid-cols-3 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    稅率 (%)
                                </label>
                                <input
                                    type="number"
                                    value={settings.taxRate}
                                    onChange={(e) => handleSettingChange('taxRate', parseFloat(e.target.value))}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    min="0"
                                    max="100"
                                    step="0.1"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    運費 (元)
                                </label>
                                <input
                                    type="number"
                                    value={settings.shippingFee}
                                    onChange={(e) => handleSettingChange('shippingFee', parseInt(e.target.value))}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    min="0"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    免運費門檻 (元)
                                </label>
                                <input
                                    type="number"
                                    value={settings.freeShippingThreshold}
                                    onChange={(e) => handleSettingChange('freeShippingThreshold', parseInt(e.target.value))}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    min="0"
                                />
                            </div>
                        </div>
                    </div>

                    {/* 通知設定 */}
                    <div className="bg-green-50 rounded-lg p-6">
                        <h2 className="text-lg font-semibold text-gray-800 mb-4">通知設定</h2>
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h3 className="text-sm font-medium text-gray-700">電子郵件通知</h3>
                                    <p className="text-sm text-gray-500">啟用訂單和系統相關的電子郵件通知</p>
                                </div>
                                <button
                                    onClick={() => handleSettingChange('enableEmailNotifications', !settings.enableEmailNotifications)}
                                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                                        settings.enableEmailNotifications ? 'bg-blue-600' : 'bg-gray-300'
                                    }`}
                                >
                                    <span
                                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                                            settings.enableEmailNotifications ? 'translate-x-6' : 'translate-x-1'
                                        }`}
                                    />
                                </button>
                            </div>
                            <div className="flex items-center justify-between">
                                <div>
                                    <h3 className="text-sm font-medium text-gray-700">簡訊通知</h3>
                                    <p className="text-sm text-gray-500">啟用簡訊通知功能</p>
                                </div>
                                <button
                                    onClick={() => handleSettingChange('enableSMSNotifications', !settings.enableSMSNotifications)}
                                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                                        settings.enableSMSNotifications ? 'bg-blue-600' : 'bg-gray-300'
                                    }`}
                                >
                                    <span
                                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                                            settings.enableSMSNotifications ? 'translate-x-6' : 'translate-x-1'
                                        }`}
                                    />
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* 系統狀態 */}
                    <div className="bg-yellow-50 rounded-lg p-6">
                        <h2 className="text-lg font-semibold text-gray-800 mb-4">系統狀態</h2>
                        <div className="flex items-center justify-between">
                            <div>
                                <h3 className="text-sm font-medium text-gray-700">維護模式</h3>
                                <p className="text-sm text-gray-500">
                                    啟用後，網站將顯示維護頁面，僅管理員可正常訪問
                                </p>
                            </div>
                            <button
                                onClick={() => handleSettingChange('maintenanceMode', !settings.maintenanceMode)}
                                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-yellow-500 ${
                                    settings.maintenanceMode ? 'bg-yellow-500' : 'bg-gray-300'
                                }`}
                            >
                                <span
                                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                                        settings.maintenanceMode ? 'translate-x-6' : 'translate-x-1'
                                    }`}
                                />
                            </button>
                        </div>
                    </div>

                    {/* 操作按鈕 */}
                    <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
                        <button
                            onClick={() => window.location.reload()}
                            className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            重置
                        </button>
                        <button
                            onClick={handleSave}
                            className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            保存設定
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SystemSettings;