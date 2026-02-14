import React, { useState } from 'react';
import { Card } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { useNavigate } from 'react-router-dom';
import {
    LineChart,
    Line,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell
} from 'recharts';

const AdminReports = () => {
    const navigate = useNavigate();
    const [timeRange, setTimeRange] = useState('7d');

    // Mock Data for Sales Trend
    const salesData = [
        { date: 'Mon', sales: 4000, orders: 24 },
        { date: 'Tue', sales: 3000, orders: 18 },
        { date: 'Wed', sales: 2000, orders: 12 },
        { date: 'Thu', sales: 2780, orders: 20 },
        { date: 'Fri', sales: 1890, orders: 15 },
        { date: 'Sat', sales: 2390, orders: 22 },
        { date: 'Sun', sales: 3490, orders: 30 },
    ];

    // Mock Data for Categories
    const categoryData = [
        { name: 'Electrónica', value: 400 },
        { name: 'Ropa', value: 300 },
        { name: 'Hogar', value: 300 },
        { name: 'Juguetes', value: 200 },
    ];

    const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

    return (
        <div className="min-h-screen bg-gray-50 py-12 px-4">
            <div className="max-w-7xl mx-auto">
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Reportes y Estadísticas</h1>
                        <p className="text-gray-600 mt-2">Visión general del rendimiento de tu tienda</p>
                    </div>
                    <Button onClick={() => navigate('/admin')} variant="outline">
                        Volver al Panel
                    </Button>
                </div>

                {/* KPI Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <Card className="p-6">
                        <p className="text-sm text-gray-500">Ventas Totales (Semana)</p>
                        <p className="text-3xl font-bold text-gray-900 mt-2">$24,500</p>
                        <span className="text-green-600 text-sm font-medium">↑ 12% vs semana anterior</span>
                    </Card>
                    <Card className="p-6">
                        <p className="text-sm text-gray-500">Pedidos Nuevos</p>
                        <p className="text-3xl font-bold text-gray-900 mt-2">145</p>
                        <span className="text-green-600 text-sm font-medium">↑ 5% vs semana anterior</span>
                    </Card>
                    <Card className="p-6">
                        <p className="text-sm text-gray-500">Ticket Promedio</p>
                        <p className="text-3xl font-bold text-gray-900 mt-2">$169</p>
                        <span className="text-red-600 text-sm font-medium">↓ 2% vs semana anterior</span>
                    </Card>
                </div>

                {/* Charts Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                    {/* Sales Trend Chart */}
                    <Card className="p-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-6">Tendencia de Ventas</h3>
                        <div className="h-80 w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={salesData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="date" />
                                    <YAxis />
                                    <Tooltip />
                                    <Legend />
                                    <Line type="monotone" dataKey="sales" stroke="#3483FA" activeDot={{ r: 8 }} name="Ventas ($)" />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    </Card>

                    {/* Orders Bar Chart */}
                    <Card className="p-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-6">Cantidad de Pedidos</h3>
                        <div className="h-80 w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={salesData}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="date" />
                                    <YAxis />
                                    <Tooltip />
                                    <Legend />
                                    <Bar dataKey="orders" fill="#82ca9d" name="Pedidos" />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </Card>

                    {/* Category Distribution Pie Chart */}
                    <Card className="p-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-6">Ventas por Categoría</h3>
                        <div className="h-80 w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={categoryData}
                                        cx="50%"
                                        cy="50%"
                                        labelLine={false}
                                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                                        outerRadius={80}
                                        fill="#8884d8"
                                        dataKey="value"
                                    >
                                        {categoryData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    </Card>

                    {/* Recent Activity Mock */}
                    <Card className="p-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-6">Actividad Reciente</h3>
                        <div className="space-y-4">
                            {[1, 2, 3, 4].map((i) => (
                                <div key={i} className="flex items-center justify-between border-b pb-2 last:border-0 hover:bg-gray-50 p-2 rounded transition-colors cursor-pointer">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold">
                                            NP
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium text-gray-900">Nuevo pedido #{1000 + i}</p>
                                            <p className="text-xs text-gray-500">Hace {i * 15} minutos</p>
                                        </div>
                                    </div>
                                    <span className="text-sm font-semibold text-gray-900">
                                        ${(Math.random() * 200 + 50).toFixed(2)}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </Card>
                </div>
            </div>
        </div>
    );
};

export default AdminReports;
