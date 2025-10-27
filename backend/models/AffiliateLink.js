// backend/models/AffiliateLink.js
const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    const AffiliateLink = sequelize.define('AffiliateLink', {
        link_id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true,
        },
        user_id: {
            type: DataTypes.UUID,
            allowNull: false,
            references: {
                model: 'users',
                key: 'user_id'
            }
        },
        link_code: {
            type: DataTypes.STRING(20),
            unique: true,
            allowNull: false,
            comment: '用作給使用者輸入的折扣碼',
            validate: {
                len: [6, 20],
                isAlphanumeric: true,
            }
        },
        discount_rate: {
            type: DataTypes.DECIMAL(5, 4), // 例如：0.1000 表示 10%
            defaultValue: 0.1000,
            allowNull: false,
            validate: {
                min: 0,
                max: 1,
            }
        },
        commission_rate: {
            type: DataTypes.DECIMAL(5, 4), // 例如：0.0500 表示 5%
            defaultValue: 0.0500,
            allowNull: false,
            validate: {
                min: 0,
                max: 1,
            }
        },
        total_clicks: {
            type: DataTypes.INTEGER,
            defaultValue: 0,
            allowNull: false,
        },
        total_orders: {
            type: DataTypes.INTEGER,
            defaultValue: 0,
            allowNull: false,
        },
        total_revenue: {
            type: DataTypes.DECIMAL(10, 2),
            defaultValue: 0.00,
            allowNull: false,
        },
        total_commission: {
            type: DataTypes.DECIMAL(10, 2),
            defaultValue: 0.00,
            allowNull: false,
        },
        status: {
            type: DataTypes.ENUM('active', 'inactive', 'suspended'),
            defaultValue: 'active',
            allowNull: false,
        },
        expires_at: {
            type: DataTypes.DATE,
            allowNull: true, // null 表示永不過期
        },
        created_at: {
            type: DataTypes.DATE,
            defaultValue: DataTypes.NOW,
        },
        updated_at: {
            type: DataTypes.DATE,
            defaultValue: DataTypes.NOW,
        }
    }, {
        tableName: 'affiliate_links',
        timestamps: true,
        createdAt: 'created_at',
        updatedAt: 'updated_at',
        indexes: [
            {
                fields: ['user_id']
            },
            {
                fields: ['link_code']
            },
            {
                fields: ['status']
            }
        ]
    });

    // Instance methods
    AffiliateLink.prototype.generateLinkUrl = function(baseUrl = 'http://localhost:5174') {
        return `${baseUrl}?ref=${this.link_code}`;
    };

    AffiliateLink.prototype.incrementClick = async function() {
        this.total_clicks += 1;
        await this.save();
    };

    AffiliateLink.prototype.recordSale = async function(orderAmount) {
        const commission = parseFloat(orderAmount) * parseFloat(this.commission_rate);
        this.total_orders += 1;
        this.total_revenue = parseFloat(this.total_revenue) + parseFloat(orderAmount);
        this.total_commission = parseFloat(this.total_commission) + commission;
        await this.save();
        return commission;
    };

    return AffiliateLink;
};