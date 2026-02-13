import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { Trash2, Plus, Minus, ShoppingBag, ArrowRight } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { useToast } from '../hooks/use-toast';

const Cart = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { isAuthenticated } = useAuth();
  const { cart, loading, updateCartItem, removeFromCart, getCartItemsCount } = useCart();

  const cartItems = cart?.items || [];

  const updateQuantity = async (productId, color, newQuantity) => {
    if (newQuantity < 1) return;
    try {
      await updateCartItem(productId, newQuantity, color);
    } catch (error) {
      toast({ title: 'Error al actualizar cantidad', variant: 'destructive' });
    }
  };

  const removeItem = async (productId, color) => {
    try {
      await removeFromCart(productId, color);
      toast({ title: 'Producto eliminado del carrito' });
    } catch (error) {
      toast({ title: 'Error al eliminar producto', variant: 'destructive' });
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'USD'
    }).format(price);
  };

  const subtotal = cart?.total || 0;
  const shipping = cartItems.some(item => !item.free_shipping) ? 15.99 : 0;
  const total = subtotal + shipping;

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-[#3483FA]"></div>
      </div>
    );
  }

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <ShoppingBag className="w-24 h-24 text-gray-400 mx-auto mb-6" />
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Tu carrito está vacío</h2>
          <p className="text-gray-600 mb-6">¡Descubrí miles de productos y empezá a comprar!</p>
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
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Carrito de compras</h1>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {cartItems.map((item, index) => (
              <Card key={`${item.product_id}-${item.color}-${index}`} className="p-6 bg-white">
                <div className="flex gap-6">
                  {/* Product Image */}
                  <div
                    className="w-32 h-32 flex-shrink-0 bg-white rounded-lg overflow-hidden cursor-pointer"
                    onClick={() => navigate(`/product/${item.product_id}`)}
                  >
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-full h-full object-contain p-2 hover:scale-105 transition-transform"
                    />
                  </div>

                  {/* Product Info */}
                  <div className="flex-1">
                    <div className="flex justify-between">
                      <div>
                        <h3
                          className="text-lg font-semibold text-gray-900 mb-2 cursor-pointer hover:text-[#3483FA]"
                          onClick={() => navigate(`/product/${item.product_id}`)}
                        >
                          {item.name}
                        </h3>
                        {item.color && (
                          <p className="text-sm text-gray-600 mb-2">Color: {item.color}</p>
                        )}
                        {item.free_shipping && (
                          <p className="text-sm text-green-600 font-semibold mb-2">
                            Envío gratis
                          </p>
                        )}
                      </div>
                      <button
                        onClick={() => removeItem(item.product_id, item.color)}
                        className="text-gray-400 hover:text-red-500 transition-colors h-fit"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>

                    <div className="flex items-center justify-between mt-4">
                      {/* Quantity Controls */}
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => updateQuantity(item.product_id, item.color, item.cart_quantity - 1)}
                          className="w-8 h-8 border border-gray-300 rounded hover:bg-gray-50 flex items-center justify-center"
                        >
                          <Minus className="w-4 h-4" />
                        </button>
                        <span className="text-lg font-semibold w-8 text-center">
                          {item.cart_quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.product_id, item.color, item.cart_quantity + 1)}
                          className="w-8 h-8 border border-gray-300 rounded hover:bg-gray-50 flex items-center justify-center"
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>

                      {/* Price */}
                      <div className="text-right">
                        <p className="text-2xl font-bold text-gray-900">
                          {formatPrice(item.price * item.cart_quantity)}
                        </p>
                        {item.cart_quantity > 1 && (
                          <p className="text-sm text-gray-500">
                            {formatPrice(item.price)} c/u
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <Card className="p-6 bg-white sticky top-24">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Resumen de compra</h2>

              <div className="space-y-4 mb-6">
                <div className="flex justify-between text-gray-700">
                  <span>Productos ({getCartItemsCount()})</span>
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

              <div className="border-t border-gray-200 pt-6 mb-6">
                <div className="flex justify-between items-center">
                  <span className="text-xl font-bold text-gray-900">Total</span>
                  <span className="text-3xl font-bold text-gray-900">
                    {formatPrice(total)}
                  </span>
                </div>
                <p className="text-sm text-gray-500 mt-2">en hasta 12 cuotas sin interés</p>
              </div>

              <Button
                onClick={() => navigate('/checkout')}
                className="w-full bg-[#3483FA] hover:bg-[#2968C8] text-white font-semibold py-6 text-lg rounded-lg mb-4"
              >
                Continuar compra
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>

              <Button
                onClick={() => navigate('/')}
                variant="outline"
                className="w-full border-gray-300 text-gray-700 hover:bg-gray-50 py-6 rounded-lg"
              >
                Seguir comprando
              </Button>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;