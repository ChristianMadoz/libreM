import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { mockProducts } from '../mock';
import { Heart, Truck, ShoppingCart, Shield, CreditCard } from 'lucide-react';
import { getMockFavorites, setMockFavorites, getMockCart, setMockCart } from '../mock';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Card } from '../components/ui/card';
import { useToast } from '../hooks/use-toast';

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const product = mockProducts.find(p => p.id === parseInt(id));
  const [selectedColor, setSelectedColor] = useState(product?.colors[0]);
  const [quantity, setQuantity] = useState(1);
  
  const favorites = getMockFavorites();
  const isFavorite = favorites.some(fav => fav === product?.id);

  if (!product) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Producto no encontrado</h2>
          <Button onClick={() => navigate('/')}>Volver al inicio</Button>
        </div>
      </div>
    );
  }

  const toggleFavorite = () => {
    let newFavorites;
    if (isFavorite) {
      newFavorites = favorites.filter(fav => fav !== product.id);
      toast({ title: 'Eliminado de favoritos' });
    } else {
      newFavorites = [...favorites, product.id];
      toast({ title: 'Agregado a favoritos', description: product.name });
    }
    setMockFavorites(newFavorites);
  };

  const addToCart = () => {
    const cart = getMockCart();
    const existingItem = cart.find(item => item.id === product.id && item.color === selectedColor);
    
    if (existingItem) {
      existingItem.quantity += quantity;
      setMockCart(cart);
    } else {
      setMockCart([...cart, { ...product, quantity, color: selectedColor }]);
    }
    
    toast({
      title: '¡Agregado al carrito!',
      description: `${quantity}x ${product.name}`
    });
  };

  const buyNow = () => {
    addToCart();
    navigate('/cart');
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'USD'
    }).format(price);
  };

  const relatedProducts = mockProducts
    .filter(p => p.categoryId === product.categoryId && p.id !== product.id)
    .slice(0, 4);

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <div className="text-sm text-gray-600 mb-6">
          <span className="hover:text-[#3483FA] cursor-pointer" onClick={() => navigate('/')}>Inicio</span>
          <span className="mx-2">/</span>
          <span className="hover:text-[#3483FA] cursor-pointer" onClick={() => navigate(`/category/${product.categoryId}`)}>
            {product.category}
          </span>
          <span className="mx-2">/</span>
          <span className="text-gray-900">{product.name}</span>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Product Images */}
          <div className="lg:col-span-2">
            <Card className="p-8 bg-white">
              <div className="relative aspect-square mb-4">
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-full h-full object-contain"
                />
                {product.discount > 0 && (
                  <Badge className="absolute top-4 left-4 bg-green-500 hover:bg-green-600 text-white text-lg px-4 py-2">
                    {product.discount}% OFF
                  </Badge>
                )}
              </div>
              
              {/* Product Info */}
              <div className="mt-6">
                <h1 className="text-2xl font-bold text-gray-900 mb-4">{product.name}</h1>
                
                {/* Rating */}
                {product.rating && (
                  <div className="flex items-center gap-4 mb-4">
                    <div className="flex items-center">
                      {[...Array(5)].map((_, i) => (
                        <svg
                          key={i}
                          className={`w-5 h-5 ${
                            i < Math.floor(product.rating)
                              ? 'text-yellow-400 fill-yellow-400'
                              : 'text-gray-300'
                          }`}
                          viewBox="0 0 20 20"
                        >
                          <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
                        </svg>
                      ))}
                    </div>
                    <span className="text-sm text-gray-600">({product.reviews} opiniones)</span>
                    <span className="text-sm text-gray-500">| {product.sold} vendidos</span>
                  </div>
                )}

                {/* Description */}
                <div className="border-t border-gray-200 pt-6 mt-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Descripción</h3>
                  <p className="text-gray-700 leading-relaxed">{product.description}</p>
                </div>

                {/* Features */}
                <div className="border-t border-gray-200 pt-6 mt-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Características</h3>
                  <ul className="space-y-2">
                    {product.features.map((feature, index) => (
                      <li key={index} className="flex items-center gap-2 text-gray-700">
                        <div className="w-1.5 h-1.5 bg-[#3483FA] rounded-full"></div>
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </Card>
          </div>

          {/* Purchase Panel */}
          <div className="lg:col-span-1">
            <Card className="p-6 bg-white sticky top-24">
              {/* Seller Info */}
              <div className="mb-6">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-sm text-gray-600">Vendido por</span>
                  {product.verified && (
                    <Badge className="bg-[#3483FA] hover:bg-[#2968C8] text-white text-xs">
                      Oficial
                    </Badge>
                  )}
                </div>
                <span className="font-semibold text-gray-900">{product.seller}</span>
              </div>

              {/* Price */}
              <div className="mb-6">
                {product.originalPrice && (
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-lg text-gray-400 line-through">
                      {formatPrice(product.originalPrice)}
                    </span>
                  </div>
                )}
                <div className="text-4xl font-bold text-gray-900">
                  {formatPrice(product.price)}
                </div>
                <p className="text-sm text-green-600 mt-2">en 12 cuotas sin interés</p>
              </div>

              {/* Free Shipping */}
              {product.freeShipping && (
                <div className="flex items-center gap-2 text-green-600 mb-6 bg-green-50 p-3 rounded-lg">
                  <Truck className="w-5 h-5" />
                  <div>
                    <p className="font-semibold">Envío gratis</p>
                    <p className="text-xs text-gray-600">Llega mañana</p>
                  </div>
                </div>
              )}

              {/* Color Selection */}
              {product.colors.length > 1 && (
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Color: {selectedColor}
                  </label>
                  <div className="flex gap-2 flex-wrap">
                    {product.colors.map((color) => (
                      <button
                        key={color}
                        onClick={() => setSelectedColor(color)}
                        className={`px-4 py-2 border rounded-lg text-sm transition-all ${
                          selectedColor === color
                            ? 'border-[#3483FA] bg-blue-50 text-[#3483FA] font-semibold'
                            : 'border-gray-300 hover:border-gray-400'
                        }`}
                      >
                        {color}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Quantity */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Cantidad
                </label>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="w-10 h-10 border border-gray-300 rounded-lg hover:bg-gray-50 font-semibold"
                  >
                    -
                  </button>
                  <span className="text-lg font-semibold w-12 text-center">{quantity}</span>
                  <button
                    onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                    className="w-10 h-10 border border-gray-300 rounded-lg hover:bg-gray-50 font-semibold"
                  >
                    +
                  </button>
                  <span className="text-sm text-gray-500">({product.stock} disponibles)</span>
                </div>
              </div>

              {/* Actions */}
              <div className="space-y-3 mb-6">
                <Button
                  onClick={buyNow}
                  className="w-full bg-[#3483FA] hover:bg-[#2968C8] text-white font-semibold py-6 text-lg rounded-lg"
                >
                  Comprar ahora
                </Button>
                <Button
                  onClick={addToCart}
                  variant="outline"
                  className="w-full border-[#3483FA] text-[#3483FA] hover:bg-blue-50 font-semibold py-6 text-lg rounded-lg"
                >
                  <ShoppingCart className="w-5 h-5 mr-2" />
                  Agregar al carrito
                </Button>
                <Button
                  onClick={toggleFavorite}
                  variant="ghost"
                  className="w-full border border-gray-300 hover:bg-gray-50 py-6 text-lg rounded-lg"
                >
                  <Heart
                    className={`w-5 h-5 mr-2 ${
                      isFavorite ? 'fill-red-500 text-red-500' : ''
                    }`}
                  />
                  {isFavorite ? 'Quitar de favoritos' : 'Agregar a favoritos'}
                </Button>
              </div>

              {/* Trust Badges */}
              <div className="border-t border-gray-200 pt-6 space-y-3">
                <div className="flex items-center gap-3 text-sm text-gray-600">
                  <Shield className="w-5 h-5 text-green-600" />
                  <span>Compra protegida</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-gray-600">
                  <CreditCard className="w-5 h-5 text-blue-600" />
                  <span>Pago seguro</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-gray-600">
                  <Truck className="w-5 h-5 text-orange-600" />
                  <span>Devolución gratis</span>
                </div>
              </div>
            </Card>
          </div>
        </div>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <div className="mt-12">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Productos relacionados</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {relatedProducts.map((relatedProduct) => (
                <Card
                  key={relatedProduct.id}
                  onClick={() => {
                    navigate(`/product/${relatedProduct.id}`);
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="cursor-pointer hover:shadow-lg transition-shadow"
                >
                  <img
                    src={relatedProduct.image}
                    alt={relatedProduct.name}
                    className="w-full h-48 object-contain p-4"
                  />
                  <div className="p-4">
                    <h3 className="text-sm text-gray-800 mb-2 line-clamp-2">
                      {relatedProduct.name}
                    </h3>
                    <p className="text-xl font-semibold text-gray-900">
                      {formatPrice(relatedProduct.price)}
                    </p>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductDetail;