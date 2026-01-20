import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { mockProducts, mockCategories } from '../mock';
import ProductCard from '../components/ProductCard';
import * as Icons from 'lucide-react';
import { Button } from '../components/ui/button';

const Category = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const category = mockCategories.find(c => c.id === parseInt(id));
  const categoryProducts = mockProducts.filter(p => p.categoryId === parseInt(id));
  const [, setRefresh] = useState(0);

  const handleFavoriteChange = () => {
    setRefresh(prev => prev + 1);
  };

  if (!category) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Categoría no encontrada</h2>
          <Button onClick={() => navigate('/')}>Volver al inicio</Button>
        </div>
      </div>
    );
  }

  const IconComponent = Icons[category.icon];

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Category Header */}
      <div className="bg-gradient-to-r from-[#3483FA] to-[#2968C8] text-white py-12">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center gap-4 mb-4">
            {IconComponent && <IconComponent className="w-12 h-12" />}
            <h1 className="text-4xl font-bold">{category.name}</h1>
          </div>
          <p className="text-lg opacity-90">
            {categoryProducts.length} productos disponibles
          </p>
        </div>
      </div>

      {/* Products */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {categoryProducts.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {categoryProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onFavoriteChange={handleFavoriteChange}
              />
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-lg p-12 text-center">
            <h3 className="text-xl font-semibold text-gray-800 mb-4">
              No hay productos disponibles en esta categoría
            </h3>
            <Button
              onClick={() => navigate('/')}
              className="bg-[#3483FA] hover:bg-[#2968C8] text-white"
            >
              Volver al inicio
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Category;