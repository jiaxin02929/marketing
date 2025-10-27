import React from 'react';
import { Link } from 'react-router-dom';

const ProductCard = ({ product }) => {
    return (
        <Link to={`/products/${product.json_id}`} className="block group border border-gray-200 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-300">
            <div className="relative overflow-hidden">
                <img
                    src={product.images[0] || '/images/placeholder.jpg'} // 使用第一張圖，如果沒有則用佔位圖
                    alt={product.name}
                    className="w-full h-64 object-cover transform group-hover:scale-105 transition-transform duration-300"
                />
            </div>
            <div className="p-4 text-center">
                <h3 className="text-lg font-semibold text-gray-800 truncate group-hover:text-blue-600 transition-colors duration-200">{product.name}</h3>
                <p className="text-gray-900 font-bold mt-2">
                    NT$ {Math.round(product.price_min)?.toLocaleString()} - {Math.round(product.price_max)?.toLocaleString()}
                </p>
                {/* 簡單的描述，可以選擇性顯示 */}
                {/* <p className="text-sm text-gray-600 mt-1">{product.description}</p> */}
            </div>
        </Link>
    );
};

export default ProductCard;