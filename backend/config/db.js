// backed/config/db.js
const { Sequelize } = require('sequelize');

// 從 .env 檔案讀取資料庫連接資訊
const sequelize = new Sequelize(
    process.env.DB_NAME,      // 資料庫名稱
    process.env.DB_USER,      // 資料庫用戶名
    process.env.DB_PASSWORD,  // 資料庫密碼
    {
        host: process.env.DB_HOST, // 資料庫主機
        port: process.env.DB_PORT, // 資料庫端口
        dialect: 'mysql',          // 指定使用 MySQL
        timezone: '+08:00',        // 設定為台灣時區 (UTC+8)
        logging: false,            // 設為 true 可以在終端機看到 SQL 查詢日誌
    }
);
const connectDB = async () => {
    try {
        // 測試資料庫連接
        await sequelize.authenticate();
        console.log('✅ MySQL 資料庫連接成功！');
        // 同步所有模型到資料庫（如果表不存在則創建）
        // 注意：在開發階段可以使用 sequelize.sync()，它會根據你的模型自動創建表。
        // 在生產環境中，通常會使用更精細的遷移工具來管理資料庫結構變更。
        await sequelize.sync({ alter: true }); // 開發模式：更新表結構
        console.log('✅ 所有模型已同步到資料庫（表已創建/更新）。');
    } catch (error) {
        console.error('❌ MySQL 資料庫連接失敗:', error.message);
        process.exit(1); // 連接失敗則退出應用程式
    }
};

module.exports = { sequelize, connectDB };