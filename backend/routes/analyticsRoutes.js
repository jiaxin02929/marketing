// backend/routes/analyticsRoutes.js - 管理者數據分析 API (簡化版)
const express = require('express');
const { sequelize } = require('../config/db');
const jwt = require('jsonwebtoken');

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';


// 管理員驗證中間件 - 使用與auth routes相同的模式
const authenticateAdmin = async (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({
            success: false,
            message: '需要提供授權令牌'
        });
    }

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        
        // 查詢用戶信息 - 使用與auth routes完全相同的查詢
        const [users] = await sequelize.query(
            'SELECT user_id, username, email, first_name, last_name, role, status FROM users WHERE user_id = ? AND status = "active"',
            { replacements: [decoded.userId] }
        );

        if (users.length === 0) {
            return res.status(401).json({
                success: false,
                message: '無效的授權令牌'
            });
        }

        // 檢查是否為管理員
        if (users[0].role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: '需要管理員權限'
            });
        }

        req.user = users[0];
        next();
    } catch (error) {
        console.error('Analytics認證錯誤:', error);
        return res.status(403).json({
            success: false,
            message: '無效的授權令牌'
        });
    }
};

// 所有其他路由都需要管理員權限
router.use(authenticateAdmin);

// 📊 1. 總覽統計數據 - GET /api/analytics/overview
router.get('/overview', async (req, res) => {
    try {
        console.log('Analytics Overview API called');
        
        // 使用原始SQL查詢獲取統計數據
        const [totalOrders] = await sequelize.query('SELECT COUNT(*) as count FROM orders');
        const [totalUsers] = await sequelize.query('SELECT COUNT(*) as count FROM users');
        const [totalProducts] = await sequelize.query('SELECT COUNT(*) as count FROM products');
        const [totalRevenue] = await sequelize.query(`
            SELECT COALESCE(SUM(total_price), 0) as total 
            FROM orders 
            WHERE payment_status = 'completed'
        `);
        const [completedOrders] = await sequelize.query(`
            SELECT COUNT(*) as count 
            FROM orders 
            WHERE payment_status = 'completed'
        `);
        const [pendingOrders] = await sequelize.query(`
            SELECT COUNT(*) as count 
            FROM orders 
            WHERE payment_status = 'pending'
        `);
        const [thisMonthOrders] = await sequelize.query(`
            SELECT COUNT(*) as count 
            FROM orders 
            WHERE created_at >= DATE_FORMAT(NOW(), '%Y-%m-01')
        `);

        // 計算增長率
        const growthRate = thisMonthOrders[0].count > 0 ? 
            ((thisMonthOrders[0].count / Math.max(totalOrders[0].count - thisMonthOrders[0].count, 1)) * 100) : 0;

        // 計算成功率 (已完成訂單 / 總訂單)
        const successRate = totalOrders[0].count > 0 ? 
            ((completedOrders[0].count / totalOrders[0].count) * 100) : 0;

        // 計算平均訂單金額 (總營收 / 已完成訂單數)
        const avgOrderValue = completedOrders[0].count > 0 ? 
            (parseFloat(totalRevenue[0].total) / completedOrders[0].count) : 0;

        const overview = {
            totalOrders: totalOrders[0].count,
            totalUsers: totalUsers[0].count,
            totalProducts: totalProducts[0].count,
            totalRevenue: parseFloat(totalRevenue[0].total),
            completedOrders: completedOrders[0].count,
            pendingOrders: pendingOrders[0].count,
            thisMonthOrders: thisMonthOrders[0].count,
            growthRate: Math.round(growthRate * 100) / 100,
            successRate: Math.round(successRate * 100) / 100,
            avgOrderValue: Math.round(avgOrderValue * 100) / 100
        };

        console.log('Overview data:', overview);

        res.json({
            success: true,
            data: overview
        });

    } catch (error) {
        console.error('獲取總覽數據錯誤:', error);
        res.status(500).json({
            success: false,
            message: '獲取總覽數據失敗',
            error: error.message
        });
    }
});

// 📈 2. 銷售趨勢 - GET /api/analytics/sales-trend
router.get('/sales-trend', async (req, res) => {
    try {
        console.log('Sales Trend API called');
        
        const period = req.query.period || '7days';
        
        let dateFormat, interval;
        switch (period) {
            case '7days':
                dateFormat = '%Y-%m-%d';
                interval = '7 DAY';
                break;
            case '30days':
                dateFormat = '%Y-%m-%d';
                interval = '30 DAY';
                break;
            case '12months':
                dateFormat = '%Y-%m';
                interval = '12 MONTH';
                break;
            default:
                dateFormat = '%Y-%m-%d';
                interval = '7 DAY';
        }

        const [salesData] = await sequelize.query(`
            SELECT 
                DATE_FORMAT(created_at, '${dateFormat}') as date,
                COUNT(*) as orders,
                COALESCE(SUM(total_price), 0) as revenue
            FROM orders 
            WHERE created_at >= DATE_SUB(NOW(), INTERVAL ${interval})
            AND payment_status = 'completed'
            GROUP BY DATE_FORMAT(created_at, '${dateFormat}')
            ORDER BY date DESC
            LIMIT 30
        `);

        console.log('Sales data:', salesData);

        res.json({
            success: true,
            data: salesData.reverse() // 按日期順序排列
        });

    } catch (error) {
        console.error('獲取銷售趨勢錯誤:', error);
        res.status(500).json({
            success: false,
            message: '獲取銷售趨勢失敗',
            error: error.message
        });
    }
});

// 🏆 3. 熱門產品 - GET /api/analytics/top-products
router.get('/top-products', async (req, res) => {
    try {
        console.log('Top Products API called');
        
        const [topProducts] = await sequelize.query(`
            SELECT
                p.id,
                p.name,
                p.price_min as price,
                CAST(COALESCE(SUM(CASE WHEN o.payment_status = 'completed' THEN oi.quantity ELSE 0 END), 0) AS UNSIGNED) as total_sold,
                COUNT(DISTINCT CASE WHEN o.payment_status = 'completed' THEN oi.order_id ELSE NULL END) as order_count,
                CAST(COALESCE(SUM(CASE WHEN o.payment_status = 'completed' THEN oi.quantity * oi.price ELSE 0 END), 0) AS DECIMAL(10,2)) as total_revenue
            FROM products p
            LEFT JOIN order_items oi ON p.json_id = oi.product_id
            LEFT JOIN orders o ON oi.order_id = o.order_id
            GROUP BY p.id, p.name, p.price_min
            ORDER BY total_sold DESC, p.name ASC
            LIMIT 10
        `);

        console.log('Top products:', topProducts);

        res.json({
            success: true,
            data: topProducts
        });

    } catch (error) {
        console.error('獲取熱門產品錯誤:', error);
        res.status(500).json({
            success: false,
            message: '獲取熱門產品失敗',
            error: error.message
        });
    }
});

// 👥 4. 用戶統計 - GET /api/analytics/user-stats
router.get('/user-stats', async (req, res) => {
    try {
        const [userStats] = await sequelize.query(`
            SELECT 
                COUNT(*) as total_users,
                SUM(CASE WHEN role = 'admin' THEN 1 ELSE 0 END) as admin_count,
                SUM(CASE WHEN role = 'affiliate' THEN 1 ELSE 0 END) as affiliate_count,
                SUM(CASE WHEN created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY) THEN 1 ELSE 0 END) as new_users_30days
            FROM users
        `);

        const [activeUsers] = await sequelize.query(`
            SELECT COUNT(DISTINCT customer_email) as active_users
            FROM orders 
            WHERE created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)
        `);

        res.json({
            success: true,
            data: {
                ...userStats[0],
                active_users: activeUsers[0].active_users
            }
        });

    } catch (error) {
        console.error('獲取用戶統計錯誤:', error);
        res.status(500).json({
            success: false,
            message: '獲取用戶統計失敗',
            error: error.message
        });
    }
});

// 📋 5. 最近訂單 - GET /api/analytics/recent-orders
router.get('/recent-orders', async (req, res) => {
    try {
        console.log('Recent Orders API called');
        const limit = parseInt(req.query.limit) || 10;

        console.log('Fetching recent orders with limit:', limit);

        const [recentOrders] = await sequelize.query(`
            SELECT
                order_id as id,
                customer_name,
                customer_email,
                total_price,
                payment_status,
                order_status,
                created_at
            FROM orders
            ORDER BY created_at DESC
            LIMIT ?
        `, {
            replacements: [limit]
        });

        console.log('Recent orders found:', recentOrders.length);
        console.log('Recent orders data:', recentOrders);

        res.json({
            success: true,
            data: recentOrders
        });

    } catch (error) {
        console.error('獲取最近訂單錯誤:', error);
        res.status(500).json({
            success: false,
            message: '獲取最近訂單失敗',
            error: error.message
        });
    }
});

module.exports = router;