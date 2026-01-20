import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { mockProducts } from '../mock';
import ProductCard from '../components/ProductCard';
import { SlidersHorizontal } from 'lucide-react';
import { Button } from '../components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../components/ui/select';

const SearchResults = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const query = searchParams.get('q') || '';
  const [sortBy, setSortBy] = useState('relevance');
  const [priceRange, setPriceRange] = useState('all');
  const [, setRefresh] = useState(0);

  const handleFavoriteChange = () => {
    setRefresh(prev => prev + 1);
  };

  // Filter products
  let filteredProducts = mockProducts;

  if (query) {
    filteredProducts = filteredProducts.filter(product =>
      product.name.toLowerCase().includes(query.toLowerCase()) ||
      product.category.toLowerCase().includes(query.toLowerCase()) ||
      product.description.toLowerCase().includes(query.toLowerCase())
    );
  }

  // Filter by price range
  if (priceRange === 'under100') {
    filteredProducts = filteredProducts.filter(p => p.price < 100);
  } else if (priceRange === '100-500') {
    filteredProducts = filteredProducts.filter(p => p.price >= 100 && p.price < 500);
  } else if (priceRange === '500-1000') {
    filteredProducts = filteredProducts.filter(p => p.price >= 500 && p.price < 1000);
  } else if (priceRange === 'over1000') {
    filteredProducts = filteredProducts.filter(p => p.price >= 1000);
  }

  // Sort products
  if (sortBy === 'price-asc') {
    filteredProducts.sort((a, b) => a.price - b.price);
  } else if (sortBy === 'price-desc') {
    filteredProducts.sort((a, b) => b.price - a.price);
  } else if (sortBy === 'rating') {
    filteredProducts.sort((a, b) => (b.rating || 0) - (a.rating || 0));
  } else if (sortBy === 'discount') {
    filteredProducts.sort((a, b) => (b.discount || 0) - (a.discount || 0));
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            {query ? `Resultados para "${query}"` : 'Todos los productos'}
          </h1>
          <p className="text-gray-600">{filteredProducts.length} resultados</p>
        </div>

        {/* Filters and Sort */}
        <div className="bg-white rounded-lg p-4 mb-6 flex flex-wrap gap-4 items-center">
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="w-5 h-5 text-gray-600" />
            <span className="font-semibold text-gray-700">Filtros:</span>
          </div>

          <Select value={priceRange} onValueChange={setPriceRange}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Precio" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos los precios</SelectItem>
              <SelectItem value="under100">Menos de $100</SelectItem>
              <SelectItem value="100-500">$100 - $500</SelectItem>
              <SelectItem value="500-1000">$500 - $1000</SelectItem>
              <SelectItem value="over1000">Más de $1000</SelectItem>
            </SelectContent>
          </Select>

          <div className="flex-1"></div>

          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">Ordenar por:</span>
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-[180px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="relevance">Más relevantes</SelectItem>
                <SelectItem value="price-asc">Menor precio</SelectItem>
                <SelectItem value="price-desc">Mayor precio</SelectItem>
                <SelectItem value="rating">Mejor calificados</SelectItem>
                <SelectItem value="discount">Mayor descuento</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Results */}
        {filteredProducts.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredProducts.map((product) => (
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
              No encontramos productos que coincidan con tu búsqueda
            </h3>
            <p className="text-gray-600 mb-6">
              Intentá con otros términos o navegá por las categorías
            </p>
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

export default SearchResults;