// backend/importProducts.js
require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { sequelize } = require('./config/db');
const Product = require('./models/Product');

const importProducts = async () => {
    try {
        await sequelize.authenticate();
        console.log('✅ 資料庫連接成功');

        // 從 products.json 讀取資料
        const productsPath = path.join(__dirname, 'products.json');
        const productsData = JSON.parse(fs.readFileSync(productsPath, 'utf-8'));

        console.log(`讀取到 ${productsData.length} 項商品資料`);

        // 同步 Product 模型
        await Product.sync({ alter: true });
        console.log('🔄 同步 Product 模型完成');

        // 清空現有商品資料
        await Product.destroy({ where: {}, truncate: true });
        console.log('🔄 清空現有商品資料完成');

        const productsToCreate = productsData.map(p => ({
            json_id: p.id,
            product_code: p.product_code,
            name: p.name,
            images: p.images,
            price_min: p.price_min,
            price_max: p.price_max,
            category_id: p.category_id,
            description: p.description,
            carat: p.carat === '' ? null : parseFloat(p.carat),
            clarity_1: p.clarity_1,
            clarity_2: p.clarity_2,
            color: p.color,
            Level: p.Level,
            material: p.material,
            simulated_price: p.simulated_price
        }));

        // 批量插入商品資料
        await Product.bulkCreate(productsToCreate);
        console.log(`🎉 成功導入 ${productsData.length} 項商品到資料庫`);

    } catch (error) {
        console.error('❌ 商品資料導入失敗:', error);
    } finally {
        await sequelize.close();
        console.log('資料庫連接已關閉。');
    }
};

importProducts();
