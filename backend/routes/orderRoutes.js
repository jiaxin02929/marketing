// backend/routes/orderRoutes.js
const express = require('express');
const router = express.Router();
const { sequelize } = require('../config/db');
const Order = require('../models/Order'); // 正確的引入方式
const OrderItem = require('../models/OrderItem'); // 正確的引入方式
const Product = require('../models/Product'); // 需要用來驗證產品
const AffiliateLink = require('../models/AffiliateLink')(sequelize);
const AffiliateClick = require('../models/AffiliateClick')(sequelize);
const { authenticateToken, optionalAuth, requireAdmin } = require('../middleware/auth');

// 🛒 1. 建立新訂單 - POST /api/orders
router.post('/', optionalAuth, async (req, res) => {
    try {
        const { customerInfo, cartItems, paymentMethod, notes, affiliateRef, clickId, discountCode } = req.body;

        // ... (validation for customerInfo and cartItems remains the same) ...

        // 計算原始總價
        let originalTotalPrice = 0;
        const orderItemsData = [];
        for (const item of cartItems) {
            const product = await Product.findOne({ where: { json_id: item.product_id } });
            if (!product) {
                return res.status(400).json({ message: `產品 ${item.product_id} 不存在` });
            }
            let itemPrice = (parseFloat(product.price_min) + parseFloat(product.price_max)) / 2;
            originalTotalPrice += itemPrice * item.quantity;
            orderItemsData.push({ product_id: item.product_id, name: product.name, quantity: item.quantity, price: itemPrice });
        }

        let finalTotalPrice = originalTotalPrice;
        let discountAmount = 0;
        let appliedDiscountCode = null;
        let affiliateLink = null; // 用於分潤的聯盟連結

        // 優先處理折扣碼
        if (discountCode) {
            const codeData = await AffiliateLink.findOne({ where: { link_code: discountCode, status: 'active' } });
            if (codeData && (!codeData.expires_at || new Date() < new Date(codeData.expires_at))) {
                discountAmount = finalTotalPrice * parseFloat(codeData.discount_rate);
                finalTotalPrice -= discountAmount;
                appliedDiscountCode = codeData.link_code;
                affiliateLink = codeData; // 將業績歸給此折扣碼的擁有者
            } else {
                return res.status(400).json({ success: false, message: '無效或已過期的折扣碼' });
            }
        } 
        // 如果沒有折扣碼，才處理舊的網址分潤邏輯
        else if (affiliateRef) {
            affiliateLink = await AffiliateLink.findOne({ where: { link_code: affiliateRef, status: 'active' } });
        }

        // 建立新訂單
        const newOrder = await Order.create({
            user_id: req.user ? req.user.user_id : null,
            customer_name: customerInfo.fullName,
            customer_email: customerInfo.email || null,
            customer_phone: customerInfo.phoneNumber,
            shipping_address: customerInfo.address,
            total_price: finalTotalPrice, // 使用折扣後的價格
            payment_method: paymentMethod || 'credit_card',
            payment_status: paymentMethod === 'bank_transfer' ? 'pending' : 'completed',
            paid_at: paymentMethod === 'bank_transfer' ? null : new Date(),
            notes: notes || null,
            affiliate_link_id: affiliateLink ? affiliateLink.link_id : null, // 記錄是哪個聯盟連結帶來的訂單
            referred_by_user: affiliateLink ? affiliateLink.user_id : null, // 直接在建立時就歸屬訂單
            applied_discount_code: appliedDiscountCode, // 記錄使用的折扣碼
            discount_amount: discountAmount, // 記錄折扣金額
        });

        // ... (OrderItem creation remains the same) ...
        const finalOrderItemsData = orderItemsData.map(item => ({ ...item, order_id: newOrder.order_id }));
        await OrderItem.bulkCreate(finalOrderItemsData);

        // 處理分潤轉換 (無論是透過折扣碼還是連結)
        if (affiliateLink && newOrder.payment_status === 'completed') {
            try {
                // 如果是透過舊連結來的，需要找到對應的 clickId
                let affiliateClick = null;
                if (clickId) {
                    affiliateClick = await AffiliateClick.findOne({ where: { click_id: clickId, link_id: affiliateLink.link_id } });
                }

                // 即使沒有 clickId (例如直接用折扣碼)，也可能需要記錄分潤
                // 這裡簡化處理：我們假設只要訂單與 affiliateLink 關聯，就計算分潤
                const commission = finalTotalPrice * parseFloat(affiliateLink.commission_rate);

                await affiliateLink.recordSale(finalTotalPrice);

                await newOrder.update({
                    affiliate_link_code: affiliateLink.link_code,
                    commission_rate: affiliateLink.commission_rate,
                    commission_amount: commission
                });

                // 如果是透過點擊連結來的，標記點擊為已轉換
                if (affiliateClick) {
                    await affiliateClick.markAsConverted(newOrder.order_id, finalTotalPrice, affiliateLink.commission_rate);
                }

            } catch (error) {
                console.error('分潤轉換處理錯誤:', error);
            }
        }

        // 回傳成功訊息
        res.status(201).json({
            message: '訂單建立成功！',
            order: {
                order_id: newOrder.order_id,
                total_price: finalTotalPrice,
                discount_amount: discountAmount,
                // ... other fields
            }
        });

    } catch (error) {
        console.error('訂單建立失敗:', error);
        res.status(500).json({ 
            message: '伺服器內部錯誤', 
            error: error.message 
        });
    }
});

// 📋 2. 取得用戶訂單 - GET /api/orders/user/:userId
router.get('/user/:userId', authenticateToken, async (req, res) => {
    try {
        const { userId } = req.params;
        const { page = 1, limit = 10 } = req.query;
        
        // 確保用戶只能查看自己的訂單
        if (req.user.user_id !== userId && req.user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: '權限不足，無法查看其他用戶的訂單'
            });
        }
        
        const offset = (page - 1) * limit;
        
        const { count, rows: orders } = await Order.findAndCountAll({
            where: { 
                user_id: userId // 改為使用 user_id 查詢
            },
            include: [{
                model: OrderItem,
                include: [Product]
            }],
            order: [['created_at', 'DESC']],
            limit: parseInt(limit),
            offset: parseInt(offset)
        });

        const totalPages = Math.ceil(count / limit);

        res.json({
            success: true,
            data: {
                orders: orders.map(order => ({
                    id: order.order_id,
                    order_number: `ORD-${order.order_id.slice(-8).toUpperCase()}`,
                    total_amount: parseFloat(order.total_price),
                    status: order.order_status,
                    created_at: order.createdAt,
                    items: order.OrderItems ? order.OrderItems.map(item => {
                        let imageUrl = '/placeholder.jpg';
                        if (item.Product && item.Product.images) {
                            try {
                                const imagesArray = (typeof item.Product.images === 'string')
                                    ? JSON.parse(item.Product.images)
                                    : item.Product.images;

                                if (Array.isArray(imagesArray) && imagesArray.length > 0) {
                                    imageUrl = imagesArray[0];
                                }
                            } catch (e) {
                                console.error('Error parsing product images:', e);
                            }
                        }

                        return {
                            id: item.id,
                            product_name: item.name,
                            quantity: item.quantity,
                            price: parseFloat(item.price),
                            product_image: imageUrl
                        };
                    }) : []
                })),
                totalPages,
                currentPage: parseInt(page),
                totalCount: count
            }
        });
    } catch (error) {
        console.error('取得用戶訂單失敗:', error);
        res.status(500).json({ 
            success: false,
            message: '伺服器內部錯誤', 
            error: error.message 
        });
    }
});

// 📋 3. 取得所有訂單 - GET /api/orders (管理員用)
router.get('/', async (req, res) => {
    try {
        const orders = await Order.findAll({
            include: [{
                model: OrderItem,
                include: [Product]
            }],
            order: [['created_at', 'DESC']]
        });

        res.json(orders);
    } catch (error) {
        console.error('取得訂單失敗:', error);
        res.status(500).json({ 
            message: '伺服器內部錯誤', 
            error: error.message 
        });
    }
});

// 🔍 3. 取得單一訂單 - GET /api/orders/:orderId
router.get('/:orderId', async (req, res) => {
    try {
        const order = await Order.findOne({
            where: { order_id: req.params.orderId },
            include: [{
                model: OrderItem,
                include: [Product]
            }]
        });

        if (!order) {
            return res.status(404).json({ message: '訂單未找到' });
        }

        res.json(order);
    } catch (error) {
        console.error('取得訂單詳情失敗:', error);
        res.status(500).json({ 
            message: '伺服器內部錯誤', 
            error: error.message 
        });
    }
});

// 💳 4. 模擬付款完成 - PUT /api/orders/:orderId/pay
router.put('/:orderId/pay', async (req, res) => {
    try {
        const order = await Order.findOne({
            where: { order_id: req.params.orderId }
        });

        if (!order) {
            return res.status(404).json({ message: '訂單未找到' });
        }

        if (order.payment_status === 'completed') {
            return res.status(400).json({ message: '訂單已付款' });
        }

        // 更新付款狀態
        await order.update({
            payment_status: 'completed',
            paid_at: new Date(),
            order_status: 'confirmed'
        });

        // 處理分潤轉換（針對銀行轉帳等延後付款的情況）
        if (order.affiliate_link_id) {
            const affiliateLink = await AffiliateLink.findByPk(order.affiliate_link_id);
            if (affiliateLink) {
                // 查找相關的點擊記錄
                const affiliateClick = await AffiliateClick.findOne({
                    where: { 
                        link_id: order.affiliate_link_id,
                        converted: false 
                    },
                    order: [['clicked_at', 'DESC']]
                });

                if (affiliateClick) {
                    const commission = await affiliateClick.markAsConverted(
                        order.order_id,
                        order.total_price,
                        affiliateLink.commission_rate
                    );
                    
                    await affiliateLink.recordSale(order.total_price);
                    
                    // 更新訂單的佣金資訊
                    await order.update({
                        commission_rate: affiliateLink.commission_rate,
                        commission_amount: commission
                    });
                    
                    console.log(`延遲分潤轉換成功: 訂單 ${order.order_id}, 佣金 $${commission}`);
                }
            }
        }

        res.json({
            message: '付款成功！',
            order: {
                order_id: order.order_id,
                payment_status: order.payment_status,
                order_status: order.order_status,
                paid_at: order.paid_at,
                commission_amount: order.commission_amount
            }
        });

    } catch (error) {
        console.error('付款處理失敗:', error);
        res.status(500).json({ 
            message: '付款處理失敗', 
            error: error.message 
        });
    }
});

// 📦 5. 更新訂單狀態 - PUT /api/orders/:orderId/status  
router.put('/:orderId/status', async (req, res) => {
    try {
        const { order_status } = req.body;
        
        const validStatuses = ['processing', 'confirmed', 'shipped', 'delivered', 'cancelled'];
        if (!validStatuses.includes(order_status)) {
            return res.status(400).json({ 
                message: '無效的訂單狀態', 
                validStatuses 
            });
        }

        const order = await Order.findOne({
            where: { order_id: req.params.orderId }
        });

        if (!order) {
            return res.status(404).json({ message: '訂單未找到' });
        }

        // 更新訂單狀態
        const updateData = { order_status };
        if (order_status === 'shipped') {
            updateData.shipped_at = new Date();
        }

        await order.update(updateData);

        res.json({
            message: '訂單狀態更新成功',
            order: {
                order_id: order.order_id,
                order_status: order.order_status,
                shipped_at: order.shipped_at
            }
        });

    } catch (error) {
        console.error('訂單狀態更新失敗:', error);
        res.status(500).json({ 
            message: '訂單狀態更新失敗', 
            error: error.message 
        });
    }
});

// 🗑️ 6. 刪除訂單 - DELETE /api/orders/:orderId (管理員用)
router.delete('/:orderId', authenticateToken, requireAdmin, async (req, res) => {
    try {
        const { orderId } = req.params;

        const order = await Order.findOne({
            where: { order_id: orderId }
        });

        if (!order) {
            return res.status(404).json({ 
                success: false, 
                message: '訂單未找到' 
            });
        }

        // 先刪除關聯的訂單項目
        await OrderItem.destroy({
            where: { order_id: orderId }
        });

        // 然後再刪除訂單本身
        await order.destroy();

        res.json({ 
            success: true, 
            message: '訂單已成功刪除' 
        });

    } catch (error) {
        console.error('刪除訂單失敗:', error);
        res.status(500).json({ 
            success: false, 
            message: '刪除訂單時發生伺服器內部錯誤', 
            error: error.message 
        });
    }
});

module.exports = router;