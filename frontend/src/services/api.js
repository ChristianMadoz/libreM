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
  login: async ({ email, password }) => {
    const { data, error } = await insforge.auth.signInWithPassword({ email, password });
    if (error) throw error;
    // Return structure compatible with existing AuthContext
    return {
      user: data.user,
      token: data.session?.accessToken,
      session: data.session
    };
  },
  loginGoogle: async () => {
    const { data, error } = await insforge.auth.signInWithOAuth({
      provider: 'google',
      redirectTo: window.location.origin
    });
    if (error) throw error;
    // For OAuth, redirect to Google
    if (data.url) {
      window.location.href = data.url;
    }
    return data;
  },
  register: async ({ email, password, name }) => {
    const { data, error } = await insforge.auth.signUp({
      email,
      password,
      name
    });
    if (error) throw error;

    // Check if email verification is required
    if (data?.requireEmailVerification) {
      // Return verification required flag
      return {
        requireEmailVerification: true,
        email: email
      };
    }

    // Return structure compatible with existing AuthContext
    return {
      user: data.user,
      token: data.session?.accessToken,
      session: data.session
    };
  },
  verifyEmail: async ({ email, otp }) => {
    const { data, error } = await insforge.auth.verifyEmail({ email, otp });
    if (error) throw error;
    // verifyEmail auto-saves session
    return {
      user: data.user,
      token: data.accessToken,
      session: { accessToken: data.accessToken, user: data.user }
    };
  },
  resendVerification: async ({ email }) => {
    const { error } = await insforge.auth.resendVerificationEmail({ email });
    if (error) throw error;
    return { success: true };
  },
  getMe: async () => {
    const { data, error } = await insforge.auth.getCurrentSession();
    if (error || !data.session) throw error || new Error('No session');
    return data.session.user;
  },
  getSession: async () => {
    const { data, error } = await insforge.auth.getCurrentSession();
    if (error) throw error;
    return data.session;
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
      .eq('product_id', id)
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
  createProduct: async (productData) => {
    const product_id = `MLB${Date.now()}_${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
    const { data, error } = await insforge.database
      .from('products')
      .insert([{
        product_id,
        ...productData,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }])
      .select()
      .single();
    if (error) throw error;
    return data;
  },
  updateProduct: async (id, updates) => {
    const { data, error } = await insforge.database
      .from('products')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('product_id', id)
      .select()
      .single();
    if (error) throw error;
    return data;
  },
  deleteProduct: async (id) => {
    const { error } = await insforge.database
      .from('products')
      .delete()
      .eq('product_id', id);
    if (error) throw error;
    return { success: true };
  },
  createCategory: async (categoryData) => {
    const { data, error } = await insforge.database
      .from('categories')
      .insert([{
        name: categoryData.name,
        icon: categoryData.icon || 'Tag'
      }])
      .select()
      .single();
    if (error) throw error;
    return data;
  },
  updateCategory: async (id, updates) => {
    const { data, error } = await insforge.database
      .from('categories')
      .update(updates)
      .eq('category_id', id)
      .select()
      .single();
    if (error) throw error;
    return data;
  },
  deleteCategory: async (id) => {
    const { error } = await insforge.database
      .from('categories')
      .delete()
      .eq('category_id', id);
    if (error) throw error;
    return { success: true };
  },
};

export const cartActions = {
  getCart: async () => {
    const { data: session } = await insforge.auth.getCurrentSession();
    if (!session?.session) return { items: [], total: 0 };

    const userId = session.session.user.id;

    // First get the user's cart
    const { data: cart, error: cartError } = await insforge.database
      .from('carts')
      .select('cart_id')
      .eq('user_id', userId)
      .single();

    if (cartError || !cart) return { items: [], total: 0 };

    // Then get cart items with products
    const { data, error } = await insforge.database
      .from('cart_items')
      .select('*, products:product_id(*)')
      .eq('cart_id', cart.cart_id);

    if (error) throw error;

    const total = data.reduce((sum, item) => sum + (item.products?.price * item.quantity), 0);
    return { items: data || [], total };
  },

  addToCart: async ({ product_id, quantity, color }) => {
    const { data: session } = await insforge.auth.getCurrentSession();
    if (!session?.session) throw new Error('Authentication required');

    const userId = session.session.user.id;

    // Get or create cart for user
    const { data: cart } = await insforge.database
      .from('carts')
      .select('cart_id')
      .eq('user_id', userId)
      .single();

    let cartId = cart?.cart_id;

    if (!cartId) {
      // Create new cart
      const { data: newCart, error: insertCartError } = await insforge.database
        .from('carts')
        .insert([{ user_id: userId }])
        .select('cart_id')
        .single();

      if (insertCartError) throw insertCartError;
      cartId = newCart.cart_id;
    }

    // Check if item already exists
    const { data: existingItem } = await insforge.database
      .from('cart_items')
      .select('cart_item_id, quantity')
      .eq('cart_id', cartId)
      .eq('product_id', product_id)
      .eq('color', color || '')
      .single();

    if (existingItem) {
      // Update quantity
      const { error } = await insforge.database
        .from('cart_items')
        .update({ quantity: existingItem.quantity + quantity })
        .eq('cart_item_id', existingItem.cart_item_id);

      if (error) throw error;
    } else {
      // Insert new item
      const { error } = await insforge.database
        .from('cart_items')
        .insert([{
          cart_id: cartId,
          product_id,
          quantity,
          color
        }]);

      if (error) throw error;
    }

    return cartActions.getCart();
  },

  updateItem: async (productId, quantity, color) => {
    const { data: session } = await insforge.auth.getCurrentSession();
    if (!session?.session) throw new Error('Authentication required');

    const userId = session.session.user.id;

    const { data: cart } = await insforge.database
      .from('carts')
      .select('cart_id')
      .eq('user_id', userId)
      .single();

    if (!cart) throw new Error('Cart not found');

    const { error } = await insforge.database
      .from('cart_items')
      .update({ quantity })
      .eq('cart_id', cart.cart_id)
      .eq('product_id', productId)
      .eq('color', color || '');

    if (error) throw error;
    return cartActions.getCart();
  },

  removeItem: async (productId, color) => {
    const { data: session } = await insforge.auth.getCurrentSession();
    if (!session?.session) throw new Error('Authentication required');

    const userId = session.session.user.id;

    const { data: cart } = await insforge.database
      .from('carts')
      .select('cart_id')
      .eq('user_id', userId)
      .single();

    if (!cart) throw new Error('Cart not found');

    const { error } = await insforge.database
      .from('cart_items')
      .delete()
      .eq('cart_id', cart.cart_id)
      .eq('product_id', productId)
      .eq('color', color || '');

    if (error) throw error;
    return cartActions.getCart();
  },

  clearCart: async () => {
    const { data: session } = await insforge.auth.getCurrentSession();
    if (!session?.session) throw new Error('Authentication required');

    const userId = session.session.user.id;

    const { data: cart } = await insforge.database
      .from('carts')
      .select('cart_id')
      .eq('user_id', userId)
      .single();

    if (!cart) return;

    const { error } = await insforge.database
      .from('cart_items')
      .delete()
      .eq('cart_id', cart.cart_id);

    if (error) throw error;
  }
};

export const favoriteActions = {
  getFavorites: async () => {
    const { data: session } = await insforge.auth.getCurrentSession();
    if (!session?.session) return { products: [] };

    const { data, error } = await insforge.database
      .from('favorites')
      .select('*, products:product_id(*)')
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
    if (!session?.session) return [];

    const { data, error } = await insforge.database
      .from('orders')
      .select('*')
      .eq('user_id', session.session.user.id)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  getOrder: async (orderId) => {
    const { data: session } = await insforge.auth.getCurrentSession();
    if (!session?.session) throw new Error('Authentication required');

    const { data, error } = await insforge.database
      .from('orders')
      .select('*')
      .eq('order_id', orderId)
      .eq('user_id', session.session.user.id)
      .single();

    if (error) throw error;
    return data;
  },

  createOrder: async ({ shipping, payment, items, total }) => {
    const { data: session } = await insforge.auth.getCurrentSession();
    if (!session?.session) throw new Error('Authentication required');

    const userId = session.session.user.id;
    const orderId = `ord_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const orderNumber = `ORD-${Date.now()}`;

    // Create order
    const { error } = await insforge.database
      .from('orders')
      .insert([{
        order_id: orderId,
        user_id: userId,
        order_number: orderNumber,
        items: items,
        shipping: shipping,
        total: total,
        status: 'confirmed'
      }]);

    if (error) throw error;

    // Clear cart after successful order
    await cartActions.clearCart();

    return { order_id: orderId, order_number: orderNumber };
  }
};