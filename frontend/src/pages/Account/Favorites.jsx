import React from 'react';
import { Heart } from 'lucide-react';
import { useFavorites } from '../../hooks/useFavorites';
import ProductCard from '../../components/Product/ProductCard/ProductCard';

export default function Favorites() {
  const { data: favorites = [], isLoading } = useFavorites();

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-8">Sản phẩm yêu thích</h1>

      {favorites.length === 0 ? (
        <div className="text-center py-12">
          <Heart className="mx-auto h-12 w-12 text-slate-300 mb-4" />
          <h3 className="text-lg font-medium text-slate-900 dark:text-white">Chưa có sản phẩm nào</h3>
          <p className="mt-2 text-slate-500 dark:text-slate-400">Bạn chưa thêm sản phẩm nào vào danh sách yêu thích.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:gap-6">
          {favorites.map((favorite) => (
            <ProductCard key={favorite.id} product={favorite.product || favorite} />
          ))}
        </div>
      )}
    </div>
  );
}
