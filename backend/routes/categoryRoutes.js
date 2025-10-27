// backend/routes/categoryRoutes.js
const express = require('express');
const Category = require('../models/Category'); // 引入分類模型

const router = express.Router();

// 取得所有分類的 API: GET /api/categories
router.get('/', async (req, res) => {
    try {
        const categories = await Category.findAll({
            order: [
                ['display_order', 'ASC'] // ✨ 按 'display_order' 欄位升序排列
            ]
        });
        res.json(categories);
    } catch (error) {
        // ...
    }
});

module.exports = router;