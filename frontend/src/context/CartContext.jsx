import React, { createContext, useContext, useState, useEffect } from 'react';
import { cartActions, favoriteActions } from '../services/api';
import { useAuth } from './AuthContext';
import { getMockCart, setMockCart, getMockFavorites, setMockFavorites, mockProducts } from '../mock';

const CartContext = createContext();

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within CartProvider');
  }
  return context;
};

export const CartProvider = ({ children }) => {
  const { isAuthenticated, user } = useAuth();
  const [cart, setCart] = useState({ items: [], total: 0 });
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(false);

  // Load cart and favorites when authentication state changes
  useEffect(() => {
    const initData = async () => {
      setLoading(true);
      if (isAuthenticated) {
        await Promise.all([loadCart(), loadFavorites()]);
      } else {
        // Load from local storage for unauthenticated users
        const localCartItems = getMockCart();
        setCart({
          items: localCartItems.map(item => ({
            ...item,
            product_id: item.id,
            cart_quantity: item.quantity,
            cart_color: item.color,
            free_shipping: item.freeShipping
          })),
          total: localCartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0)
        });

        const localFavs = getMockFavorites();
        setFavorites(localFavs.map(id => ({ product_id: id })));
      }
      setLoading(false);
    };
    initData();
  }, [isAuthenticated, user]);

  const loadFavorites = async () => {
    try {
      const data = await favoriteActions.getFavorites();
      // data should contain {favorites: [...ids], products: [...products]}
      setFavorites(data.products || []);
    } catch (error) {
      console.warn('Backend favorites failed, using mock');
      const localFavs = getMockFavorites();
      const favProducts = mockProducts.filter(p => localFavs.includes(p.id));
      setFavorites(favProducts.map(p => ({ ...p, product_id: p.id })));
    }
  };

  const loadCart = async () => {
    try {
      const cartData = await cartActions.getCart();
      setCart(cartData.cart); // api.js returns data directly, and getCart returns {cart: {...}}
    } catch (error) {
      console.warn('Backend cart failed, using mock');
      const localCartItems = getMockCart();
      setCart({
        items: localCartItems.map(item => ({
          ...item,
          product_id: item.id,
          cart_quantity: item.quantity,
          cart_color: item.color,
          free_shipping: item.freeShipping
        })),
        total: localCartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0)
      });
    }
  };

  const addToCart = async (productId, quantity, color) => {
    if (isAuthenticated) {
      try {
        const response = await cartActions.addToCart({ product_id: productId, quantity, color });
        setCart(response.cart);
        return response.cart;
      } catch (error) {
        console.warn('Failed to add to backend cart, fallback to mock');
      }
    }

    // Mock Fallback
    const localCart = getMockCart();
    const product = mockProducts.find(p => p.id === productId);
    if (!product) return;

    const existingIndex = localCart.findIndex(item => item.id === productId && item.color === color);
    let newItems;
    if (existingIndex > -1) {
      newItems = [...localCart];
      newItems[existingIndex].quantity += quantity;
    } else {
      newItems = [...localCart, { ...product, quantity, color }];
    }

    setMockCart(newItems);
    const updatedState = {
      items: newItems.map(item => ({
        ...item,
        product_id: item.id,
        cart_quantity: item.quantity,
        cart_color: item.color,
        free_shipping: item.freeShipping
      })),
      total: newItems.reduce((sum, item) => sum + (item.price * item.quantity), 0)
    };
    setCart(updatedState);
    return updatedState;
  };

  const updateCartItem = async (productId, quantity, color) => {
    if (isAuthenticated) {
      try {
        const response = await cartActions.updateItem(productId, quantity, color);
        setCart(response.cart);
        return response.cart;
      } catch (error) {
        console.warn('Failed to update backend cart, fallback to mock');
      }
    }

    const localCart = getMockCart();
    const itemIndex = localCart.findIndex(item => item.id === productId && item.color === color);
    if (itemIndex > -1) {
      localCart[itemIndex].quantity = quantity;
      setMockCart(localCart);
      setCart({
        items: localCart.map(item => ({
          ...item,
          product_id: item.id,
          cart_quantity: item.quantity,
          cart_color: item.color,
          free_shipping: item.freeShipping
        })),
        total: localCart.reduce((sum, item) => sum + (item.price * item.quantity), 0)
      });
    }
  };

  const removeFromCart = async (productId, color) => {
    if (isAuthenticated) {
      try {
        const response = await cartActions.removeItem(productId, color);
        setCart(response.cart);
        return response.cart;
      } catch (error) {
        console.warn('Failed to remove from backend cart, fallback to mock');
      }
    }

    const localItems = getMockCart().filter(item => !(item.id === productId && item.color === color));
    setMockCart(localItems);
    setCart({
      items: localItems.map(item => ({
        ...item,
        product_id: item.id,
        cart_quantity: item.quantity,
        cart_color: item.color,
        free_shipping: item.freeShipping
      })),
      total: localItems.reduce((sum, item) => sum + (item.price * item.quantity), 0)
    });
  };

  const clearCart = async () => {
    if (isAuthenticated) {
      try {
        await cartActions.clearCart();
      } catch (error) {
        console.warn('Failed to clear backend cart');
      }
    }
    setMockCart([]);
    setCart({ items: [], total: 0 });
  };

  const addFavorite = async (productId) => {
    if (isAuthenticated) {
      try {
        const response = await favoriteActions.addFavorite(productId);
        setFavorites(response.favorites || []);
        return;
      } catch (error) {
        console.warn('Failed to add to backend favorites');
      }
    }
    const localFavs = [...getMockFavorites(), productId];
    setMockFavorites([...new Set(localFavs)]);
    setFavorites(localFavs.map(id => ({ product_id: id })));
  };

  const removeFavorite = async (productId) => {
    if (isAuthenticated) {
      try {
        const response = await favoriteActions.removeFavorite(productId);
        setFavorites(response.favorites || []);
        return;
      } catch (error) {
        console.warn('Failed to remove from backend favorites');
      }
    }
    const localFavs = getMockFavorites().filter(id => id !== productId);
    setMockFavorites(localFavs);
    setFavorites(localFavs.map(id => ({ product_id: id })));
  };

  const getCartItemsCount = () => {
    return cart.items.reduce((sum, item) => sum + (item.cart_quantity || 0), 0);
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
    addFavorite,
    removeFavorite,
    getCartItemsCount,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

export default CartContext;
