import { Star, ShoppingCart } from 'lucide-react';
import type { Product } from '@/lib/supabase';
import { formatPrice } from '@/lib/hooks';
import ProductImageFallback from './ProductImageFallback';

type ProductCardProps = {
  product: Product;
  onAddToCart: (product: Product) => void;
  onQuickView?: (product: Product) => void;
};

export default function ProductCard({ product, onAddToCart, onQuickView }: ProductCardProps) {
  const inStock = product.stock > 0;
  const lowStock = product.stock > 0 && product.stock <= 10;

  return (
    <div className="group bg-white rounded-2xl border border-slate-200 overflow-hidden hover:shadow-xl hover:shadow-slate-200/60 hover:border-slate-300 transition-all duration-300 hover:-translate-y-1 flex flex-col">
      {/* Image */}
      <div
        className="relative aspect-[4/3] overflow-hidden bg-slate-100 cursor-pointer"
        onClick={() => onQuickView?.(product)}
      >
        {product.image_url ? (
          <img
            src={product.image_url}
            alt={product.name}
            loading="lazy"
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <ProductImageFallback product={product} />
        )}

        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5">
          {product.featured && (
            <span className="px-2.5 py-1 bg-red-600 text-white text-[10px] font-bold rounded-md uppercase tracking-wide shadow-sm">
              Destacado
            </span>
          )}
          {lowStock && (
            <span className="px-2.5 py-1 bg-amber-500 text-white text-[10px] font-bold rounded-md shadow-sm">
              ¡Pocas unidades!
            </span>
          )}
        </div>

        {/* Stock status */}
        <div className="absolute top-3 right-3">
          <span
            className={`px-2.5 py-1 text-[10px] font-bold rounded-md shadow-sm ${
              inStock
                ? 'bg-green-500/90 text-white'
                : 'bg-slate-700/90 text-white'
            }`}
          >
            {inStock ? 'En stock' : 'Agotado'}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 flex flex-col flex-1">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-semibold text-red-600 uppercase tracking-wide">
            {product.brand}
          </span>
          <div className="flex items-center gap-1">
            <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
            <span className="text-xs font-medium text-slate-600">{product.rating.toFixed(1)}</span>
          </div>
        </div>

        <h3
          className="font-bold text-slate-900 text-sm leading-snug mb-2 cursor-pointer hover:text-red-600 transition-colors line-clamp-2"
          onClick={() => onQuickView?.(product)}
        >
          {product.name}
        </h3>

        <p className="text-xs text-slate-500 line-clamp-2 mb-3 flex-1 leading-relaxed">
          {product.description}
        </p>

        <div className="flex items-center justify-between gap-2 mt-auto">
          <div>
            <div className="text-lg font-bold text-slate-900">{formatPrice(product.price)}</div>
            <div className="text-[10px] text-slate-400 font-mono">SKU: {product.sku}</div>
          </div>
          <button
            onClick={() => onAddToCart(product)}
            disabled={!inStock}
            className="w-10 h-10 flex items-center justify-center rounded-xl bg-slate-900 text-white hover:bg-red-600 disabled:opacity-40 disabled:cursor-not-allowed transition-all hover:scale-105 active:scale-95"
            aria-label="Agregar al carrito"
          >
            <ShoppingCart className="w-4.5 h-4.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
