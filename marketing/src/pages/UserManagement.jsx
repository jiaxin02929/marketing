// src/pages/UserManagement.jsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';

const UserManagement = () => {
    const { user, token, isAdmin } = useAuth();
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [roleFilter, setRoleFilter] = useState('all');
    const [selectedUser, setSelectedUser] = useState(null);
    const [showUserModal, setShowUserModal] = useState(false);

    // 檢查權限
    useEffect(() => {
        if (!user || !isAdmin()) {
            return;
        }
        fetchUsers();
    }, [user]);

    const fetchUsers = async () => {
        try {
            setLoading(true);
            const response = await fetch('http://localhost:5002/api/admin/users', {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (response.ok) {
                const data = await response.json();
                setUsers(data.data || []);
            } else {
                console.error('獲取用戶列表失敗');
            }
        } catch (error) {
            console.error('獲取用戶列表錯誤:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleRoleChange = async (userId, newRole) => {
        try {
            const response = await fetch(`http://localhost:5002/api/admin/users/${userId}/role`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ role: newRole })
            });

            if (response.ok) {
                // 更新本地狀態
                setUsers(users.map(u => 
                    u.id === userId ? { ...u, role: newRole } : u
                ));
            } else {
                alert('更新用戶角色失敗');
            }
        } catch (error) {
            console.error('更新用戶角色錯誤:', error);
            alert('更新用戶角色錯誤');
        }
    };

    const handleUserStatusChange = async (userId, newStatus) => {
        try {
            const response = await fetch(`http://localhost:5002/api/admin/users/${userId}/status`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ status: newStatus })
            });

            if (response.ok) {
                // 更新本地狀態
                setUsers(users.map(u => 
                    u.id === userId ? { ...u, status: newStatus } : u
                ));
            } else {
                alert('更新用戶狀態失敗');
            }
        } catch (error) {
            console.error('更新用戶狀態錯誤:', error);
            alert('更新用戶狀態錯誤');
        }
    };

    // 篩選用戶
    const filteredUsers = users.filter(u => {
        const matchesSearch = u.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            (u.first_name && u.first_name.toLowerCase().includes(searchTerm.toLowerCase())) ||
                            (u.last_name && u.last_name.toLowerCase().includes(searchTerm.toLowerCase()));
        
        const matchesRole = roleFilter === 'all' || u.role === roleFilter;
        
        return matchesSearch && matchesRole;
    });

    const getRoleColor = (role) => {
        switch (role) {
            case 'admin': return 'bg-red-100 text-red-800';
            case 'affiliate': return 'bg-blue-100 text-blue-800';
            case 'customer': return 'bg-green-100 text-green-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    const getStatusColor = (status) => {
        return status === 'active' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800';
    };

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

    if (loading) {
        return (
            <div className="container mx-auto px-4 py-8">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500 mx-auto"></div>
                    <p className="mt-4 text-gray-600">載入中...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="bg-white rounded-lg shadow-md">
                {/* 標題和操作欄 */}
                <div className="p-6 border-b border-gray-200">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-800 mb-2">用戶管理</h1>
                            <p className="text-gray-600">管理系統中的所有用戶</p>
                        </div>
                        <div className="mt-4 md:mt-0">
                            <span className="text-sm text-gray-500">
                                總計 {users.length} 個用戶，篩選後 {filteredUsers.length} 個
                            </span>
                        </div>
                    </div>
                </div>

                {/* 搜索和篩選 */}
                <div className="p-6 border-b border-gray-200 bg-gray-50">
                    <div className="flex flex-col md:flex-row gap-4">
                        <div className="flex-1">
                            <input
                                type="text"
                                placeholder="搜尋用戶名、信箱或姓名..."
                                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <div>
                            <select
                                className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                value={roleFilter}
                                onChange={(e) => setRoleFilter(e.target.value)}
                            >
                                <option value="all">所有角色</option>
                                <option value="admin">管理員</option>
                                <option value="affiliate">分潤夥伴</option>
                                <option value="customer">一般客戶</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* 用戶列表 */}
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    用戶信息
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    角色
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    狀態
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    註冊時間
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    操作
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {filteredUsers.map((userItem) => (
                                <tr key={userItem.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center">
                                            <div className="flex-shrink-0 h-10 w-10">
                                                <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
                                                    <span className="text-gray-600 font-medium">
                                                        {(userItem.first_name || userItem.username)?.charAt(0)?.toUpperCase()}
                                                    </span>
                                                </div>
                                            </div>
                                            <div className="ml-4">
                                                <div className="text-sm font-medium text-gray-900">
                                                    {userItem.first_name && userItem.last_name 
                                                        ? `${userItem.first_name} ${userItem.last_name}`
                                                        : userItem.username}
                                                </div>
                                                <div className="text-sm text-gray-500">
                                                    {userItem.email}
                                                </div>
                                                <div className="text-xs text-gray-400">
                                                    @{userItem.username}
                                                </div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <select
                                            value={userItem.role}
                                            onChange={(e) => handleRoleChange(userItem.id, e.target.value)}
                                            className={`px-2 py-1 text-xs font-semibold rounded-full ${getRoleColor(userItem.role)} border-0 cursor-pointer`}
                                            disabled={userItem.id === user.user_id} // 不能修改自己的角色
                                        >
                                            <option value="customer">一般客戶</option>
                                            <option value="affiliate">分潤夥伴</option>
                                            <option value="admin">管理員</option>
                                        </select>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <button
                                            onClick={() => handleUserStatusChange(
                                                userItem.id, 
                                                userItem.status === 'active' ? 'inactive' : 'active'
                                            )}
                                            className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(userItem.status || 'active')}`}
                                            disabled={userItem.id === user.user_id} // 不能修改自己的狀態
                                        >
                                            {userItem.status === 'active' || !userItem.status ? '啟用' : '停用'}
                                        </button>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {new Date(userItem.created_at).toLocaleDateString('zh-TW')}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                        <button
                                            onClick={() => {
                                                setSelectedUser(userItem);
                                                setShowUserModal(true);
                                            }}
                                            className="text-blue-600 hover:text-blue-900 mr-3"
                                        >
                                            查看詳情
                                        </button>
                                        {userItem.id !== user.user_id && (
                                            <button className="text-red-600 hover:text-red-900">
                                                刪除
                                            </button>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* 空狀態 */}
                {filteredUsers.length === 0 && (
                    <div className="text-center py-12">
                        <div className="text-gray-400 mb-4">
                            <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"></path>
                            </svg>
                        </div>
                        <h3 className="text-lg font-medium text-gray-900 mb-2">沒有找到用戶</h3>
                        <p className="text-gray-500">
                            {searchTerm || roleFilter !== 'all' 
                                ? '試試調整搜尋條件' 
                                : '系統中還沒有用戶'}
                        </p>
                    </div>
                )}
            </div>

            {/* 用戶詳情模態框 (預留) */}
            {showUserModal && selectedUser && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-lg max-w-md w-full p-6">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-semibold">用戶詳情</h3>
                            <button 
                                onClick={() => setShowUserModal(false)}
                                className="text-gray-400 hover:text-gray-600"
                            >
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                                </svg>
                            </button>
                        </div>
                        
                        <div className="space-y-3">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">用戶名</label>
                                <p className="text-sm text-gray-900">{selectedUser.username}</p>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">信箱</label>
                                <p className="text-sm text-gray-900">{selectedUser.email}</p>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">姓名</label>
                                <p className="text-sm text-gray-900">
                                    {selectedUser.first_name && selectedUser.last_name 
                                        ? `${selectedUser.first_name} ${selectedUser.last_name}`
                                        : '未設定'}
                                </p>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">角色</label>
                                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getRoleColor(selectedUser.role)}`}>
                                    {selectedUser.role === 'admin' ? '管理員' : 
                                     selectedUser.role === 'affiliate' ? '分潤夥伴' : '一般客戶'}
                                </span>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">註冊時間</label>
                                <p className="text-sm text-gray-900">
                                    {new Date(selectedUser.created_at).toLocaleString('zh-TW')}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default UserManagement;