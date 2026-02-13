import React, { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '../services/api';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Check if user is authenticated on mount
  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const userData = await authAPI.getCurrentUser();
      setUser(userData);
      setIsAuthenticated(true);
    } catch (error) {
      setUser(null);
      setIsAuthenticated(false);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    try {
      const data = await authAPI.login(email, password);
      setUser(data.user);
      setIsAuthenticated(true);
      localStorage.setItem('session_token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      return data.user;
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    }
  };

  const loginWithGoogle = async (sessionId) => {
    try {
      const data = await authAPI.googleLogin(sessionId);
      setUser(data.user);
      setIsAuthenticated(true);
      localStorage.setItem('session_token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      return data.user;
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    }
  };

  const devLogin = async () => {
    try {
      // For dev login, we still want a "fake" user but it might fail on backend
      // if the backend expects a real token.
      const data = await authAPI.devLogin();
      setUser(data.user);
      setIsAuthenticated(true);
      localStorage.setItem('session_token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      return data.user;
    } catch (error) {
      console.error('Dev login failed:', error);
      throw error;
    }
  };

  const register = async (name, email, password) => {
    try {
      const data = await authAPI.register(name, email, password);
      setUser(data.user);
      setIsAuthenticated(true);
      // Store token as fallback
      localStorage.setItem('session_token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      return data.user;
    } catch (error) {
      console.error('Registration failed:', error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await authAPI.logout();
    } catch (error) {
      console.error('Logout failed:', error);
    } finally {
      setUser(null);
      setIsAuthenticated(false);
      localStorage.removeItem('session_token');
      localStorage.removeItem('user');
    }
  };

  const value = {
    user,
    loading,
    isAuthenticated,
    login,
    loginWithGoogle,
    register,
    devLogin,
    logout,
    checkAuth,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthContext;