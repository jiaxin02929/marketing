// backend/syncDatabase.js - 手動同步資料庫結構
require('dotenv').config();
const { sequelize } = require('./config/db');

const syncDatabase = async () => {
    try {
        console.log('🔄 開始同步資料庫結構...');
        
        // 測試資料庫連接
        await sequelize.authenticate();
        console.log('✅ 資料庫連接成功');

        // 同步所有模型（更新表結構，不刪除資料）
        await sequelize.sync({ alter: true });
        console.log('✅ 資料庫結構同步完成');

        console.log('🎉 同步完成！所有表格結構已更新');

    } catch (error) {
        console.error('❌ 同步失敗:', error);
    } finally {
        await sequelize.close();
        console.log('資料庫連接已關閉。');
    }
};

syncDatabase();