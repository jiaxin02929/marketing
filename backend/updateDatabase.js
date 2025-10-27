// backend/updateDatabase.js - 更新資料庫以包含新的用戶和分潤系統表格
require('dotenv').config();
const { sequelize } = require('./config/db');

// 導入模型
const User = require('./models/User')(sequelize);
const AffiliateLink = require('./models/AffiliateLink')(sequelize);
const AffiliateClick = require('./models/AffiliateClick')(sequelize);

// 導入現有模型
const Product = require('./models/Product');
const Category = require('./models/Category'); 
const Order = require('./models/Order');

// 設置模型關聯
const setupAssociations = () => {
    console.log('🔗 設置資料表關聯...');
    
    // 用戶與分潤連結關聯
    User.hasMany(AffiliateLink, {
        foreignKey: 'user_id',
        as: 'affiliateLinks'
    });
    AffiliateLink.belongsTo(User, {
        foreignKey: 'user_id',
        as: 'user'
    });

    // 分潤連結與點擊關聯
    AffiliateLink.hasMany(AffiliateClick, {
        foreignKey: 'link_id',
        as: 'clicks'
    });
    AffiliateClick.belongsTo(AffiliateLink, {
        foreignKey: 'link_id',
        as: 'link'
    });

    // 用戶與點擊關聯
    User.hasMany(AffiliateClick, {
        foreignKey: 'user_id',
        as: 'affiliateClicks'
    });
    AffiliateClick.belongsTo(User, {
        foreignKey: 'user_id',
        as: 'user'
    });

    // 訂單與點擊關聯（可選）
    AffiliateClick.belongsTo(Order, {
        foreignKey: 'order_id',
        as: 'order'
    });
    Order.hasOne(AffiliateClick, {
        foreignKey: 'order_id',
        as: 'affiliateClick'
    });

    console.log('✅ 資料表關聯設置完成');
};

const updateDatabase = async () => {
    try {
        console.log('🚀 開始更新資料庫...');
        
        // 測試資料庫連接
        await sequelize.authenticate();
        console.log('✅ 資料庫連接成功');

        // 設置關聯
        setupAssociations();

        // 同步新的表格（只創建不存在的表格）
        console.log('📊 同步新增的表格...');
        
        // 同步用戶表
        await User.sync({ alter: true });
        console.log('✅ 用戶表同步完成');

        // 同步分潤連結表
        await AffiliateLink.sync({ alter: true });
        console.log('✅ 分潤連結表同步完成');

        // 同步分潤點擊表
        await AffiliateClick.sync({ alter: true });
        console.log('✅ 分潤點擊表同步完成');

        // 更新訂單表以添加分潤相關欄位
        await Order.sync({ alter: true });
        console.log('✅ 訂單表更新完成');

        // 創建測試管理員帳號
        const adminExists = await User.findOne({
            where: { email: 'admin@nkustic.com' }
        });

        if (!adminExists) {
            const adminUser = await User.create({
                username: 'admin',
                email: 'admin@nkustic.com',
                password_hash: 'admin123', // 將被自動加密
                first_name: '系統',
                last_name: '管理員',
                phone: '0900000000',
                role: 'admin',
                status: 'active',
                email_verified: true
            });
            console.log('✅ 管理員帳號創建完成:', adminUser.username);
        } else {
            console.log('ℹ️  管理員帳號已存在');
        }

        // 創建測試會員帳號
        const affiliateExists = await User.findOne({
            where: { email: 'affiliate@nkustic.com' }
        });

        if (!affiliateExists) {
            const affiliateUser = await User.create({
                username: 'affiliate_test',
                email: 'affiliate@nkustic.com',
                password_hash: 'affiliate123',
                first_name: '測試',
                last_name: '聯盟會員',
                phone: '0900000001',
                role: 'affiliate',
                status: 'active',
                email_verified: true
            });

            // 為會員創建一個測試分潤連結
            await AffiliateLink.create({
                user_id: affiliateUser.user_id,
                link_code: 'TEST001',
                commission_rate: 0.05,
                status: 'active'
            });

            console.log('✅ 會員帳號和測試連結創建完成:', affiliateUser.username);
        } else {
            console.log('ℹ️  會員帳號已存在');
        }

        // 創建測試一般用戶帳號
        const customerExists = await User.findOne({
            where: { email: 'customer@nkustic.com' }
        });

        if (!customerExists) {
            const customerUser = await User.create({
                username: 'customer_test',
                email: 'customer@nkustic.com',
                password_hash: 'customer123',
                first_name: '測試',
                last_name: '客戶',
                phone: '0900000002',
                role: 'customer',
                status: 'active',
                email_verified: true
            });
            console.log('✅ 客戶帳號創建完成:', customerUser.username);
        } else {
            console.log('ℹ️  客戶帳號已存在');
        }

        console.log('\n🎉 資料庫更新完成！');
        console.log('\n📋 測試帳號列表：');
        console.log('🔧 管理員：admin@nkustic.com / admin123');
        console.log('💰 聯盟會員：affiliate@nkustic.com / affiliate123');
        console.log('👤 一般客戶：customer@nkustic.com / customer123');
        console.log('\n✨ 您現在可以使用新的用戶系統和分潤功能！');

    } catch (error) {
        console.error('❌ 資料庫更新失敗:', error);
        throw error;
    }
};

// 主函數
const main = async () => {
    try {
        await updateDatabase();
        process.exit(0);
    } catch (error) {
        console.error('❌ 更新過程發生錯誤:', error);
        process.exit(1);
    }
};

// 如果直接執行這個文件
if (require.main === module) {
    main();
}

module.exports = { updateDatabase, setupAssociations };