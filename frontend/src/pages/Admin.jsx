import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { productsAPI } from '../services/api';

const Admin = () => {
    const navigate = useNavigate();
    const { user, isAuthenticated } = useAuth();
    const [stats, setStats] = useState({
        totalProducts: 0,
        lowStock: 0,
        totalOrders: 0,
        totalRevenue: 0
    });
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!isAuthenticated) {
            navigate('/login?redirect=/admin');
            return;
        }

        loadDashboardData();
    }, [isAuthenticated, navigate]);

    const loadDashboardData = async () => {
        try {
            const productsData = await productsAPI.getProducts();
            setProducts(productsData);

            const lowStockProducts = productsData.filter(p => p.stock < 10);

            setStats({
                totalProducts: productsData.length,
                lowStock: lowStockProducts.length,
                totalOrders: 0, // Would come from orders API
                totalRevenue: 0  // Would come from orders API
            });
        } catch (error) {
            console.error('Error loading dashboard data:', error);
        } finally {
            setLoading(false);
        }
    };

    if (!user || loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-[#3483FA]"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-12 px-4">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">Panel de Administración</h1>
                    <p className="text-gray-600 mt-2">Bienvenido, {user.name}</p>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    <Card className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600">Total Productos</p>
                                <p className="text-3xl font-bold text-gray-900 mt-2">{stats.totalProducts}</p>
                            </div>
                            <div className="p-3 bg-blue-100 rounded-full">
                                <span className="text-2xl">📦</span>
                            </div>
                        </div>
                    </Card>

                    <Card className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600">Stock Bajo</p>
                                <p className="text-3xl font-bold text-orange-600 mt-2">{stats.lowStock}</p>
                            </div>
                            <div className="p-3 bg-orange-100 rounded-full">
                                <span className="text-2xl">⚠️</span>
                            </div>
                        </div>
                    </Card>

                    <Card className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600">Pedidos Totales</p>
                                <p className="text-3xl font-bold text-green-600 mt-2">{stats.totalOrders}</p>
                            </div>
                            <div className="p-3 bg-green-100 rounded-full">
                                <span className="text-2xl">🛒</span>
                            </div>
                        </div>
                    </Card>

                    <Card className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600">Ingresos</p>
                                <p className="text-3xl font-bold text-purple-600 mt-2">${stats.totalRevenue.toLocaleString()}</p>
                            </div>
                            <div className="p-3 bg-purple-100 rounded-full">
                                <span className="text-2xl">💰</span>
                            </div>
                        </div>
                    </Card>
                </div>

                {/* Quick Actions */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                    <Card className="p-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Gestión de Productos</h3>
                        <div className="space-y-2">
                            <Button className="w-full bg-[#3483FA] hover:bg-[#2968C8]">
                                ➕ Agregar Producto
                            </Button>
                            <Button variant="outline" className="w-full">
                                📝 Ver Todos los Productos
                            </Button>
                        </div>
                    </Card>

                    <Card className="p-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Gestión de Pedidos</h3>
                        <div className="space-y-2">
                            <Button className="w-full bg-green-600 hover:bg-green-700">
                                📋 Pedidos Pendientes
                            </Button>
                            <Button variant="outline" className="w-full">
                                ✅ Pedidos Completados
                            </Button>
                        </div>
                    </Card>

                    <Card className="p-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Reportes</h3>
                        <div className="space-y-2">
                            <Button className="w-full bg-purple-600 hover:bg-purple-700">
                                📊 Ver Estadísticas
                            </Button>
                            <Button variant="outline" className="w-full">
                                📈 Generar Reporte
                            </Button>
                        </div>
                    </Card>
                </div>

                {/* Low Stock Products */}
                {stats.lowStock > 0 && (
                    <Card className="p-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">
                            ⚠️ Productos con Stock Bajo
                        </h3>
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b border-gray-200">
                                        <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Producto</th>
                                        <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Stock Actual</th>
                                        <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Categoría</th>
                                        <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Precio</th>
                                        <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Acción</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {products.filter(p => p.stock < 10).map((product) => (
                                        <tr key={product.product_id} className="border-b border-gray-100 hover:bg-gray-50">
                                            <td className="py-3 px-4">
                                                <div className="flex items-center gap-3">
                                                    <img
                                                        src={product.image}
                                                        alt={product.name}
                                                        className="w-12 h-12 object-cover rounded"
                                                    />
                                                    <span className="font-medium text-gray-900">{product.name}</span>
                                                </div>
                                            </td>
                                            <td className="py-3 px-4">
                                                <span className={`font-semibold ${product.stock < 5 ? 'text-red-600' : 'text-orange-600'}`}>
                                                    {product.stock}
                                                </span>
                                            </td>
                                            <td className="py-3 px-4 text-gray-600">{product.category}</td>
                                            <td className="py-3 px-4 font-semibold text-gray-900">${product.price.toLocaleString()}</td>
                                            <td className="py-3 px-4">
                                                <Button size="sm" variant="outline">
                                                    Reponer Stock
                                                </Button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </Card>
                )}
            </div>
        </div>
    );
};

export default Admin;
