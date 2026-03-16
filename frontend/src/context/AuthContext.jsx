import React, { createContext, useContext, useState, useEffect } from 'react';
import { authActions } from '../services/api';

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
  const [awaitingVerification, setAwaitingVerification] = useState(false);
  const [verificationEmail, setVerificationEmail] = useState(null);

  // Check if user is authenticated on mount
  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const session = await authActions.getSession();
      if (session?.user) {
        setUser(session.user);
        setIsAuthenticated(true);
      } else {
        setUser(null);
        setIsAuthenticated(false);
      }
    } catch (error) {
      setUser(null);
      setIsAuthenticated(false);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    try {
      const data = await authActions.login({ email, password });
      setUser(data.user);
      setIsAuthenticated(!!data.session);
      return data.user;
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    }
  };

  const loginWithGoogle = async () => {
    try {
      // This will redirect to Google, so no return needed
      await authActions.loginGoogle();
    } catch (error) {
      console.error('Google login failed:', error);
      throw error;
    }
  };

  const register = async (name, email, password) => {
    try {
      const data = await authActions.register({ name, email, password });

      // Check if email verification is required
      if (data.requireEmailVerification) {
        setAwaitingVerification(true);
        setVerificationEmail(email);
        return { requireEmailVerification: true, email };
      }

      // User is already signed in (no verification required)
      if (data.user) {
        setUser(data.user);
        setIsAuthenticated(true);
      }
      return data.user;
    } catch (error) {
      console.error('Registration failed:', error);
      throw error;
    }
  };

  const verifyEmail = async (otp) => {
    try {
      if (!verificationEmail) {
        throw new Error('No email set for verification');
      }

      const data = await authActions.verifyEmail({ email: verificationEmail, otp });
      setUser(data.user);
      setIsAuthenticated(true);
      setAwaitingVerification(false);
      setVerificationEmail(null);
      return data.user;
    } catch (error) {
      console.error('Email verification failed:', error);
      throw error;
    }
  };

  const resendVerificationEmail = async () => {
    try {
      if (!verificationEmail) {
        throw new Error('No email set for verification');
      }
      await authActions.resendVerification({ email: verificationEmail });
      return { success: true };
    } catch (error) {
      console.error('Resend verification failed:', error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await authActions.logout();
    } catch (error) {
      console.error('Logout failed:', error);
    } finally {
      setUser(null);
      setIsAuthenticated(false);
      setAwaitingVerification(false);
      setVerificationEmail(null);
    }
  };

  const value = {
    user,
    loading,
    isAuthenticated,
    awaitingVerification,
    verificationEmail,
    login,
    loginWithGoogle,
    register,
    verifyEmail,
    resendVerificationEmail,
    logout,
    checkAuth,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthContext;