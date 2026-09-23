import { useState, useMemo } from 'react';
import { useProducts } from '@/lib/hooks';
import type { Product } from '@/lib/supabase';
import ProductCard from './ProductCard';

type FeaturedProductsProps = {
  onAddToCart: (product: Product) => void;
  onQuickView: (product: Product) => void;
};

export default function FeaturedProducts({ onAddToCart, onQuickView }: FeaturedProductsProps) {
  const { products, loading } = useProducts({ featuredOnly: true });
  const [showAll, setShowAll] = useState(false);

  const displayed = useMemo(
    () => (showAll ? products : products.slice(0, 8)),
    [products, showAll]
  );

  if (!loading && products.length === 0) return null;

  return (
    <section className="py-16 lg:py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10">
          <div>
            <span className="text-sm font-semibold text-blue-600 uppercase tracking-wider">
              Destacados
            </span>
            <h2 className="text-3xl lg:text-4xl font-bold text-slate-900 mt-2">
              Productos destacados
            </h2>
            <p className="text-slate-500 mt-2">
              Los repuestos más vendidos y recomendados por nuestros clientes
            </p>
          </div>
          {!showAll && products.length > 8 && (
            <button
              onClick={() => setShowAll(true)}
              className="inline-flex items-center gap-2 px-5 py-2.5 border-2 border-slate-900 text-slate-900 font-semibold rounded-xl hover:bg-slate-900 hover:text-white transition-all text-sm self-start sm:self-auto"
            >
              Ver todos
            </button>
          )}
        </div>

        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="bg-white rounded-2xl border border-slate-200 overflow-hidden animate-pulse">
                <div className="aspect-[4/3] bg-slate-200" />
                <div className="p-4 space-y-3">
                  <div className="h-3 bg-slate-200 rounded w-20" />
                  <div className="h-4 bg-slate-200 rounded w-full" />
                  <div className="h-3 bg-slate-200 rounded w-full" />
                  <div className="flex justify-between items-center pt-2">
                    <div className="h-6 bg-slate-200 rounded w-16" />
                    <div className="h-10 w-10 bg-slate-200 rounded-xl" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
            {displayed.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onAddToCart={onAddToCart}
                onQuickView={onQuickView}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
