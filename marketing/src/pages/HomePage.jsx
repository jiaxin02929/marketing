// src/pages/Homepage.jsx
import React, { useState, useEffect } from 'react'; // ✨ 修正: 匯入 useState 和 useEffect
import { Link } from 'react-router-dom';
import siteContent from '../data/siteContent.json'; // 這些靜態檔案現在應該從後端 API 取得
import axios from 'axios'; // ✨ 修正: 匯入 axios

// 引入首頁用到的元件
import ProductCard from '../components/ProductCard';
import TestimonialsSection from '../components/TestimonialsSection';
import LatestNewsPreview from '../components/LatestNewsPreview';

const HomePage = () => {
    // 從 products.json 中選取3-4個產品作為特色產品
    const [featuredProducts, setFeaturedProducts] = useState([]);


    // 從 siteContent 中獲取品牌故事摘要
    const brandStoryExcerpt = siteContent.aboutPageText.substring(0, 200) + '...'; // 取前200字作為摘要

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                // 從後端 API 取得所有產品
                const { data } = await axios.get('/api/products');
                
                // ✅ 關鍵修復：檢查 data 是否為陣列
                if (Array.isArray(data)) {
                    const selectedProducts = [
                        data.find(p => p.json_id === 'male_ring_001'), 
                        data.find(p => p.json_id === 'couple_ring_001'), 
                        data.find(p => p.json_id === 'earrings_001'), 
                        data.find(p => p.json_id === 'necklace_001')
                    ].filter(p => p);
                    
                    setFeaturedProducts(selectedProducts);
                } else {
                    console.error('後端傳回的資料不是陣列:', data);
                    setFeaturedProducts([]); // 設為空陣列以避免崩潰
                }
            } catch (error) {
                console.error('無法取得產品資料:', error);
                setFeaturedProducts([]);
            }
        };
        fetchProducts();
    }, []);

    return (
        <div className="bg-gray-50">
            {/* 英雄區塊 - 參考您的首頁圖 */}
            <section className="relative h-[600px] md:h-[750px] overflow-hidden">
                <img
                    src="/images/hero_background.png"
                    alt="輪播背景"
                    className="absolute inset-0 w-full h-full object-cover"
                />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-white text-center z-10">
                    <h1 className="text-4xl md:text-6xl font-bold mb-4 leading-tight shadow-text">
                        Not a fairytale, but it shines brighter than one.
                    </h1>
                    <Link
                        to="/products"
                        className="inline-block px-8 py-3 bg-white text-gray-800 font-semibold text-lg rounded-full hover:bg-gray-200 transition-colors duration-300 shadow-lg"
                    >
                        Shop Now
                    </Link>
                </div>
            </section>

            {/* 熱門或特色產品區塊 */}
            <section className="py-16">
                <div className="container mx-auto px-4">
                    <h2 className="text-4xl font-bold text-center text-gray-800 mb-4">特色產品</h2>
                    <p className="text-center text-gray-600 mb-12 max-w-2xl mx-auto">
                        探索我們精選的璀璨鑽石飾品，每一件都是匠心獨運的藝術品。
                    </p>
                    <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
                        {featuredProducts.length > 0 ? (
                            featuredProducts.map(product => (
                                <ProductCard key={product.json_id} product={product} />
                            ))
                        ) : (
                            <p className="col-span-4 text-center text-gray-500">無法載入特色產品，請稍後再試。</p>
                        )}
                    </div>
                    <div className="text-center mt-12">
                        <Link to="/products" className="px-8 py-4 bg-gray-800 text-white rounded-full hover:bg-gray-700 transition-colors duration-300 text-lg font-semibold">
                            查看所有產品
                        </Link>
                    </div>
                </div>
            </section>

            {/* 最新消息區塊 (使用 LatestNewsPreview 元件) */}
            <LatestNewsPreview />

            {/* 客戶評價區塊 (使用 TestimonialsSection 元件) */}
            <TestimonialsSection />

            {/* 品牌故事摘要區塊 */}
            <section className="py-16 bg-blue-50">
                <div className="container mx-auto px-4 text-center">
                    <h2 className="text-4xl font-bold text-gray-800 mb-6">我們的品牌故事</h2>
                    <p className="text-lg text-gray-700 leading-relaxed max-w-3xl mx-auto">
                        {brandStoryExcerpt}
                    </p>
                    <Link to="/about" className="inline-block mt-8 px-6 py-3 border-2 border-blue-600 text-blue-600 rounded-full hover:bg-blue-600 hover:text-white transition-colors duration-300 font-semibold">
                        了解更多
                    </Link>
                </div>
            </section>

            {/* 聯絡支援區塊 */}
            <section className="py-16 bg-white">
                <div className="container mx-auto px-4">
                    <h2 className="text-4xl font-bold text-center text-gray-800 mb-12">需要協助嗎？</h2>
                    <div className="grid md:grid-cols-2 gap-12 items-center">
                        <div>
                            <img src="/images/support_person.png" alt="Support" className="rounded-lg shadow-lg w-full h-auto object-cover" />
                        </div>
                        <div>
                            <p className="text-lg text-gray-700 mb-6">
                                如果您有任何疑問或需要協助，請填寫下列表單，我們將盡快與您聯繫。
                            </p>
                            <form className="space-y-4">
                                <div>
                                    <label htmlFor="firstName" className="block text-sm font-medium text-gray-700">姓名</label>
                                    <input type="text" id="firstName" name="firstName" className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500" placeholder="您的姓名" />
                                </div>
                                <div>
                                    <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
                                    <input type="email" id="email" name="email" className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500" placeholder="您的電子郵件" />
                                </div>
                                <div>
                                    <label htmlFor="message" className="block text-sm font-medium text-gray-700">您想詢問什麼？</label>
                                    <textarea id="message" name="message" rows="4" className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500" placeholder="請在此輸入您的訊息..."></textarea>
                                </div>
                                <button type="submit" className="w-full bg-gray-800 text-white py-3 rounded-md hover:bg-gray-700 transition-colors duration-300 font-semibold">
                                    提交
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default HomePage;