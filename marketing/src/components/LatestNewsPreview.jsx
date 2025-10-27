// src/components/LatestNewsPreview.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import siteContent from '../data/siteContent.json';

const LatestNewsPreview = () => {
    const latestPosts = siteContent.blogPosts.slice(0, 3); // 顯示最新的3篇文章

    return (
        <section className="py-16 bg-white">
            <div className="container mx-auto px-4">
                <h2 className="text-4xl font-bold text-center text-gray-800 mb-12">最新消息</h2>
                <div className="grid md:grid-cols-3 gap-8">
                    {latestPosts.map((post) => (
                        <Link to={post.path} key={post.id} className="block group rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-300">
                            <img
                                src={post.image || '/images/placeholder_blog.jpg'} // 確保有這些圖片
                                alt={post.title}
                                className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                            />
                            <div className="p-4">
                                <h3 className="text-xl font-semibold text-gray-800 group-hover:text-blue-600 transition-colors duration-200">{post.title}</h3>
                                <p className="text-gray-600 mt-2 text-sm">{post.excerpt}</p>
                            </div>
                        </Link>
                    ))}
                </div>
                {/* 如果想有「查看更多」按鈕，可以加在這裡 */}
                {/* <div className="text-center mt-12">
                    <Link to="/blog" className="px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors duration-300">
                        查看更多消息
                    </Link>
                </div> */}
            </div>
        </section>
    );
};

export default LatestNewsPreview;