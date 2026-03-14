import { insforge } from '../lib/insforge';

// Common error handler
const handleError = (error) => {
  if (error && error.message && error.message.includes('401')) {
    localStorage.removeItem('session_token');
    localStorage.removeItem('user');
  }
  return Promise.reject(error?.message || error || 'Unknown error');
};

export const authActions = {
  loginGoogle: async (sessionId) => {
    // Note: insforge.auth handles sessions directly, but if there's a custom backend bridge:
    const { data, error } = await insforge.auth.signInWithOAuth({ provider: 'google' });
    if (error) throw error;
    return data;
  },
  register: async ({ email, password, name }) => {
    const { data, error } = await insforge.auth.signUp({
      email,
      password,
      options: { data: { name } }
    });
    if (error) throw error;
    return data;
  },
  getMe: async () => {
    const { data, error } = await insforge.auth.getCurrentSession();
    if (error || !data.session) throw error || new Error('No session');
    return data.session.user;
  },
  logout: async () => {
    const { error } = await insforge.auth.signOut();
    if (error) throw error;
  }
};

export const productActions = {
  getProducts: async (params = {}) => {
    let query = insforge.database.from('products').select('*');
    
    if (params.category) {
      query = query.eq('category_id', params.category);
    }
    if (params.search) {
      query = query.ilike('name', `%${params.search}%`);
    }
    
    const { data, error } = await query;
    if (error) throw error;
    return { products: data || [] };
  },
  getProduct: async (id) => {
    const { data, error } = await insforge.database
      .from('products')
      .select('*, categories(*)')
      .eq('id', id)
      .single();
    if (error) throw error;
    return data;
  },
  getCategories: async () => {
    const { data, error } = await insforge.database
      .from('categories')
      .select('*')
      .order('name');
    if (error) throw error;
    return { categories: data || [] };
  },
};

export const cartActions = {
  getCart: async () => {
    const { data: session } = await insforge.auth.getCurrentSession();
    if (!session?.session) return { items: [], total: 0 };

    const { data, error } = await insforge.database
      .from('cart_items')
      .select('*, products(*)')
      .eq('user_id', session.session.user.id);
    
    if (error) throw error;
    
    const total = data.reduce((sum, item) => sum + (item.products?.price * item.quantity), 0);
    return { items: data || [], total };
  },
  addToCart: async ({ product_id, quantity, color }) => {
    const { data: session } = await insforge.auth.getCurrentSession();
    if (!session?.session) throw new Error('Authentication required');

    const { error } = await insforge.database
      .from('cart_items')
      .insert([{
        user_id: session.session.user.id,
        product_id,
        quantity,
        color
      }]);
    
    if (error) throw error;
    return cartActions.getCart();
  },
  updateItem: async (productId, quantity, color) => {
    const { data: session } = await insforge.auth.getCurrentSession();
    const { error } = await insforge.database
      .from('cart_items')
      .update({ quantity })
      .eq('user_id', session.session.user.id)
      .eq('product_id', productId)
      .eq('color', color);
    
    if (error) throw error;
    return cartActions.getCart();
  },
  removeItem: async (productId, color) => {
    const { data: session } = await insforge.auth.getCurrentSession();
    const { error } = await insforge.database
      .from('cart_items')
      .delete()
      .eq('user_id', session.session.user.id)
      .eq('product_id', productId)
      .eq('color', color);
    
    if (error) throw error;
    return cartActions.getCart();
  },
  clearCart: async () => {
    const { data: session } = await insforge.auth.getCurrentSession();
    const { error } = await insforge.database
      .from('cart_items')
      .delete()
      .eq('user_id', session.session.user.id);
    
    if (error) throw error;
  }
};

export const favoriteActions = {
  getFavorites: async () => {
    const { data: session } = await insforge.auth.getCurrentSession();
    if (!session?.session) return { products: [] };

    const { data, error } = await insforge.database
      .from('favorites')
      .select('*, products(*)')
      .eq('user_id', session.session.user.id);
    
    if (error) throw error;
    return { products: data.map(f => f.products) || [] };
  },
  addFavorite: async (productId) => {
    const { data: session } = await insforge.auth.getCurrentSession();
    const { error } = await insforge.database
      .from('favorites')
      .insert([{ user_id: session.session.user.id, product_id: productId }]);
    
    if (error) throw error;
    return favoriteActions.getFavorites();
  },
  removeFavorite: async (productId) => {
    const { data: session } = await insforge.auth.getCurrentSession();
    const { error } = await insforge.database
      .from('favorites')
      .delete()
      .eq('user_id', session.session.user.id)
      .eq('product_id', productId);
    
    if (error) throw error;
    return favoriteActions.getFavorites();
  },
};

export const orderActions = {
  getOrders: async () => {
    const { data: session } = await insforge.auth.getCurrentSession();
    const { data, error } = await insforge.database
      .from('orders')
      .select('*, order_items(*, products(*))')
      .eq('user_id', session.session.user.id)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data;
  },
};