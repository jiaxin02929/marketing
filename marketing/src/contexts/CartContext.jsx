import React, { createContext, useState, useContext, useEffect } from 'react';
import { useLocation } from 'react-router-dom';

// 創建 Cart Context
const CartContext = createContext();

// 提供 Cart Context 的 Provider
export const CartProvider = ({ children }) => {
    const location = useLocation();
    
    // 購物車狀態，嘗試從 localStorage 加載
    const [cartItems, setCartItems] = useState(() => {
        try {
            const localData = localStorage.getItem('cartItems');
            return localData ? JSON.parse(localData) : [];
        } catch (error) {
            console.error("Failed to load cart items from localStorage", error);
            return [];
        }
    });

    // 分潤追蹤狀態
    const [affiliateInfo, setAffiliateInfo] = useState(() => {
        try {
            const localData = localStorage.getItem('affiliateInfo');
            return localData ? JSON.parse(localData) : null;
        } catch (error) {
            console.error("Failed to load affiliate info from localStorage", error);
            return null;
        }
    });

    // 當 cartItems 改變時，保存到 localStorage
    useEffect(() => {
        try {
            localStorage.setItem('cartItems', JSON.stringify(cartItems));
        } catch (error) {
            console.error("Failed to save cart items to localStorage", error);
        }
    }, [cartItems]);

    // 保存分潤資訊到 localStorage
    useEffect(() => {
        try {
            if (affiliateInfo) {
                localStorage.setItem('affiliateInfo', JSON.stringify(affiliateInfo));
            } else {
                localStorage.removeItem('affiliateInfo');
            }
        } catch (error) {
            console.error("Failed to save affiliate info to localStorage", error);
        }
    }, [affiliateInfo]);

    // 檢查 URL 參數中的分潤資訊
    useEffect(() => {
        const urlParams = new URLSearchParams(location.search);
        const ref = urlParams.get('ref');

        // 只在有新的 ref code 且尚未處理過時才觸發
            if (ref && (!affiliateInfo || affiliateInfo.affiliateRef !== ref)) {
                const registerClick = async () => {
                    try {
                        const response = await fetch(`http://localhost:5002/api/affiliate/click/${ref}`);
                        const data = await response.json();
                        if (response.ok && data.success) {
                            const newAffiliateInfo = {
                                affiliateRef: ref,
                                clickId: data.data.click_id,
                                timestamp: new Date().toISOString()
                            };
                            setAffiliateInfo(newAffiliateInfo);
                        }
                    } catch (error) {
                        console.error("註冊分潤點擊失敗:", error);
                    }
                };
                registerClick();
            }
    }, [location.search, affiliateInfo]);

    // 將商品添加到購物車
    const addToCart = (product, quantityToAdd = 1) => {
        setCartItems((prevItems) => {
            const existingItem = prevItems.find((item) => item.json_id === product.json_id);
            if (existingItem) {
                return prevItems.map((item) =>
                    item.json_id === product.json_id ? { ...item, quantity: item.quantity + quantityToAdd } : item
                );
            } else {
                return [...prevItems, { ...product, quantity: quantityToAdd }];
            }
        });
    };

    // 從購物車中移除商品
    const removeFromCart = (productId) => {
        setCartItems((prevItems) => prevItems.filter((item) => item.json_id !== productId));
    };

    // 調整商品數量
    const updateQuantity = (productId, newQuantity) => {
        setCartItems((prevItems) => {
            if (newQuantity <= 0) {
                return prevItems.filter(item => item.json_id !== productId); // 數量為0或負數時移除
            }
            return prevItems.map((item) =>
                item.json_id === productId ? { ...item, quantity: newQuantity } : item
            );
        });
    };

    // 清空購物車
    const clearCart = () => {
        setCartItems([]);
    };

    // 計算購物車商品總數 (Badge 用)
    const getTotalItems = () => {
        return cartItems.reduce((total, item) => total + item.quantity, 0);
    };

    // 計算小計
    const getSubtotal = () => {
        return cartItems.reduce((total, item) => total + item.price * item.quantity, 0);
    };

    // 清除分潤資訊（訂單完成後使用）
    const clearAffiliateInfo = () => {
        setAffiliateInfo(null);
    };

    // 提供給 Context 的值
    const contextValue = {
        cartItems,
        addToCart,
        removeFromCart,
        updateQuantity,
        getTotalItems,
        getSubtotal,
        clearCart,
        affiliateInfo,
        clearAffiliateInfo,
    };

    return <CartContext.Provider value={contextValue}>{children}</CartContext.Provider>;
};

// 自定義 Hook，方便在組件中使用購物車 Context
export const useCart = () => {
    const context = useContext(CartContext);
    if (context === undefined) {
        throw new Error('useCart must be used within a CartProvider');
    }
    return context;
};
