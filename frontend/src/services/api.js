import axios from 'axios';

// Use REACT_APP_BACKEND_URL from .env, fallback to localhost. Append /api
const backendUrl = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8000';
const API_BASE_URL = `${backendUrl}/api`;

const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true, // Required for secure httponly cookies
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add token if it exists in localStorage
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('session_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

// Response interceptor for handling common errors (like 401 Unauthorized)
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Handle unauthorized access (e.g., redirect to login or clear local state)
      localStorage.removeItem('session_token');
      // window.location.href = '/login'; // Optional: auto-redirect
    }
    return Promise.reject(error.response?.data || error.message);
  }
);

export const authActions = {
  loginGoogle: (sessionId) => api.post('/auth/google', { session_id: sessionId }),
  register: (data) => api.post('/auth/register', data),
  getMe: () => api.get('/auth/me'),
  logout: () => api.post('/auth/logout'),
};

export const productActions = {
  getProducts: (params) => api.get('/products', { params }),
  getProduct: (id) => api.get(`/products/${id}`),
  getCategories: () => api.get('/categories'),
  createProduct: (data) => api.post('/products', data),
};

export const cartActions = {
  getCart: () => api.get('/cart'),
  addToCart: (data) => api.post('/cart', data),
  updateItem: (id, quantity, color) =>
    api.put(`/cart/${id}`, { quantity }, { params: { color } }),
  removeItem: (id, color) =>
    api.delete(`/cart/${id}`, { params: { color } }),
  clearCart: () => api.delete('/cart'),
};

export const favoriteActions = {
  getFavorites: () => api.get('/favorites'),
  addFavorite: (id) => api.post(`/favorites/${id}`),
  removeFavorite: (id) => api.delete(`/favorites/${id}`),
};

export const orderActions = {
  createOrder: (data) => api.post('/orders', orderData),
  getOrders: () => api.get('/orders'),
  getOrder: (id) => api.get(`/orders/${id}`),
};

export default api;