// backend/models/User.js
const { DataTypes } = require('sequelize');
const bcrypt = require('bcrypt');

module.exports = (sequelize) => {
    const User = sequelize.define('User', {
        user_id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true,
        },
        username: {
            type: DataTypes.STRING(50),
            unique: true,
            allowNull: false,
            validate: {
                len: [3, 50],
                notEmpty: true,
            }
        },
        email: {
            type: DataTypes.STRING(100),
            unique: true,
            allowNull: false,
            validate: {
                isEmail: true,
                notEmpty: true,
            }
        },
        password_hash: {
            type: DataTypes.STRING(255),
            allowNull: false,
            validate: {
                notEmpty: true,
            }
        },
        first_name: {
            type: DataTypes.STRING(50),
            allowNull: false,
            validate: {
                notEmpty: true,
            }
        },
        last_name: {
            type: DataTypes.STRING(50),
            allowNull: false,
            validate: {
                notEmpty: true,
            }
        },
        phone: {
            type: DataTypes.STRING(20),
            allowNull: true,
        },
        address: {
            type: DataTypes.TEXT,
            allowNull: true,
        },
        role: {
            type: DataTypes.ENUM('customer', 'affiliate', 'admin'),
            defaultValue: 'customer',
            allowNull: false,
        },
        status: {
            type: DataTypes.ENUM('active', 'inactive', 'suspended'),
            defaultValue: 'active',
            allowNull: false,
        },
        email_verified: {
            type: DataTypes.BOOLEAN,
            defaultValue: false,
        },
        email_verification_token: {
            type: DataTypes.STRING(255),
            allowNull: true,
        },
        last_login: {
            type: DataTypes.DATE,
            allowNull: true,
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
        tableName: 'users',
        timestamps: true,
        createdAt: 'created_at',
        updatedAt: 'updated_at',
        hooks: {
            // 密碼加密 hooks
            beforeCreate: async (user) => {
                if (user.password_hash) {
                    const salt = await bcrypt.genSalt(10);
                    user.password_hash = await bcrypt.hash(user.password_hash, salt);
                }
            },
            beforeUpdate: async (user) => {
                if (user.changed('password_hash')) {
                    const salt = await bcrypt.genSalt(10);
                    user.password_hash = await bcrypt.hash(user.password_hash, salt);
                }
            }
        }
    });

    // Instance methods
    User.prototype.validatePassword = async function(password) {
        return await bcrypt.compare(password, this.password_hash);
    };

    User.prototype.toSafeObject = function() {
        const { password_hash, email_verification_token, ...safeUser } = this.toJSON();
        
        // 確保 boolean 欄位正確轉換為 JSON 兼容格式
        safeUser.email_verified = !!safeUser.email_verified;
        
        return safeUser;
    };

    return User;
};