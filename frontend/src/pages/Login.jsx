import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';

const Login = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirect = searchParams.get('redirect') || '/';
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { isAuthenticated, loading: authLoading, login, devLogin } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });

  useEffect(() => {
    console.log('Login page state:', { isAuthenticated, authLoading, redirect });
  }, [isAuthenticated, authLoading, redirect]);

  // If already authenticated, redirect
  useEffect(() => {
    if (isAuthenticated && !authLoading) {
      navigate(redirect);
    }
  }, [isAuthenticated, authLoading, navigate, redirect]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await login(formData.email, formData.password);
    } catch (err) {
      console.error('Login failed:', err);
      setError('Email o contraseña incorrectos');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center py-12 px-4">
      <Card className="max-w-md w-full p-8 bg-white shadow-lg rounded-xl">
        <div className="text-center mb-8">
          <div className="bg-[#FFE600] rounded-xl p-4 inline-block mb-4 shadow-sm">
            <svg width="48" height="48" viewBox="0 0 40 40" fill="none">
              <path d="M20 5L35 15V25L20 35L5 25V15L20 5Z" fill="#3483FA" />
              <path d="M20 15L28 20V28L20 33L12 28V20L20 15Z" fill="#FFE600" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            ¡Hola! Ingresa tu e-mail
          </h1>
          <p className="text-gray-600">
            Usá tu cuenta de Mercado Libre
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="email">E-mail</Label>
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="nombre@ejemplo.com"
              required
              value={formData.email}
              onChange={handleChange}
              className="py-6 text-lg"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Contraseña</Label>
            <Input
              id="password"
              name="password"
              type="password"
              placeholder="Ingresa tu contraseña"
              required
              value={formData.password}
              onChange={handleChange}
              className="py-6 text-lg"
            />
          </div>

          <Button
            type="submit"
            disabled={loading}
            className="w-full bg-[#3483FA] hover:bg-[#2968C8] text-white py-8 text-xl font-bold rounded-lg shadow-md transition-all active:scale-95"
          >
            {loading ? 'Ingresando...' : 'Ingresar'}
          </Button>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 animate-in fade-in slide-in-from-top-1">
              <p className="text-sm text-red-800 text-center font-medium">
                {error}
              </p>
            </div>
          )}
        </form>

        <div className="mt-8 pt-6 border-t border-gray-100 space-y-4">
          <div className="text-center">
            <p className="text-sm text-gray-600">
              ¿No tienes cuenta?{' '}
              <Link
                to={`/register${redirect !== '/' ? `?redirect=${redirect}` : ''}`}
                className="text-[#3483FA] hover:underline font-bold"
              >
                Crear cuenta
              </Link>
            </p>
          </div>

          <Button
            onClick={async () => {
              setLoading(true);
              try {
                await devLogin();
              } catch (err) {
                setError('Error en login de desarrollo');
              } finally {
                setLoading(false);
              }
            }}
            variant="ghost"
            disabled={loading}
            className="w-full text-gray-400 text-sm hover:text-gray-600 transition-colors"
          >
            Modo Desarrollador
          </Button>
        </div>

        <div className="mt-6 text-center">
          <button
            onClick={() => navigate('/')}
            className="text-gray-500 hover:text-gray-800 text-sm transition-colors"
          >
            Volver al inicio
          </button>
        </div>
      </Card >
    </div >
  );
};

export default Login;
