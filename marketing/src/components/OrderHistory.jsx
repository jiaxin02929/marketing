// src/components/OrderHistory.jsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';

const OrderHistory = () => {
    const { user, token } = useAuth();
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    const ordersPerPage = 10;

    useEffect(() => {
        if (user && user.user_id) {
            fetchOrders();
        }
    }, [currentPage, user]);

    const fetchOrders = async () => {
        if (!user || !user.user_id) {
            setLoading(false);
            setError('無法獲取用戶資訊');
            return;
        }

        try {
            setLoading(true);
            const response = await axios.get(`http://localhost:5002/api/orders/user/${user.user_id}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                params: {
                    page: currentPage,
                    limit: ordersPerPage
                }
            });

            if (response.data.success) {
                setOrders(response.data.data.orders);
                setTotalPages(response.data.data.totalPages);
                setError('');
            } else {
                throw new Error(response.data.message || '獲取訂單失敗');
            }
        } catch (err) {
            console.error('獲取訂單錯誤:', err);
            setError(err.response?.data?.message || err.message || '載入訂單時發生錯誤');
            setOrders([]);
        } finally {
            setLoading(false);
        }
    };

    const getStatusBadge = (status) => {
        const statusConfig = {
            pending: { label: '待處理', color: 'bg-yellow-100 text-yellow-800' },
            processing: { label: '處理中', color: 'bg-blue-100 text-blue-800' },
            shipped: { label: '已出貨', color: 'bg-purple-100 text-purple-800' },
            completed: { label: '已完成', color: 'bg-green-100 text-green-800' },
            cancelled: { label: '已取消', color: 'bg-red-100 text-red-800' }
        };

        const config = statusConfig[status] || statusConfig.pending;
        return (
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${config.color}`}>
                {config.label}
            </span>
        );
    };

    const formatPrice = (price) => {
        return `NT$ ${Math.round(price).toLocaleString()}`;
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('zh-TW', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    if (loading) {
        return (
            <div className="text-center py-8">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                <p className="mt-4 text-gray-600">載入訂單資料中...</p>
            </div>
        );
    }

    if (error && orders.length === 0) {
        return (
            <div className="text-center py-8">
                <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <h3 className="mt-4 text-lg font-medium text-gray-900">載入失敗</h3>
                <p className="mt-2 text-sm text-gray-500">{error}</p>
                <button
                    onClick={fetchOrders}
                    className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                    重新載入
                </button>
            </div>
        );
    }

    if (orders.length === 0) {
        return (
            <div className="text-center py-8">
                <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
                <h3 className="mt-4 text-lg font-medium text-gray-900">尚無訂單紀錄</h3>
                <p className="mt-2 text-sm text-gray-500">您還沒有購買任何商品</p>
                <a
                    href="/products"
                    className="mt-4 inline-block bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                    前往購物
                </a>
            </div>
        );
    }

    return (
        <div>
            {/* 訂單列表 */}
            <div className="space-y-6">
                {orders.map((order) => (
                    <div key={order.id} className="border border-gray-200 rounded-lg overflow-hidden">
                        {/* 訂單標題 */}
                        <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                                <div className="flex items-center space-x-4">
                                    <h3 className="text-lg font-medium text-gray-900">
                                        訂單編號：{order.order_number}
                                    </h3>
                                    {getStatusBadge(order.status)}
                                </div>
                                <div className="mt-2 sm:mt-0 text-sm text-gray-500">
                                    {formatDate(order.created_at)}
                                </div>
                            </div>
                        </div>

                        {/* 訂單商品 */}
                        <div className="px-6 py-4">
                            {order.items && order.items.map((item, index) => (
                                <div key={index} className="flex items-center space-x-4 py-3">
                                    <img
                                        src={item.product_image || '/placeholder.jpg'}
                                        alt={item.product_name}
                                        className="w-16 h-16 object-cover rounded-lg"
                                    />
                                    <div className="flex-1">
                                        <h4 className="font-medium text-gray-900">{item.product_name}</h4>
                                        <div className="flex items-center justify-between mt-1">
                                            <span className="text-sm text-gray-500">數量：{item.quantity}</span>
                                            <span className="font-medium text-gray-900">
                                                {formatPrice(item.price)}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* 訂單總計 */}
                        <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
                            <div className="flex justify-between items-center">
                                <span className="text-base font-medium text-gray-900">訂單總額</span>
                                <span className="text-lg font-bold text-blue-600">
                                    {formatPrice(order.total_amount)}
                                </span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* 分頁 */}
            {totalPages > 1 && (
                <div className="flex justify-center mt-8">
                    <nav className="flex space-x-2">
                        <button
                            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                            disabled={currentPage <= 1}
                            className="px-3 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            上一頁
                        </button>
                        
                        {[...Array(Math.min(5, totalPages))].map((_, i) => {
                            const pageNum = Math.max(1, currentPage - 2) + i;
                            if (pageNum <= totalPages) {
                                return (
                                    <button
                                        key={pageNum}
                                        onClick={() => setCurrentPage(pageNum)}
                                        className={`px-3 py-2 rounded ${
                                            pageNum === currentPage
                                                ? 'bg-blue-600 text-white'
                                                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                                        }`}
                                    >
                                        {pageNum}
                                    </button>
                                );
                            }
                            return null;
                        })}
                        
                        <button
                            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                            disabled={currentPage >= totalPages}
                            className="px-3 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            下一頁
                        </button>
                    </nav>
                </div>
            )}
        </div>
    );
};

export default OrderHistory;