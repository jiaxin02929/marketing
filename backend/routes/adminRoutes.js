// backend/routes/adminRoutes.js - 管理員專用API
const express = require('express');
const { sequelize } = require('../config/db');
const jwt = require('jsonwebtoken');

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

// 簡化的管理員驗證中間件
const authenticateAdmin = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        const token = authHeader && authHeader.split(' ')[1];

        if (!token) {
            return res.status(401).json({
                success: false,
                message: '未提供授權令牌'
            });
        }

        const decoded = jwt.verify(token, JWT_SECRET);
        
        // 檢查用戶是否為管理員
        const [users] = await sequelize.query(
            'SELECT * FROM users WHERE user_id = ? AND role = "admin"',
            { replacements: [decoded.userId] }
        );

        if (users.length === 0) {
            return res.status(403).json({
                success: false,
                message: '需要管理員權限'
            });
        }

        req.user = users[0];
        next();
    } catch (error) {
        console.error('認證錯誤:', error);
        res.status(401).json({
            success: false,
            message: '無效的授權令牌'
        });
    }
};

// 所有路由都需要管理員權限
router.use(authenticateAdmin);

// 🔍 獲取所有用戶列表 - GET /api/admin/users
router.get('/users', async (req, res) => {
    try {
        const [users] = await sequelize.query(`
            SELECT 
                user_id as id,
                username,
                email,
                first_name,
                last_name,
                role,
                status,
                created_at,
                updated_at
            FROM users 
            ORDER BY created_at DESC
        `);

        res.json({
            success: true,
            data: users
        });

    } catch (error) {
        console.error('獲取用戶列表錯誤:', error);
        res.status(500).json({
            success: false,
            message: '獲取用戶列表失敗',
            error: error.message
        });
    }
});

// 👤 獲取單個用戶詳情 - GET /api/admin/users/:id
router.get('/users/:id', async (req, res) => {
    try {
        const userId = req.params.id;
        
        const [users] = await sequelize.query(
            'SELECT user_id as id, username, email, first_name, last_name, role, status, created_at, updated_at FROM users WHERE user_id = ?',
            { replacements: [userId] }
        );

        if (users.length === 0) {
            return res.status(404).json({
                success: false,
                message: '用戶不存在'
            });
        }

        res.json({
            success: true,
            data: users[0]
        });

    } catch (error) {
        console.error('獲取用戶詳情錯誤:', error);
        res.status(500).json({
            success: false,
            message: '獲取用戶詳情失敗',
            error: error.message
        });
    }
});

// 🔄 更新用戶角色 - PUT /api/admin/users/:id/role
router.put('/users/:id/role', async (req, res) => {
    try {
        const userId = req.params.id;
        const { role } = req.body;

        // 驗證角色是否有效 (根據實際資料庫結構)
        const validRoles = ['customer', 'affiliate', 'admin'];
        if (!validRoles.includes(role)) {
            return res.status(400).json({
                success: false,
                message: '無效的角色'
            });
        }

        // 檢查用戶是否存在
        const [existingUsers] = await sequelize.query(
            'SELECT user_id FROM users WHERE user_id = ?',
            { replacements: [userId] }
        );

        if (existingUsers.length === 0) {
            return res.status(404).json({
                success: false,
                message: '用戶不存在'
            });
        }

        // 不能修改自己的角色
        if (userId === req.user.user_id) {
            return res.status(400).json({
                success: false,
                message: '不能修改自己的角色'
            });
        }

        // 更新用戶角色
        await sequelize.query(
            'UPDATE users SET role = ?, updated_at = NOW() WHERE user_id = ?',
            { replacements: [role, userId] }
        );

        res.json({
            success: true,
            message: '用戶角色更新成功'
        });

    } catch (error) {
        console.error('更新用戶角色錯誤:', error);
        res.status(500).json({
            success: false,
            message: '更新用戶角色失敗',
            error: error.message
        });
    }
});

// 🔄 更新用戶狀態 - PUT /api/admin/users/:id/status  
router.put('/users/:id/status', async (req, res) => {
    try {
        const userId = req.params.id;
        const { status } = req.body;

        // 驗證狀態是否有效 (根據實際資料庫結構)
        const validStatuses = ['active', 'inactive', 'suspended'];
        if (!validStatuses.includes(status)) {
            return res.status(400).json({
                success: false,
                message: '無效的狀態'
            });
        }

        // 檢查用戶是否存在
        const [existingUsers] = await sequelize.query(
            'SELECT user_id FROM users WHERE user_id = ?',
            { replacements: [userId] }
        );

        if (existingUsers.length === 0) {
            return res.status(404).json({
                success: false,
                message: '用戶不存在'
            });
        }

        // 不能修改自己的狀態
        if (userId === req.user.user_id) {
            return res.status(400).json({
                success: false,
                message: '不能修改自己的狀態'
            });
        }

        // 更新用戶狀態
        await sequelize.query(
            'UPDATE users SET status = ?, updated_at = NOW() WHERE user_id = ?',
            { replacements: [status, userId] }
        );

        res.json({
            success: true,
            message: '用戶狀態更新成功'
        });

    } catch (error) {
        console.error('更新用戶狀態錯誤:', error);
        res.status(500).json({
            success: false,
            message: '更新用戶狀態失敗',
            error: error.message
        });
    }
});

// ❌ 刪除用戶 - DELETE /api/admin/users/:id
router.delete('/users/:id', async (req, res) => {
    try {
        const userId = req.params.id;

        // 檢查用戶是否存在
        const [existingUsers] = await sequelize.query(
            'SELECT user_id FROM users WHERE user_id = ?',
            { replacements: [userId] }
        );

        if (existingUsers.length === 0) {
            return res.status(404).json({
                success: false,
                message: '用戶不存在'
            });
        }

        // 不能刪除自己
        if (userId === req.user.user_id) {
            return res.status(400).json({
                success: false,
                message: '不能刪除自己的帳號'
            });
        }

        // 軟刪除用戶 (設定為非活躍狀態)
        await sequelize.query(
            'UPDATE users SET status = "inactive", updated_at = NOW() WHERE user_id = ?',
            { replacements: [userId] }
        );

        res.json({
            success: true,
            message: '用戶停用成功'
        });

    } catch (error) {
        console.error('停用用戶錯誤:', error);
        res.status(500).json({
            success: false,
            message: '停用用戶失敗',
            error: error.message
        });
    }
});

// 📊 用戶統計 - GET /api/admin/users/stats
router.get('/users/stats', async (req, res) => {
    try {
        const [stats] = await sequelize.query(`
            SELECT 
                COUNT(*) as total_users,
                SUM(CASE WHEN role = 'admin' THEN 1 ELSE 0 END) as admin_count,
                SUM(CASE WHEN role = 'affiliate' THEN 1 ELSE 0 END) as affiliate_count,
                SUM(CASE WHEN role = 'customer' THEN 1 ELSE 0 END) as customer_count,
                SUM(CASE WHEN status = 'active' THEN 1 ELSE 0 END) as active_users,
                SUM(CASE WHEN created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY) THEN 1 ELSE 0 END) as new_users_30days,
                SUM(CASE WHEN created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY) THEN 1 ELSE 0 END) as new_users_7days
            FROM users
        `);

        res.json({
            success: true,
            data: stats[0]
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

module.exports = router;