// src/pages/ProductsPage.jsx
import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import axios from 'axios'; // ✨ 引入 axios

const ProductsPage = () => {
    const location = useLocation();
    const navigate = useNavigate();

    // 狀態來儲存從後端獲取的產品和分類數據
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true); // 新增載入狀態
    const [error, setError] = useState(null); // 新增錯誤狀態

    // 從 URL 查詢參數中獲取當前選中的分類
    const queryParams = new URLSearchParams(location.search);
    const initialCategory = queryParams.get('category') || 'all'; // 默認為 'all'

    const [selectedCategory, setSelectedCategory] = useState(initialCategory);

    // ✨ 修改點：使用 useEffect 從後端獲取數據
    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            setError(null);
            try {
                // 獲取所有產品
                const productsResponse = await axios.get('/api/products');
                setProducts(productsResponse.data);

                // 獲取所有分類
                const categoriesResponse = await axios.get('/api/categories');
                setCategories(categoriesResponse.data);

            } catch (err) {
                console.error('Error fetching data:', err);
                setError('無法載入產品或分類數據。');
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []); // 空依賴項表示只在組件首次掛載時運行一次

    // 當 URL 查詢參數改變時 (例如通過瀏覽器回退/前進)，更新 selectedCategory 狀態
    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const categoryFromUrl = params.get('category') || 'all';
        // 只有當從 URL 獲取的分類與當前狀態不同時才更新，避免不必要的重新渲染
        if (categoryFromUrl !== selectedCategory) {
            setSelectedCategory(categoryFromUrl);
        }
    }, [location.search, selectedCategory]);


    // 根據 selectedCategory 篩選產品
    // ✨ 修改點：現在篩選的是 `products` 狀態中的數據，並且使用 `product.category_id` 進行比較
    const filteredProducts = products.filter(product =>
        selectedCategory === 'all' || product.category_id === selectedCategory
    );

    // 處理分類點擊事件，並更新 URL 查詢參數
    const handleCategoryClick = (categoryId) => {
        setSelectedCategory(categoryId);
        if (categoryId === 'all') {
            navigate('/products'); // 如果是「所有產品」，移除查詢參數
        } else {
            navigate(`/products?category=${categoryId}`);
        }
    };

    // 用於顯示當前選中的分類名稱 (標題)
    // ✨ 修改點：現在從 `categories` 狀態中查找分類名稱
    const displayTitle = selectedCategory === 'all'
        ? '所有產品'
        : categories.find(cat => cat.id === selectedCategory)?.name || '產品';

    // 輔助函數來處理圖片路徑
    const getImagePath = (imagePath) => {
        // 直接返回，因為 Vite 會自動處理 public 資料夾的相對路徑
        // 確保從資料庫拿到的圖片路徑是正確可用的
        return imagePath;
    };

    if (loading) {
        return (
            <div className="container mx-auto px-4 py-16 text-center bg-gray-50 min-h-screen flex flex-col justify-center items-center">
                <h1 className="text-4xl font-bold text-gray-800">載入中...</h1>
                <p className="mt-4 text-lg text-gray-600">正在獲取產品和分類數據。</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="container mx-auto px-4 py-16 text-center bg-gray-50 min-h-screen flex flex-col justify-center items-center">
                <h1 className="text-4xl font-bold text-red-600">錯誤！</h1>
                <p className="mt-4 text-lg text-gray-600">{error}</p>
                <button
                    onClick={() => window.location.reload()}
                    className="mt-8 bg-blue-600 text-white py-3 px-6 rounded-lg text-lg hover:bg-blue-700 transition-colors duration-300 shadow-md"
                >
                    重試
                </button>
            </div>
        );
    }
    
    return (
        <div className="container mx-auto p-4 py-8 flex flex-col md:flex-row">
            {/* 左側邊欄 - 分類篩選 */}
            <aside className="w-full md:w-1/4 lg:w-1/5 md:pr-8 mb-8 md:mb-0">
                <h2 className="text-2xl font-bold text-gray-800 mb-4 border-b pb-2">產品分類</h2>
                <ul className="space-y-2">
                    <li>
                        <button
                            onClick={() => handleCategoryClick('all')}
                            className={`w-full text-left py-2 px-4 rounded-md transition-colors duration-200 
                                ${selectedCategory === 'all' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                        >
                            所有產品
                        </button>
                    </li>
                    {categories.map((cat) => ( // ✨ 從 categories 狀態映射
                        <li key={cat.id}>
                            <button
                                onClick={() => handleCategoryClick(cat.id)}
                                className={`w-full text-left py-2 px-4 rounded-md transition-colors duration-200 
                                    ${selectedCategory === cat.id ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                            >
                                {cat.name}
                            </button>
                        </li>
                    ))}
                </ul>
            </aside>

            {/* 右側內容 - 產品列表 */}
            <div className="w-full md:w-3/4 lg:w-4/5">
                <h1 className="text-4xl font-bold text-center text-gray-800 mb-8">
                    {displayTitle}
                </h1>

                {filteredProducts.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {filteredProducts.map((product) => (
                            // 將整個產品卡片包裝在 Link 裡面，點擊跳轉到產品詳情頁面
                            <Link
                                // ✨ 重要：這裡的 key 和 to 都需要使用 product.json_id
                                key={product.json_id}
                                to={`/products/${product.json_id}`} // <-- 點擊跳轉到 /products/json_id
                                className="bg-white rounded-lg shadow-lg overflow-hidden transition-transform transform hover:scale-105 cursor-pointer block" // block 使 Link 佔據整個 div 空間
                            >
                                <img
                                    // 確保 product.images 存在且有第一個元素
                                    src={product.images && product.images.length > 0 ? getImagePath(product.images[0]) : '/placeholder.jpg'}
                                    alt={product.name}
                                    className="w-full h-64 object-cover"
                                />
                                <div className="p-4">
                                    <h2 className="text-xl font-semibold text-gray-800 truncate">
                                        {product.name}
                                    </h2>
                                    {/* 確保 price 是數字再格式化 */}
                                    <p className="text-rose-600 font-bold mt-2">
                                        NT$ {parseInt(product.price_min)?.toLocaleString()}
                                    </p>
                                </div>
                            </Link>
                        ))}
                    </div>
                ) : (
                    <p className="text-center text-gray-600 text-lg mt-16">
                        抱歉，目前沒有找到 {displayTitle} 類別的產品。
                    </p>
                )}
            </div>
        </div>
    );
};

export default ProductsPage;