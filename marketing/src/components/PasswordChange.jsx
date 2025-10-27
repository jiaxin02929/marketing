// src/components/PasswordChange.jsx
import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';

const PasswordChange = () => {
    const { user } = useAuth();
    const [formData, setFormData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState('');
    const [error, setError] = useState('');
    const [showPasswords, setShowPasswords] = useState({
        current: false,
        new: false,
        confirm: false
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
        // 清除錯誤訊息
        if (error) setError('');
    };

    const togglePasswordVisibility = (field) => {
        setShowPasswords(prev => ({
            ...prev,
            [field]: !prev[field]
        }));
    };

    const validateForm = () => {
        if (!formData.currentPassword) {
            setError('請輸入目前密碼');
            return false;
        }
        if (!formData.newPassword) {
            setError('請輸入新密碼');
            return false;
        }
        if (formData.newPassword.length < 6) {
            setError('新密碼至少需要6個字元');
            return false;
        }
        if (formData.newPassword !== formData.confirmPassword) {
            setError('新密碼與確認密碼不符');
            return false;
        }
        if (formData.currentPassword === formData.newPassword) {
            setError('新密碼不能與目前密碼相同');
            return false;
        }
        return true;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!validateForm()) {
            return;
        }

        setLoading(true);
        setError('');
        setSuccess('');

        try {
            const token = localStorage.getItem('auth_token');
            const response = await axios.put('http://localhost:5002/api/users/change-password', {
                currentPassword: formData.currentPassword,
                newPassword: formData.newPassword
            }, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.data.success) {
                setSuccess('密碼變更成功！');
                // 清空表單
                setFormData({
                    currentPassword: '',
                    newPassword: '',
                    confirmPassword: ''
                });
            } else {
                setError(response.data.message || '密碼變更失敗');
            }
        } catch (err) {
            console.error('變更密碼錯誤:', err);
            if (err.response?.status === 401) {
                setError('身份驗證失敗，請重新登入');
            } else if (err.response?.status === 400) {
                setError(err.response.data.message || '目前密碼不正確');
            } else {
                setError('變更密碼時發生錯誤，請稍後再試');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-md mx-auto">
            <form onSubmit={handleSubmit} className="space-y-6">
                {/* 成功訊息 */}
                {success && (
                    <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">
                        <div className="flex items-center">
                            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                            </svg>
                            {success}
                        </div>
                    </div>
                )}

                {/* 錯誤訊息 */}
                {error && (
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                        <div className="flex items-center">
                            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                            {error}
                        </div>
                    </div>
                )}

                {/* 安全提醒 */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="flex items-start">
                        <svg className="w-5 h-5 text-blue-500 mt-0.5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <div>
                            <h3 className="text-sm font-medium text-blue-800">密碼安全提醒</h3>
                            <ul className="mt-2 text-sm text-blue-700 list-disc list-inside space-y-1">
                                <li>密碼長度至少6個字元</li>
                                <li>建議包含大小寫字母、數字和特殊符號</li>
                                <li>不要使用容易猜測的個人資訊</li>
                            </ul>
                        </div>
                    </div>
                </div>

                {/* 目前密碼 */}
                <div>
                    <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-700 mb-2">
                        目前密碼 <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                        <input
                            type={showPasswords.current ? "text" : "password"}
                            id="currentPassword"
                            name="currentPassword"
                            value={formData.currentPassword}
                            onChange={handleChange}
                            required
                            className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="請輸入目前密碼"
                        />
                        <button
                            type="button"
                            onClick={() => togglePasswordVisibility('current')}
                            className="absolute inset-y-0 right-0 pr-3 flex items-center"
                        >
                            <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                {showPasswords.current ? (
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                                ) : (
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                )}
                            </svg>
                        </button>
                    </div>
                </div>

                {/* 新密碼 */}
                <div>
                    <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 mb-2">
                        新密碼 <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                        <input
                            type={showPasswords.new ? "text" : "password"}
                            id="newPassword"
                            name="newPassword"
                            value={formData.newPassword}
                            onChange={handleChange}
                            required
                            className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="請輸入新密碼"
                        />
                        <button
                            type="button"
                            onClick={() => togglePasswordVisibility('new')}
                            className="absolute inset-y-0 right-0 pr-3 flex items-center"
                        >
                            <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                {showPasswords.new ? (
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                                ) : (
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                )}
                            </svg>
                        </button>
                    </div>
                </div>

                {/* 確認新密碼 */}
                <div>
                    <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                        確認新密碼 <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                        <input
                            type={showPasswords.confirm ? "text" : "password"}
                            id="confirmPassword"
                            name="confirmPassword"
                            value={formData.confirmPassword}
                            onChange={handleChange}
                            required
                            className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="請再次輸入新密碼"
                        />
                        <button
                            type="button"
                            onClick={() => togglePasswordVisibility('confirm')}
                            className="absolute inset-y-0 right-0 pr-3 flex items-center"
                        >
                            <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                {showPasswords.confirm ? (
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                                ) : (
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                )}
                            </svg>
                        </button>
                    </div>
                    {formData.newPassword && formData.confirmPassword && formData.newPassword !== formData.confirmPassword && (
                        <p className="mt-1 text-sm text-red-600">密碼不符</p>
                    )}
                </div>

                {/* 提交按鈕 */}
                <div className="flex justify-end">
                    <button
                        type="submit"
                        disabled={loading || !formData.currentPassword || !formData.newPassword || !formData.confirmPassword}
                        className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                        {loading ? (
                            <div className="flex items-center">
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                變更中...
                            </div>
                        ) : (
                            '變更密碼'
                        )}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default PasswordChange;