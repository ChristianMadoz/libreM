'use client';

import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/**
 * Componente para proteger rutas que requieren autenticación
 * Redirige a /login si el usuario no está autenticado
 */
export default function PrivateRoute({ children, redirectTo = '/login', requireAdmin = false }) {
  const { isAuthenticated, isAdmin, loading } = useAuth();
  const { pathname } = useLocation();
  const navigate = useNavigate();

  // Mientras carga, mostrar spinner
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#3483FA]"></div>
      </div>
    );
  }

  // Si no está autenticado, redirigir al login
  if (!isAuthenticated) {
    const redirectParam = pathname;
    navigate(`${redirectTo}?redirect=${encodeURIComponent(redirectParam)}`, { replace: true });
    return null;
  }

  // Si requiere admin y no lo es, redirigir a Home o un error
  if (requireAdmin && !isAdmin) {
    navigate('/', { replace: true });
    return null;
  }

  // Si pasa todas las validaciones, renderizar
  return children;
}
