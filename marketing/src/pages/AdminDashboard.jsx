// src/pages/AdminDashboard.jsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';

const AdminDashboard = () => {
    const { user, token } = useAuth();
    const [loading, setLoading] = useState(true);
    const [overview, setOverview] = useState({});
    const [salesTrend, setSalesTrend] = useState([]);
    const [topProducts, setTopProducts] = useState([]);
    const [recentOrders, setRecentOrders] = useState([]);
    const [selectedPeriod, setSelectedPeriod] = useState('7days');
    const [deleteError, setDeleteError] = useState(null);

    const handleDeleteOrder = async (orderId) => {
        if (window.confirm('您確定要永久刪除此訂單嗎？此操作無法復原。')) {
            setDeleteError(null);
            try {
                const response = await fetch(`http://localhost:5002/api/orders/${orderId}`, {
                    method: 'DELETE',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                    },
                });

                if (!response.ok) {
                    const data = await response.json();
                    throw new Error(data.message || '刪除失敗');
                }

                // 從 UI 及時移除訂單
                setRecentOrders(prevOrders => prevOrders.filter(order => order.id !== orderId));

            } catch (error) {
                console.error('刪除訂單時發生錯誤:', error);
                setDeleteError(error.message);
            }
        }
    };

    // 檢查權限
    useEffect(() => {
        if (!user || user.role !== 'admin') {
            // 如果不是管理員，重定向或顯示錯誤
            return;
        }
    }, [user]);

    // 獲取總覽數據
    const fetchOverview = async () => {
        try {
            const response = await fetch('http://localhost:5002/api/analytics/overview', {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (response.ok) {
                const data = await response.json();
                setOverview(data.data);
            }
        } catch (error) {
            console.error('獲取總覽數據失敗:', error);
        }
    };

    // 獲取銷售趨勢
    const fetchSalesTrend = async () => {
        try {
            const response = await fetch(`http://localhost:5002/api/analytics/sales-trend?period=${selectedPeriod}`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (response.ok) {
                const data = await response.json();
                setSalesTrend(data.data);
            }
        } catch (error) {
            console.error('獲取銷售趨勢失敗:', error);
        }
    };

    // 獲取熱門產品
    const fetchTopProducts = async () => {
        try {
            console.log('🔍 開始獲取熱門產品...', { token: token ? '有' : '無' });
            const response = await fetch('http://localhost:5002/api/analytics/top-products?limit=10', {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            console.log('📡 API響應狀態:', response.status);
            if (response.ok) {
                const data = await response.json();
                console.log('✅ 熱門產品數據:', data);
                console.log('📊 產品數量:', data.data?.length || 0);
                setTopProducts(data.data || []);
            } else {
                const errorText = await response.text();
                console.error('❌ 熱門產品API錯誤:', {
                    status: response.status,
                    statusText: response.statusText,
                    error: errorText
                });
                setTopProducts([]);
            }
        } catch (error) {
            console.error('💥 獲取熱門產品異常:', error);
            setTopProducts([]);
        }
    };

    // 獲取最近訂單
    const fetchRecentOrders = async () => {
        try {
            const response = await fetch('http://localhost:5002/api/analytics/recent-orders?limit=30', {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (response.ok) {
                const data = await response.json();
                setRecentOrders(data.data || []);
            } else {
                console.error('獲取最近訂單失敗:', response.status);
                setRecentOrders([]);
            }
        } catch (error) {
            console.error('獲取最近訂單失敗:', error);
            setRecentOrders([]);
        }
    };

    // 載入所有數據
    const loadAllData = async () => {
        setLoading(true);
        await Promise.all([
            fetchOverview(),
            fetchSalesTrend(),
            fetchTopProducts(),
            fetchRecentOrders()
        ]);
        setLoading(false);
    };

    useEffect(() => {
        console.log('🔍 AdminDashboard useEffect triggered:', {
            user: user ? `${user.username} (${user.role})` : 'null',
            token: token ? 'yes' : 'no',
            isAdmin: user?.role === 'admin'
        });

        if (user && user.role === 'admin' && token) {
            console.log('✅ 條件滿足，開始載入數據...');
            loadAllData();
        } else {
            console.log('❌ 條件不滿足，無法載入數據');
        }
    }, [user, token, selectedPeriod]);

    // 格式化貨幣
    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('zh-TW', {
            style: 'currency',
            currency: 'TWD',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(amount);
    };

    // 格式化日期
    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        try {
            return new Date(dateString).toLocaleDateString('zh-TW', {
                year: 'numeric',
                month: '2-digit',
                day: '2-digit'
            });
        } catch (error) {
            return 'N/A';
        }
    };

    // 統計卡片組件
    const StatCard = ({ title, value, subtitle, icon, color = 'blue' }) => (
        <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-blue-500">
            <div className="flex items-center">
                <div className={`p-3 rounded-full bg-${color}-100 text-${color}-600`}>
                    {icon}
                </div>
                <div className="ml-4">
                    <h3 className="text-sm font-medium text-gray-500">{title}</h3>
                    <p className="text-2xl font-bold text-gray-900">{value}</p>
                    {subtitle && <p className="text-sm text-gray-600">{subtitle}</p>}
                </div>
            </div>
        </div>
    );

    // 如果正在載入認證狀態，顯示載入中
    if (!user && token) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600">載入中...</p>
                </div>
            </div>
        );
    }

    if (!user || user.role !== 'admin') {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-100">
                <div className="text-center">
                    <h1 className="text-2xl font-bold text-gray-900 mb-4">權限不足</h1>
                    <p className="text-gray-600">您需要管理員權限才能訪問此頁面</p>
                </div>
            </div>
        );
    }

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-100">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600">載入數據中...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-100 py-6">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* 頁面標題 */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">管理者儀表板</h1>
                    <p className="text-gray-600 mt-2">歡迎回來，{user.first_name} {user.last_name}</p>
                </div>

                {/* 統計卡片網格 */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    <StatCard
                        title="總訂單數"
                        value={overview.totalOrders || 0}
                        subtitle={`成功率: ${overview.successRate || 0}%`}
                        icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" /></svg>}
                    />
                    <StatCard
                        title="總營收"
                        value={formatCurrency(overview.totalRevenue || 0)}
                        subtitle={`平均訂單: ${formatCurrency(overview.avgOrderValue || 0)}`}
                        icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" /></svg>}
                        color="green"
                    />
                    <StatCard
                        title="註冊用戶"
                        value={overview.totalUsers || 0}
                        subtitle={`本月訂單: ${overview.thisMonthOrders || 0}`}
                        icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>}
                        color="purple"
                    />
                    <StatCard
                        title="商品數量"
                        value={overview.totalProducts || 0}
                        subtitle={`待處理: ${overview.pendingOrders || 0}`}
                        icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg>}
                        color="yellow"
                    />
                </div>

                {/* 銷售趨勢和熱門產品 */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                    {/* 銷售趨勢 */}
                    <div className="bg-white rounded-lg shadow-md p-6">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-semibold text-gray-900">銷售趨勢</h3>
                            <select
                                value={selectedPeriod}
                                onChange={(e) => setSelectedPeriod(e.target.value)}
                                className="text-sm border border-gray-300 rounded-md px-3 py-1"
                            >
                                <option value="7days">過去7天</option>
                                <option value="30days">過去30天</option>
                                <option value="12months">過去12個月</option>
                            </select>
                        </div>
                        <div className="space-y-2 max-h-64 overflow-y-auto">
                            {salesTrend.map((item, index) => (
                                <div key={index} className="flex justify-between items-center py-2 border-b border-gray-100">
                                    <span className="text-sm text-gray-600">{formatDate(item.date)}</span>
                                    <div className="text-right">
                                        <div className="text-sm font-medium">{item.orders} 筆訂單</div>
                                        <div className="text-xs text-green-600">{formatCurrency(item.revenue)}</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* 熱門產品 */}
                    <div className="bg-white rounded-lg shadow-md p-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">熱門產品 TOP 10</h3>
                        <div className="space-y-3">
                            {topProducts.length > 0 ? topProducts.map((product, index) => (
                                <div key={product.id || index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                    <div className="flex items-center">
                                        <span className="text-lg font-bold text-blue-600 mr-3">#{index + 1}</span>
                                        <div>
                                            <h4 className="font-medium text-gray-900">{product.name || 'N/A'}</h4>
                                            <p className="text-sm text-gray-600">已售 {product.total_sold || 0} 件</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <div className="font-semibold text-green-600">{formatCurrency(product.total_revenue || 0)}</div>
                                        <div className="text-xs text-gray-500">{product.order_count || 0} 筆訂單</div>
                                    </div>
                                </div>
                            )) : (
                                <div className="text-center py-8 text-gray-500">
                                    <svg className="w-12 h-12 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                                    </svg>
                                    <p>暫無產品銷售數據</p>
                                    <p className="text-sm mt-1">當有完成的訂單後，這裡將顯示熱門產品</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* 最近訂單 */}
                <div className="bg-white rounded-lg shadow-md p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">最近訂單</h3>
                    {deleteError && (
                        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
                            <strong className="font-bold">刪除失敗: </strong>
                            <span className="block sm:inline">{deleteError}</span>
                        </div>
                    )}
                    <div className="max-h-[640px] overflow-y-auto">
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">訂單編號</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">客戶</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">金額</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">狀態</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">日期</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">操作</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {recentOrders.length > 0 ? recentOrders.map((order) => (
                                        <tr key={order.id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                                #{order.id ? order.id.toString().slice(0, 8) : 'N/A'}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                {order.customer_name || 'N/A'}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                {formatCurrency(order.total_price || 0)}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                                    order.payment_status === 'completed' 
                                                        ? 'bg-green-100 text-green-800' 
                                                        : order.payment_status === 'pending'
                                                        ? 'bg-yellow-100 text-yellow-800'
                                                        : 'bg-red-100 text-red-800'
                                                }`}>
                                                    {order.payment_status === 'completed' ? '已完成' :
                                                     order.payment_status === 'pending' ? '待處理' : '失敗'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {formatDate(order.created_at)}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                                <button onClick={() => handleDeleteOrder(order.id)} className="text-red-600 hover:text-red-900">
                                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                                                </button>
                                            </td>
                                        </tr>
                                    )) : (
                                        <tr>
                                            <td colSpan="6" className="px-6 py-4 text-center text-gray-500">
                                                暫無訂單數據
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                                                    </table>
                                                </div>
                                            </div>                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;