// 導入分類資料到資料庫
require('dotenv').config();
const { connectDB, sequelize } = require('./config/db');
const Category = require('./models/Category');

// 分類資料
const categoriesData = [
    {
        id: 'male-rings',
        name: '男戒',
        display_order: 1
    },
    {
        id: 'female-rings', 
        name: '女戒',
        display_order: 2
    },
    {
        id: 'couple-rings',
        name: '對戒',
        display_order: 3
    },
    {
        id: 'necklaces',
        name: '項鍊',
        display_order: 4
    },
    {
        id: 'bracelets',
        name: '手鍊',
        display_order: 5
    },
    {
        id: 'earrings',
        name: '耳環',
        display_order: 6
    },
    {
        id: 'diamonds',
        name: '裸鑽',
        display_order: 7
    }
];

async function importCategories() {
    try {
        // 連接資料庫
        await connectDB();
        console.log('✅ 資料庫連接成功');

        // 清空現有分類資料並重新插入
        await Category.destroy({ where: {} });
        console.log('🔄 清空現有分類資料');

        // 批量插入分類資料
        const result = await Category.bulkCreate(categoriesData);
        console.log(`🎉 成功導入 ${result.length} 個分類到資料庫：`);
        
        categoriesData.forEach(category => {
            console.log(`   - ${category.id}: ${category.name}`);
        });

        // 關閉資料庫連接
        await sequelize.close();
        console.log('✅ 資料庫連接已關閉');

    } catch (error) {
        console.error('❌ 分類資料導入失敗:', error);
        process.exit(1);
    }
}

// 執行導入
importCategories();