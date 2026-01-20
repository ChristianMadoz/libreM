import React, { createContext, useContext, useState, useEffect } from 'react';
import { cartAPI, favoritesAPI } from '../services/api';
import { useAuth } from './AuthContext';

const CartContext = createContext();

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within CartProvider');
  }
  return context;
};

export const CartProvider = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const [cart, setCart] = useState({ items: [], total: 0 });
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(false);

  // Load cart and favorites when user is authenticated
  useEffect(() => {
    if (isAuthenticated) {
      loadCart();
      loadFavorites();
    } else {
      setCart({ items: [], total: 0 });
      setFavorites([]);
    }
  }, [isAuthenticated]);

  const loadFavorites = async () => {
    try {
      const data = await cartAPI.getFavorites();
      setFavorites(data.favorites || []);
    } catch (error) {
      console.error('Failed to load favorites:', error);
    }
  };

  const loadCart = async () => {
    try {
      setLoading(true);
      const cartData = await cartAPI.getCart();
      setCart(cartData);
    } catch (error) {
      console.error('Failed to load cart:', error);
    } finally {
      setLoading(false);
    }
  };

  const addToCart = async (productId, quantity, color) => {
    try {
      const updatedCart = await cartAPI.addToCart(productId, quantity, color);
      setCart(updatedCart);
      return updatedCart;
    } catch (error) {
      console.error('Failed to add to cart:', error);
      throw error;
    }
  };

  const updateCartItem = async (productId, quantity, color) => {
    try {
      const updatedCart = await cartAPI.updateCartItem(productId, quantity, color);
      setCart(updatedCart);
      return updatedCart;
    } catch (error) {
      console.error('Failed to update cart:', error);
      throw error;
    }
  };

  const removeFromCart = async (productId, color) => {
    try {
      const updatedCart = await cartAPI.removeFromCart(productId, color);
      setCart(updatedCart);
      return updatedCart;
    } catch (error) {
      console.error('Failed to remove from cart:', error);
      throw error;
    }
  };

  const clearCart = async () => {
    try {
      await cartAPI.clearCart();
      setCart({ items: [], total: 0 });
    } catch (error) {
      console.error('Failed to clear cart:', error);
      throw error;
    }
  };

  const getCartItemsCount = () => {
    return cart.items.reduce((sum, item) => sum + item.cart_quantity, 0);
  };

  const value = {
    cart,
    favorites,
    loading,
    loadCart,
    loadFavorites,
    addToCart,
    updateCartItem,
    removeFromCart,
    clearCart,
    getCartItemsCount,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

export default CartContext;