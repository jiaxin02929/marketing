// backend/middleware/auth.js
const jwt = require('jsonwebtoken');
const { sequelize } = require('../config/db');
const User = require('../models/User')(sequelize);

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

// 驗證 JWT token 中間件
const authenticateToken = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

        if (!token) {
            return res.status(401).json({
                success: false,
                message: '未提供授權令牌'
            });
        }

        const decoded = jwt.verify(token, JWT_SECRET);
        const user = await User.findByPk(decoded.userId);

        if (!user) {
            return res.status(401).json({
                success: false,
                message: '用戶不存在'
            });
        }

        if (user.status !== 'active') {
            return res.status(403).json({
                success: false,
                message: '帳戶已被停用'
            });
        }

        // 將用戶資訊附加到請求對象
        req.user = user;
        next();

    } catch (error) {
        console.error('身份驗證錯誤:', error);
        
        if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({
                success: false,
                message: '無效的授權令牌'
            });
        }
        
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({
                success: false,
                message: '授權令牌已過期'
            });
        }

        return res.status(500).json({
            success: false,
            message: '身份驗證失敗',
            error: error.message
        });
    }
};

// 檢查用戶角色中間件
const requireRole = (roles) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: '需要先進行身份驗證'
            });
        }

        if (!roles.includes(req.user.role)) {
            return res.status(403).json({
                success: false,
                message: '權限不足'
            });
        }

        next();
    };
};

// 檢查是否為管理員
const requireAdmin = requireRole(['admin']);

// 檢查是否為聯盟會員或管理員
const requireAffiliate = requireRole(['affiliate', 'admin']);

// 可選的身份驗證中間件 (如果有 token 就驗證，沒有也繼續)
const optionalAuth = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        const token = authHeader && authHeader.split(' ')[1];

        if (token) {
            const decoded = jwt.verify(token, JWT_SECRET);
            const user = await User.findByPk(decoded.userId);
            
            if (user && user.status === 'active') {
                req.user = user;
            }
        }

        next();
    } catch (error) {
        // 忽略錯誤，繼續執行
        next();
    }
};

module.exports = {
    authenticateToken,
    requireRole,
    requireAdmin,
    requireAffiliate,
    optionalAuth
};