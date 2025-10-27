// src/pages/ContactPage.jsx
import React from 'react';
import siteContent from '../data/siteContent.json';

const ContactPage = () => {
    // 門市資訊
    const storeLocations = [
        {
            name: "台北辦公室",
            address: "民生東路二段143號8F",
            mapUrl: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3614.7!2d121.544!3d25.064!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMjXCsDAzJzQ4LjAiTiAxMjHCsDMyJzM4LjAiRQ!5e0!3m2!1sen!2stw!4v1234567890",
            customMapUrl: "" // 您可以在這裡輸入自定義地圖網址
        },
        {
            name: "台中門市",
            address: "朝富路268號",
            mapUrl: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3640.7!2d120.644!3d24.164!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMjTCsDA5JzUwLjAiTiAxMjDCsDM4JzM4LjAiRQ!5e0!3m2!1sen!2stw!4v1234567890",
            customMapUrl: "" // 您可以在這裡輸入自定義地圖網址
        },
        {
            name: "高雄辦公室",
            address: "民生一路56號18樓",
            mapUrl: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3683.7!2d120.301!3d22.627!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMjLCsDM3JzM4LjAiTiAxMjDCsDE4JzA0LjAiRQ!5e0!3m2!1sen!2stw!4v1234567890",
            customMapUrl: "" // 您可以在這裡輸入自定義地圖網址
        }
    ];

    return (
        <div className="bg-gray-50 min-h-screen">
            <div className="container mx-auto px-4 py-12">
                {/* 原有聯絡資訊 */}
                <h1 className="text-4xl font-bold text-center text-gray-800 mb-8">聯絡我們</h1>
                <div className="max-w-2xl mx-auto bg-white p-8 rounded-lg shadow-md mb-12">
                    <p className="text-lg text-gray-700 mb-4">如果您有任何疑問或需要協助，請透過以下方式與我們聯繫：</p>
                    <ul className="text-lg text-gray-800 space-y-2">
                        <li><strong>Email：</strong> <a href={`mailto:${siteContent.contactInfo.email}`} className="text-blue-600 hover:underline">{siteContent.contactInfo.email}</a></li>
                        <li><strong>電話：</strong> <a href={`tel:${siteContent.contactInfo.phone}`} className="text-blue-600 hover:underline">{siteContent.contactInfo.phone}</a></li>
                    </ul>
                </div>

                {/* 門市資訊區塊 */}
                <div className="max-w-6xl mx-auto mb-12">
                    <div className="flex items-center mb-8">
                        <div className="w-1 h-8 bg-red-500 mr-4"></div>
                        <h2 className="text-2xl font-bold text-gray-800">門市資訊</h2>
                    </div>
                    
                    <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8">
                        {storeLocations.map((store, index) => (
                            <div key={index} className="bg-white rounded-lg shadow-lg overflow-hidden">
                                <div className="p-6 border-b">
                                    <div className="flex items-center mb-2">
                                        <div className="w-3 h-3 bg-red-500 rounded-full mr-2"></div>
                                        <h3 className="text-lg font-bold text-gray-800">{store.name}</h3>
                                    </div>
                                    <p className="text-gray-600">{store.address}</p>
                                </div>
                                <div className="h-64">
                                    <iframe
                                        src={store.customMapUrl || store.mapUrl}
                                        width="100%"
                                        height="100%"
                                        style={{ border: 0 }}
                                        allowFullScreen=""
                                        loading="lazy"
                                        referrerPolicy="no-referrer-when-downgrade"
                                        title={`${store.name}地圖`}
                                    ></iframe>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* 營業時間 */}
                <div className="max-w-6xl mx-auto mb-12">
                    <div className="bg-white rounded-lg shadow-lg p-6">
                        <div className="flex items-center text-lg">
                            <div className="w-3 h-3 bg-red-500 rounded-full mr-3"></div>
                            <span className="font-bold text-gray-800">營業時間：12:00 - 20:00</span>
                            <span className="ml-4 text-gray-600">（店休：週日 & 週一）</span>
                        </div>
                    </div>
                </div>

                {/* LINE 客服區塊 */}
                <div className="max-w-2xl mx-auto">
                    <div className="bg-white rounded-lg shadow-lg p-8 text-center">
                        <div className="flex items-center justify-center mb-6">
                            <svg className="w-6 h-6 text-gray-400 mr-2" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M12 2L3 7l9 5 9-5-9-5zM3 17l9 5 9-5M3 12l9 5 9-5"/>
                            </svg>
                            <h3 className="text-lg text-gray-600">線上客服不打烊，歡迎隨時聯繫我們</h3>
                        </div>
                        
                        <div className="mb-6">
                            <a 
                                href="https://line.me/R/ti/p/@252flmie" 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="inline-block bg-green-500 hover:bg-green-600 text-white font-bold py-4 px-8 rounded-lg transition-colors duration-300 shadow-lg"
                            >
                                <div className="flex items-center justify-center">
                                    <svg className="w-8 h-8 mr-3" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M19.365 9.863c.349 0 .63.285.63.631 0 .345-.281.63-.63.63H17.61v1.125h1.755c.349 0 .63.283.63.63 0 .344-.281.629-.63.629h-2.386c-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.627-.63h2.386c.349 0 .63.285.63.63 0 .349-.281.63-.63.63H17.61v1.125h1.755zm-3.855 3.016c0 .27-.174.51-.432.596-.064.021-.133.031-.199.031-.211 0-.391-.09-.51-.25l-2.443-3.317v2.94c0 .344-.279.629-.631.629-.346 0-.626-.285-.626-.629V8.108c0-.27.173-.51.43-.595.06-.023.136-.033.194-.033.195 0 .375.104.495.254l2.462 3.33V8.108c0-.345.282-.63.63-.63.345 0 .63.285.63.63v4.771zm-5.741 0c0 .344-.282.629-.631.629-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.627-.63.349 0 .631.285.631.63v4.771zm-2.466.629H4.917c-.345 0-.63-.285-.63-.629V8.108c0-.345.285-.63.63-.63.348 0 .63.285.63.63v4.141h1.756c.348 0 .629.283.629.63 0 .344-.281.628-.629.628M24 10.314C24 4.943 18.615.572 12 .572S0 4.943 0 10.314c0 4.811 4.27 8.842 10.035 9.608.391.082.923.258 1.058.59.12.301.079.766.038 1.08l-.164 1.02c-.045.301-.24 1.186 1.049.645 1.291-.539 6.916-4.078 9.436-6.975C23.176 14.393 24 12.458 24 10.314"/>
                                    </svg>
                                    <div>
                                        <div className="text-xl">LINE</div>
                                        <div className="text-sm opacity-90">ID: @252flmie</div>
                                    </div>
                                </div>
                            </a>
                        </div>

                        <div className="text-center">
                            <p className="text-lg font-medium text-gray-700 flex items-center justify-center">
                                <span className="text-2xl mr-2">✨</span>
                                鑽石，有選擇；閃耀，無極限
                                <span className="text-2xl ml-2">✨</span>
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ContactPage;