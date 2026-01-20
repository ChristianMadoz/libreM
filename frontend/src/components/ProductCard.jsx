import React from 'react';
import { Link } from 'react-router-dom';
import { Heart, Truck } from 'lucide-react';
import { getMockFavorites, setMockFavorites } from '../mock';
import { Card } from './ui/card';
import { Badge } from './ui/badge';

const ProductCard = ({ product, onFavoriteChange }) => {
  const favorites = getMockFavorites();
  const isFavorite = favorites.some(fav => fav === product.id);

  const toggleFavorite = (e) => {
    e.preventDefault();
    let newFavorites;
    if (isFavorite) {
      newFavorites = favorites.filter(fav => fav !== product.id);
    } else {
      newFavorites = [...favorites, product.id];
    }
    setMockFavorites(newFavorites);
    if (onFavoriteChange) onFavoriteChange();
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'USD'
    }).format(price);
  };

  return (
    <Link to={`/product/${product.id}`}>
      <Card className="group overflow-hidden hover:shadow-lg transition-all duration-300 h-full border border-gray-200 rounded-lg">
        <div className="relative aspect-square overflow-hidden bg-white">
          <img
            src={product.image}
            alt={product.name}
            className="w-full h-full object-contain p-4 group-hover:scale-105 transition-transform duration-300"
          />
          {product.discount > 0 && (
            <Badge className="absolute top-3 left-3 bg-green-500 hover:bg-green-600 text-white font-semibold">
              {product.discount}% OFF
            </Badge>
          )}
          <button
            onClick={toggleFavorite}
            className="absolute top-3 right-3 p-2 bg-white rounded-full shadow-md hover:shadow-lg transition-all duration-200 hover:scale-110"
          >
            <Heart
              className={`w-5 h-5 transition-colors ${
                isFavorite ? 'fill-red-500 text-red-500' : 'text-gray-400'
              }`}
            />
          </button>
        </div>

        <div className="p-4">
          {product.freeShipping && (
            <div className="flex items-center gap-1 mb-2">
              <Truck className="w-4 h-4 text-green-600" />
              <span className="text-xs text-green-600 font-semibold">Envío gratis</span>
            </div>
          )}

          <h3 className="text-sm text-gray-800 mb-2 line-clamp-2 group-hover:text-[#3483FA] transition-colors">
            {product.name}
          </h3>

          <div className="space-y-1">
            {product.originalPrice && (
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-400 line-through">
                  {formatPrice(product.originalPrice)}
                </span>
              </div>
            )}
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-semibold text-gray-900">
                {formatPrice(product.price)}
              </span>
            </div>
          </div>

          {product.rating && (
            <div className="flex items-center gap-2 mt-2">
              <div className="flex items-center">
                {[...Array(5)].map((_, i) => (
                  <svg
                    key={i}
                    className={`w-3 h-3 ${
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
              <span className="text-xs text-gray-500">({product.reviews})</span>
            </div>
          )}
        </div>
      </Card>
    </Link>
  );
};

export default ProductCard;