const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db'); // 引入 Sequelize 實例

const Product = sequelize.define('Product', {
    // Sequelize 會自動創建一個 'id' 作為主鍵 (整數, 自動遞增, 主鍵)
    // 你 JSON 數據中的 id 字段，我們把它儲存為一個獨立的字串欄位
    json_id: {
        type: DataTypes.STRING, 
        allowNull: false,
        unique: true
    },
    product_code: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false
    },
    images: {
        type: DataTypes.JSON, // 使用 JSON 類型來儲存圖片路徑陣列
        allowNull: false
    },
    price_min: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false
    },
    price_max: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false
    },
    category_id: {
        type: DataTypes.STRING,
        allowNull: false
    },
    description: {
        type: DataTypes.TEXT, // 使用 TEXT 類型來儲存較長的描述
        allowNull: true // 描述可以為空
    },
    // ✨ 新增的產品規格欄位
    carat: {
        type: DataTypes.FLOAT,
        allowNull: true
    },
    clarity_1: {
        type: DataTypes.STRING,
        allowNull: true
    },
    clarity_2: {
        type: DataTypes.STRING,
        allowNull: true
    },
    color: {
        type: DataTypes.STRING,
        allowNull: true
    },
    Level: {
        type: DataTypes.STRING,
        allowNull: true
    },
    material: {
        type: DataTypes.STRING,
        allowNull: true
    },
    simulated_price: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true
    }
}, {
    tableName: 'products', // 指定資料庫中的表名為 'products' (預設是 'Products')
    timestamps: true,      // Sequelize 會自動添加 `createdAt` 和 `updatedAt` 字段
    underscored: true,     // 將欄位名從駝峰式轉換為下劃線式 (例如 `createdAt` -> `created_at`)
});

module.exports = Product;