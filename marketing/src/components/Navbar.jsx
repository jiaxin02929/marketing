// src/components/Navbar.jsx
import React, { useState, useRef } from 'react'; // 引入 useRef
import { Link } from 'react-router-dom';
import navItems from '../data/navConfig.json';
import categories from '../data/categories.json';
import siteContent from '../data/siteContent.json';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';

const Navbar = () => {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isProductsDropdownOpen, setIsProductsDropdownOpen] = useState(false);
    const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);
    const { getTotalItems } = useCart();
    const { user, logout, isAuthenticated } = useAuth();
    const dropdownTimeoutRef = useRef(null); // 用於儲存 setTimeout 的 ID
    
    // 調試用 - 監控用戶狀態變化
    React.useEffect(() => {
        console.log('Navbar useEffect - user changed:', user);
    }, [user]);
    // 新增圖片路徑輔助函數
    const getImagePath = (imagePath) => {
        return imagePath; // Vite 會自動處理 public 資料夾的相對路徑
    };
    // 定義你的 Logo 圖片路徑
    // **請將 'brand-logo.png' 替換為你實際的 Logo 檔案名稱和路徑**
    const logoPath = "/images/logo.png"; 

    const toggleMobileMenu = () => {
        setIsMobileMenuOpen(!isMobileMenuOpen);
        setIsProductsDropdownOpen(false); // 手機選單開關時，確保產品下拉選單也關閉
    };

    // 關閉所有選單 (用於點擊連結後)
    const closeAllMenus = () => {
        setIsMobileMenuOpen(false);
        setIsProductsDropdownOpen(false);
        setIsUserDropdownOpen(false);
        if (dropdownTimeoutRef.current) {
            clearTimeout(dropdownTimeoutRef.current); // 清除任何 pending 的關閉計時器
        }
    };

    // 鼠標進入時立即打開下拉選單
    const handleMouseEnterDropdown = () => {
        if (dropdownTimeoutRef.current) {
            clearTimeout(dropdownTimeoutRef.current); // 如果有 pending 的關閉計時器，則取消
        }
        setIsProductsDropdownOpen(true);
        // console.log('Mouse entered: Dropdown opened.'); // 調試訊息
    };

    // 鼠標離開時，延遲關閉下拉選單
    const handleMouseLeaveDropdown = () => {
        // 設定一個短暫的延遲 (例如 200 毫秒)，在真正關閉之前給鼠標一個機會進入下拉選單
        dropdownTimeoutRef.current = setTimeout(() => {
            setIsProductsDropdownOpen(false);
            // console.log('Mouse left: Dropdown closed after delay.'); // 調試訊息
        }, 200); // 200 毫秒
    };


    return (
        <nav className="bg-white p-4 shadow-md sticky top-0 z-50">
            <div className="container mx-auto flex justify-between items-center">
                {/* Logo / 品牌名稱 */}
                <Link to="/" onClick={closeAllMenus}>
                    <img
                        src={getImagePath(logoPath)}
                        alt="鑽之韻" // 請替換為你的品牌名稱
                        className="h-10 w-auto" // 調整圖片高度，w-auto 讓寬度按比例自動調整
                    />
                </Link>

                {/* 主要導航連結 - 桌面版 */}
                <div className="hidden md:flex items-center space-x-6">
                    {navItems.map((item) => (
                        <div
                            key={item.path}
                            className="relative"
                            onMouseEnter={item.hasDropdown ? handleMouseEnterDropdown : null}
                            onMouseLeave={item.hasDropdown ? handleMouseLeaveDropdown : null}
                        >
                            <Link
                                to={item.path}
                                className="text-gray-600 hover:text-blue-600 font-medium py-2 px-3 flex items-center"
                                onClick={closeAllMenus}
                            >
                                {item.label}
                                {item.hasDropdown && (
                                    <svg className={`ml-1 w-4 h-4 transition-transform duration-200 ${isProductsDropdownOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                                )}
                            </Link>

                            {/* 下拉選單內容 */}
                            {item.hasDropdown && isProductsDropdownOpen && (
                                <div className="absolute left-0 mt-2 w-48 bg-white border border-gray-200 rounded-md shadow-lg py-1 z-20"> {/* 提高 z-index */}
                                    {categories.map((cat) => (
                                        <Link
                                            key={cat.id}
                                            to={`/products?category=${cat.id}`}
                                            className="block px-4 py-2 text-gray-700 hover:bg-gray-100"
                                            onClick={closeAllMenus}
                                        >
                                            {cat.name}
                                        </Link>
                                    ))}
                                </div>
                            )}
                        </div>
                    ))}
                </div>

                {/* 功能性圖標 - 桌面版 */}
                <div className="hidden md:flex items-center space-x-4">
                    <Link to="/search" className="text-gray-600 hover:text-blue-600 p-2 rounded-full hover:bg-gray-100" onClick={closeAllMenus}>
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
                    </Link>
                    <Link to="/cart" className="relative text-gray-600 hover:text-blue-600 p-2 rounded-full hover:bg-gray-100" onClick={closeAllMenus}>
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13v8a2 2 0 002 2h2a2 2 0 002-2v-8m-4 0v8a2 2 0 002 2h2a2 2 0 002-2v-8m-4 0z"></path></svg>
                    {getTotalItems() > 0 && ( // 只有當購物車有商品時才顯示數量
                        <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full h-4 w-4 flex items-center justify-center transform translate-x-1/2 -translate-y-1/2">
                            {getTotalItems()}
                        </span>
                    )}
                    </Link>
                    {/* 桌面版用戶菜單 */}
                    {user ? (
                        <div className="relative">
                            <button 
                                className="text-gray-600 hover:text-blue-600 p-2 rounded-full hover:bg-gray-100 flex items-center space-x-1 focus:outline-none"
                                onClick={() => {
                                    console.log('=== DESKTOP USER MENU CLICKED ===');
                                    console.log('User data:', user);
                                    setIsUserDropdownOpen(!isUserDropdownOpen);
                                }}
                            >
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
                                </svg>
                                <span className="text-sm hidden lg:block">
                                    {user.last_name || user.lastName || user.username || 'USER'}
                                </span>
                            </button>
                            
                            {/* 桌面版下拉菜單 */}
                            {isUserDropdownOpen && (
                                <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50 border border-gray-200">
                                    <Link 
                                        to="/account" 
                                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                        onClick={() => {
                                            closeAllMenus();
                                            console.log('Navigating to account');
                                        }}
                                    >
                                        我的帳戶
                                    </Link>
                                    <Link 
                                        to="/member" 
                                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                        onClick={() => {
                                            console.log('=== MEMBER CENTER LINK CLICKED (DESKTOP) ===');
                                            console.log('Current user:', user);
                                            console.log('Is authenticated:', isAuthenticated());
                                            closeAllMenus();
                                        }}
                                    >
                                        會員中心
                                    </Link>
                                    {isAuthenticated() && user.role === 'admin' && (
                                        <Link 
                                            to="/admin" 
                                            className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                            onClick={() => {
                                                closeAllMenus();
                                                console.log('Navigating to admin');
                                            }}
                                        >
                                            管理後台
                                        </Link>
                                    )}
                                    <button 
                                        onClick={() => {
                                            console.log('Logging out...');
                                            logout();
                                            closeAllMenus();
                                        }} 
                                        className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                    >
                                        登出
                                    </button>
                                </div>
                            )}
                        </div>
                    ) : (
                        <Link to="/account" className="text-gray-600 hover:text-blue-600 p-2 rounded-full hover:bg-gray-100" onClick={closeAllMenus}>
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg>
                        </Link>
                    )}
                </div>

                {/* 漢堡選單按鈕 - 手機版 */}
                <div className="md:hidden">
                    <button onClick={toggleMobileMenu} className="text-gray-600 hover:text-blue-600 focus:outline-none">
                        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"></path></svg>
                    </button>
                </div>

                {/* 手機版選單內容 (針對下拉選單行為有調整) */}
                {isMobileMenuOpen && (
                    <div className="md:hidden absolute top-[64px] left-0 w-full bg-white py-2 shadow-lg z-40"> {/* Adjusted top to be below navbar height */}
                        {navItems.map((item) => (
                            <div key={item.path} className="relative">
                                {item.hasDropdown ? (
                                    <>
                                        <button
                                            onClick={() => setIsProductsDropdownOpen(!isProductsDropdownOpen)}
                                            className="block w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100 focus:outline-none flex justify-between items-center"
                                        >
                                            {item.label}
                                            <svg className={`ml-1 w-4 h-4 transition-transform duration-200 ${isProductsDropdownOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                                        </button>
                                        {isProductsDropdownOpen && (
                                            <div className="pl-6 py-1">
                                                {categories.map((cat) => (
                                                    <Link
                                                        key={cat.id}
                                                        to={`/products?category=${cat.id}`}
                                                        className="block px-4 py-2 text-gray-700 hover:bg-gray-100"
                                                        onClick={closeAllMenus}
                                                    >
                                                        {cat.name}
                                                    </Link>
                                                ))}
                                            </div>
                                        )}
                                    </>
                                ) : (
                                    <Link
                                        to={item.path}
                                        className="block px-4 py-2 text-gray-700 hover:bg-gray-100"
                                        onClick={closeAllMenus}
                                    >
                                        {item.label}
                                    </Link>
                                )}
                            </div>
                        ))}
                        {/* 手機版的功能性圖標 */}
                        <div className="flex justify-around py-4 border-t border-gray-200">
                            <Link to="/search" className="text-gray-600 hover:text-blue-600" onClick={closeAllMenus}>
                                <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
                                <span className="block text-xs mt-1">搜尋</span>
                            </Link>
                            <Link to="/cart" className="relative text-gray-600 hover:text-blue-600" onClick={closeAllMenus}>
                            <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13v8a2 2 0 002 2h2a2 2 0 002-2v-8m-4 0v8a2 2 0 002 2h2a2 2 0 002-2v-8m-4 0z"></path></svg>
                            <span className="block text-xs mt-1">購物車</span>
                            {getTotalItems() > 0 && (
                                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full h-4 w-4 flex items-center justify-center transform translate-x-1/2 -translate-y-1/2">
                                    {getTotalItems()}
                                </span>
                            )}
                            </Link>
                            {/* 用戶菜單 - 簡化版本 */}
                            {user ? (
                                <div className="relative">
                                    <button 
                                        className="text-gray-600 hover:text-blue-600 flex flex-col items-center focus:outline-none"
                                        onClick={() => {
                                            console.log('=== USER MENU CLICKED ===');
                                            console.log('User data:', user);
                                            console.log('Current dropdown state:', isUserDropdownOpen);
                                            setIsUserDropdownOpen(!isUserDropdownOpen);
                                            console.log('Setting dropdown state to:', !isUserDropdownOpen);
                                        }}
                                    >
                                        <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
                                        </svg>
                                        <span className="block text-xs mt-1">
                                            {user.last_name || user.lastName || user.username || 'USER'}
                                        </span>
                                    </button>
                                    
                                    {/* 下拉菜單 */}
                                    {isUserDropdownOpen && (
                                        <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50 border border-gray-200">
                                            <Link 
                                                to="/account" 
                                                className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                                onClick={() => {
                                                    closeAllMenus();
                                                    console.log('Navigating to account');
                                                }}
                                            >
                                                我的帳戶
                                            </Link>
                                            <Link 
                                                to="/member" 
                                                className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                                onClick={() => {
                                                    console.log('=== MEMBER CENTER LINK CLICKED (MOBILE) ===');
                                                    console.log('Current user:', user);
                                                    console.log('Is authenticated:', isAuthenticated());
                                                    closeAllMenus();
                                                }}
                                            >
                                                會員中心
                                            </Link>
                                            {isAuthenticated() && user.role === 'admin' && (
                                                <Link 
                                                    to="/admin" 
                                                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                                    onClick={() => {
                                                        closeAllMenus();
                                                        console.log('Navigating to admin');
                                                    }}
                                                >
                                                    管理後台
                                                </Link>
                                            )}
                                            <button 
                                                onClick={() => {
                                                    console.log('Logging out...');
                                                    logout();
                                                    closeAllMenus();
                                                }} 
                                                className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                            >
                                                登出
                                            </button>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <Link to="/account" className="text-gray-600 hover:text-blue-600 flex flex-col items-center" onClick={closeAllMenus}>
                                    <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg>
                                    <span className="block text-xs mt-1">登入/註冊</span>
                                </Link>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </nav>
    );
};

export default Navbar;