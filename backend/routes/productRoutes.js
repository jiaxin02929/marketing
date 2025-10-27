// backend/routes/productRoutes_new.js - 重新創建搜尋功能
const express = require('express');
const Product = require('../models/Product');
const { Op } = require('sequelize');

const router = express.Router();

// ✅ 搜尋產品的 API: GET /api/products/search?q=關鍵字
router.get('/search', async (req, res) => {
    try {
        const { q, category, min_price, max_price, sort, limit = 20, page = 1 } = req.query;
        
        const searchTerm = q ? q.trim() : '';
        const offset = (parseInt(page) - 1) * parseInt(limit);

        // 建構搜尋條件 - 使用正確的欄位名稱
        const whereConditions = { [Op.and]: [] };
        
        // 如果有搜尋關鍵字，加入文字搜尋條件
        if (searchTerm && searchTerm.length > 0) {
            const categoryNameToIdMap = {
                '男戒': 'male-rings',
                '女戒': 'female-rings',
                '對戒': 'couple-rings',
                '項鍊': 'necklaces',
                '手鍊': 'bracelets',
                '耳環': 'earrings',
                '裸鑽': 'diamonds'
            };
            const searchCategoryId = categoryNameToIdMap[searchTerm];

            const orConditions = [
                { name: { [Op.like]: `%${searchTerm}%` } },
                { description: { [Op.like]: `%${searchTerm}%` } },
                { material: { [Op.like]: `%${searchTerm}%` } },
                { color: { [Op.like]: `%${searchTerm}%` } },
                { product_code: { [Op.like]: `%${searchTerm}%` } }
            ];

            if (searchCategoryId) {
                orConditions.push({ category_id: searchCategoryId });
            } else {
                orConditions.push({ category_id: { [Op.like]: `%${searchTerm}%` } });
            }

            whereConditions[Op.and].push({ [Op.or]: orConditions });
        }

        // 加入分類篩選
        if (category && category !== 'all') {
            whereConditions[Op.and].push({ category_id: category });
        }

        // 加入價格篩選
        if (min_price) {
            whereConditions[Op.and].push({ price_min: { [Op.gte]: parseFloat(min_price) } });
        }
        if (max_price) {
            whereConditions[Op.and].push({ price_max: { [Op.lte]: parseFloat(max_price) } });
        }

        // 設定排序
        let order = [['created_at', 'DESC']];
        switch (sort) {
            case 'price_asc':
                order = [['price_min', 'ASC']];
                break;
            case 'price_desc':
                order = [['price_max', 'DESC']];
                break;
            case 'name_asc':
                order = [['name', 'ASC']];
                break;
            case 'name_desc':
                order = [['name', 'DESC']];
                break;
            case 'newest':
                order = [['created_at', 'DESC']];
                break;
            case 'oldest':
                order = [['created_at', 'ASC']];
                break;
            default:
                order = [['created_at', 'DESC']];
        }

        // 執行搜尋 - 如果沒有任何搜尋條件，顯示所有產品
        let queryOptions = {
            order,
            limit: parseInt(limit),
            offset: offset
        };

        // 如果有搜尋條件才加入 where 子句
        if (whereConditions[Op.and].length > 0) {
            queryOptions.where = whereConditions;
        }

        const { count, rows: products } = await Product.findAndCountAll(queryOptions);

        // 處理價格數據
        const productsWithSimulatedPrice = products.map(product => {
            const priceMin = parseFloat(product.price_min);
            const priceMax = parseFloat(product.price_max);
            const simulatedPrice = (priceMin + priceMax) / 2;

            return {
                ...product.toJSON(),
                simulated_price: simulatedPrice,
            };
        });

        res.json({
            success: true,
            data: {
                products: productsWithSimulatedPrice,
                pagination: {
                    total: count,
                    page: parseInt(page),
                    limit: parseInt(limit),
                    total_pages: Math.ceil(count / parseInt(limit))
                },
                search_info: {
                    keyword: searchTerm,
                    category: category || 'all',
                    min_price: min_price || null,
                    max_price: max_price || null,
                    sort: sort || 'newest'
                }
            }
        });

    } catch (error) {
        console.error('搜尋產品時發生錯誤:', error);
        res.status(500).json({
            success: false,
            message: '搜尋失敗，請稍後再試',
            error: error.message
        });
    }
});

// ✅ 取得所有產品的 API: GET /api/products
router.get('/', async (req, res) => {
    try {
        const products = await Product.findAll();

        const productsWithSimulatedPrice = products.map(product => {
            const priceMin = parseFloat(product.price_min);
            const priceMax = parseFloat(product.price_max);
            const simulatedPrice = (priceMin + priceMax) / 2;

            return {
                ...product.toJSON(),
                simulated_price: simulatedPrice,
            };
        });

        res.json(productsWithSimulatedPrice);
    } catch (error) {
        console.error('從資料庫獲取產品列表時發生錯誤:', error);
        res.status(500).json({ message: '伺服器內部錯誤' });
    }
});

// ✅ 取得單一產品的 API: GET /api/products/:json_id
router.get('/:json_id', async (req, res) => {
    try {
        const product = await Product.findOne({
            where: { json_id: req.params.json_id }
        });

        if (!product) {
            return res.status(404).json({ message: '產品未找到' });
        }

        const priceMin = parseFloat(product.price_min);
        const priceMax = parseFloat(product.price_max);
        const simulatedPrice = (priceMin + priceMax) / 2;
        const responseData = {
            ...product.toJSON(),
            simulated_price: simulatedPrice,
        };

        res.json(responseData);
    } catch (error) {
        console.error('從資料庫獲取單一產品時發生錯誤:', error);
        res.status(500).json({ message: '伺服器內部錯誤' });
    }
});

module.exports = router;