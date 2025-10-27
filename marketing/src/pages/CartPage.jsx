import React, { useState, useEffect } from 'react';
import { useCart } from '../contexts/CartContext';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const CartPage = () => {
    const { cartItems, updateQuantity, removeFromCart, getSubtotal, affiliateInfo, clearAffiliateInfo } = useCart();
    const { token } = useAuth();

    // Component State
    const [customerInfo, setCustomerInfo] = useState({ fullName: '', email: '', phoneNumber: '', address: '', saveDefault: false });
    const [paymentMethod, setPaymentMethod] = useState('credit_card');
    const [paymentStatus, setPaymentStatus] = useState('idle');
    const [discountCodeInput, setDiscountCodeInput] = useState('');
    const [appliedCode, setAppliedCode] = useState(null);
    const [discountError, setDiscountError] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [modalTitle, setModalTitle] = useState('');
    const [modalMessage, setModalMessage] = useState('');

    // Load customer info from localStorage on mount
    useEffect(() => {
        try {
            const savedInfo = localStorage.getItem('customerInfo');
            if (savedInfo) {
                setCustomerInfo(JSON.parse(savedInfo));
            }
        } catch (error) {
            console.error("Failed to load customer info from localStorage", error);
        }
    }, []);

    // Save customer info to localStorage if checked
    useEffect(() => {
        if (customerInfo.saveDefault) {
            localStorage.setItem('customerInfo', JSON.stringify(customerInfo));
        }
    }, [customerInfo]);

    // Handle applying a discount code
    const handleApplyDiscount = async () => {
        if (!discountCodeInput.trim()) {
            setModalTitle('輸入錯誤');
            setModalMessage('請輸入折扣碼');
            setShowModal(true);
            return;
        }
        setDiscountError('');
        setAppliedCode(null);
        try {
            const response = await fetch(`http://localhost:5002/api/affiliate/code/${discountCodeInput.trim()}`);
            const data = await response.json();
            if (response.ok && data.success) {
                setAppliedCode(data.data);
                setPaymentStatus('success'); // Set status for modal icon
                setModalTitle('套用成功');
                setModalMessage(`折扣碼 ${(data.data.discount_rate * 100).toFixed(0)}% 已成功套用！`);
                setShowModal(true);
            } else {
                setPaymentStatus('error'); // Set status for modal icon
                setDiscountError(data.message || '無效的折扣碼');
                setModalTitle('套用失敗');
                setModalMessage(data.message || '無效的折扣碼');
                setShowModal(true);
            }
        } catch (error) {
            setDiscountError('驗證折扣碼時發生錯誤');
        }
    };

    // Handle customer info form changes
    const handleCustomerInfoChange = (e) => {
        const { name, value, type, checked } = e.target;
        setCustomerInfo(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
    };

    // Handle the final checkout process
    const handleCheckout = async () => {
        if (cartItems.length === 0 || !customerInfo.fullName || !customerInfo.phoneNumber || !customerInfo.address) {
            setModalTitle('資料不完整');
            setModalMessage('請填寫完整的會員資料（姓名、電話、地址為必填）。');
            setShowModal(true);
            return;
        }
        setPaymentStatus('loading');
        const orderData = {
            customerInfo,
            cartItems: cartItems.map(item => ({ product_id: item.json_id, quantity: item.quantity, price: item.price })),
            paymentMethod,
            ...(affiliateInfo && { affiliateRef: affiliateInfo.affiliateRef, clickId: affiliateInfo.clickId }),
            ...(appliedCode && { discountCode: appliedCode.code })
        };
        try {
            const headers = { 'Content-Type': 'application/json' };
            if (token) headers['Authorization'] = `Bearer ${token}`;
            const response = await fetch('http://localhost:5002/api/orders', {
                method: 'POST',
                headers: headers,
                body: JSON.stringify(orderData),
            });
            const result = await response.json();
            if (!response.ok) {
                throw new Error(result.message || '無法建立訂單');
            }
            setPaymentStatus('success');
            setModalTitle('付款成功');
            setModalMessage(`您的訂單已成功送出！`);
            setShowModal(true);
            if (affiliateInfo) clearAffiliateInfo();
        } catch (error) {
            setPaymentStatus('error');
            setModalTitle('付款失敗');
            setModalMessage(`請稍後再試。錯誤: ${error.message}`);
            setShowModal(true);
        }
    };

    // Calculations
    const subtotal = getSubtotal();
    const discountAmount = appliedCode ? subtotal * parseFloat(appliedCode.discount_rate) : 0;
    const totalBeforeShipping = subtotal - discountAmount;
    const shippingFee = subtotal > 1000 ? 0 : 60;
    const finalTotal = totalBeforeShipping + shippingFee;

    // Sub-component for the result modal
    const PaymentResultModal = ({ show, title, message, onClose, status, total }) => {
        if (!show) return null;
        const isSuccess = status === 'success';
        return (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 backdrop-blur-sm">
                <div className="bg-white p-8 rounded-2xl shadow-2xl max-w-sm w-full mx-4 border border-gray-200">
                    <div className="text-center">
                        <div className={`mx-auto flex items-center justify-center h-16 w-16 rounded-full mb-6 ${isSuccess ? 'bg-green-100' : 'bg-red-100'}`}>
                            {isSuccess ? (
                                <svg className="h-8 w-8 text-green-700" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg>
                            ) : (
                                <svg className="h-8 w-8 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                            )}
                        </div>
                        <h3 className="text-2xl font-bold text-gray-900 mb-4">{title}</h3>
                        <div className="text-gray-600 mb-6">
                            <p>{message}</p>
                            {isSuccess && total > 0 && <p className="mt-3 text-xl font-bold text-gray-800">總金額：NT$ {Math.round(total).toLocaleString()}</p>}
                        </div>
                    </div>
                    <button type="button" className="w-full bg-gradient-to-r from-gray-700 to-slate-700 text-white font-bold py-3 px-6 rounded-xl" onClick={onClose}>關閉</button>
                </div>
            </div>
        );
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-slate-50">
            <div className="container mx-auto px-4 py-8 md:py-12">
                <div className="text-center mb-10">
                    <h1 className="text-4xl md:text-5xl font-extrabold bg-gradient-to-r from-gray-800 to-slate-600 bg-clip-text text-transparent mb-4">購物清單確認</h1>
                    <p className="text-gray-600 text-lg">完成您的訂購</p>
                </div>
                <div className="flex flex-col lg:flex-row gap-8">
                    <div className="lg:w-2/3 bg-white p-6 md:p-8 rounded-2xl shadow-xl border border-gray-100">
                        <div className="flex items-center mb-6 pb-4 border-b-2 border-gray-200">
                            <h2 className="text-2xl md:text-3xl font-bold text-gray-800">我的購物車</h2>
                        </div>
                        {cartItems.length === 0 ? (
                            <div className="text-center py-16"><p>您的購物車是空的</p><Link to="/products">前往選購商品</Link></div>
                        ) : (
                            <div className="space-y-4">
                                {cartItems.map((item) => (
                                    <div key={item.json_id} className="bg-gradient-to-r from-white to-gray-50 rounded-xl p-6 border border-gray-200 hover:shadow-lg transition-all duration-300">
                                        <div className="flex flex-col md:flex-row items-center gap-4">
                                            <div className="flex items-center flex-1">
                                                <img className="w-20 h-20 object-cover rounded-lg shadow-md" src={item.images && item.images.length > 0 ? item.images[0] : 'https://placehold.co/80x80/E2E8F0/A0AEC0?text=Product'} alt={item.name} />
                                                <div className="ml-4 flex-1"><h3 className="text-lg font-semibold text-gray-900">{item.name}</h3><p className="text-lg font-bold text-gray-800">NT$ {Math.round(item.price).toLocaleString()}</p></div>
                                            </div>
                                            <div className="flex items-center bg-white rounded-lg border-2 border-gray-200 shadow-sm"><button onClick={() => updateQuantity(item.json_id, item.quantity - 1)} className="px-3 py-2" disabled={item.quantity <= 1}>-</button><input type="number" value={item.quantity} onChange={(e) => updateQuantity(item.json_id, parseInt(e.target.value) || 0)} className="w-12 text-center" min="1" /><button onClick={() => updateQuantity(item.json_id, item.quantity + 1)} className="px-3 py-2">+</button></div>
                                            <div className="flex items-center gap-4"><div className="text-right"><p className="text-sm text-gray-500">小計</p><p className="text-xl font-bold">NT$ {Math.round(item.price * item.quantity).toLocaleString()}</p></div><button onClick={() => removeFromCart(item.json_id)} className="p-2 text-red-500 hover:bg-red-500 hover:text-white rounded-lg"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg></button></div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                        <div className="mt-10">
                            <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-6">會員資料</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="transform transition-all duration-200 hover:scale-105"><label htmlFor="fullName" className="flex items-center text-sm font-semibold text-gray-700 mb-2">姓名 <span className="text-red-500 ml-1">*</span></label><input type="text" name="fullName" id="fullName" value={customerInfo.fullName} onChange={handleCustomerInfoChange} className="w-full border-2 border-gray-200 rounded-lg shadow-sm py-3 px-4" placeholder="請輸入您的姓名" /></div>
                                <div className="transform transition-all duration-200 hover:scale-105"><label htmlFor="email" className="flex items-center text-sm font-semibold text-gray-700 mb-2">電子郵件</label><input type="email" name="email" id="email" value={customerInfo.email} onChange={handleCustomerInfoChange} className="w-full border-2 border-gray-200 rounded-lg shadow-sm py-3 px-4" placeholder="您的電子郵件 (選填)" /></div>
                                <div className="transform transition-all duration-200 hover:scale-105"><label htmlFor="phoneNumber" className="flex items-center text-sm font-semibold text-gray-700 mb-2">聯絡電話 <span className="text-red-500 ml-1">*</span></label><input type="tel" name="phoneNumber" id="phoneNumber" value={customerInfo.phoneNumber} onChange={handleCustomerInfoChange} className="w-full border-2 border-gray-200 rounded-lg shadow-sm py-3 px-4" placeholder="您的聯絡電話" /></div>
                                <div className="md:col-span-2 transform transition-all duration-200 hover:scale-105"><label htmlFor="address" className="flex items-center text-sm font-semibold text-gray-700 mb-2">送貨地址 <span className="text-red-500 ml-1">*</span></label><input type="text" name="address" id="address" value={customerInfo.address} onChange={handleCustomerInfoChange} className="w-full border-2 border-gray-200 rounded-lg shadow-sm py-3 px-4" placeholder="完整的送貨地址" /></div>
                            </div>
                        </div>
                        <div className="mt-10">
                            <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-6">付款方式</h2>
                            <div className="grid grid-cols-1 gap-4">
                                <div className={`relative cursor-pointer rounded-lg p-4 border-2 ${paymentMethod === 'credit_card' ? 'border-gray-600 bg-gray-50' : 'border-gray-200 bg-white'}`}><div className="flex items-center"><input id="credit_card" name="payment_method" type="radio" value="credit_card" checked={paymentMethod === 'credit_card'} onChange={(e) => setPaymentMethod(e.target.value)} className="h-5 w-5" /><label htmlFor="credit_card" className="ml-4 flex items-center text-base font-semibold">信用卡支付</label></div></div>
                                <div className={`relative cursor-pointer rounded-lg p-4 border-2 ${paymentMethod === 'bank_transfer' ? 'border-gray-600 bg-gray-50' : 'border-gray-200 bg-white'}`}><div className="flex items-center"><input id="bank_transfer" name="payment_method" type="radio" value="bank_transfer" checked={paymentMethod === 'bank_transfer'} onChange={(e) => setPaymentMethod(e.target.value)} className="h-5 w-5" /><label htmlFor="bank_transfer" className="ml-4 flex items-center text-base font-semibold">銀行轉帳</label></div></div>
                                <div className={`relative cursor-pointer rounded-lg p-4 border-2 ${paymentMethod === 'cash' ? 'border-gray-600 bg-gray-50' : 'border-gray-200 bg-white'}`}><div className="flex items-center"><input id="cash" name="payment_method" type="radio" value="cash" checked={paymentMethod === 'cash'} onChange={(e) => setPaymentMethod(e.target.value)} className="h-5 w-5" /><label htmlFor="cash" className="ml-4 flex items-center text-base font-semibold">現金支付</label></div></div>
                            </div>
                        </div>
                    </div>
                    <div className="lg:w-1/3 space-y-6">
                        <div className="bg-white p-6 md:p-8 rounded-2xl shadow-xl border border-gray-100 sticky top-8">
                            <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-6">訂單總結</h2>
                            <div className="mb-8">
                                <label htmlFor="discountCode">折扣碼</label>
                                <div className="flex"><input type="text" id="discountCode" value={discountCodeInput} onChange={(e) => setDiscountCodeInput(e.target.value)} className={`flex-1 bg-gray-50 border-2 rounded-l-lg py-2 px-3 ${discountError ? 'border-red-500' : 'border-gray-200'}`} placeholder="輸入折扣碼" disabled={!!appliedCode} /><button onClick={handleApplyDiscount} disabled={!!appliedCode} className="bg-gray-700 text-white px-6 py-2 rounded-r-lg">套用</button></div>
                                {discountError && <p className="text-red-500 text-sm mt-2">{discountError}</p>}
                                {appliedCode && <div className="text-green-600 text-sm mt-2">已套用: <strong>{appliedCode.code}</strong> ({(appliedCode.discount_rate * 100).toFixed(0)}% 折扣)<button onClick={() => { setAppliedCode(null); setDiscountCodeInput(''); setDiscountError(''); }} className="ml-2 text-red-500 text-xs">[移除]</button></div>}
                            </div>
                            <div className="space-y-4 bg-gray-50 p-6 rounded-lg border border-gray-200">
                                <div className="flex justify-between"><span>小計</span><span>NT$ {Math.round(subtotal).toLocaleString()}</span></div>
                                <div className="flex justify-between"><span className="text-red-500">折扣</span><span className="text-red-500">- NT$ {Math.round(discountAmount).toLocaleString()}</span></div>
                                <div className="flex justify-between"><span>運費</span><span>{shippingFee === 0 ? '0' : `NT$ ${Math.round(shippingFee).toLocaleString()}`}</span></div>
                                <div className="border-t-2 pt-4 mt-4 flex justify-between"><strong>總計</strong><strong>NT$ {Math.round(finalTotal).toLocaleString()}</strong></div>
                            </div>
                            <button onClick={handleCheckout} className={`mt-8 w-full py-4 rounded-xl text-xl ${cartItems.length === 0 || paymentStatus === 'loading' ? 'bg-gray-400' : 'bg-gray-800 text-white'}`} disabled={cartItems.length === 0 || paymentStatus === 'loading'}>{paymentStatus === 'loading' ? '處理中...' : '完成結帳'}</button>
                        </div>
                    </div>
                </div>
                <PaymentResultModal show={showModal} title={modalTitle} message={modalMessage} onClose={() => setShowModal(false)} status={paymentStatus} total={finalTotal} />
            </div>
        </div>
    );
};

export default CartPage;