// backend/routes/authRoutes.js
const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const { sequelize } = require('../config/db');
const User = require('../models/User')(sequelize);

const router = express.Router();

// JWT 密鑰 - 在生產環境中應該放在環境變數
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

// 用戶註冊
router.post('/register', async (req, res) => {
    try {
        const {
            username,
            email,
            password,
            firstName,
            lastName,
            phone,
            address,
            role = 'customer'
        } = req.body;

        // 驗證必填欄位
        if (!username || !email || !password || !firstName || !lastName) {
            return res.status(400).json({
                success: false,
                message: '用戶名、電子郵件、密碼、姓名為必填欄位'
            });
        }

        // 檢查用戶是否已存在
        const existingUser = await User.findOne({
            where: {
                [sequelize.Sequelize.Op.or]: [
                    { username: username },
                    { email: email }
                ]
            }
        });

        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: '用戶名或電子郵件已存在'
            });
        }

        // 創建新用戶 (使用Sequelize ORM，會自動處理密碼加密和預設值)
        const newUser = await User.create({
            username,
            email,
            password_hash: password, // User模型的hook會自動加密
            first_name: firstName,
            last_name: lastName,
            phone,
            address,
            role: ['customer', 'affiliate', 'admin'].includes(role) ? role : 'customer'
            // status 和 email_verified 會使用模型中定義的預設值
        });

        // 轉換為安全物件（移除敏感資訊）
        const safeUser = newUser.toSafeObject();
        
        // 確保 boolean 值正確轉換
        if (safeUser.email_verified !== undefined) {
            safeUser.email_verified = Boolean(safeUser.email_verified);
        }

        // 生成 JWT token
        const token = jwt.sign(
            { 
                userId: safeUser.user_id, 
                username: safeUser.username,
                role: safeUser.role 
            },
            JWT_SECRET,
            { expiresIn: '24h' }
        );

        res.status(201).json({
            success: true,
            message: '用戶註冊成功',
            data: {
                token,
                user: safeUser
            }
        });

    } catch (error) {
        console.error('註冊錯誤:', error);
        res.status(500).json({
            success: false,
            message: '註冊失敗',
            error: error.message
        });
    }
});

// 用戶登入
router.post('/login', async (req, res) => {
    try {
        const { username, password } = req.body;

        // 驗證必填欄位
        if (!username || !password) {
            return res.status(400).json({
                success: false,
                message: '用戶名和密碼為必填欄位'
            });
        }

        // 查找用戶
        const user = await User.findOne({
            where: {
                [sequelize.Sequelize.Op.or]: [
                    { username: username },
                    { email: username }
                ],
                status: 'active'
            }
        });

        if (!user) {
            return res.status(401).json({
                success: false,
                message: '用戶名或密碼錯誤'
            });
        }

        // 驗證密碼
        const isValidPassword = await user.validatePassword(password);
        if (!isValidPassword) {
            return res.status(401).json({
                success: false,
                message: '用戶名或密碼錯誤'
            });
        }

        // 更新最後登入時間
        await user.update({ last_login: new Date() });

        // 生成 JWT token
        const token = jwt.sign(
            { 
                userId: user.user_id, 
                username: user.username,
                role: user.role 
            },
            JWT_SECRET,
            { expiresIn: '24h' }
        );

        // 返回用戶信息（不包含敏感信息）
        const safeUser = user.toSafeObject();
        
        // 確保 boolean 值正確轉換
        if (safeUser.email_verified !== undefined) {
            safeUser.email_verified = Boolean(safeUser.email_verified);
        }

        res.json({
            success: true,
            message: '登入成功',
            data: {
                token,
                user: safeUser
            }
        });

    } catch (error) {
        console.error('登入錯誤:', error);
        res.status(500).json({
            success: false,
            message: '登入失敗',
            error: error.message
        });
    }
});

// 驗證 token 中間件
const authenticateToken = async (req, res, next) => {
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
        
        // 查詢用戶信息
        const user = await User.findOne({
            where: {
                user_id: decoded.userId,
                status: 'active'
            }
        });

        if (!user) {
            return res.status(401).json({
                success: false,
                message: '無效的授權令牌'
            });
        }

        const safeUser = user.toSafeObject();
        
        // 確保 boolean 值正確轉換
        if (safeUser.email_verified !== undefined) {
            safeUser.email_verified = Boolean(safeUser.email_verified);
        }
        
        req.user = safeUser;
        next();
    } catch (error) {
        console.error('Token 驗證錯誤:', error);
        return res.status(403).json({
            success: false,
            message: '無效的授權令牌'
        });
    }
};

// 驗證令牌端點
router.get('/verify', authenticateToken, (req, res) => {
    res.json({
        success: true,
        message: '令牌有效',
        data: {
            user: req.user
        }
    });
});

// 用戶登出（簡化版本）
router.post('/logout', (req, res) => {
    // 在實際應用中，您可能會想要將token加入黑名單
    res.json({
        success: true,
        message: '登出成功'
    });
});

module.exports = router;