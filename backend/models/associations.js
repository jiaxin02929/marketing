// backend/models/associations.js
const Order = require('./Order');
const OrderItem = require('./OrderItem');
const Product = require('./Product');
const Category = require('./Category');

// 設置所有模型之間的關聯
function setupAssociations() {
    // Order 和 OrderItem 的關聯
    Order.hasMany(OrderItem, { 
        foreignKey: 'order_id', 
        onDelete: 'CASCADE' 
    });
    
    OrderItem.belongsTo(Order, { 
        foreignKey: 'order_id' 
    });

    // Product 和 OrderItem 的關聯
    Product.hasMany(OrderItem, { 
        foreignKey: 'product_id',
        sourceKey: 'json_id' // 指定 Product 表的 json_id 為來源鍵
    });
    
    OrderItem.belongsTo(Product, { 
        foreignKey: 'product_id',
        targetKey: 'json_id' // 指定 Product 表的 json_id 為目標鍵
    });

    // Product 和 Category 的關聯
    Category.hasMany(Product, { 
        foreignKey: 'category_id',
        sourceKey: 'id'  // Category表的主鍵是'id'
    });
    
    Product.belongsTo(Category, { 
        foreignKey: 'category_id',
        targetKey: 'id'  // Category表的主鍵是'id'
    });
}

module.exports = { setupAssociations };