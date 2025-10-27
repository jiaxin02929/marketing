// backend/routes/affiliateRoutes.js
const express = require('express');
const { sequelize } = require('../config/db');
const AffiliateLink = require('../models/AffiliateLink')(sequelize);
const AffiliateClick = require('../models/AffiliateClick')(sequelize);
const User = require('../models/User')(sequelize);
const Order = require('../models/Order');
const { authenticateToken, requireAffiliate } = require('../middleware/auth');

const router = express.Router();

// 建立新的分潤連結
router.post('/links', authenticateToken, requireAffiliate, async (req, res) => {
    try {
        const { link_code, commission_rate, discount_rate, expires_at } = req.body;
        const userId = req.user.user_id;

        console.log('[DEBUG] Attempting to find existing link with code:', link_code);

        // 驗證連結代碼是否唯一
        const existingLink = await AffiliateLink.findOne({
            where: { link_code }
        });

        if (existingLink) {
            return res.status(400).json({
                success: false,
                message: '此折扣碼已被使用，請選擇其他代碼'
            });
        }

        // 建立新連結
        try {
            const newLink = await AffiliateLink.create({
                user_id: userId,
                link_code,
                commission_rate: commission_rate || 0.05, // 預設 5%
                discount_rate: discount_rate || 0.10, // 預設 10% 折扣
                expires_at: expires_at || null
            });

            res.status(201).json({
                success: true,
                message: '折扣碼建立成功',
                data: {
                    link: newLink,
                    full_url: newLink.generateLinkUrl('http://localhost:5174')
                }
            });
        } catch (error) {
            if (error.name === 'SequelizeValidationError') {
                const messages = error.errors.map(err => err.message).join(', ');
                return res.status(400).json({ success: false, message: `驗證失敗: ${messages}` });
            }
            throw error; // 重新拋出非驗證錯誤
        }

    } catch (error) {
        console.error('建立分潤連結錯誤 (Raw):', error);
        console.error('建立分潤連結錯誤 (Full JSON):', JSON.stringify(error, null, 2));
        res.status(500).json({
            success: false,
            message: '建立分潤連結失敗',
            error: error.message
        });
    }
});

// 取得用戶的所有分潤連結
router.get('/links', authenticateToken, requireAffiliate, async (req, res) => {
    try {
        const userId = req.user.user_id;
        const { page = 1, limit = 10, status } = req.query;

        const whereConditions = { user_id: userId };
        if (status && status !== 'all') {
            whereConditions.status = status;
        }

        const { count, rows: links } = await AffiliateLink.findAndCountAll({
            where: whereConditions,
            order: [['created_at', 'DESC']],
            limit: parseInt(limit),
            offset: (parseInt(page) - 1) * parseInt(limit)
        });

        // 為每個連結生成完整 URL
        const linksWithUrls = links.map(link => ({
            ...link.toJSON(),
            full_url: link.generateLinkUrl('http://localhost:5174')
        }));

        res.json({
            success: true,
            data: {
                links: linksWithUrls,
                pagination: {
                    total: count,
                    page: parseInt(page),
                    limit: parseInt(limit),
                    total_pages: Math.ceil(count / parseInt(limit))
                }
            }
        });

    } catch (error) {
        console.error('取得分潤連結錯誤:', error);
        res.status(500).json({
            success: false,
            message: '取得分潤連結失敗',
            error: error.message
        });
    }
});

// 取得單一分潤連結的詳細資訊和統計
router.get('/links/:linkId', authenticateToken, requireAffiliate, async (req, res) => {
    try {
        const { linkId } = req.params;
        const userId = req.user.user_id;

        const link = await AffiliateLink.findOne({
            where: {
                link_id: linkId,
                user_id: userId
            }
        });

        if (!link) {
            return res.status(404).json({
                success: false,
                message: '找不到該分潤連結'
            });
        }

        // 取得點擊統計
        const clickStats = await AffiliateClick.findAll({
            where: { link_id: linkId },
            attributes: [
                [sequelize.fn('DATE', sequelize.col('clicked_at')), 'date'],
                [sequelize.fn('COUNT', '*'), 'clicks'],
                [sequelize.fn('SUM', sequelize.literal('CASE WHEN converted = true THEN 1 ELSE 0 END')), 'conversions']
            ],
            group: [sequelize.fn('DATE', sequelize.col('clicked_at'))],
            order: [[sequelize.fn('DATE', sequelize.col('clicked_at')), 'DESC']],
            limit: 30
        });

        res.json({
            success: true,
            data: {
                link: {
                    ...link.toJSON(),
                    full_url: link.generateLinkUrl('http://localhost:5174')
                },
                click_stats: clickStats
            }
        });

    } catch (error) {
        console.error('取得分潤連結詳情錯誤:', error);
        res.status(500).json({
            success: false,
            message: '取得分潤連結詳情失敗',
            error: error.message
        });
    }
});

// 驗證折扣碼 (公開端點)
router.get('/code/:code', async (req, res) => {
    try {
        const { code } = req.params;

        const affiliateCode = await AffiliateLink.findOne({
            where: {
                link_code: code,
                status: 'active'
            }
        });

        if (!affiliateCode) {
            return res.status(404).json({
                success: false,
                message: '無效的折扣碼'
            });
        }

        if (affiliateCode.expires_at && new Date() > new Date(affiliateCode.expires_at)) {
            return res.status(404).json({
                success: false,
                message: '此折扣碼已過期'
            });
        }

        res.json({
            success: true,
            data: {
                code: affiliateCode.link_code,
                discount_rate: affiliateCode.discount_rate,
                commission_rate: affiliateCode.commission_rate
            }
        });

    } catch (error) {
        console.error('驗證折扣碼錯誤:', error);
        res.status(500).json({
            success: false,
            message: '驗證折扣碼時發生錯誤'
        });
    }
});

// 更新分潤連結
router.put('/links/:linkId', authenticateToken, requireAffiliate, async (req, res) => {
    try {
        const { linkId } = req.params;
        const userId = req.user.user_id;
        const { status, expires_at } = req.body;

        const link = await AffiliateLink.findOne({
            where: {
                link_id: linkId,
                user_id: userId
            }
        });

        if (!link) {
            return res.status(404).json({
                success: false,
                message: '找不到該分潤連結'
            });
        }

        // 更新連結
        const updateData = {};
        if (status) updateData.status = status;
        if (expires_at !== undefined) updateData.expires_at = expires_at;

        await link.update(updateData);

        res.json({
            success: true,
            message: '分潤連結更新成功',
            data: {
                link: {
                    ...link.toJSON(),
                    full_url: link.generateLinkUrl('http://localhost:5174')
                }
            }
        });

    } catch (error) {
        console.error('更新分潤連結錯誤:', error);
        res.status(500).json({
            success: false,
            message: '更新分潤連結失敗',
            error: error.message
        });
    }
});

// 處理分潤連結點擊 (公開端點，不需要身份驗證)
router.get('/click/:linkCode', async (req, res) => {
    try {
        const { linkCode } = req.params;
        const clientIP = req.ip || req.connection.remoteAddress;
        const userAgent = req.get('User-Agent');
        const referrer = req.get('Referrer');

        // 查找分潤連結
        const link = await AffiliateLink.findOne({
            where: {
                link_code: linkCode,
                status: 'active'
            }
        });

        if (!link) {
            return res.status(404).json({
                success: false,
                message: '無效的分潤連結'
            });
        }

        // 檢查連結是否過期
        if (link.expires_at && new Date() > new Date(link.expires_at)) {
            return res.status(410).json({
                success: false,
                message: '分潤連結已過期'
            });
        }

        // 記錄點擊
        const click = await AffiliateClick.create({
            link_id: link.link_id,
            user_id: link.user_id,
            ip_address: clientIP,
            user_agent: userAgent,
            referrer: referrer
        });

        // 更新連結點擊計數
        await link.incrementClick();

        // 重導向到主網站 (可以加上追蹤參數)
        const redirectUrl = `http://localhost:5174?ref=${linkCode}&click_id=${click.click_id}`;
        
        res.json({
            success: true,
            message: '連結點擊已記錄',
            data: {
                redirect_url: redirectUrl,
                click_id: click.click_id
            }
        });

    } catch (error) {
        console.error('處理分潤連結點擊錯誤:', error);
        res.status(500).json({
            success: false,
            message: '處理連結點擊失敗',
            error: error.message
        });
    }
});

// 取得分潤收益報告 (重構後)
router.get('/earnings', authenticateToken, requireAffiliate, async (req, res) => {
        try {
            const userId = req.user.user_id;
            const { start_date, end_date, period = 'month' } = req.query;
    
            const dateConditions = {};
        if (start_date) {
            dateConditions.created_at = { [sequelize.Sequelize.Op.gte]: new Date(start_date) };
        }
        if (end_date) {
            if (!dateConditions.created_at) dateConditions.created_at = {};
            dateConditions.created_at[sequelize.Sequelize.Op.lte] = new Date(end_date);
        }

        // 直接從 Order 表計算總收益
        const totalEarnings = await Order.findOne({
            where: {
                referred_by_user: userId,
                payment_status: 'completed',
                ...dateConditions
            },
            attributes: [
                [sequelize.fn('SUM', sequelize.col('commission_amount')), 'total_commission'],
                [sequelize.fn('SUM', sequelize.col('total_price')), 'total_sales'],
                [sequelize.fn('COUNT', sequelize.col('order_id')), 'total_conversions']
            ],
            raw: true
        });

        // 根據期間分組取得收益趨勢
        let dateFormat;
        switch (period) {
            case 'day': dateFormat = '%Y-%m-%d'; break;
            case 'week': dateFormat = '%Y-%u'; break;
            default: dateFormat = '%Y-%m';
        }

        const earningsTrend = await Order.findAll({
            where: {
                referred_by_user: userId,
                payment_status: 'completed',
                ...dateConditions
            },
            attributes: [
                [sequelize.fn('DATE_FORMAT', sequelize.col('created_at'), dateFormat), 'period'],
                [sequelize.fn('SUM', sequelize.col('commission_amount')), 'commission'],
                [sequelize.fn('SUM', sequelize.col('total_price')), 'sales'],
                [sequelize.fn('COUNT', sequelize.col('order_id')), 'conversions']
            ],
            group: ['period'],
            order: [['period', 'DESC']],
            limit: 12,
            raw: true
        });

        res.json({
            success: true,
            data: {
                total_earnings: {
                    total_commission: parseFloat(totalEarnings.total_commission) || 0,
                    total_sales: parseFloat(totalEarnings.total_sales) || 0,
                    total_conversions: parseInt(totalEarnings.total_conversions) || 0
                },
                earnings_trend: earningsTrend.map(item => ({
                    period: item.period,
                    commission: parseFloat(item.commission) || 0,
                    sales: parseFloat(item.sales) || 0,
                    conversions: parseInt(item.conversions) || 0
                }))
            }
        });

    } catch (error) {
        console.error('取得收益報告錯誤:', error);
        res.status(500).json({
            success: false,
            message: '取得收益報告失敗',
            error: error.message
        });
    }
});

// 取得最近的轉換紀錄
router.get('/conversions', authenticateToken, requireAffiliate, async (req, res) => {
    try {
        const userId = req.user.user_id;

        const recentConversions = await Order.findAll({
            where: {
                referred_by_user: userId,
                payment_status: 'completed'
            },
            order: [['created_at', 'DESC']],
            limit: 5,
            attributes: ['order_id', 'total_price', 'commission_amount', 'created_at']
        });

        res.json({
            success: true,
            data: recentConversions
        });

    } catch (error) {
        console.error('取得最近轉換紀錄錯誤:', error);
        res.status(500).json({
            success: false,
            message: '取得最近轉換紀錄失敗'
        });
    }
});

// 刪除分潤連結
router.delete('/links/:linkId', authenticateToken, requireAffiliate, async (req, res) => {
    try {
        const { linkId } = req.params;
        const userId = req.user.user_id;

        const link = await AffiliateLink.findOne({
            where: {
                link_id: linkId,
                user_id: userId
            }
        });

        if (!link) {
            return res.status(404).json({
                success: false,
                message: '找不到該分潤連結'
            });
        }

        // 檢查是否有已轉換的點擊，如果有則不允許刪除
        const hasConversions = await AffiliateClick.count({
            where: {
                link_id: linkId,
                converted: true
            }
        });

        if (hasConversions > 0) {
            return res.status(400).json({
                success: false,
                message: '此連結已有轉換記錄，無法刪除'
            });
        }

        // 刪除相關的點擊記錄
        await AffiliateClick.destroy({
            where: { link_id: linkId }
        });

        // 刪除連結
        await link.destroy();

        res.json({
            success: true,
            message: '分潤連結已刪除'
        });

    } catch (error) {
        console.error('刪除分潤連結錯誤:', error);
        res.status(500).json({
            success: false,
            message: '刪除分潤連結失敗',
            error: error.message
        });
    }
});

// 生成隨機連結代碼的輔助端點
router.get('/generate-code', authenticateToken, requireAffiliate, async (req, res) => {
    try {
        const generateCode = () => {
            const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
            let result = '';
            for (let i = 0; i < 8; i++) {
                result += chars.charAt(Math.floor(Math.random() * chars.length));
            }
            return result;
        };

        let linkCode;
        let attempts = 0;
        const maxAttempts = 10;

        do {
            linkCode = generateCode();
            const existing = await AffiliateLink.findOne({
                where: { link_code: linkCode }
            });
            if (!existing) break;
            attempts++;
        } while (attempts < maxAttempts);

        if (attempts >= maxAttempts) {
            return res.status(500).json({
                success: false,
                message: '無法生成唯一的連結代碼，請稍後再試'
            });
        }

        res.json({
            success: true,
            data: {
                link_code: linkCode
            }
        });

    } catch (error) {
        console.error('生成連結代碼錯誤:', error);
        res.status(500).json({
            success: false,
            message: '生成連結代碼失敗',
            error: error.message
        });
    }
});

module.exports = router;