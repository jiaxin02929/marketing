require('dotenv').config();
const { sequelize } = require('./config/db');
const User = require('./models/User')(sequelize);
const AffiliateLink = require('./models/AffiliateLink')(sequelize);

const createSale20Code = async () => {
    try {
        await sequelize.authenticate();
        console.log('✅ 資料庫連接成功');

        // 1. 找到管理員用戶
        const adminUser = await User.findOne({ where: { email: 'admin@nkustic.com' } });
        if (!adminUser) {
            console.error('❌ 找不到管理員帳號 (admin@nkustic.com)，請先執行 updateDatabase.js 來建立預設帳號。');
            return;
        }
        console.log(`ℹ️  找到管理員帳號: ${adminUser.username}`);

        // 2. 檢查 SALE20 是否已存在
        const codeExists = await AffiliateLink.findOne({ where: { link_code: 'SALE20' } });
        if (codeExists) {
            console.log('ℹ️  折扣碼 SALE20 已存在。');
            return;
        }

        // 3. 建立折扣碼
        console.log('➕ 正在建立折扣碼 SALE20...');
        await AffiliateLink.create({
            user_id: adminUser.user_id,
            link_code: 'SALE20',
            discount_rate: 0.20, // 20% 折扣
            commission_rate: 0, // 0% 分潤
            status: 'active',
        });

        console.log('🎉 成功建立折扣碼 SALE20！');

    } catch (error) {
        console.error('❌ 操作失敗:', error);
    } finally {
        await sequelize.close();
        console.log('資料庫連接已關閉。');
    }
};

createSale20Code();
