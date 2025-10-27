// src/pages/AboutPage.jsx
import React from 'react';
import siteContent from '../data/siteContent.json'; // 引入 siteContent 數據

const AboutPage = () => {
    // 從 siteContent.json 中獲取資訊
    const { aboutPageText, contactInfo } = siteContent;

    // 社群媒體連結資訊 (根據你提供的圖片和常見連結格式構建)
    // 請替換 'YOUR_YOUTUBE_URL', 'YOUR_TIKTOK_URL' 等為你實際的連結
    const socialLinks = [
        { name: 'YouTube', icon: 'fab fa-youtube', description: '精彩短影片', url: 'https://www.youtube.com/@%E9%91%BD%E4%B9%8B%E9%9F%BBDIAMONDSYMPHONY/shorts' }, //
        { name: 'TikTok', icon: 'fab fa-tiktok', description: '趣味短影片', url: 'https://www.tiktok.com/@.diamond.symphony' }, //
        { name: 'Facebook', icon: 'fab fa-facebook-f', description: '品牌資訊與活動', url: 'https://www.facebook.com/profile.php?id=61565776509572' }, //
        { name: 'Instagram', icon: 'fab fa-instagram', description: '精美珠寶展示', url: 'https://www.instagram.com/zuanzhiyun/' }, //
        { name: 'LINE', icon: 'fab fa-line', description: '線上諮詢與新品訊息', url: 'https://lin.ee/dY9OiEQ' }, //
    ];

    // 服務項目 (使用 SVG 圖標)
    const services = [
        {
            title: '戒指訂製',
            icon: (
                <svg className="w-12 h-12 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                </svg>
            ),
            description: '我們提供各種戒指設計服務，無論是經典款式還是個性化設計，都能滿足您的需求，打造獨一無二的婚戒或紀念戒。'
        },
        {
            title: '項鍊設計',
            icon: (
                <svg className="w-12 h-12 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5.25 8.25h13.5m-13.5 7.5h13.5m-1.875-3.75a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
            ),
            description: '從吊墜到完整的項鍊設計，我們的專業團隊將根據您的需求，打造出符合個人風格的項鍊作品。'
        },
        {
            title: '耳環設計',
            icon: (
                <svg className="w-12 h-12 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.286zm0 13.036h.008v.008h-.008v-.008z" />
                </svg>
            ),
            description: '耳釘、耳環或垂墜耳飾，皆可根據您的喜好與需求，提供量身打造的設計服務，呈現優雅或俏皮風格。'
        },
        {
            title: '裸鑽服務',
            icon: (
                <svg className="w-12 h-12 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
                </svg>
            ),
            description: '我們提供經 GIA 認證的裸鑽，無論您是用於收藏還是製作專屬珠寶，我們都能為您提供最合適的選擇。'
        },
    ];

    return (
        <div className="container mx-auto px-4 py-8 md:py-12">
            {/* <h1 className="text-4xl md:text-5xl font-extrabold text-center text-gray-800 mb-10">關於我們</h1> */}

            {/* 品牌簡介 */}
            <section className="bg-white rounded-lg shadow-xl p-6 md:p-8 mb-12 text-center">
                <div className="max-w-3xl mx-auto">
                    <svg className="w-12 h-12 text-blue-600 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 18L4 10l8-8 8 8-8 8z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M4 10h16" />
                    </svg>
                    <h2 className="text-3xl font-bold text-gray-800 mb-6">品牌理念</h2>
                    <p className="text-gray-700 text-lg leading-relaxed">
                        {aboutPageText}
                    </p>
                </div>
                {/* 可以考慮在這裡添加一張品牌形象圖 */}
                {/* <div className="mt-8">
                    <img src="/images/about_us_hero.jpg" alt="Our Brand Story" className="w-full h-auto rounded-lg shadow-md"/>
                </div> */}
            </section>

            {/* 我們的服務 */}
            <section className="mb-12">
                <h2 className="text-3xl font-bold text-gray-800 mb-8 text-center">專業服務</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {services.map((service, index) => (
                        <div key={index} className="bg-white rounded-lg shadow-md p-6 flex flex-col items-center text-center">
                            <div className="mb-4">{service.icon}</div> {/* 直接渲染 SVG 圖標 */}
                            <h3 className="text-xl font-semibold text-gray-800 mb-3">{service.title}</h3>
                            <p className="text-gray-600 leading-relaxed">{service.description}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* 社群網站連結 */}
            <section className="mb-12">
                <h2 className="text-3xl font-bold text-gray-800 mb-8 text-center">社群網站連結</h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-6">
                    {socialLinks.map((link, index) => (
                        <a
                            key={index}
                            href={link.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="bg-white rounded-lg shadow-md p-6 flex flex-col items-center justify-center text-center hover:shadow-lg transition-shadow duration-300 transform hover:-translate-y-1"
                        >
                            <i className={`${link.icon} text-4xl mb-3 ${link.name === 'Facebook' ? 'text-blue-700' :
                                link.name === 'LINE' ? 'text-green-500' :
                                link.name === 'YouTube' ? 'text-red-600' :
                                link.name === 'TikTok' ? 'text-black' : // TikTok 圖標可能需要自定義顏色或使用黑白
                                link.name === 'Instagram' ? 'text-purple-600' : ''
                            }`}></i> {/* 根據平台調整顏色 */}
                            <h3 className="text-lg font-semibold text-gray-800 mb-1">{link.name}</h3>
                            <p className="text-sm text-gray-600">{link.description}</p>
                        </a>
                    ))}
                     {/* Google Maps 嵌入*/}
                    {/* 你需要去 Google Maps 獲取你地址的嵌入代碼 (iframe) */}
                    {/* <div className="mt-6">
                        <iframe
                            src="YOUR_Maps_EMBED_URL"
                            width="100%"
                            height="400"
                            style={{ border: 0 }}
                            allowFullScreen=""
                            loading="lazy"
                            referrerPolicy="no-referrer-when-downgrade"
                            title="公司位置"
                            className="rounded-lg shadow-md"
                        ></iframe>
                    </div> */}
                </div>
            </section>
        </div>
    );
};

export default AboutPage;