import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { productsAPI } from '../services/api';

const Admin = () => {
    const navigate = useNavigate();
    const { user, isAuthenticated, loading: authLoading } = useAuth();
    const [stats, setStats] = useState({
        totalProducts: 0,
        lowStock: 0,
        totalOrders: 0,
        totalRevenue: 0
    });
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showProductModal, setShowProductModal] = useState(false);
    const [categories, setCategories] = useState([]);
    const [formLoading, setFormLoading] = useState(false);
    const [productForm, setProductForm] = useState({
        name: '',
        price: '',
        description: '',
        category: '',
        stock: '',
        image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=1000&auto=format&fit=crop', // Placeholder image
        seller: 'LibreM Official'
    });

    const loadDashboardData = React.useCallback(async () => {
        try {
            setLoading(true);
            const [productsData, categoriesData] = await Promise.all([
                productsAPI.getProducts(),
                productsAPI.getCategories()
            ]);
            setProducts(productsData);
            setCategories(categoriesData);

            const lowStockProducts = productsData.filter(p => p.stock < 10);

            setStats({
                totalProducts: productsData.length,
                lowStock: lowStockProducts.length,
                totalOrders: 0,
                totalRevenue: 0
            });
        } catch (error) {
            console.error('Error loading dashboard data:', error);
        } finally {
            setLoading(false);
        }
    }, []);

    const handleCreateProduct = async (e) => {
        e.preventDefault();
        setFormLoading(true);
        try {
            const selectedCategory = categories.find(c => c.name === productForm.category);
            const productData = {
                ...productForm,
                price: parseFloat(productForm.price),
                stock: parseInt(productForm.stock),
                category_id: selectedCategory ? selectedCategory.category_id : 1,
                free_shipping: true,
                verified: true
            };

            await productsAPI.createProduct(productData);
            alert('Producto creado exitosamente');
            setShowProductModal(false);
            setProductForm({
                name: '',
                price: '',
                description: '',
                category: '',
                stock: '',
                image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=1000&auto=format&fit=crop',
                seller: 'LibreM Official'
            });
            await loadDashboardData();
        } catch (error) {
            console.error('Error creating product:', error);
            alert('Error al crear el producto');
        } finally {
            setFormLoading(false);
        }
    };

    useEffect(() => {
        if (!authLoading && isAuthenticated) {
            loadDashboardData();
        }
    }, [authLoading, isAuthenticated, loadDashboardData]);

    if (authLoading || (loading && products.length === 0)) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#3483FA]"></div>
            </div>
        );
    }

    if (!isAuthenticated) return null;

    return (
        <div className="min-h-screen bg-gray-50 py-12 px-4">
            <div className="max-w-7xl mx-auto">
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Panel de Administración</h1>
                        <p className="text-gray-600">Bienvenido, {user?.name}</p>
                    </div>
                </div>

                {/* Statistics Grid */}
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
                            <Button
                                className="w-full bg-[#3483FA] hover:bg-[#2968C8]"
                                onClick={() => setShowProductModal(true)}
                            >
                                ➕ Agregar Producto
                            </Button>
                            <Button
                                variant="outline"
                                className="w-full"
                                onClick={() => navigate('/')}
                            >
                                📝 Ver Todos los Productos
                            </Button>
                        </div>
                    </Card>

                    <Card className="p-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Gestión de Pedidos</h3>
                        <div className="space-y-2">
                            <Button
                                className="w-full bg-green-600 hover:bg-green-700"
                                onClick={() => navigate('/orders')}
                            >
                                📋 Pedidos Pendientes
                            </Button>
                            <Button
                                variant="outline"
                                className="w-full"
                                onClick={() => navigate('/orders')}
                            >
                                ✅ Pedidos Completados
                            </Button>
                        </div>
                    </Card>

                    <Card className="p-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Reportes</h3>
                        <div className="space-y-2">
                            <Button
                                className="w-full bg-purple-600 hover:bg-purple-700"
                                onClick={() => navigate('/admin/reports')}
                            >
                                📊 Ver Estadísticas
                            </Button>
                            <Button
                                variant="outline"
                                className="w-full"
                                onClick={() => navigate('/admin/reports')}
                            >
                                📈 Generar Reporte
                            </Button>
                        </div>
                    </Card>
                </div>

                {/* Create Product Modal */}
                {showProductModal && (
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                        <Card className="w-full max-w-md p-6 bg-white max-h-[90vh] overflow-y-auto">
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="text-xl font-bold">Agregar Nuevo Producto</h3>
                                <button onClick={() => setShowProductModal(false)} className="text-gray-500 hover:text-gray-700">✕</button>
                            </div>
                            <form onSubmit={handleCreateProduct} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Nombre del Producto</label>
                                    <input
                                        type="text"
                                        className="w-full border rounded-md p-2"
                                        value={productForm.name}
                                        onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
                                        required
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Precio</label>
                                        <input
                                            type="number"
                                            className="w-full border rounded-md p-2"
                                            value={productForm.price}
                                            onChange={(e) => setProductForm({ ...productForm, price: e.target.value })}
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Stock</label>
                                        <input
                                            type="number"
                                            className="w-full border rounded-md p-2"
                                            value={productForm.stock}
                                            onChange={(e) => setProductForm({ ...productForm, stock: e.target.value })}
                                            required
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Categoría</label>
                                    <select
                                        className="w-full border rounded-md p-2"
                                        value={productForm.category}
                                        onChange={(e) => setProductForm({ ...productForm, category: e.target.value })}
                                        required
                                    >
                                        <option value="">Seleccionar categoría</option>
                                        {categories.map((cat) => (
                                            <option key={cat.category_id} value={cat.name}>{cat.name}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Descripción</label>
                                    <textarea
                                        className="w-full border rounded-md p-2"
                                        rows="3"
                                        value={productForm.description}
                                        onChange={(e) => setProductForm({ ...productForm, description: e.target.value })}
                                        required
                                    />
                                </div>
                                <div className="pt-4 flex gap-3">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        className="flex-1"
                                        onClick={() => setShowProductModal(false)}
                                    >
                                        Cancelar
                                    </Button>
                                    <Button
                                        type="submit"
                                        className="flex-1 bg-[#3483FA]"
                                        disabled={formLoading}
                                    >
                                        {formLoading ? 'Guardando...' : 'Crear Producto'}
                                    </Button>
                                </div>
                            </form>
                        </Card>
                    </div>
                )}

                {/* Low Stock Products */}
                {stats.lowStock > 0 && (
                    <Card className="p-6 mt-8">
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
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    onClick={() => alert(`Reponer stock de: ${product.name}`)}
                                                >
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
