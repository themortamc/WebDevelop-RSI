import { useState } from 'react';
import { X, Star, ShoppingCart, Check, Minus, Plus } from 'lucide-react';
import type { Product } from '@/lib/supabase';
import ProductImageFallback from './ProductImageFallback';

type QuickViewModalProps = {
  product: Product | null;
  onClose: () => void;
  onAddToCart: (product: Product, quantity: number) => void;
};

export default function QuickViewModal({ product, onClose, onAddToCart }: QuickViewModalProps) {
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);

  if (!product) return null;

  const inStock = product.stock > 0;

  const handleAdd = () => {
    onAddToCart(product, quantity);
    setAdded(true);
    setTimeout(() => {
      setAdded(false);
      onClose();
    }, 1200);
  };

  return (
    <>
      <div
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[60] animate-[fadeIn_0.2s_ease-out]"
        onClick={onClose}
      />
      <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 pointer-events-none">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto pointer-events-auto animate-[scaleIn_0.2s_ease-out]">
          {/* Close */}
          <div className="sticky top-0 z-10 flex justify-end p-4 bg-gradient-to-b from-white to-transparent">
            <button
              onClick={onClose}
              className="w-9 h-9 flex items-center justify-center rounded-lg bg-white shadow-md text-slate-500 hover:bg-slate-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="grid md:grid-cols-2 gap-6 p-6 pt-0">
            {/* Image */}
            <div className="relative aspect-square rounded-xl overflow-hidden bg-slate-100">
              {product.image_url ? (
                <img
                  src={product.image_url}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <ProductImageFallback product={product} iconClassName="w-16 h-16" />
              )}
              {product.featured && (
                <span className="absolute top-3 left-3 px-3 py-1 bg-blue-600 text-white text-xs font-bold rounded-md uppercase tracking-wide">
                  Destacado
                </span>
              )}
            </div>

            {/* Info */}
            <div className="flex flex-col">
              <div className="flex items-center gap-3 mb-2">
                <span className="text-sm font-semibold text-blue-600 uppercase tracking-wide">
                  {product.brand}
                </span>
                <div className="flex items-center gap-1">
                  <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                  <span className="text-sm font-medium text-slate-600">
                    {product.rating.toFixed(1)}
                  </span>
                </div>
              </div>

              <h2 className="text-2xl font-bold text-slate-900 mb-3">{product.name}</h2>

              <p className="text-slate-600 leading-relaxed mb-4">{product.description}</p>

              <div className="grid grid-cols-2 gap-3 mb-6">
                <div className="p-3 bg-slate-50 rounded-lg">
                  <div className="text-[10px] text-slate-400 uppercase font-semibold tracking-wide">
                    SKU
                  </div>
                  <div className="text-sm font-mono text-slate-700 mt-0.5">{product.sku}</div>
                </div>
                <div className="p-3 bg-slate-50 rounded-lg">
                  <div className="text-[10px] text-slate-400 uppercase font-semibold tracking-wide">
                    Disponibilidad
                  </div>
                  <div
                    className={`text-sm font-semibold mt-0.5 ${
                      inStock ? 'text-green-600' : 'text-blue-600'
                    }`}
                  >
                    {inStock ? `${product.stock} unidades` : 'Agotado'}
                  </div>
                </div>
              </div>

              <div className="mt-auto">
                {inStock && (
                  <div className="flex items-center gap-4 mb-4">
                    <div className="flex items-center gap-1 border border-slate-200 rounded-xl">
                      <button
                        onClick={() => setQuantity(Math.max(1, quantity - 1))}
                        className="w-9 h-9 flex items-center justify-center text-slate-600 hover:text-blue-600 transition-colors"
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                      <span className="w-10 text-center font-semibold">{quantity}</span>
                      <button
                        onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                        className="w-9 h-9 flex items-center justify-center text-slate-600 hover:text-blue-600 transition-colors"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                )}

                <button
                  onClick={handleAdd}
                  disabled={!inStock}
                  className="w-full py-3.5 bg-slate-900 hover:bg-blue-600 text-white font-semibold rounded-xl shadow-lg disabled:opacity-40 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
                >
                  {added ? (
                    <>
                      <Check className="w-5 h-5" />
                      ¡Agregado al carrito!
                    </>
                  ) : (
                    <>
                      <ShoppingCart className="w-5 h-5" />
                      Agregar al carrito
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
