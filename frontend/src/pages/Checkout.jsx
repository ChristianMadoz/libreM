import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { ordersAPI } from '../services/api';
import { getMockCart, setMockCart, getMockOrders, setMockOrders } from '../mock';
import { CreditCard, Truck, MapPin, CheckCircle } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { useToast } from '../hooks/use-toast';

const Checkout = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const { cart, clearCart, loading: cartLoading } = useCart();

  const cartItems = React.useMemo(() => cart?.items || [], [cart?.items]);
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);

  const [shippingData, setShippingData] = useState({
    fullName: user?.name || '',
    email: user?.email || '',
    phone: '',
    address: '',
    city: '',
    postalCode: '',
    province: ''
  });

  // Sync shipping data when user is loaded
  useEffect(() => {
    if (user) {
      setShippingData(prev => ({
        ...prev,
        fullName: prev.fullName || user.name || '',
        email: prev.email || user.email || ''
      }));
    }
  }, [user]);

  const [paymentData, setPaymentData] = useState({
    cardNumber: '',
    cardName: '',
    expiryDate: '',
    cvv: ''
  });

  const formatPrice = (price) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'USD'
    }).format(price);
  };

  const subtotal = cart?.total || 0;
  const shipping = cartItems.some(item => !item.free_shipping) ? 15.99 : 0;
  const total = subtotal + shipping;

  useEffect(() => {
    if (!authLoading && !cartLoading && cartItems.length === 0) {
      navigate('/cart');
    }
  }, [cartItems, navigate, authLoading, cartLoading]);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      navigate('/login?redirect=/checkout');
    }
  }, [isAuthenticated, navigate, authLoading]);

  if (authLoading || cartLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-[#3483FA]"></div>
      </div>
    );
  }

  if (cartItems.length === 0 || !isAuthenticated) {
    return null;
  }

  const handleShippingSubmit = (e) => {
    e.preventDefault();
    setStep(2);
  };

  const handlePaymentSubmit = (e) => {
    e.preventDefault();
    handlePlaceOrder();
  };

  const handlePlaceOrder = async () => {
    try {
      setProcessing(true);
      setError(null);

      let order;
      try {
        order = await ordersAPI.createOrder(shippingData, paymentData);
      } catch (apiError) {
        console.warn('Backend order failed, using mock');
        // Generate a mock order
        order = {
          order_id: `mock_order_${Date.now()}`,
          order_number: `ML-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${Math.random().toString(36).substring(2, 10).toUpperCase()}`,
          items: cart.items,
          shipping: shippingData,
          total: cart.total,
          status: 'confirmed',
          created_at: new Date().toISOString()
        };

        // Save to mock orders
        const { getMockOrders, setMockOrders } = await import('../mock');
        setMockOrders([order, ...getMockOrders()]);
      }

      await clearCart();

      // Navigate to success
      navigate('/orders', {
        state: {
          order,
          success: true
        }
      });

      toast({
        title: "¡Compra realizada!",
        description: `Tu pedido ${order.order_number} ha sido confirmado.`,
      });

    } catch (err) {
      console.error('Checkout error:', err);
      setError('Hubo un problema al procesar tu compra. Por favor intenta de nuevo.');
      toast({
        title: "Error",
        description: "No pudimos procesar tu pedido",
        variant: "destructive"
      });
    } finally {
      setProcessing(false);
    }
  };

  if (step === 3) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center py-12">
        <Card className="max-w-2xl w-full mx-4 p-8 bg-white text-center">
          <div className="mb-6">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-12 h-12 text-green-600" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              ¡Compra exitosa!
            </h1>
            <p className="text-lg text-gray-600">
              Tu pedido ha sido procesado correctamente
            </p>
          </div>

          <div className="bg-gray-50 rounded-lg p-6 mb-6">
            <div className="flex justify-between items-center mb-4">
              <span className="text-gray-600">Total pagado</span>
              <span className="text-3xl font-bold text-gray-900">
                {formatPrice(total)}
              </span>
            </div>
            <div className="text-sm text-gray-600">
              <p>Recibirás un email con los detalles de tu compra</p>
            </div>
          </div>

          <div className="space-y-3">
            <Button
              onClick={() => navigate('/orders')}
              className="w-full bg-[#3483FA] hover:bg-[#2968C8] text-white py-6 text-lg"
            >
              Ver mis compras
            </Button>
            <Button
              onClick={() => navigate('/')}
              variant="outline"
              className="w-full py-6 text-lg"
            >
              Seguir comprando
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="max-w-7xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Finalizar compra</h1>

        {/* Progress Steps */}
        <div className="flex items-center justify-center mb-8">
          <div className="flex items-center gap-4">
            <div className={`flex items-center gap-2 ${step >= 1 ? 'text-[#3483FA]' : 'text-gray-400'
              }`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step >= 1 ? 'bg-[#3483FA] text-white' : 'bg-gray-300'
                }`}>
                {step > 1 ? <CheckCircle className="w-5 h-5" /> : '1'}
              </div>
              <span className="font-semibold hidden sm:inline">Envío</span>
            </div>
            <div className="w-16 h-0.5 bg-gray-300"></div>
            <div className={`flex items-center gap-2 ${step >= 2 ? 'text-[#3483FA]' : 'text-gray-400'
              }`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step >= 2 ? 'bg-[#3483FA] text-white' : 'bg-gray-300'
                }`}>
                2
              </div>
              <span className="font-semibold hidden sm:inline">Pago</span>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {step === 1 && (
              <Card className="p-6 bg-white">
                <div className="flex items-center gap-3 mb-6">
                  <Truck className="w-6 h-6 text-[#3483FA]" />
                  <h2 className="text-2xl font-bold text-gray-900">Datos de envío</h2>
                </div>

                <form onSubmit={handleShippingSubmit} className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="fullName">Nombre completo *</Label>
                      <Input
                        id="fullName"
                        required
                        value={shippingData.fullName}
                        onChange={(e) => setShippingData({ ...shippingData, fullName: e.target.value })}
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="phone">Teléfono *</Label>
                      <Input
                        id="phone"
                        type="tel"
                        required
                        value={shippingData.phone}
                        onChange={(e) => setShippingData({ ...shippingData, phone: e.target.value })}
                        className="mt-1"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="email">Email *</Label>
                    <Input
                      id="email"
                      type="email"
                      required
                      value={shippingData.email}
                      onChange={(e) => setShippingData({ ...shippingData, email: e.target.value })}
                      className="mt-1"
                    />
                  </div>

                  <div>
                    <Label htmlFor="address">Dirección *</Label>
                    <Input
                      id="address"
                      required
                      value={shippingData.address}
                      onChange={(e) => setShippingData({ ...shippingData, address: e.target.value })}
                      className="mt-1"
                      placeholder="Calle y número"
                    />
                  </div>

                  <div className="grid md:grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="city">Ciudad *</Label>
                      <Input
                        id="city"
                        required
                        value={shippingData.city}
                        onChange={(e) => setShippingData({ ...shippingData, city: e.target.value })}
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="province">Provincia *</Label>
                      <Input
                        id="province"
                        required
                        value={shippingData.province}
                        onChange={(e) => setShippingData({ ...shippingData, province: e.target.value })}
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="postalCode">Código postal *</Label>
                      <Input
                        id="postalCode"
                        required
                        value={shippingData.postalCode}
                        onChange={(e) => setShippingData({ ...shippingData, postalCode: e.target.value })}
                        className="mt-1"
                      />
                    </div>
                  </div>

                  <Button
                    type="submit"
                    className="w-full bg-[#3483FA] hover:bg-[#2968C8] text-white py-6 text-lg mt-6"
                  >
                    Continuar al pago
                  </Button>
                </form>
              </Card>
            )}

            {step === 2 && (
              <Card className="p-6 bg-white">
                <div className="flex items-center gap-3 mb-6">
                  <CreditCard className="w-6 h-6 text-[#3483FA]" />
                  <h2 className="text-2xl font-bold text-gray-900">Método de pago</h2>
                </div>

                <form onSubmit={handlePaymentSubmit} className="space-y-4">
                  <div>
                    <Label htmlFor="cardNumber">Número de tarjeta *</Label>
                    <Input
                      id="cardNumber"
                      required
                      placeholder="1234 5678 9012 3456"
                      value={paymentData.cardNumber}
                      onChange={(e) => setPaymentData({ ...paymentData, cardNumber: e.target.value })}
                      maxLength={19}
                      className="mt-1"
                    />
                  </div>

                  <div>
                    <Label htmlFor="cardName">Nombre en la tarjeta *</Label>
                    <Input
                      id="cardName"
                      required
                      value={paymentData.cardName}
                      onChange={(e) => setPaymentData({ ...paymentData, cardName: e.target.value })}
                      className="mt-1"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="expiryDate">Vencimiento *</Label>
                      <Input
                        id="expiryDate"
                        required
                        placeholder="MM/AA"
                        value={paymentData.expiryDate}
                        onChange={(e) => setPaymentData({ ...paymentData, expiryDate: e.target.value })}
                        maxLength={5}
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="cvv">CVV *</Label>
                      <Input
                        id="cvv"
                        required
                        placeholder="123"
                        value={paymentData.cvv}
                        onChange={(e) => setPaymentData({ ...paymentData, cvv: e.target.value })}
                        maxLength={4}
                        className="mt-1"
                      />
                    </div>
                  </div>

                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mt-6">
                    <p className="text-sm text-yellow-800">
                      <strong>Nota:</strong> Esta es una compra simulada. No se procesará ningún pago real.
                    </p>
                  </div>

                  <div className="flex gap-4 mt-6">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setStep(1)}
                      className="flex-1 py-6 text-lg"
                    >
                      Volver
                    </Button>
                    <Button
                      type="submit"
                      disabled={loading}
                      className="flex-1 bg-[#3483FA] hover:bg-[#2968C8] text-white py-6 text-lg"
                    >
                      {loading ? 'Procesando...' : 'Confirmar compra'}
                    </Button>
                  </div>
                </form>
              </Card>
            )}
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <Card className="p-6 bg-white sticky top-24">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Resumen del pedido</h2>

              <div className="space-y-4 mb-6">
                {cartItems.map((item, index) => (
                  <div key={index} className="flex gap-3">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-16 h-16 object-contain bg-gray-50 rounded"
                    />
                    <div className="flex-1">
                      <p className="text-sm text-gray-800 line-clamp-2">{item.name}</p>
                      <p className="text-sm text-gray-600">Cantidad: {item.cart_quantity}</p>
                      <p className="text-sm font-semibold text-gray-900">
                        {formatPrice(item.price * item.cart_quantity)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="border-t border-gray-200 pt-4 space-y-3">
                <div className="flex justify-between text-gray-700">
                  <span>Subtotal</span>
                  <span className="font-semibold">{formatPrice(subtotal)}</span>
                </div>
                <div className="flex justify-between text-gray-700">
                  <span>Envío</span>
                  <span className="font-semibold">
                    {shipping === 0 ? (
                      <span className="text-green-600">Gratis</span>
                    ) : (
                      formatPrice(shipping)
                    )}
                  </span>
                </div>
              </div>

              <div className="border-t border-gray-200 pt-4 mt-4">
                <div className="flex justify-between items-center">
                  <span className="text-xl font-bold text-gray-900">Total</span>
                  <span className="text-3xl font-bold text-gray-900">
                    {formatPrice(total)}
                  </span>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;