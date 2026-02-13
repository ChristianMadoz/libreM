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
        <div className="min-h-screen bg-gray-100 flex items-center justify-center py-12 px-4">
            <Card className="max-w-md w-full p-8 bg-white shadow-lg rounded-xl">
                <div className="text-center mb-8">
                    <div className="bg-[#FFE600] rounded-xl p-4 inline-block mb-4 shadow-sm">
                        <svg width="48" height="48" viewBox="0 0 40 40" fill="none">
                            <path d="M20 5L35 15V25L20 35L5 25V15L20 5Z" fill="#3483FA" />
                            <path d="M20 15L28 20V28L20 33L12 28V20L20 15Z" fill="#FFE600" />
                        </svg>
                    </div>
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">Crear cuenta</h1>
                    <p className="text-gray-600">Completa tus datos para empezar</p>
                </div>

                {error && (
                    <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                        <p className="text-sm text-red-600 font-medium text-center">{error}</p>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
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
                            className="w-full py-6"
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
                            className="w-full py-6"
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
                            className="w-full py-6"
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
                            className="w-full py-6"
                            required
                        />
                    </div>

                    <Button
                        type="submit"
                        className="w-full bg-[#3483FA] hover:bg-[#2968C8] text-white py-8 text-xl font-bold rounded-lg shadow-md mt-4"
                        disabled={loading}
                    >
                        {loading ? 'Creando cuenta...' : 'Crear cuenta'}
                    </Button>
                </form>

                <div className="mt-8 text-center pt-6 border-t border-gray-100">
                    <p className="text-sm text-gray-600">
                        ¿Ya tienes cuenta?{' '}
                        <Link
                            to={`/login${redirect !== '/' ? `?redirect=${redirect}` : ''}`}
                            className="text-[#3483FA] hover:underline font-bold"
                        >
                            Inicia sesión
                        </Link>
                    </p>
                </div>
            </Card>
        </div>
    );
};

export default Register;
