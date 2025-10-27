// src/pages/SearchResultsPage.jsx
import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';

const SearchResultsPage = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [filters, setFilters] = useState({
        category: 'all',
        min_price: '',
        max_price: '',
        sort: 'newest'
    });
    const [pagination, setPagination] = useState({
        total: 0,
        page: 1,
        limit: 12,
        total_pages: 0
    });

    const API_BASE_URL = 'http://localhost:5002/api';

    // 從 URL 參數解析搜尋條件
    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const query = params.get('q') || '';
        const category = params.get('category') || 'all';
        const min_price = params.get('min_price') || '';
        const max_price = params.get('max_price') || '';
        const sort = params.get('sort') || 'newest';
        const page = parseInt(params.get('page')) || 1;

        setSearchQuery(query);
        setFilters({ category, min_price, max_price, sort });
        setPagination(prev => ({ ...prev, page }));

        // 如果有任何篩選條件，就執行搜尋
        if (query.trim() || category !== 'all' || min_price || max_price) {
            performSearch(query, { category, min_price, max_price, sort }, page);
        }
    }, [location.search]);

    const performSearch = async (query, searchFilters = filters, currentPage = pagination.page) => {

        setIsLoading(true);
        setError('');

        try {
            const params = new URLSearchParams({
                q: query,
                page: currentPage.toString(),
                limit: pagination.limit.toString(),
                ...(searchFilters.category !== 'all' && { category: searchFilters.category }),
                ...(searchFilters.min_price && { min_price: searchFilters.min_price }),
                ...(searchFilters.max_price && { max_price: searchFilters.max_price }),
                sort: searchFilters.sort
            });

            const response = await fetch(`${API_BASE_URL}/products/search?${params}`);
            const data = await response.json();

            if (data.success) {
                setSearchResults(data.data.products);
                setPagination(data.data.pagination);
            } else {
                setError(data.message || '搜尋失敗');
            }
        } catch (err) {
            setError('搜尋時發生網路錯誤，請稍後再試');
            console.error('Search error:', err);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSearchSubmit = (e) => {
        e.preventDefault();
        updateURL(searchQuery, filters, 1);
    };

    const handleFilterChange = (newFilters) => {
        setFilters(newFilters);
        updateURL(searchQuery, newFilters, 1);
    };

    const handlePageChange = (newPage) => {
        updateURL(searchQuery, filters, newPage);
    };

    const updateURL = (query, searchFilters, page) => {
        const params = new URLSearchParams({
            q: query,
            page: page.toString(),
            ...(searchFilters.category !== 'all' && { category: searchFilters.category }),
            ...(searchFilters.min_price && { min_price: searchFilters.min_price }),
            ...(searchFilters.max_price && { max_price: searchFilters.max_price }),
            sort: searchFilters.sort
        });
        navigate(`/search?${params}`, { replace: true });
    };

    const formatPrice = (price) => {
        return new Intl.NumberFormat('zh-TW', {
            style: 'currency',
            currency: 'TWD',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(price);
    };

    const formatCategory = (categoryId) => {
        const categoryMap = {
            'male-rings': '男戒',
            'female-rings': '女戒', 
            'couple-rings': '對戒',
            'necklaces': '項鍊',
            'bracelets': '手鍊',
            'earrings': '耳環',
            'diamonds': '裸鑽'
        };
        return categoryMap[categoryId] || categoryId;
    };

    return (
        <div className="container mx-auto px-4 py-8">
            {/* 搜尋表單 */}
            <div className="bg-white rounded-lg shadow-md p-6 mb-8">
                <form onSubmit={handleSearchSubmit} className="mb-6">
                    <div className="flex flex-col md:flex-row gap-4">
                        <div className="flex-1">
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="搜尋產品名稱、描述、材質、顏色..."
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                        <button
                            type="submit"
                            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            搜尋
                        </button>
                    </div>
                </form>

                {/* 篩選器 */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">分類</label>
                        <select
                            value={filters.category}
                            onChange={(e) => handleFilterChange({ ...filters, category: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="all">所有分類</option>
                            <option value="male-rings">男戒</option>
                            <option value="female-rings">女戒</option>
                            <option value="couple-rings">對戒</option>
                            <option value="necklaces">項鍊</option>
                            <option value="bracelets">手鍊</option>
                            <option value="earrings">耳環</option>
                            <option value="diamonds">裸鑽</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">最低價格</label>
                        <input
                            type="number"
                            value={filters.min_price}
                            onChange={(e) => handleFilterChange({ ...filters, min_price: e.target.value })}
                            placeholder="最低價格"
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">最高價格</label>
                        <input
                            type="number"
                            value={filters.max_price}
                            onChange={(e) => handleFilterChange({ ...filters, max_price: e.target.value })}
                            placeholder="最高價格"
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">排序方式</label>
                        <select
                            value={filters.sort}
                            onChange={(e) => handleFilterChange({ ...filters, sort: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="newest">最新發布</option>
                            <option value="oldest">最早發布</option>
                            <option value="price_asc">價格由低到高</option>
                            <option value="price_desc">價格由高到低</option>
                            <option value="name_asc">名稱 A-Z</option>
                            <option value="name_desc">名稱 Z-A</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* 搜尋結果標題 */}
            {searchQuery && (
                <div className="mb-6">
                    <h1 className="text-2xl font-bold text-gray-800">
                        搜尋結果："{searchQuery}"
                    </h1>
                    {!isLoading && searchResults.length > 0 && (
                        <p className="text-gray-600 mt-2">
                            找到 {pagination.total} 個相關產品（第 {pagination.page} 頁 / 共 {pagination.total_pages} 頁）
                        </p>
                    )}
                </div>
            )}

            {/* 載入狀態 */}
            {isLoading && (
                <div className="text-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
                    <p className="mt-4 text-gray-600">搜尋中...</p>
                </div>
            )}

            {/* 錯誤訊息 */}
            {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                    <p className="text-red-700">{error}</p>
                </div>
            )}

            {/* 搜尋結果 */}
            {!isLoading && searchResults.length > 0 && (
                <>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
                        {searchResults.map((product) => (
                            <div key={product.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
                                <Link to={`/products/${product.json_id}`}>
                                    <img
                                        src={product.images && product.images.length > 0 ? product.images[0] : '/images/products/placeholder.jpg'}
                                        alt={product.name}
                                        className="w-full h-48 object-cover hover:scale-105 transition-transform"
                                    />
                                </Link>
                                <div className="p-4">
                                    <Link to={`/products/${product.json_id}`}>
                                        <h3 className="text-lg font-semibold text-gray-800 mb-2 hover:text-blue-600 transition-colors">
                                            {product.name}
                                        </h3>
                                    </Link>
                                    <p className="text-gray-600 text-sm mb-2 line-clamp-2">
                                        {product.description}
                                    </p>
                                    <div className="flex justify-between items-center">
                                        <div className="text-lg font-bold text-blue-600">
                                            {formatPrice(product.simulated_price)}
                                        </div>
                                        <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                                            {formatCategory(product.category_id)}
                                        </span>
                                    </div>
                                    {product.material && (
                                        <p className="text-xs text-gray-500 mt-1">材質：{product.material}</p>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* 分頁 */}
                    {pagination.total_pages > 1 && (
                        <div className="flex justify-center">
                            <nav className="flex space-x-2">
                                <button
                                    onClick={() => handlePageChange(pagination.page - 1)}
                                    disabled={pagination.page <= 1}
                                    className="px-3 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    上一頁
                                </button>
                                {[...Array(Math.min(5, pagination.total_pages))].map((_, i) => {
                                    const pageNum = Math.max(1, pagination.page - 2) + i;
                                    if (pageNum <= pagination.total_pages) {
                                        return (
                                            <button
                                                key={pageNum}
                                                onClick={() => handlePageChange(pageNum)}
                                                className={`px-3 py-2 rounded ${
                                                    pageNum === pagination.page
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
                                    onClick={() => handlePageChange(pagination.page + 1)}
                                    disabled={pagination.page >= pagination.total_pages}
                                    className="px-3 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    下一頁
                                </button>
                            </nav>
                        </div>
                    )}
                </>
            )}

            {/* 無搜尋結果 */}
            {!isLoading && searchQuery && searchResults.length === 0 && !error && (
                <div className="text-center py-12">
                    <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    <h3 className="mt-4 text-lg font-medium text-gray-900">找不到相關產品</h3>
                    <p className="mt-2 text-sm text-gray-500">
                        嘗試使用不同的關鍵字或調整篩選條件
                    </p>
                </div>
            )}

            {/* 初始狀態（無搜尋關鍵字） */}
            {!searchQuery && (
                <div className="text-center py-12">
                    <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    <h3 className="mt-4 text-lg font-medium text-gray-900">開始搜尋產品</h3>
                    <p className="mt-2 text-sm text-gray-500">
                        輸入產品名稱、分類、材質或任何相關關鍵字來找到您想要的珠寶
                    </p>
                </div>
            )}
        </div>
    );
};

export default SearchResultsPage;