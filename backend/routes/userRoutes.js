// Backup of original userRoutes.js
// backend/routes/userRoutes.js
const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const { sequelize } = require('../config/db');
const User = require('../models/User')(sequelize);
const { authenticateToken } = require('../middleware/auth');

// 🧪 TEST ROUTE - GET /api/users/test
router.get('/test', (req, res) => {
    res.json({ message: 'User routes are working!', timestamp: new Date() });
});

// 📋 1. 更新用戶個人資料 - PUT /api/users/profile
router.put('/profile', authenticateToken, async (req, res) => {
    try {
        const { username, email, phone, address, birthday } = req.body;
        const userId = req.user.user_id;

        // 檢查是否提供了必要的資料
        if (!username || !email) {
            return res.status(400).json({
                success: false,
                message: '使用者名稱和電子郵件為必填項目'
            });
        }

        // 檢查email是否已被其他用戶使用
        if (email !== req.user.email) {
            const existingUser = await User.findOne({
                where: { 
                    email: email,
                    user_id: { [sequelize.Sequelize.Op.ne]: userId }
                }
            });

            if (existingUser) {
                return res.status(400).json({
                    success: false,
                    message: '此電子郵件已被其他用戶使用'
                });
            }
        }

        // 檢查username是否已被其他用戶使用
        if (username !== req.user.username) {
            const existingUser = await User.findOne({
                where: { 
                    username: username,
                    user_id: { [sequelize.Sequelize.Op.ne]: userId }
                }
            });

            if (existingUser) {
                return res.status(400).json({
                    success: false,
                    message: '此使用者名稱已被其他用戶使用'
                });
            }
        }

        // 更新用戶資料
        await req.user.update({
            username: username,
            email: email,
            phone: phone || null,
            address: address || null,
            birthday: birthday || null
        });

        // 重新查詢用戶資料以獲取最新資訊
        const updatedUser = await User.findByPk(userId, {
            attributes: { exclude: ['password'] }
        });

        res.json({
            success: true,
            message: '個人資料更新成功',
            user: updatedUser
        });

    } catch (error) {
        console.error('更新個人資料失敗:', error);
        res.status(500).json({
            success: false,
            message: '伺服器內部錯誤',
            error: error.message
        });
    }
});

// 🔐 2. 變更密碼 - PUT /api/users/change-password
router.put('/change-password', authenticateToken, async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;
        const userId = req.user.user_id;

        // 檢查必要欄位
        if (!currentPassword || !newPassword) {
            return res.status(400).json({
                success: false,
                message: '目前密碼和新密碼為必填項目'
            });
        }

        // 檢查新密碼長度
        if (newPassword.length < 6) {
            return res.status(400).json({
                success: false,
                message: '新密碼至少需要6個字元'
            });
        }

        // 驗證目前密碼
        const isCurrentPasswordValid = await bcrypt.compare(currentPassword, req.user.password);
        if (!isCurrentPasswordValid) {
            return res.status(400).json({
                success: false,
                message: '目前密碼不正確'
            });
        }

        // 檢查新密碼是否與目前密碼相同
        const isSamePassword = await bcrypt.compare(newPassword, req.user.password);
        if (isSamePassword) {
            return res.status(400).json({
                success: false,
                message: '新密碼不能與目前密碼相同'
            });
        }

        // 加密新密碼
        const saltRounds = 12;
        const hashedNewPassword = await bcrypt.hash(newPassword, saltRounds);

        // 更新密碼
        await req.user.update({
            password: hashedNewPassword
        });

        res.json({
            success: true,
            message: '密碼變更成功'
        });

    } catch (error) {
        console.error('變更密碼失敗:', error);
        res.status(500).json({
            success: false,
            message: '伺服器內部錯誤',
            error: error.message
        });
    }
});

// 📋 3. 取得用戶個人資料 - GET /api/users/profile
router.get('/profile', authenticateToken, async (req, res) => {
    try {
        const user = await User.findByPk(req.user.user_id, {
            attributes: { exclude: ['password'] }
        });

        if (!user) {
            return res.status(404).json({
                success: false,
                message: '用戶不存在'
            });
        }

        res.json({
            success: true,
            user: user
        });

    } catch (error) {
        console.error('取得用戶資料失敗:', error);
        res.status(500).json({
            success: false,
            message: '伺服器內部錯誤',
            error: error.message
        });
    }
});

module.exports = router;