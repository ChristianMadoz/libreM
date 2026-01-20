import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { mockProducts, mockCategories } from '../mock';
import ProductCard from '../components/ProductCard';
import { ChevronRight } from 'lucide-react';
import { Button } from '../components/ui/button';
import * as Icons from 'lucide-react';

const Home = () => {
  const [, setRefresh] = useState(0);

  const handleFavoriteChange = () => {
    setRefresh(prev => prev + 1);
  };

  const featuredProducts = mockProducts.slice(0, 6);
  const techProducts = mockProducts.filter(p => p.categoryId === 1).slice(0, 4);
  const homeProducts = mockProducts.filter(p => p.categoryId === 2).slice(0, 4);

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Hero Banner */}
      <div className="bg-gradient-to-r from-[#3483FA] to-[#2968C8] text-white">
        <div className="max-w-7xl mx-auto px-4 py-16">
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div>
              <h1 className="text-4xl md:text-5xl font-bold mb-4">
                ¡Las mejores ofertas están aquí!
              </h1>
              <p className="text-xl mb-6 opacity-90">
                Miles de productos con envío gratis y las mejores cuotas sin interés
              </p>
              <Button
                className="bg-[#FFE600] text-gray-800 hover:bg-[#FFD700] font-semibold px-8 py-6 text-lg rounded-lg shadow-lg hover:shadow-xl transition-all"
                onClick={() => window.scrollTo({ top: 400, behavior: 'smooth' })}
              >
                Ver ofertas
              </Button>
            </div>
            <div className="hidden md:block">
              <img
                src="https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=600&q=80"
                alt="Shopping"
                className="rounded-lg shadow-2xl"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Categories */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">Categorías destacadas</h2>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {mockCategories.slice(0, 10).map((category) => {
            const IconComponent = Icons[category.icon];
            return (
              <Link
                key={category.id}
                to={`/category/${category.id}`}
                className="bg-white rounded-lg p-6 text-center hover:shadow-md transition-all group"
              >
                <div className="flex flex-col items-center gap-3">
                  {IconComponent && (
                    <IconComponent className="w-8 h-8 text-[#3483FA] group-hover:scale-110 transition-transform" />
                  )}
                  <span className="text-sm font-medium text-gray-700 group-hover:text-[#3483FA] transition-colors">
                    {category.name}
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Featured Deals */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-800">Ofertas destacadas</h2>
          <Link
            to="/search?featured=true"
            className="flex items-center gap-1 text-[#3483FA] hover:underline font-medium"
          >
            Ver todas
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {featuredProducts.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              onFavoriteChange={handleFavoriteChange}
            />
          ))}
        </div>
      </div>

      {/* Tech Products */}
      <div className="bg-white py-12">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-800">Tecnología</h2>
            <Link
              to="/category/1"
              className="flex items-center gap-1 text-[#3483FA] hover:underline font-medium"
            >
              Ver todas
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {techProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onFavoriteChange={handleFavoriteChange}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Promo Banner */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl p-8 md:p-12 text-white">
          <div className="max-w-2xl">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              ¡Hasta 50% OFF en productos seleccionados!
            </h2>
            <p className="text-lg mb-6 opacity-90">
              Aprovechá las mejores ofertas en electrónica, hogar y más
            </p>
            <Button
              onClick={() => window.location.href = '/search?discount=true'}
              className="bg-white text-purple-600 hover:bg-gray-100 font-semibold px-8 py-6 text-lg rounded-lg shadow-lg"
            >
              Ver ofertas
            </Button>
          </div>
        </div>
      </div>

      {/* Home Products */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-800">Hogar y Muebles</h2>
          <Link
            to="/category/2"
            className="flex items-center gap-1 text-[#3483FA] hover:underline font-medium"
          >
            Ver todas
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {homeProducts.map((product) => (
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

export default Home;