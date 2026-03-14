import React from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { SpeedInsights } from '@vercel/speed-insights/react';
import './App.css';
import Header from './components/Header';
import Home from './pages/Home';
import ProductDetail from './pages/ProductDetail';
import Cart from './pages/Cart';
import SearchResults from './pages/SearchResults';
import Category from './pages/Category';
import Favorites from './pages/Favorites';
import Checkout from './pages/Checkout';
import Orders from './pages/Orders';
import Login from './pages/Login';
import Register from './pages/Register';
import Profile from './pages/Profile';
import Posts from './pages/Posts';
import Admin from './pages/Admin';
import AdminReports from './pages/AdminReports';
import { Toaster } from './components/ui/sonner';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';

// CRM Imports
import { AuthPage } from './pages/crm/AuthPage';
import { DealsPage } from './pages/crm/DealsPage';
import { DealDetailPage } from './pages/crm/DealDetailPage';
import { ContactsPage } from './pages/crm/ContactsPage';
import { CompaniesPage } from './pages/crm/CompaniesPage';
import { CRMLayout } from './components/crm/CRMLayout';

function AppContent() {
  const location = useLocation();
  const isCRM = location.pathname.startsWith('/crm');

  return (
    <>
      {!isCRM && <Header />}
      <Routes>
        {/* E-commerce Routes */}
        <Route path="/" element={<Home />} />
        <Route path="/product/:id" element={<ProductDetail />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/search" element={<SearchResults />} />
        <Route path="/category/:id" element={<Category />} />
        <Route path="/favorites" element={<Favorites />} />
        <Route path="/checkout" element={<Checkout />} />
        <Route path="/orders" element={<Orders />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/users" element={<Profile />} />
        <Route path="/posts" element={<Posts />} />
        <Route path="/admin" element={<Admin />} />
        <Route path="/admin/reports" element={<AdminReports />} />

        {/* CRM Routes */}
        <Route path="/crm/auth" element={<AuthPage />} />
        <Route path="/crm" element={<CRMLayout />}>
          <Route index element={<DealsPage />} />
          <Route path="deals/:id" element={<DealDetailPage />} />
          <Route path="contacts" element={<ContactsPage />} />
          <Route path="companies" element={<CompaniesPage />} />
        </Route>
      </Routes>
      <Toaster />
      <SpeedInsights />
    </>
  );
}

function App() {
  return (
    <div className="App">
      <BrowserRouter>
        <AuthProvider>
          <CartProvider>
            <AppContent />
          </CartProvider>
        </AuthProvider>
      </BrowserRouter>
    </div>
  );
}

export default App;