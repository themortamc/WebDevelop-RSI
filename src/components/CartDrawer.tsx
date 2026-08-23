import { X, Plus, Minus, ShoppingBag, Trash2, MessageCircle } from 'lucide-react';
import type { CartItem } from '@/lib/hooks';
import { formatPrice } from '@/lib/hooks';

type CartDrawerProps = {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
  total: number;
  onUpdateQuantity: (productId: string, quantity: number) => void;
  onRemove: (productId: string) => void;
  onClear: () => void;
  onCheckout: () => void;
};

export default function CartDrawer({
  isOpen,
  onClose,
  items,
  total,
  onUpdateQuantity,
  onRemove,
  onClear,
  onCheckout,
}: CartDrawerProps) {
  return (
    <>
      {/* Overlay */}
      <div
        className={`fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 transition-opacity duration-300 ${
          isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={onClose}
      />

      {/* Drawer */}
      <div
        className={`fixed top-0 right-0 h-full w-full max-w-md bg-white z-50 shadow-2xl flex flex-col transition-transform duration-300 ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-red-600" />
            <h2 className="font-bold text-lg text-slate-900">Tu carrito</h2>
            {items.length > 0 && (
              <span className="px-2 py-0.5 bg-red-100 text-red-600 text-xs font-bold rounded-full">
                {items.length}
              </span>
            )}
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 flex items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto p-5">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center py-20">
              <div className="w-20 h-20 rounded-full bg-slate-100 flex items-center justify-center mb-4">
                <ShoppingBag className="w-10 h-10 text-slate-300" />
              </div>
              <h3 className="font-bold text-slate-900 mb-1">Tu carrito está vacío</h3>
              <p className="text-sm text-slate-500 mb-6">
                Agrega repuestos para empezar tu compra
              </p>
              <button
                onClick={onClose}
                className="px-6 py-2.5 bg-slate-900 text-white text-sm font-semibold rounded-xl hover:bg-red-600 transition-colors"
              >
                Explorar productos
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {items.map((item: CartItem) => (
                <div
                  key={item.product.id}
                  className="flex gap-3 p-3 rounded-xl border border-slate-100 hover:border-slate-200 transition-colors"
                >
                  {/* Image */}
                  <div className="w-20 h-20 rounded-lg overflow-hidden bg-slate-100 flex-shrink-0">
                    {item.product.image_url ? (
                      <img
                        src={item.product.image_url}
                        alt={item.product.name}
                        className="w-full h-full object-cover"
                      />
                    ) : null}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <h4 className="font-semibold text-sm text-slate-900 line-clamp-2">
                        {item.product.name}
                      </h4>
                      <button
                        onClick={() => onRemove(item.product.id)}
                        className="text-slate-400 hover:text-red-600 transition-colors flex-shrink-0"
                        aria-label="Eliminar"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5">{item.product.brand}</p>

                    <div className="flex items-center justify-between mt-2">
                      {/* Quantity */}
                      <div className="flex items-center gap-1 border border-slate-200 rounded-lg">
                        <button
                          onClick={() => onUpdateQuantity(item.product.id, item.quantity - 1)}
                          className="w-7 h-7 flex items-center justify-center text-slate-600 hover:text-red-600 transition-colors"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <span className="w-8 text-center text-sm font-semibold">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => onUpdateQuantity(item.product.id, item.quantity + 1)}
                          className="w-7 h-7 flex items-center justify-center text-slate-600 hover:text-red-600 transition-colors"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      {/* Price */}
                      <div className="text-right">
                        <div className="font-bold text-sm text-slate-900">
                          {formatPrice(item.product.price * item.quantity)}
                        </div>
                        <div className="text-[10px] text-slate-400">
                          {formatPrice(item.product.price)} c/u
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}

              <button
                onClick={onClear}
                className="w-full py-2.5 text-sm text-slate-500 hover:text-red-600 font-medium transition-colors"
              >
                Vaciar carrito
              </button>
            </div>
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="border-t border-slate-100 p-5 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-slate-600 font-medium">Total</span>
              <span className="text-2xl font-bold text-slate-900">
                {formatPrice(total)}
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Te vamos a redirigir a WhatsApp para coordinar el pedido
            </p>
            <button
              onClick={onCheckout}
              className="w-full py-3.5 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-xl shadow-lg shadow-red-600/20 hover:scale-[1.01] transition-all flex items-center justify-center gap-2"
            >
              <MessageCircle className="w-5 h-5" />
              Pedir por WhatsApp
            </button>
          </div>
        )}
      </div>
    </>
  );
}
