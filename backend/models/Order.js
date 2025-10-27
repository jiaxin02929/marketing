const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const Order = sequelize.define('Order', {
    order_id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        allowNull: false,
        primaryKey: true
    },
    user_id: {
        type: DataTypes.UUID,
        allowNull: true, // 允許遊客訂單
        references: {
            model: 'users',
            key: 'user_id'
        }
    },
    // 客戶資訊
    customer_name: {
        type: DataTypes.STRING,
        allowNull: false
    },
    customer_email: {
        type: DataTypes.STRING,
        allowNull: true
    },
    customer_phone: {
        type: DataTypes.STRING,
        allowNull: false
    },
    shipping_address: {
        type: DataTypes.TEXT,
        allowNull: false
    },
    // 訂單金額
    total_price: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false
    },
    // 付款狀態
    payment_status: {
        type: DataTypes.ENUM('pending', 'completed', 'failed', 'refunded'),
        defaultValue: 'pending'
    },
    // 訂單狀態
    order_status: {
        type: DataTypes.ENUM('processing', 'confirmed', 'shipped', 'delivered', 'cancelled'),
        defaultValue: 'processing'
    },
    // 付款方式
    payment_method: {
        type: DataTypes.ENUM('credit_card', 'bank_transfer', 'cash_on_delivery'),
        allowNull: true
    },
    // 付款時間
    paid_at: {
        type: DataTypes.DATE,
        allowNull: true
    },
    // 出貨時間
    shipped_at: {
        type: DataTypes.DATE,
        allowNull: true
    },
    // 備註
    notes: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    // 分潤相關
    referred_by_user: {
        type: DataTypes.UUID,
        allowNull: true,
        references: {
            model: 'users',
            key: 'user_id'
        }
    },
    affiliate_link_id: {
        type: DataTypes.UUID,
        allowNull: true,
        references: {
            model: 'affiliate_links',
            key: 'link_id'
        }
    },
    affiliate_link_code: {
        type: DataTypes.STRING(20),
        allowNull: true
    },
    commission_rate: {
        type: DataTypes.DECIMAL(5, 4),
        allowNull: true
    },
    commission_amount: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true
    },
    // 折扣相關
    applied_discount_code: {
        type: DataTypes.STRING,
        allowNull: true
    },
    discount_amount: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true
    }
}, {
    tableName: 'orders',
    timestamps: true,
    underscored: true
});

module.exports = Order;