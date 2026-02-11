import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { Input } from '../components/ui/input';

const Register = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const redirect = searchParams.get('redirect') || '/';
    const { isAuthenticated, register } = useAuth();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [showEmailForm, setShowEmailForm] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        confirmPassword: ''
    });

    // If already authenticated, redirect
    useEffect(() => {
        if (isAuthenticated) {
            navigate(redirect);
        }
    }, [isAuthenticated, navigate, redirect]);

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
        setError(null);
    };

    const handleGoogleLogin = () => {
        setLoading(true);
        const returnUrl = new URL('/login', window.location.origin);
        returnUrl.searchParams.set('redirect', redirect);
        const redirectUrl = returnUrl.toString();
        window.location.href = `https://auth.emergentagent.com/?redirect=${encodeURIComponent(redirectUrl)}`;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);

        if (!formData.name.trim()) {
            setError('El nombre es requerido');
            return;
        }

        if (!formData.email.trim()) {
            setError('El email es requerido');
            return;
        }

        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
            setError('Email inválido');
            return;
        }

        if (!formData.password) {
            setError('La contraseña es requerida');
            return;
        }

        if (formData.password.length < 6) {
            setError('La contraseña debe tener al menos 6 caracteres');
            return;
        }

        if (formData.password !== formData.confirmPassword) {
            setError('Las contraseñas no coinciden');
            return;
        }

        setLoading(true);
        try {
            await register(formData.name, formData.email, formData.password);
        } catch (err) {
            console.error('Registration failed:', err);
            setError(err.response?.data?.detail || 'Error al crear la cuenta. Por favor, intenta de nuevo.');
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-[#3483FA] to-[#2968C8] flex items-center justify-center py-12 px-4">
            <Card className="max-w-md w-full p-8 bg-white">
                <div className="text-center mb-8">
                    <div className="bg-[#FFE600] rounded-lg p-4 inline-block mb-4">
                        <svg width="48" height="48" viewBox="0 0 40 40" fill="none">
                            <path d="M20 5L35 15V25L20 35L5 25V15L20 5Z" fill="#3483FA" />
                            <path d="M20 15L28 20V28L20 33L12 28V20L20 15Z" fill="#FFE600" />
                        </svg>
                    </div>
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">Comenzar</h1>
                    <p className="text-gray-600">Crea tu cuenta gratis</p>
                </div>

                {error && (
                    <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                        <p className="text-sm text-red-600">{error}</p>
                    </div>
                )}

                {!showEmailForm ? (
                    <div className="space-y-3">
                        {/* Google Button */}
                        <Button
                            onClick={handleGoogleLogin}
                            disabled={loading}
                            className="w-full bg-white border-2 border-gray-200 text-gray-700 hover:bg-gray-50 hover:border-gray-300 py-3 flex items-center justify-center gap-3"
                        >
                            <svg className="w-5 h-5" viewBox="0 0 24 24">
                                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                            </svg>
                            Continuar con Google
                        </Button>

                        {/* GitHub Button */}
                        <Button
                            disabled
                            className="w-full bg-white border-2 border-gray-200 text-gray-700 hover:bg-gray-50 hover:border-gray-300 py-3 flex items-center justify-center gap-3"
                        >
                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
                            </svg>
                            Continuar con GitHub
                        </Button>

                        {/* Divider */}
                        <div className="relative my-6">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-gray-300"></div>
                            </div>
                            <div className="relative flex justify-center text-sm">
                                <span className="px-2 bg-white text-gray-500">O</span>
                            </div>
                        </div>

                        {/* Email Button */}
                        <Button
                            onClick={() => setShowEmailForm(true)}
                            className="w-full bg-[#3483FA] hover:bg-[#2968C8] text-white py-3"
                        >
                            Continuar con email
                        </Button>

                        <div className="mt-6 text-center">
                            <p className="text-sm text-gray-600">
                                ¿Ya tienes cuenta?{' '}
                                <Link
                                    to={`/login${redirect !== '/' ? `?redirect=${redirect}` : ''}`}
                                    className="text-[#3483FA] hover:text-[#2968C8] font-medium"
                                >
                                    Inicia sesión
                                </Link>
                            </p>
                        </div>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <button
                            type="button"
                            onClick={() => setShowEmailForm(false)}
                            className="text-sm text-gray-600 hover:text-gray-800 mb-4"
                        >
                            ← Volver
                        </button>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Nombre completo
                            </label>
                            <Input
                                type="text"
                                name="name"
                                placeholder="Juan Pérez"
                                value={formData.name}
                                onChange={handleChange}
                                disabled={loading}
                                className="w-full"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Email
                            </label>
                            <Input
                                type="email"
                                name="email"
                                placeholder="tu@email.com"
                                value={formData.email}
                                onChange={handleChange}
                                disabled={loading}
                                className="w-full"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Contraseña
                            </label>
                            <Input
                                type="password"
                                name="password"
                                placeholder="Mínimo 6 caracteres"
                                value={formData.password}
                                onChange={handleChange}
                                disabled={loading}
                                className="w-full"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Confirmar contraseña
                            </label>
                            <Input
                                type="password"
                                name="confirmPassword"
                                placeholder="Repite tu contraseña"
                                value={formData.confirmPassword}
                                onChange={handleChange}
                                disabled={loading}
                                className="w-full"
                                required
                            />
                        </div>

                        <Button
                            type="submit"
                            className="w-full bg-[#3483FA] hover:bg-[#2968C8] text-white py-3"
                            disabled={loading}
                        >
                            {loading ? (
                                <span className="flex items-center justify-center gap-2">
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                    Creando cuenta...
                                </span>
                            ) : (
                                'Crear cuenta'
                            )}
                        </Button>
                    </form>
                )}

                <div className="mt-6 pt-6 border-t border-gray-200 text-center">
                    <p className="text-xs text-gray-500">
                        Al registrarte, aceptas nuestros{' '}
                        <a href="#" className="text-[#3483FA] hover:underline">
                            Términos y Condiciones
                        </a>
                    </p>
                </div>
            </Card>
        </div>
    );
};

export default Register;
