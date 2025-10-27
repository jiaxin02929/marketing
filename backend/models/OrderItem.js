const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const OrderItem = sequelize.define('OrderItem', {
    order_item_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false
    },
    quantity: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    price: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false
    },
    // 外鍵字段
    order_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
            model: 'orders',
            key: 'order_id'
        }
    },
    product_id: {
        type: DataTypes.STRING,
        allowNull: false
    }
}, {
    tableName: 'order_items',
    timestamps: false,
    underscored: true
});

module.exports = OrderItem;