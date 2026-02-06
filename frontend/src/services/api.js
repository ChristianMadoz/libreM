import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API_URL = `${BACKEND_URL}/api`;

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,  // Important for cookies
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor to include token from localStorage as fallback
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('session_token');
    if (token && !config.headers.Authorization) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Unauthorized - clear auth and redirect to login
      localStorage.removeItem('session_token');
      localStorage.removeItem('user');
      // Only redirect if not already on login page
      if (!window.location.pathname.includes('/login')) {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// Auth APIs
export const authAPI = {
  googleLogin: async (sessionId) => {
    const response = await api.post('/auth/google', { session_id: sessionId });
    return response.data;
  },

  getCurrentUser: async () => {
    const response = await api.get('/auth/me');
    return response.data;
  },

  logout: async () => {
    const response = await api.post('/auth/logout');
    return response.data;
  },

  devLogin: async () => {
    // Mock successful login response
    return {
      user: {
        user_id: "dev_user_123",
        name: "Developer User",
        email: "dev@example.com",
        picture: "https://github.com/shadcn.png",
        favorites: []
      },
      token: "mock_dev_token_" + Date.now()
    };
  },
};

// Products APIs
export const productsAPI = {
  getProducts: async (filters = {}) => {
    const params = new URLSearchParams();
    if (filters.category) params.append('category', filters.category);
    if (filters.search) params.append('search', filters.search);
    if (filters.minPrice) params.append('min_price', filters.minPrice);
    if (filters.maxPrice) params.append('max_price', filters.maxPrice);
    if (filters.sort) params.append('sort', filters.sort);

    const response = await api.get(`/products?${params.toString()}`);
    return response.data.products;
  },

  getProduct: async (productId) => {
    const response = await api.get(`/products/${productId}`);
    return response.data.product;
  },

  getCategories: async () => {
    const response = await api.get('/categories');
    return response.data.categories;
  },
};

// Cart APIs
export const cartAPI = {
  getCart: async () => {
    const response = await api.get('/cart');
    return response.data.cart;
  },

  addToCart: async (productId, quantity, color) => {
    const response = await api.post('/cart', {
      product_id: productId,
      quantity,
      color,
    });
    return response.data.cart;
  },

  updateCartItem: async (productId, quantity, color) => {
    const params = color ? `?color=${encodeURIComponent(color)}` : '';
    const response = await api.put(`/cart/${productId}${params}`, { quantity });
    return response.data.cart;
  },

  removeFromCart: async (productId, color) => {
    const params = color ? `?color=${encodeURIComponent(color)}` : '';
    const response = await api.delete(`/cart/${productId}${params}`);
    return response.data.cart;
  },

  clearCart: async () => {
    const response = await api.delete('/cart');
    return response.data;
  },
};

// Favorites APIs
export const favoritesAPI = {
  getFavorites: async () => {
    const response = await api.get('/favorites');
    return response.data;
  },

  addFavorite: async (productId) => {
    const response = await api.post(`/favorites/${productId}`);
    return response.data.favorites;
  },

  removeFavorite: async (productId) => {
    const response = await api.delete(`/favorites/${productId}`);
    return response.data.favorites;
  },
};

// Orders APIs
export const ordersAPI = {
  createOrder: async (shippingData, paymentData) => {
    const response = await api.post('/orders', {
      shipping_data: shippingData,
      payment_data: paymentData,
    });
    return response.data.order;
  },

  getOrders: async () => {
    const response = await api.get('/orders');
    return response.data.orders;
  },

  getOrder: async (orderId) => {
    const response = await api.get(`/orders/${orderId}`);
    return response.data.order;
  },
};

export default api;