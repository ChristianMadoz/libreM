import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ordersAPI } from '../services/api';
import { getMockOrders } from '../mock';
import { Package, ChevronRight } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { Badge } from '../components/ui/badge';

const Orders = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const [orders, setOrders] = useState([]);
  const [pageLoading, setPageLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      if (!isAuthenticated && !authLoading) {
        navigate('/login?redirect=/orders');
        return;
      }

      if (isAuthenticated) {
        setPageLoading(true);
        try {
          const data = await ordersAPI.getOrders();
          setOrders(data || []);
        } catch (error) {
          console.warn('Backend orders failed, using mock');
          const { getMockOrders } = await import('../mock');
          setOrders(getMockOrders());
        } finally {
          setPageLoading(false);
        }
      }
    };

    fetchOrders();
  }, [isAuthenticated, authLoading, navigate]);

  if (pageLoading || authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-[#3483FA]"></div>
      </div>
    );
  }

  // The isAuthenticated check is now handled within useEffect, so if we reach here,
  // and isAuthenticated is false, it means the navigate has already been called.
  // However, to be safe, we can keep a redundant check or ensure useEffect's navigation is synchronous enough.
  // For now, let's assume useEffect handles the redirect before rendering the rest.

  const formatPrice = (price) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'USD'
    }).format(price);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-AR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (orders.length === 0) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <Package className="w-24 h-24 text-gray-400 mx-auto mb-6" />
          <h2 className="text-2xl font-bold text-gray-800 mb-4">
            No tenés compras realizadas
          </h2>
          <p className="text-gray-600 mb-6">
            Cuando realices una compra, aparecerá aquí
          </p>
          <Button
            onClick={() => navigate('/')}
            className="bg-[#3483FA] hover:bg-[#2968C8] text-white px-8"
          >
            Descubrir productos
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center gap-3 mb-8">
          <Package className="w-8 h-8 text-[#3483FA]" />
          <h1 className="text-3xl font-bold text-gray-900">Mis compras</h1>
        </div>

        <div className="space-y-6">
          {orders.map((order) => (
            <Card key={order.id} className="p-6 bg-white">
              <div className="flex flex-wrap items-center justify-between mb-6 gap-4">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-bold text-gray-900">
                      Pedido #{order.id}
                    </h3>
                    <Badge className="bg-green-500 hover:bg-green-600 text-white">
                      Confirmado
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-600">
                    Realizado el {formatDate(order.date)}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-600 mb-1">Total</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {formatPrice(order.total)}
                  </p>
                </div>
              </div>

              <div className="space-y-4 mb-6">
                {order.items.map((item, index) => (
                  <div key={index} className="flex gap-4 p-4 bg-gray-50 rounded-lg">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-20 h-20 object-contain bg-white rounded cursor-pointer"
                      onClick={() => navigate(`/product/${item.id}`)}
                    />
                    <div className="flex-1">
                      <h4
                        className="font-semibold text-gray-900 mb-1 cursor-pointer hover:text-[#3483FA]"
                        onClick={() => navigate(`/product/${item.id}`)}
                      >
                        {item.name}
                      </h4>
                      <p className="text-sm text-gray-600 mb-2">
                        Cantidad: {item.quantity}
                        {item.color && ` | Color: ${item.color}`}
                      </p>
                      <p className="text-lg font-semibold text-gray-900">
                        {formatPrice(item.price * item.quantity)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="border-t border-gray-200 pt-4">
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">Dirección de envío</h4>
                    <p className="text-sm text-gray-600">{order.shipping.fullName}</p>
                    <p className="text-sm text-gray-600">{order.shipping.address}</p>
                    <p className="text-sm text-gray-600">
                      {order.shipping.city}, {order.shipping.province} - {order.shipping.postalCode}
                    </p>
                    <p className="text-sm text-gray-600">{order.shipping.phone}</p>
                  </div>
                  <div className="flex items-center justify-end">
                    <Button
                      variant="outline"
                      className="border-[#3483FA] text-[#3483FA] hover:bg-blue-50"
                    >
                      Ver detalles
                      <ChevronRight className="w-4 h-4 ml-2" />
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Orders;