import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';

const Profile = () => {
    const navigate = useNavigate();
    const { user, isAuthenticated, loading: authLoading, logout } = useAuth();
    const [editing, setEditing] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        email: ''
    });

    useEffect(() => {
        // Wait for auth to finish loading before making decisions
        if (authLoading) return;

        if (!isAuthenticated) {
            navigate('/login?redirect=/profile');
            return;
        }

        if (user) {
            setFormData({
                name: user.name || '',
                email: user.email || ''
            });
        }
    }, [isAuthenticated, authLoading, user, navigate]);

    const handleLogout = async () => {
        await logout();
        navigate('/');
    };

    if (authLoading || !user) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-[#3483FA]"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-12 px-4">
            <div className="max-w-4xl mx-auto">
                <h1 className="text-3xl font-bold text-gray-900 mb-8">Mi Perfil</h1>

                <div className="grid gap-6">
                    {/* Profile Information */}
                    <Card className="p-6">
                        <div className="flex items-start justify-between mb-6">
                            <h2 className="text-xl font-semibold text-gray-900">Información Personal</h2>
                            <Button
                                variant="outline"
                                onClick={() => setEditing(!editing)}
                            >
                                {editing ? 'Cancelar' : 'Editar'}
                            </Button>
                        </div>

                        <div className="flex items-center gap-6 mb-6">
                            <img
                                src={user.picture || 'https://github.com/shadcn.png'}
                                alt={user.name}
                                className="w-24 h-24 rounded-full border-2 border-gray-200"
                            />
                            <div>
                                <h3 className="text-2xl font-bold text-gray-900">{user.name}</h3>
                                <p className="text-gray-600">{user.email}</p>
                                <p className="text-sm text-gray-500 mt-1">ID: {user.user_id}</p>
                            </div>
                        </div>

                        {editing ? (
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Nombre
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#3483FA] focus:border-transparent"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Email
                                    </label>
                                    <input
                                        type="email"
                                        value={formData.email}
                                        disabled
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-500 cursor-not-allowed"
                                    />
                                    <p className="text-xs text-gray-500 mt-1">El email no puede ser modificado</p>
                                </div>
                                <Button className="bg-[#3483FA] hover:bg-[#2968C8]">
                                    Guardar Cambios
                                </Button>
                            </div>
                        ) : (
                            <div className="grid grid-cols-2 gap-4 text-sm">
                                <div>
                                    <p className="text-gray-600 font-medium">Nombre completo</p>
                                    <p className="text-gray-900">{user.name}</p>
                                </div>
                                <div>
                                    <p className="text-gray-600 font-medium">Email</p>
                                    <p className="text-gray-900">{user.email}</p>
                                </div>
                            </div>
                        )}
                    </Card>

                    {/* Account Stats */}
                    <Card className="p-6">
                        <h2 className="text-xl font-semibold text-gray-900 mb-4">Estadísticas de Cuenta</h2>
                        <div className="grid grid-cols-3 gap-4">
                            <div className="text-center p-4 bg-blue-50 rounded-lg">
                                <p className="text-3xl font-bold text-[#3483FA]">{user.favorites?.length || 0}</p>
                                <p className="text-sm text-gray-600 mt-1">Favoritos</p>
                            </div>
                            <div className="text-center p-4 bg-green-50 rounded-lg">
                                <p className="text-3xl font-bold text-green-600">0</p>
                                <p className="text-sm text-gray-600 mt-1">Compras</p>
                            </div>
                            <div className="text-center p-4 bg-purple-50 rounded-lg">
                                <p className="text-3xl font-bold text-purple-600">0</p>
                                <p className="text-sm text-gray-600 mt-1">Reseñas</p>
                            </div>
                        </div>
                    </Card>

                    {/* Quick Actions */}
                    <Card className="p-6">
                        <h2 className="text-xl font-semibold text-gray-900 mb-4">Acciones Rápidas</h2>
                        <div className="grid gap-3">
                            <Button
                                variant="outline"
                                className="justify-start"
                                onClick={() => navigate('/orders')}
                            >
                                📦 Ver mis pedidos
                            </Button>
                            <Button
                                variant="outline"
                                className="justify-start"
                                onClick={() => navigate('/favorites')}
                            >
                                ❤️ Ver mis favoritos
                            </Button>
                            <Button
                                variant="outline"
                                className="justify-start text-red-600 hover:bg-red-50"
                                onClick={handleLogout}
                            >
                                🚪 Cerrar sesión
                            </Button>
                        </div>
                    </Card>
                </div>
            </div>
        </div>
    );
};

export default Profile;
