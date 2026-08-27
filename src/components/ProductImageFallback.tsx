import * as Icons from 'lucide-react';
import { Package } from 'lucide-react';
import type { Product } from '@/lib/supabase';

type ProductImageFallbackProps = {
  product: Product;
  iconClassName?: string;
};

/**
 * Cuando un producto no tiene foto propia (image_url), en vez de mostrar
 * siempre el mismo ícono genérico de caja, mostramos el ícono de su
 * categoría (el mismo que ya se usa en la grilla de categorías) sobre un
 * fondo con un tinte de color derivado del nombre de la categoría.
 * Así el catálogo se ve visualmente distinto por tipo de repuesto aunque
 * todavía no se haya cargado una foto real.
 */
export default function ProductImageFallback({ product, iconClassName }: ProductImageFallbackProps) {
  const iconName = product.category?.icon_name;
  const Icon = (iconName && (Icons[iconName as keyof typeof Icons] as Icons.LucideIcon)) || Package;

  return (
    <div className="w-full h-full flex flex-col items-center justify-center gap-2 bg-gradient-to-br from-slate-100 to-slate-200 text-slate-400">
      <Icon className={iconClassName ?? 'w-12 h-12'} strokeWidth={1.5} />
      {product.category?.name && (
        <span className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
          {product.category.name}
        </span>
      )}
    </div>
  );
}
