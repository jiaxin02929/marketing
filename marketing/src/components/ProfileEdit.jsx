// src/components/ProfileEdit.jsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';

const ProfileEdit = () => {
    const { user, updateUser } = useAuth();
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        phone: '',
        address: '',
        birthday: ''
    });
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState('');
    const [error, setError] = useState('');

    useEffect(() => {
        if (user) {
            setFormData({
                username: user.username || '',
                email: user.email || '',
                phone: user.phone || '',
                address: user.address || '',
                birthday: user.birthday ? user.birthday.split('T')[0] : ''
            });
        }
    }, [user]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setSuccess('');

        try {
            const token = localStorage.getItem('auth_token');
            const response = await axios.put(`http://localhost:5002/api/users/profile`, formData, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.data.success) {
                setSuccess('個人資料更新成功！');
                // 更新 AuthContext 中的用戶資料
                if (updateUser) {
                    updateUser(response.data.user);
                }
            } else {
                setError(response.data.message || '更新失敗');
            }
        } catch (err) {
            console.error('更新個人資料錯誤:', err);
            if (err.response?.status === 401) {
                setError('身份驗證失敗，請重新登入');
            } else if (err.response?.status === 400) {
                setError(err.response.data.message || '資料驗證失敗');
            } else {
                setError('更新個人資料時發生錯誤');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-2xl mx-auto">
            <form onSubmit={handleSubmit} className="space-y-6">
                {/* 成功訊息 */}
                {success && (
                    <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">
                        {success}
                    </div>
                )}

                {/* 錯誤訊息 */}
                {error && (
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                        {error}
                    </div>
                )}

                {/* 使用者名稱 */}
                <div>
                    <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-2">
                        使用者名稱
                    </label>
                    <input
                        type="text"
                        id="username"
                        name="username"
                        value={formData.username}
                        onChange={handleChange}
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="請輸入使用者名稱"
                    />
                </div>

                {/* 電子郵件 */}
                <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                        電子郵件
                    </label>
                    <input
                        type="email"
                        id="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="請輸入電子郵件"
                    />
                </div>

                {/* 電話號碼 */}
                <div>
                    <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                        電話號碼
                    </label>
                    <input
                        type="tel"
                        id="phone"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="請輸入電話號碼"
                    />
                </div>

                {/* 地址 */}
                <div>
                    <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-2">
                        地址
                    </label>
                    <textarea
                        id="address"
                        name="address"
                        value={formData.address}
                        onChange={handleChange}
                        rows="3"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="請輸入地址"
                    />
                </div>

                {/* 生日 */}
                <div>
                    <label htmlFor="birthday" className="block text-sm font-medium text-gray-700 mb-2">
                        生日
                    </label>
                    <input
                        type="date"
                        id="birthday"
                        name="birthday"
                        value={formData.birthday}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                </div>

                {/* 提交按鈕 */}
                <div className="flex justify-end">
                    <button
                        type="submit"
                        disabled={loading}
                        className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                        {loading ? (
                            <div className="flex items-center">
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                更新中...
                            </div>
                        ) : (
                            '更新資料'
                        )}
                    </button>
                </div>
            </form>

            {/* 個人資料顯示區塊 */}
            <div className="mt-8 bg-gray-50 rounded-lg p-6">
                <h3 className="text-lg font-medium text-gray-800 mb-4">目前個人資料</h3>
                <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                        <span className="text-gray-600">使用者名稱：</span>
                        <span className="font-medium text-gray-800">{user?.username || '未設定'}</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-gray-600">電子郵件：</span>
                        <span className="font-medium text-gray-800">{user?.email || '未設定'}</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-gray-600">電話號碼：</span>
                        <span className="font-medium text-gray-800">{user?.phone || '未設定'}</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-gray-600">地址：</span>
                        <span className="font-medium text-gray-800">{user?.address || '未設定'}</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-gray-600">生日：</span>
                        <span className="font-medium text-gray-800">
                            {user?.birthday ? new Date(user.birthday).toLocaleDateString('zh-TW') : '未設定'}
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProfileEdit;