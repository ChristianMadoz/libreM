import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getMockFavorites, mockProducts } from '../mock';
import ProductCard from '../components/ProductCard';
import { Heart } from 'lucide-react';
import { Button } from '../components/ui/button';

const Favorites = () => {
  const navigate = useNavigate();
  const [favorites, setFavorites] = useState(getMockFavorites());

  const handleFavoriteChange = () => {
    setFavorites(getMockFavorites());
  };

  const favoriteProducts = mockProducts.filter(p => favorites.includes(p.id));

  if (favoriteProducts.length === 0) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <Heart className="w-24 h-24 text-gray-400 mx-auto mb-6" />
          <h2 className="text-2xl font-bold text-gray-800 mb-4">
            No tenés productos favoritos
          </h2>
          <p className="text-gray-600 mb-6">
            Guardá tus productos favoritos para encontrarlos fácilmente
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
          <Heart className="w-8 h-8 text-red-500" />
          <h1 className="text-3xl font-bold text-gray-900">Mis favoritos</h1>
          <span className="text-gray-600">({favoriteProducts.length})</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {favoriteProducts.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              onFavoriteChange={handleFavoriteChange}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default Favorites;