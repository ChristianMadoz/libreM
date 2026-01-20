import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, ShoppingCart, Heart, User, Menu, LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { Button } from './ui/button';
import { Input } from './ui/input';

const Header = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [showUserMenu, setShowUserMenu] = useState(false);
  const { user, isAuthenticated, logout } = useAuth();
  const { cart, favorites } = useCart();

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
    }
  };

  const handleLogout = async () => {
    await logout();
    setShowUserMenu(false);
    navigate('/');
  };


  const cartItemsCount = cart?.items?.reduce((sum, item) => sum + (item.cart_quantity || 0), 0) || 0;
  const favoritesCount = favorites?.length || 0;

  return (
    <header className="sticky top-0 z-50 bg-[#FFE600] shadow-md">
      <div className="max-w-7xl mx-auto px-4">
        {/* Top bar */}
        <div className="flex items-center justify-between py-3">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <div className="bg-white rounded-lg p-2 shadow-sm">
              <svg width="32" height="32" viewBox="0 0 40 40" fill="none">
                <path d="M20 5L35 15V25L20 35L5 25V15L20 5Z" fill="#3483FA" />
                <path d="M20 15L28 20V28L20 33L12 28V20L20 15Z" fill="#FFE600" />
              </svg>
            </div>
            <div className="flex flex-col">
              <span className="text-lg font-bold text-gray-800">Mercado</span>
              <span className="text-lg font-bold text-[#3483FA] -mt-1">Libre</span>
            </div>
          </Link>

          {/* Search bar */}
          <form onSubmit={handleSearch} className="flex-1 max-w-2xl mx-8">
            <div className="relative">
              <Input
                type="text"
                placeholder="Buscar productos, marcas y más..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-4 pr-12 py-2 rounded-sm border-0 shadow-sm text-gray-700 focus:ring-2 focus:ring-[#3483FA]"
              />
              <button
                type="submit"
                className="absolute right-0 top-0 h-full px-4 bg-white hover:bg-gray-50 transition-colors rounded-r-sm"
              >
                <Search className="w-5 h-5 text-gray-600" />
              </button>
            </div>
          </form>

          {/* Right actions */}
          <div className="flex items-center gap-6">
            {/* User menu */}
            <div className="relative">
              {user ? (
                <div className="relative">
                  <button
                    onClick={() => setShowUserMenu(!showUserMenu)}
                    className="flex items-center gap-2 text-gray-800 hover:text-gray-600 transition-colors"
                  >
                    <User className="w-5 h-5" />
                    <span className="text-sm font-medium">{user.name}</span>
                  </button>
                  {showUserMenu && (
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg py-2 z-50">
                      <Link
                        to="/orders"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        onClick={() => setShowUserMenu(false)}
                      >
                        Mis compras
                      </Link>
                      <button
                        onClick={handleLogout}
                        className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
                      >
                        <LogOut className="w-4 h-4" />
                        Cerrar sesión
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <Link
                  to="/login"
                  className="flex items-center gap-2 text-gray-800 hover:text-gray-600 transition-colors"
                >
                  <User className="w-5 h-5" />
                  <span className="text-sm font-medium">Ingresa</span>
                </Link>
              )}
            </div>

            {/* Favorites */}
            <Link
              to="/favorites"
              className="relative flex items-center gap-2 text-gray-800 hover:text-gray-600 transition-colors"
            >
              <Heart className="w-5 h-5" />
              {favoritesCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                  {favoritesCount}
                </span>
              )}
            </Link>

            {/* Cart */}
            <Link
              to="/cart"
              className="relative flex items-center gap-2 text-gray-800 hover:text-gray-600 transition-colors"
            >
              <ShoppingCart className="w-5 h-5" />
              {cartItemsCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-[#3483FA] text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                  {cartItemsCount}
                </span>
              )}
            </Link>
          </div>
        </div>
      </div>

      {/* Categories bar */}
      <div className="bg-white border-t border-gray-200">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center gap-6 py-2 overflow-x-auto scrollbar-hide">
            <Link
              to="/category/1"
              className="text-sm text-gray-700 hover:text-[#3483FA] whitespace-nowrap transition-colors"
            >
              Tecnología
            </Link>
            <Link
              to="/category/2"
              className="text-sm text-gray-700 hover:text-[#3483FA] whitespace-nowrap transition-colors"
            >
              Hogar y Muebles
            </Link>
            <Link
              to="/category/3"
              className="text-sm text-gray-700 hover:text-[#3483FA] whitespace-nowrap transition-colors"
            >
              Deportes
            </Link>
            <Link
              to="/category/4"
              className="text-sm text-gray-700 hover:text-[#3483FA] whitespace-nowrap transition-colors"
            >
              Moda
            </Link>
            <Link
              to="/category/5"
              className="text-sm text-gray-700 hover:text-[#3483FA] whitespace-nowrap transition-colors"
            >
              Electrodomésticos
            </Link>
            <Link
              to="/category/6"
              className="text-sm text-gray-700 hover:text-[#3483FA] whitespace-nowrap transition-colors"
            >
              Juguetes
            </Link>
            <Link
              to="/category/7"
              className="text-sm text-gray-700 hover:text-[#3483FA] whitespace-nowrap transition-colors"
            >
              Belleza
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;