// src/pages/UserAccountPage.jsx
import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

const UserAccountPage = () => {
    const { user, isLoading, login, register, logout, isAuthenticated } = useAuth();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('login');
    const [loginForm, setLoginForm] = useState({ username: '', password: '' });
    const [registerForm, setRegisterForm] = useState({
        username: '',
        email: '',
        password: '',
        confirmPassword: '',
        firstName: '',
        lastName: '',
        phone: '',
        address: ''
    });
    const [error, setError] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleLoginSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setIsSubmitting(true);

        const result = await login(loginForm);
        
        console.log('Login result:', result);
        
        if (!result.success) {
            setError(result.message);
        } else {
            console.log('Login successful! User data:', result.user);
        }
        
        setIsSubmitting(false);
    };

    const handleRegisterSubmit = async (e) => {
        e.preventDefault();
        setError('');

        // 驗證密碼確認
        if (registerForm.password !== registerForm.confirmPassword) {
            setError('密碼與確認密碼不一致');
            return;
        }

        setIsSubmitting(true);

        const { confirmPassword, ...registerData } = registerForm;
        const result = await register(registerData);
        
        if (!result.success) {
            setError(result.message);
        }
        
        setIsSubmitting(false);
    };

    const handleLogout = async () => {
        await logout();
    };

    if (isLoading) {
        return (
            <div className="container mx-auto px-4 py-16 text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
                <p className="mt-4 text-gray-600">載入中...</p>
            </div>
        );
    }

    // 已登入用戶的帳戶管理頁面
    if (isAuthenticated()) {
        return (
            <div className="container mx-auto px-4 py-8">
                <div className="max-w-4xl mx-auto">
                    <div className="bg-white rounded-lg shadow-md p-8">
                        <div className="flex justify-between items-center mb-6">
                            <h1 className="text-3xl font-bold text-gray-800">會員中心</h1>
                            <button
                                onClick={handleLogout}
                                className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                            >
                                登出
                            </button>
                        </div>

                        <div className="grid md:grid-cols-2 gap-8">
                            {/* 基本資訊 */}
                            <div className="bg-gray-50 rounded-lg p-6">
                                <h2 className="text-xl font-semibold text-gray-800 mb-4">基本資訊</h2>
                                <div className="space-y-3">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-600">用戶名</label>
                                        <p className="text-gray-800">{user.username}</p>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-600">電子郵件</label>
                                        <p className="text-gray-800">{user.email}</p>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-600">姓名</label>
                                        <p className="text-gray-800">{user.first_name} {user.last_name}</p>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-600">電話</label>
                                        <p className="text-gray-800">{user.phone || '未設定'}</p>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-600">角色</label>
                                        <span className={`inline-block px-3 py-1 rounded-full text-sm ${
                                            user.role === 'admin' ? 'bg-red-100 text-red-800' :
                                            user.role === 'affiliate' ? 'bg-green-100 text-green-800' :
                                            'bg-blue-100 text-blue-800'
                                        }`}>
                                            {user.role === 'admin' ? '管理員' : 
                                             user.role === 'affiliate' ? '聯盟會員' : '一般會員'}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* 帳戶狀態 */}
                            <div className="bg-gray-50 rounded-lg p-6">
                                <h2 className="text-xl font-semibold text-gray-800 mb-4">帳戶狀態</h2>
                                <div className="space-y-3">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-600">帳戶狀態</label>
                                        <span className={`inline-block px-3 py-1 rounded-full text-sm ${
                                            user.status === 'active' ? 'bg-green-100 text-green-800' :
                                            user.status === 'inactive' ? 'bg-yellow-100 text-yellow-800' :
                                            'bg-red-100 text-red-800'
                                        }`}>
                                            {user.status === 'active' ? '啟用中' :
                                             user.status === 'inactive' ? '未啟用' : '已暫停'}
                                        </span>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-600">電子郵件驗證</label>
                                        <span className={`inline-block px-3 py-1 rounded-full text-sm ${
                                            user.email_verified ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                                        }`}>
                                            {user.email_verified ? '已驗證' : '未驗證'}
                                        </span>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-600">註冊時間</label>
                                        <p className="text-gray-800">
                                            {new Date(user.created_at).toLocaleDateString('zh-TW')}
                                        </p>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-600">最後登入</label>
                                        <p className="text-gray-800">
                                            {user.last_login ? 
                                                new Date(user.last_login).toLocaleString('zh-TW') : 
                                                '首次登入'}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* 功能區塊 */}
                        <div className="mt-8 grid md:grid-cols-3 gap-4">
                            <button 
                                onClick={() => navigate('/member?tab=orders')}
                                className="p-4 bg-blue-50 rounded-lg text-blue-700 hover:bg-blue-100 transition-colors text-center"
                            >
                                <div className="text-lg font-semibold">訂單記錄</div>
                                <div className="text-sm">查看購買記錄</div>
                            </button>
                            <button 
                                onClick={() => navigate('/member?tab=profile')}
                                className="p-4 bg-green-50 rounded-lg text-green-700 hover:bg-green-100 transition-colors text-center"
                            >
                                <div className="text-lg font-semibold">個人資料</div>
                                <div className="text-sm">修改個人資訊</div>
                            </button>
                            <button 
                                onClick={() => navigate('/member?tab=password')}
                                className="p-4 bg-purple-50 rounded-lg text-purple-700 hover:bg-purple-100 transition-colors text-center"
                            >
                                <div className="text-lg font-semibold">密碼變更</div>
                                <div className="text-sm">修改登入密碼</div>
                            </button>
                        </div>

                        {/* 聯盟會員功能 */}
                        {user.role === 'affiliate' || user.role === 'admin' ? (
                            <div className="mt-8 bg-green-50 rounded-lg p-6">
                                <h2 className="text-xl font-semibold text-green-800 mb-4">聯盟會員功能</h2>
                                <div className="grid md:grid-cols-2 gap-4">
                                    <button 
                                        onClick={() => navigate('/affiliate')}
                                        className="p-4 bg-white rounded-lg text-green-700 hover:bg-green-50 transition-colors text-center border border-green-200"
                                    >
                                        <div className="text-lg font-semibold">分潤連結</div>
                                        <div className="text-sm">管理推廣連結</div>
                                    </button>
                                    <button 
                                        onClick={() => navigate('/affiliate')}
                                        className="p-4 bg-white rounded-lg text-green-700 hover:bg-green-50 transition-colors text-center border border-green-200"
                                    >
                                        <div className="text-lg font-semibold">收益報告</div>
                                        <div className="text-sm">查看分潤收益</div>
                                    </button>
                                </div>
                            </div>
                        ) : null}

                        {/* 管理員功能 */}
                        {user.role === 'admin' ? (
                            <div className="mt-8 bg-red-50 rounded-lg p-6">
                                <h2 className="text-xl font-semibold text-red-800 mb-4">管理員功能</h2>
                                <div className="grid md:grid-cols-3 gap-4">
                                    <button 
                                        onClick={() => navigate('/admin/users')}
                                        className="p-4 bg-white rounded-lg text-red-700 hover:bg-red-50 transition-colors text-center border border-red-200"
                                    >
                                        <div className="text-lg font-semibold">用戶管理</div>
                                        <div className="text-sm">管理所有用戶</div>
                                    </button>
                                    <button 
                                        onClick={() => navigate('/admin')}
                                        className="p-4 bg-white rounded-lg text-red-700 hover:bg-red-50 transition-colors text-center border border-red-200"
                                    >
                                        <div className="text-lg font-semibold">數據分析</div>
                                        <div className="text-sm">查看系統數據</div>
                                    </button>
                                    <button 
                                        onClick={() => navigate('/admin/settings')}
                                        className="p-4 bg-white rounded-lg text-red-700 hover:bg-red-50 transition-colors text-center border border-red-200"
                                    >
                                        <div className="text-lg font-semibold">系統設定</div>
                                        <div className="text-sm">系統參數設定</div>
                                    </button>
                                </div>
                            </div>
                        ) : null}
                    </div>
                </div>
            </div>
        );
    }

    // 未登入用戶的登入/註冊頁面
    return (
        <div className="container mx-auto px-4 py-8">
            <div className="max-w-md mx-auto bg-white rounded-lg shadow-md p-8">
                <h1 className="text-3xl font-bold text-gray-800 text-center mb-8">會員中心</h1>
                
                {/* 登入/註冊標籤 */}
                <div className="flex mb-6 border-b">
                    <button
                        onClick={() => setActiveTab('login')}
                        className={`flex-1 py-2 px-4 text-center ${
                            activeTab === 'login'
                                ? 'border-b-2 border-blue-500 text-blue-600 font-semibold'
                                : 'text-gray-500 hover:text-gray-700'
                        }`}
                    >
                        登入
                    </button>
                    <button
                        onClick={() => setActiveTab('register')}
                        className={`flex-1 py-2 px-4 text-center ${
                            activeTab === 'register'
                                ? 'border-b-2 border-blue-500 text-blue-600 font-semibold'
                                : 'text-gray-500 hover:text-gray-700'
                        }`}
                    >
                        註冊
                    </button>
                </div>

                {/* 錯誤訊息 */}
                {error && (
                    <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
                        {error}
                    </div>
                )}

                {/* 登入表單 */}
                {activeTab === 'login' && (
                    <form onSubmit={handleLoginSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                用戶名或電子郵件
                            </label>
                            <input
                                type="text"
                                value={loginForm.username}
                                onChange={(e) => setLoginForm({ ...loginForm, username: e.target.value })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                密碼
                            </label>
                            <input
                                type="password"
                                value={loginForm.password}
                                onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                required
                            />
                        </div>
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                        >
                            {isSubmitting ? '登入中...' : '登入'}
                        </button>
                    </form>
                )}

                {/* 註冊表單 */}
                {activeTab === 'register' && (
                    <form onSubmit={handleRegisterSubmit} className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    姓 *
                                </label>
                                <input
                                    type="text"
                                    value={registerForm.firstName}
                                    onChange={(e) => setRegisterForm({ ...registerForm, firstName: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    名 *
                                </label>
                                <input
                                    type="text"
                                    value={registerForm.lastName}
                                    onChange={(e) => setRegisterForm({ ...registerForm, lastName: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    required
                                />
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                用戶名 *
                            </label>
                            <input
                                type="text"
                                value={registerForm.username}
                                onChange={(e) => setRegisterForm({ ...registerForm, username: e.target.value })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                電子郵件 *
                            </label>
                            <input
                                type="email"
                                value={registerForm.email}
                                onChange={(e) => setRegisterForm({ ...registerForm, email: e.target.value })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                電話
                            </label>
                            <input
                                type="tel"
                                value={registerForm.phone}
                                onChange={(e) => setRegisterForm({ ...registerForm, phone: e.target.value })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                地址
                            </label>
                            <textarea
                                value={registerForm.address}
                                onChange={(e) => setRegisterForm({ ...registerForm, address: e.target.value })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                rows="2"
                            ></textarea>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                密碼 *
                            </label>
                            <input
                                type="password"
                                value={registerForm.password}
                                onChange={(e) => setRegisterForm({ ...registerForm, password: e.target.value })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                確認密碼 *
                            </label>
                            <input
                                type="password"
                                value={registerForm.confirmPassword}
                                onChange={(e) => setRegisterForm({ ...registerForm, confirmPassword: e.target.value })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                required
                            />
                        </div>
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="w-full bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 disabled:opacity-50"
                        >
                            {isSubmitting ? '註冊中...' : '註冊'}
                        </button>
                    </form>
                )}
            </div>
        </div>
    );
};

export default UserAccountPage;