// src/pages/ProductDetailPage.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useCart } from '../contexts/CartContext';
import axios from 'axios';

// ProductCard 組件保持不變
const ProductCard = ({ product }) => {
    const navigate = useNavigate();
    return (
        <div
            className="bg-white rounded-lg shadow-md overflow-hidden cursor-pointer hover:shadow-lg transition-shadow duration-300"
            onClick={() => navigate(`/products/${product.json_id}`)}
        >
            <img
                src={product.images && product.images.length > 0 ? product.images[0] : '/placeholder.jpg'}
                alt={product.name}
                className="w-full h-48 object-cover"
            />
            <div className="p-4">
                <h3 className="text-lg font-semibold text-gray-800">{product.name}</h3>
                {/* 使用模擬價格或單一價格來顯示 */}
                {product.price_min === product.price_max ? (
                    <p className="text-blue-600 text-xl font-bold mt-2">NT$ {Math.round(parseFloat(product.price_min)).toLocaleString()}</p>
                ) : (
                    <p className="text-blue-600 text-xl font-bold mt-2">NT$ {Math.round(parseFloat(product.simulated_price)).toLocaleString()}</p>
                )}
            </div>
        </div>
    );
};

const ProductDetailPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { addToCart } = useCart();

    const [product, setProduct] = useState(null);
    const [relatedProducts, setRelatedProducts] = useState([]);
    const [mainImage, setMainImage] = useState('');
    const [quantity, setQuantity] = useState(1);

    const getImagePath = (imagePath) => imagePath;

    useEffect(() => {
        const fetchProduct = async () => {
            try {
                const productResponse = await axios.get(`/api/products/${id}`);
                const fetchedProduct = productResponse.data;
                setProduct(fetchedProduct);

                if (fetchedProduct && fetchedProduct.images && fetchedProduct.images.length > 0) {
                    setMainImage(getImagePath(fetchedProduct.images[0]));
                } else {
                    setMainImage(getImagePath('/placeholder.jpg'));
                }

                const allProductsResponse = await axios.get('/api/products');
                const allProducts = allProductsResponse.data;

                const related = allProducts
                    .filter(p => p.category_id === fetchedProduct.category_id && p.json_id !== fetchedProduct.json_id)
                    .slice(0, 3);
                setRelatedProducts(related);
            } catch (error) {
                console.error('Error fetching product or related products:', error);
                setProduct(null);
                setRelatedProducts([]);
            }
        };
        fetchProduct();
    }, [id]);

    if (product === null) {
        return (
            <div className="container mx-auto px-4 py-16 text-center bg-gray-50 min-h-screen flex flex-col justify-center items-center">
                <h1 className="text-4xl font-bold text-gray-800">載入中...</h1>
                <p className="mt-4 text-lg text-gray-600">如果長時間未顯示，產品可能未找到。</p>
            </div>
        );
    }

    const handleAddToCart = () => {
        if (quantity < 1) {
            alert('請選擇有效的商品數量！');
            return;
        }

        addToCart({
            ...product,
            price: product.simulated_price // ✨ 在加入購物車時使用模擬價格
        }, quantity);

        alert(`"${product.name}" (數量: ${quantity}) 已成功加入購物車！`);
    };

    return (
        <div className="container mx-auto px-4 py-8 md:py-12 bg-gray-50">
            <div className="bg-white rounded-lg shadow-xl p-6 md:p-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-8 md:gap-12 items-start">
                {/* 左側：產品圖片區塊 */}
                <div className="flex flex-col items-center">
                    <div className="w-full max-w-lg mb-6 bg-gray-50 rounded-lg overflow-hidden flex justify-center items-center">
                        <img
                            src={mainImage}
                            alt={product.name}
                            className="w-full h-auto max-h-[500px] object-contain transition-opacity duration-300 ease-in-out"
                        />
                    </div>
                    {product.images && product.images.length > 1 && (
                        <div className="flex justify-center w-full">
                            <div className="grid grid-cols-4 gap-3 max-w-lg">
                                {product.images.map((img, index) => (
                                    <div
                                        key={index}
                                        className={`w-full h-24 bg-gray-50 rounded-lg cursor-pointer overflow-hidden flex justify-center items-center p-1
                                            border-2 ${mainImage === getImagePath(img) ? 'border-blue-600' : 'border-transparent'}
                                            hover:border-blue-400 transition-all duration-200`}
                                        onClick={() => setMainImage(getImagePath(img))}
                                    >
                                        <img
                                            src={getImagePath(img)}
                                            alt={`${product.name} - 角度 ${index + 1}`}
                                            className="max-w-full max-h-full object-contain"
                                        />
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* 右側：產品資訊區塊 - 依照你的新排版進行修改 */}
                <div>
                    {/* 商品名稱 */}
                    <h1 className="text-4xl lg:text-5xl font-extrabold text-gray-800 mb-6">{product.name}</h1>
                    
                    {/* 產品敘述 */}
                    <p className="text-gray-700 text-lg mb-6 leading-relaxed">{product.description}</p>
                    
                    {/* 注意框 */}
                    <div className="bg-yellow-50 border-l-4 border-yellow-400 text-yellow-800 p-4 mb-6 rounded-md">
                        <div className="flex">
                            <div className="flex-shrink-0">
                                <svg className="h-5 w-5 text-yellow-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.487 0l5.58 9.92c.754 1.346-.245 3.03-1.742 3.03H4.417c-1.497 0-2.496-1.684-1.742-3.03l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                </svg>
                            </div>
                            <div className="ml-3">
                                <p className="text-sm font-medium">
                                    本商品需依據您的需求確認鑽石規格、戒圍尺寸、貴金屬材質等細節。為確保服務品質與產品完整度，目前暫不開放線上購物車結帳。
                                </p>
                            </div>
                        </div>
                    </div>
                    
                    {/* 引流框 */}
                    <div className="bg-gray-100 p-4 mb-6 rounded-md">
                        <div className="flex items-center mb-4">
                            <span className="font-semibold text-gray-800">📩 購買與諮詢請透過 LINE 或客服中心聯絡我們</span>
                        </div>
                        <div className="flex space-x-4">
                            <a href="https://line.me/R/ti/p/@252flmie?oat_content=url&ts=07181245" target="_blank" rel="noopener noreferrer" className="flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-500 hover:bg-green-600 transition-colors">
                                <i className="fab fa-line mr-2"></i> 加入好友
                            </a>
                            <a href="mailto:service@yourbrand.com" className="flex items-center justify-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50 transition-colors">
                                <i className="fas fa-headset mr-2"></i> 客服中心
                            </a>
                        </div>
                    </div>

                    {/* 訂價基準框 */}
                    <div className="bg-blue-50 p-6 mb-6 rounded-lg border border-blue-200">
                        <h3 className="flex items-center text-xl font-bold text-blue-800 mb-4">
                            <span className="mr-2">💎</span> 訂價基準
                        </h3>
                        <p className="text-gray-700 mb-4">此款價格基於鉑金（PT950）材質的設計。</p>
                        <ul className="list-none space-y-2 text-gray-700 mb-4">
                            <li className="flex items-center">
                                <span className="text-blue-500 mr-2">🔹</span> 天然鑽款：{product.carat} 克拉 {product.color} 色 {product.clarity_1}，{product.Level} 等級
                            </li>
                            <li className="flex items-center">
                                <span className="text-blue-500 mr-2">🔹</span> 培育鑽款：{product.carat} 克拉 {product.color} 色 {product.clarity_2}，{product.Level} 等級
                            </li>
                        </ul>
                        <p className="text-gray-600 text-sm">
                            配鑽將依主鑽類型一致搭配，天然配天然，培育配培育。
                            <br />
                            如有特殊規格、材質更換或其他客製需求，歡迎洽詢專人服務。
                        </p>
                    </div>

                    {/* 售價範圍 */}
                    <p className="text-rose-500 text-3xl font-extrabold mb-6">
                        NT$ {Math.round(parseFloat(product.price_min)).toLocaleString()}~NT$ {Math.round(parseFloat(product.price_max)).toLocaleString()}
                    </p>

                    {/* 數量選擇器 */}
                    <div className="mb-8 flex items-center">
                        <label htmlFor="quantity" className="block text-xl font-medium text-gray-700 mr-4">數量:</label>
                        <div className="flex border border-gray-300 rounded-md overflow-hidden">
                            <button
                                onClick={() => setQuantity(prev => Math.max(1, prev - 1))}
                                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-lg focus:outline-none"
                            >
                                -
                            </button>
                            <input
                                type="number"
                                id="quantity"
                                value={quantity}
                                onChange={(e) => {
                                    const val = parseInt(e.target.value);
                                    setQuantity(isNaN(val) || val < 1 ? '' : val);
                                }}
                                onBlur={(e) => {
                                    if (parseInt(e.target.value) < 1 || e.target.value === '') {
                                        setQuantity(1);
                                    }
                                }}
                                min="1"
                                className="w-20 text-center py-2 focus:outline-none appearance-none text-lg"
                            />
                            <button
                                onClick={() => setQuantity(prev => prev + 1)}
                                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-lg focus:outline-none"
                            >
                                +
                            </button>
                        </div>
                    </div>

                    {/* 加入購物車按鈕 */}
                    <button
                        onClick={handleAddToCart}
                        className="w-full bg-blue-600 text-white text-xl py-3 px-6 rounded-lg hover:bg-blue-700 transition-colors duration-300 font-semibold shadow-md flex items-center justify-center"
                    >
                        <i className="fas fa-shopping-cart mr-2"></i> 加入購物車
                    </button>
                    
                    {/* 商品編號 */}
                    <p className="text-gray-500 text-sm mt-6">商品編號: {product.product_code}</p>
                </div>
            </div>

            {/* 以下區塊保持不變，但因排版會受影響，建議重新審視 */}
            {/* ... 客戶評價區塊 */}
            {/* ... 相關產品推薦區塊 */}

            {relatedProducts.length > 0 && (
                <section className="mt-16 py-8 border-t border-gray-200 bg-white rounded-lg shadow-md p-6">
                    <h2 className="text-3xl font-bold text-gray-800 mb-6 text-center">相關產品推薦</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-8">
                        {relatedProducts.map(relProduct => (
                            <ProductCard key={relProduct.json_id} product={relProduct} />
                        ))}
                    </div>
                </section>
            )}
        </div>
    );
};

export default ProductDetailPage;