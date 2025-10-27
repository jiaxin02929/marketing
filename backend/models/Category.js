// backend/models/Category.js
const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db'); // 引入前面導出的 sequelize 實例

// 定義 Category 模型
const Category = sequelize.define('Category', {
    id: {
        type: DataTypes.STRING,
        primaryKey: true,
        allowNull: false,
        unique: true
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false
    },
    // ✨ 新增這個欄位來控制顯示順序
    display_order: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 999 // 預設一個較大的值，確保新數據在列表末尾
    }
}, {
    tableName: 'categories',
    timestamps: false,
});

module.exports = Category;