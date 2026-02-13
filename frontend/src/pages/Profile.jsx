import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { insforge } from '../lib/insforge';
import { toast } from 'sonner';
import { Camera, Loader2 } from 'lucide-react';

const Profile = () => {
    const navigate = useNavigate();
    const { user, isAuthenticated, loading: authLoading, logout, checkAuth } = useAuth();
    const [editing, setEditing] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [profileData, setProfileData] = useState(null);
    const fileInputRef = useRef(null);
    const [formData, setFormData] = useState({
        name: '',
        email: ''
    });

    const fetchInsforgeProfile = React.useCallback(async () => {
        if (!user?.user_id) return;

        const { data, error } = await insforge.database
            .from('profiles')
            .select('*')
            .eq('id', user.user_id)
            .single();

        if (data) {
            setProfileData(data);
        }
    }, [user?.user_id]);

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
            fetchInsforgeProfile();
        }
    }, [isAuthenticated, authLoading, user, navigate, fetchInsforgeProfile]);

    const handleImageUpload = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Check file type
        if (!file.type.startsWith('image/')) {
            toast.error('Por favor selecciona una imagen válida');
            return;
        }

        // Check file size (max 2MB)
        if (file.size > 2 * 1024 * 1024) {
            toast.error('La imagen es muy pesada (máximo 2MB)');
            return;
        }

        setUploading(true);
        try {
            // 1. Upload to InsForge Storage
            const fileName = `${user.user_id}/${Date.now()}-${file.name}`;
            const { data: uploadData, error: uploadError } = await insforge.storage
                .from('profiles')
                .upload(fileName, file);

            if (uploadError) throw uploadError;

            // 2. Update/Insert in profiles table
            const { error: dbError } = await insforge.database
                .from('profiles')
                .upsert({
                    id: user.user_id,
                    avatar_url: uploadData.url,
                    avatar_key: uploadData.key,
                    updated_at: new Date().toISOString(),
                });

            if (dbError) throw dbError;

            toast.success('Imagen de perfil actualizada');
            fetchInsforgeProfile();
        } catch (error) {
            console.error('Error uploading image:', error);
            toast.error('No se pudo subir la imagen');
        } finally {
            setUploading(false);
        }
    };

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

    const currentProfileImage = profileData?.avatar_url || user.picture || 'https://github.com/shadcn.png';

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
                            <div className="relative group">
                                <img
                                    src={currentProfileImage}
                                    alt={user.name}
                                    className="w-24 h-24 rounded-full border-2 border-gray-200 object-cover"
                                />
                                <button
                                    onClick={() => fileInputRef.current?.click()}
                                    disabled={uploading}
                                    className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-full opacity-0 group-hover:opacity-100 transition-opacity disabled:cursor-not-allowed"
                                >
                                    {uploading ? (
                                        <Loader2 className="w-8 h-8 text-white animate-spin" />
                                    ) : (
                                        <Camera className="w-8 h-8 text-white" />
                                    )}
                                </button>
                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    onChange={handleImageUpload}
                                    className="hidden"
                                    accept="image/*"
                                />
                            </div>
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
