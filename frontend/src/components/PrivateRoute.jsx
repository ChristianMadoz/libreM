'use client';

import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/**
 * Componente para proteger rutas que requieren autenticación
 * Redirige a /login si el usuario no está autenticado
 */
export default function PrivateRoute({ children, redirectTo = '/login' }) {
  const { isAuthenticated, loading } = useAuth();
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

  // Si no está autenticado, redirigir al login con el redirect apropiado
  if (!isAuthenticated) {
    const redirectParam = pathname;
    navigate(`${redirectTo}?redirect=${encodeURIComponent(redirectParam)}`, { replace: true });
    return null;
  }

  // Si está autenticado, renderizar el componente
  return children;
}
