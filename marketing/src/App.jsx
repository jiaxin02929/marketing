// src/App.jsx
import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { CartProvider } from './contexts/CartContext';
import { AuthProvider } from './contexts/AuthContext';
import HomePage from './pages/HomePage'; //
import ProductsPage from './pages/ProductsPage'; // 所有產品總覽頁面
import ProductDetailPage from './pages/ProductDetailPage'; // 產品詳情頁面
import AboutPage from './pages/AboutPage';
import CartPage from './pages/CartPage';
import ContactPage from './pages/ContactPage';
import FAQPage from './pages/FAQPage';
import SearchResultsPage from './pages/SearchResultsPage';
import UserAccountPage from './pages/UserAccountPage';
import MemberCenter from './pages/MemberCenter';
import AdminDashboard from './pages/AdminDashboard';
import UserManagement from './pages/UserManagement';
import SystemSettings from './pages/SystemSettings';
import AffiliateDashboard from './pages/AffiliateDashboard';     
import Navbar from './components/Navbar'; 
import Footer from './components/Footer';
import ErrorBoundary from './components/ErrorBoundary'; 

function App() {
  return (
    <div className="flex flex-col min-h-screen">
      <AuthProvider>
        <CartProvider>
          <Navbar />
          <main className="flex-grow">
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/products" element={<ProductsPage />} />
              <Route path="/products/:id" element={<ProductDetailPage />} />
              <Route path="/about" element={<AboutPage />} />
              <Route path="/cart" element={<CartPage />} />
              <Route path="/contact" element={<ContactPage />} />
              <Route path="/faq" element={<FAQPage />} />
              <Route path="/search" element={<SearchResultsPage />} />
              <Route path="/account" element={<UserAccountPage />} />
              <Route path="/member" element={<MemberCenter />} />
              <Route path="/affiliate" element={<AffiliateDashboard />} />
              <Route path="/admin" element={<ErrorBoundary><AdminDashboard /></ErrorBoundary>} />
              <Route path="/admin/users" element={<UserManagement />} />
              <Route path="/admin/settings" element={<SystemSettings />} />      
            </Routes>
          </main>
          <Footer />
        </CartProvider>
      </AuthProvider>
    </div>
  );
}

export default App;