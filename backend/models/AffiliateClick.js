// backend/models/AffiliateClick.js
const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    const AffiliateClick = sequelize.define('AffiliateClick', {
        click_id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true,
        },
        link_id: {
            type: DataTypes.UUID,
            allowNull: false,
            references: {
                model: 'affiliate_links',
                key: 'link_id'
            }
        },
        user_id: {
            type: DataTypes.UUID,
            allowNull: false,
            references: {
                model: 'users',
                key: 'user_id'
            }
        },
        order_id: {
            type: DataTypes.UUID,
            allowNull: true, // null 表示點擊但未產生訂單
            references: {
                model: 'orders',
                key: 'order_id'
            }
        },
        ip_address: {
            type: DataTypes.STRING(45), // 支援 IPv6
            allowNull: true,
        },
        user_agent: {
            type: DataTypes.TEXT,
            allowNull: true,
        },
        referrer: {
            type: DataTypes.TEXT,
            allowNull: true,
        },
        converted: {
            type: DataTypes.BOOLEAN,
            defaultValue: false,
        },
        conversion_value: {
            type: DataTypes.DECIMAL(10, 2),
            defaultValue: 0.00,
            allowNull: true,
        },
        commission_earned: {
            type: DataTypes.DECIMAL(10, 2),
            defaultValue: 0.00,
            allowNull: true,
        },
        clicked_at: {
            type: DataTypes.DATE,
            defaultValue: DataTypes.NOW,
        },
        converted_at: {
            type: DataTypes.DATE,
            allowNull: true,
        }
    }, {
        tableName: 'affiliate_clicks',
        timestamps: false, // 使用自定義的 clicked_at
        indexes: [
            {
                fields: ['link_id']
            },
            {
                fields: ['user_id']
            },
            {
                fields: ['order_id']
            },
            {
                fields: ['clicked_at']
            },
            {
                fields: ['converted']
            }
        ]
    });

    // Instance methods
    AffiliateClick.prototype.markAsConverted = async function(orderId, orderAmount, commissionRate) {
        this.order_id = orderId;
        this.converted = true;
        this.conversion_value = parseFloat(orderAmount);
        this.commission_earned = parseFloat(orderAmount) * parseFloat(commissionRate);
        this.converted_at = new Date();
        await this.save();
        return this.commission_earned;
    };

    return AffiliateClick;
};