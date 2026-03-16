import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/**
 * Componente para proteger rutas que requieren autenticación
 * Redirige a /login si el usuario no está autenticado
 */
const PrivateRoute = ({ children, redirectTo = '/login' }) => {
  const { isAuthenticated, loading } = useAuth();
  const location = useLocation();

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
    const redirectParam = location.pathname + location.search;
    return <Navigate to={`${redirectTo}?redirect=${encodeURIComponent(redirectParam)}`} replace />;
  }

  // Si está autenticado, renderizar el componente
  return children;
};

export default PrivateRoute;
