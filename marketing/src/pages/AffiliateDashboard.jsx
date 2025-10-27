import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Navigate } from 'react-router-dom';
import { TagIcon, PlusIcon, TrashIcon, ClipboardIcon } from '@heroicons/react/24/outline';
import { ChartBarIcon, CurrencyDollarIcon, UserGroupIcon } from '@heroicons/react/24/solid';

const AffiliateDashboard = () => {
    const { user, token, isAuthenticated, isAffiliate } = useAuth();
    const [activeTab, setActiveTab] = useState('overview');
    const [codes, setCodes] = useState([]);
    const [earnings, setEarnings] = useState({ total_earnings: {}, earnings_trend: [] });
    const [loading, setLoading] = useState(true);
    const [showCreateForm, setShowCreateForm] = useState(false);
    const [newCode, setNewCode] = useState({
        link_code: '',
        discount_rate: 0.10,
        commission_rate: 0.05,
        expires_at: ''
    });
    const [recentConversions, setRecentConversions] = useState([]);

    const API_BASE_URL = 'http://localhost:5002/api';

    if (!isAuthenticated() || !isAffiliate()) {
        return <Navigate to="/account" replace />;
    }

    useEffect(() => {
        loadInitialData();
    }, []);

    const loadInitialData = async () => {
        setLoading(true);
        await Promise.all([fetchCodes(), fetchEarnings(), fetchRecentConversions()]);
        setLoading(false);
    }

    const fetchRecentConversions = async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/affiliate/conversions`, { headers: { 'Authorization': `Bearer ${token}` } });
            const data = await response.json();
            if (data.success) {
                console.log('[DEBUG-FRONTEND] Fetched recent conversions data:', data.data);
                setRecentConversions(data.data);
                console.log('[DEBUG-FRONTEND] Recent conversions state after set:', data.data);
            } else {
                console.error('[DEBUG-FRONTEND] Failed to fetch recent conversions:', data.message);
            }
        } catch (error) {
            console.error('獲取最近轉換失敗:', error);
        }
    };

    const fetchCodes = async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/affiliate/links`, { headers: { 'Authorization': `Bearer ${token}` } });
            const data = await response.json();
            if (data.success) setCodes(data.data.links);
        } catch (error) {
            console.error('獲取折扣碼失敗:', error);
        }
    };

    const fetchEarnings = async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/affiliate/earnings`, { headers: { 'Authorization': `Bearer ${token}` } });
            const data = await response.json();
            if (data.success) {
                console.log('[DEBUG-FRONTEND] Fetched earnings data:', data.data);
                setEarnings(data.data);
                console.log('[DEBUG-FRONTEND] Earnings state after set:', data.data);
            }
        } catch (error) {
            console.error('獲取收益失敗:', error);
        }
    };

    const generateCode = async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/affiliate/generate-code`, { headers: { 'Authorization': `Bearer ${token}` } });
            const data = await response.json();
            if (data.success) setNewCode({ ...newCode, link_code: data.data.link_code });
        } catch (error) {
            console.error('生成代碼失敗:', error);
        }
    };

    const createCode = async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/affiliate/links`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
                body: JSON.stringify(newCode)
            });
            const data = await response.json();
            if (data.success) {
                fetchCodes();
                setNewCode({ link_code: '', discount_rate: 0.10, commission_rate: 0.05, expires_at: '' });
                setShowCreateForm(false);
            } else {
                alert(data.message);
            }
        } catch (error) {
            console.error('創建折扣碼失敗:', error);
        }
    };

    const copyToClipboard = async (text) => {
        try {
            await navigator.clipboard.writeText(text);
            alert('折扣碼已複製到剪貼簿！');
        } catch (error) {
            console.error('複製失敗:', error);
        }
    };

    const deleteCode = async (linkId) => {
        if (!confirm('確定要刪除這個折扣碼嗎？')) return;
        try {
            const response = await fetch(`${API_BASE_URL}/affiliate/links/${linkId}`, { method: 'DELETE', headers: { 'Authorization': `Bearer ${token}` } });
            const data = await response.json();
            if (data.success) {
                fetchCodes();
                alert('折扣碼已成功刪除！');
            } else {
                alert(data.message);
            }
        } catch (error) {
            console.error('刪除折扣碼失敗:', error);
            alert('刪除失敗，請稍後再試。');
        }
    };

    const formatCurrency = (amount) => new Intl.NumberFormat('zh-TW', { style: 'currency', currency: 'TWD', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(amount || 0);

    const formatExpiryDate = (dateString) => {
        if (!dateString) return '永不過期';
        return new Date(dateString).toLocaleString('zh-TW', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' });
    };

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="max-w-6xl mx-auto">
                <div className="mb-8 flex justify-between items-center">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-800">網紅分潤儀表板</h1>
                        <p className="text-gray-600 mt-2">管理您的專屬折扣碼並追蹤收益</p>
                    </div>
                    <button onClick={loadInitialData} className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg">🔄 刷新</button>
                </div>

                {earnings && (
                    <div className="grid md:grid-cols-3 gap-6 mb-8">
                        <div className="bg-green-50 rounded-lg p-6 border border-green-200"><div className="flex items-center"><CurrencyDollarIcon className="h-8 w-8 text-green-600" /><div className="ml-4"><p className="text-sm font-medium text-green-600">總收益</p><p className="text-2xl font-bold text-green-800">{formatCurrency(earnings.total_earnings.total_commission)}</p></div></div></div>
                        <div className="bg-blue-50 rounded-lg p-6 border border-blue-200"><div className="flex items-center"><ChartBarIcon className="h-8 w-8 text-blue-600" /><div className="ml-4"><p className="text-sm font-medium text-blue-600">總銷售額</p><p className="text-2xl font-bold text-blue-800">{formatCurrency(earnings.total_earnings.total_sales)}</p></div></div></div>
                        <div className="bg-purple-50 rounded-lg p-6 border border-purple-200"><div className="flex items-center"><UserGroupIcon className="h-8 w-8 text-purple-600" /><div className="ml-4"><p className="text-sm font-medium text-purple-600">成功轉換</p><p className="text-2xl font-bold text-purple-800">{earnings.total_earnings.total_conversions}</p></div></div></div>
                    </div>
                )}

                <div className="flex space-x-1 mb-8 bg-gray-100 p-1 rounded-lg">
                    <button onClick={() => setActiveTab('overview')} className={`px-4 py-2 rounded-md font-medium transition-colors ${activeTab === 'overview' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-600'}`}>總覽</button>
                    <button onClick={() => setActiveTab('codes')} className={`px-4 py-2 rounded-md font-medium transition-colors ${activeTab === 'codes' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-600'}`}>折扣碼管理</button>
                </div>

                {/* Tab Content for Overview */}
                {activeTab === 'overview' && (
                    <div>
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                            <div className="lg:col-span-2 bg-white rounded-lg shadow-md p-6">
                                <h3 className="text-lg font-semibold text-gray-900 mb-4">收益趨勢 (最近7天)</h3>
                                {earnings && earnings.earnings_trend && earnings.earnings_trend.length > 0 ? (
                                    <div className="flex justify-around items-end h-48 p-2 border-b border-gray-200">
                                        {earnings.earnings_trend.slice(0, 7).reverse().map((item, index) => (
                                            <div key={index} className="flex flex-col items-center w-1/8">
                                                <div className="text-xs text-green-600">{formatCurrency(item.commission)}</div>
                                                <div className="w-full bg-blue-500 rounded-t-lg mt-1 min-w-[10px] min-h-[1px]" style={{ height: `${(parseFloat(item.commission) / Math.max(1, ...earnings.earnings_trend.map(e => parseFloat(e.commission)))) * 100}%` }}></div>
                                                <div className="text-xs text-gray-500 mt-1">{item.period}</div>
                                            </div>
                                        ))}
                                    </div>
                                ) : <p className="text-gray-500 py-16 text-center">暫無足夠數據生成趨勢圖</p>}
                            </div>
                            <div className="bg-white rounded-lg shadow-md p-6">
                                <h3 className="text-lg font-semibold text-gray-900 mb-4">熱門折扣碼</h3>
                                <div className="space-y-3">
                                    {codes && codes.length > 0 ? codes.sort((a, b) => b.total_revenue - a.total_revenue).slice(0, 5).map((code, index) => (
                                        <div key={code.link_id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                            <div className="font-medium text-gray-800">#{index + 1}. {code.link_code}</div>
                                            <div className="text-green-600 font-semibold">{formatCurrency(code.total_commission)}</div>
                                        </div>
                                    )) : <p className="text-gray-500 text-center py-8">暫無折扣碼數據</p>}
                                </div>
                            </div>
                        </div>
                        <div className="bg-white rounded-lg shadow-md p-6">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">最近轉換紀錄</h3>
                            <div className="overflow-x-auto">
                                <table className="min-w-full">
                                    <tbody className="divide-y divide-gray-200">
                                        {recentConversions && recentConversions.length > 0 ? recentConversions.map(order => (
                                            <tr key={order.order_id}>
                                                <td className="px-4 py-3 text-sm text-gray-800">#{order.order_id.slice(0, 8)}...</td>
                                                <td className="px-4 py-3 text-sm text-gray-800">{formatCurrency(order.total_price)}</td>
                                                <td className="px-4 py-3 text-sm text-green-600 font-semibold">{formatCurrency(order.commission_amount)}</td>
                                                <td className="px-4 py-3 text-sm text-gray-500">{new Date(order.created_at).toLocaleDateString()}</td>
                                            </tr>
                                        )) : (
                                            <tr><td colSpan="4" className="text-center text-gray-500 py-8">暫無轉換紀錄</td></tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'codes' && (
                    <div className="bg-white rounded-lg shadow-md p-6">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-xl font-semibold text-gray-800">我的折扣碼</h2>
                            <button onClick={() => setShowCreateForm(true)} className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center"><PlusIcon className="h-4 w-4 mr-2" />建立新折扣碼</button>
                        </div>
                        {showCreateForm && (
                            <div className="bg-gray-50 rounded-lg p-6 mb-6 border border-gray-200">
                                <h3 className="text-lg font-medium text-gray-800 mb-4">建立新的折扣碼</h3>
                                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">折扣碼</label>
                                        <div className="flex"><input type="text" value={newCode.link_code} onChange={(e) => setNewCode({ ...newCode, link_code: e.target.value })} className="flex-1 px-3 py-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="6-20位英數字" /><button onClick={generateCode} className="px-4 py-2 bg-gray-500 text-white rounded-r-md hover:bg-gray-600">生成</button></div>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">顧客折扣率 (%)</label>
                                        <input type="number" value={newCode.discount_rate * 100} onChange={(e) => setNewCode({ ...newCode, discount_rate: parseFloat(e.target.value) / 100 })} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="例如: 10" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">分潤率 (%)</label>
                                        <input type="number" value={newCode.commission_rate * 100} onChange={(e) => setNewCode({ ...newCode, commission_rate: parseFloat(e.target.value) / 100 })} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="例如: 5" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">過期時間 (可選)</label>
                                        <input type="datetime-local" value={newCode.expires_at} onChange={(e) => setNewCode({ ...newCode, expires_at: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" />
                                    </div>
                                </div>
                                <div className="flex justify-end space-x-4 mt-4">
                                    <button onClick={() => setShowCreateForm(false)} className="px-4 py-2 text-gray-600 hover:text-gray-800">取消</button>
                                    <button onClick={createCode} disabled={!newCode.link_code} className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50">建立折扣碼</button>
                                </div>
                            </div>
                        )}
                        <div className="space-y-4">
                            {codes.map((code) => (
                                <div key={code.link_id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center">
                                            <TagIcon className="h-6 w-6 text-gray-400 mr-4" />
                                            <div>
                                                <p className="font-semibold text-gray-800 text-lg tracking-wider">{code.link_code}</p>
                                                <div className="text-sm text-gray-500 flex items-center space-x-4 mt-1">
                                                    <span>顧客折扣: <strong className="text-blue-600">{(code.discount_rate * 100).toFixed(0)}%</strong></span>
                                                    <span>您的分潤: <strong className="text-green-600">{(code.commission_rate * 100).toFixed(1)}%</strong></span>
                                                    <span>過期時間: <strong className="text-gray-700">{formatExpiryDate(code.expires_at)}</strong></span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${code.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>{code.status === 'active' ? '啟用中' : '暫停'}</span>
                                            <button onClick={() => copyToClipboard(code.link_code)} className="p-2 text-gray-500 hover:text-blue-600" title="複製折扣碼"><ClipboardIcon className="h-5 w-5" /></button>
                                            <button onClick={() => deleteCode(code.link_id)} className="p-2 text-gray-500 hover:text-red-600" title="刪除折扣碼"><TrashIcon className="h-5 w-5" /></button>
                                        </div>
                                    </div>
                                    <div className="mt-4 pt-4 border-t border-gray-100 grid grid-cols-3 gap-4 text-center text-sm">
                                        <div><p className="text-gray-500">點擊次數</p><p className="font-semibold text-lg">{code.total_clicks}</p></div>
                                        <div><p className="text-gray-500">轉換訂單</p><p className="font-semibold text-lg">{code.total_orders}</p></div>
                                        <div><p className="text-gray-500">總收益</p><p className="font-semibold text-lg text-green-700">{formatCurrency(code.total_commission)}</p></div>
                                    </div>
                                </div>
                            ))}
                            {codes.length === 0 && !loading && <div className="text-center py-8"><TagIcon className="h-12 w-12 text-gray-300 mx-auto mb-4" /><p className="text-gray-500">還沒有建立任何折扣碼</p><button onClick={() => setShowCreateForm(true)} className="mt-2 text-blue-600 hover:text-blue-800 font-medium">建立您的第一個折扣碼</button></div>}
                        </div>
                    </div>
                )}
                {/* ... other tabs ... */}
            </div>
        </div>
    );
};

export default AffiliateDashboard;