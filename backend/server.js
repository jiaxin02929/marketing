require('dotenv').config();

const express = require('express');
const cors = require('cors');

// 載入模型關聯
const { setupAssociations } = require('./models/associations');
setupAssociations();

// 不導入資料庫連接避免同步問題，但要載入路由
const productRoutes = require('./routes/productRoutes');
const categoryRoutes = require('./routes/categoryRoutes');
const orderRoutes = require('./routes/orderRoutes');
const authRoutes = require('./routes/authRoutes');
console.log('🔍 Loading userRoutes...');
const userRoutes = require('./routes/userRoutes');
console.log('✅ userRoutes loaded successfully');
const affiliateRoutes = require('./routes/affiliateRoutes');
const analyticsRoutes = require('./routes/analyticsRoutes');
const adminRoutes = require('./routes/adminRoutes');

const app = express();
const PORT = 5002; // 新端口避免衝突

// 中間件
app.use(express.json());
app.use(cors());

// API路由
app.use('/api/products', productRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/auth', authRoutes);
console.log('🔗 Registering /api/users routes...');
console.log('🔍 userRoutes type:', typeof userRoutes);
console.log('🔍 userRoutes value:', userRoutes);
app.use('/api/users', userRoutes);
console.log('✅ /api/users routes registered');
app.use('/api/affiliate', affiliateRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/admin', adminRoutes);

// 基本路由
app.get('/', (req, res) => {
    res.json({ 
        message: 'Pearl Jewelry API 正常運行！', 
        timestamp: new Date(),
        endpoints: {
            products: '/api/products',
            categories: '/api/categories', 
            orders: '/api/orders',
            auth: '/api/auth',
            affiliate: '/api/affiliate'
        },
        status: 'ready'
    });
});

// 健康檢查端點
app.get('/health', (req, res) => {
    res.json({ status: 'healthy', timestamp: new Date() });
});

// 啟動伺服器（不連接資料庫）
const server = app.listen(PORT, () => {
    console.log(`🚀 工作伺服器運行在 http://localhost:${PORT}`);
    console.log('📋 可用端點:');
    console.log('   GET  / - API資訊');
    console.log('   GET  /health - 健康檢查'); 
    console.log('   GET  /api/products - 產品列表');
    console.log('   GET  /api/products/:id - 單一產品');
    console.log('   GET  /api/categories - 分類列表');
    console.log('   POST /api/orders - 建立訂單');
    console.log('   GET  /api/orders - 訂單列表');
    console.log('   PUT  /api/orders/:id/pay - 模擬付款');
    console.log('   POST /api/auth/register - 用戶註冊');
    console.log('   POST /api/auth/login - 用戶登入');
    console.log('   GET  /api/auth/verify - 驗證令牌');
    console.log('   POST /api/auth/logout - 用戶登出');
    console.log('   GET  /api/products/search - 搜尋產品');
    console.log('   POST /api/affiliate/links - 建立分潤連結');
    console.log('   GET  /api/affiliate/links - 取得分潤連結');
    console.log('   GET  /api/affiliate/earnings - 收益報告');
    console.log('   GET  /api/affiliate/click/:code - 處理連結點擊');
});

// 優雅關機
process.on('SIGINT', () => {
    console.log('\n正在關閉伺服器...');
    server.close(() => {
        console.log('伺服器已關閉');
        process.exit(0);
    });
});

process.on('unhandledRejection', (err) => {
    console.log('Unhandled Promise Rejection:', err);
    console.log('服務器繼續運行...');
});

process.on('uncaughtException', (err) => {
    console.log('Uncaught Exception:', err);
    console.log('服務器繼續運行...');
});