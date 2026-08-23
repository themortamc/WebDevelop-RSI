import { useMemo, useState } from 'react';
import { SlidersHorizontal, X, Package, AlertCircle } from 'lucide-react';
import type { Category, Product } from '@/lib/supabase';
import { useProducts, type ProductFilters } from '@/lib/hooks';
import ProductCard from './ProductCard';

type CatalogProps = {
  categories: Category[];
  selectedCategory: string | null;
  onCategoryChange: (id: string | null) => void;
  search: string;
  onAddToCart: (product: Product) => void;
  onQuickView: (product: Product) => void;
  catalogRef: React.RefObject<HTMLDivElement>;
};

const sortOptions: { value: ProductFilters['sort']; label: string }[] = [
  { value: 'featured', label: 'Destacados' },
  { value: 'price-asc', label: 'Precio: menor a mayor' },
  { value: 'price-desc', label: 'Precio: mayor a menor' },
  { value: 'name', label: 'Nombre A-Z' },
];

export default function Catalog({
  categories,
  selectedCategory,
  onCategoryChange,
  search,
  onAddToCart,
  onQuickView,
  catalogRef,
}: CatalogProps) {
  const [sort, setSort] = useState<ProductFilters['sort']>('featured');
  const [showFilters, setShowFilters] = useState(false);

  const filters = useMemo(
    () => ({ categoryId: selectedCategory, search, sort }),
    [selectedCategory, search, sort]
  );
  const { products, loading, error } = useProducts(filters);

  const activeCategory = categories.find((c) => c.id === selectedCategory);

  return (
    <section id="catalogo" ref={catalogRef} className="py-16 lg:py-24 bg-white scroll-mt-24">
      <div className="max-w-7xl mx-auto px-4">
        {/* Section header */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4 mb-8">
          <div>
            <span className="text-sm font-semibold text-red-600 uppercase tracking-wider">
              Catálogo
            </span>
            <h2 className="text-3xl lg:text-4xl font-bold text-slate-900 mt-2">
              {activeCategory ? activeCategory.name : 'Todos los repuestos'}
            </h2>
            <p className="text-slate-500 mt-2">
              {loading
                ? 'Cargando productos...'
                : `${products.length} ${products.length === 1 ? 'producto encontrado' : 'productos encontrados'}`}
            </p>
          </div>

          <div className="flex items-center gap-3">
            {/* Mobile filter toggle */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="lg:hidden inline-flex items-center gap-2 px-4 py-2.5 border border-slate-300 rounded-xl text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors"
            >
              <SlidersHorizontal className="w-4 h-4" />
              Filtros
            </button>

            {/* Sort dropdown */}
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value as ProductFilters['sort'])}
              className="px-4 py-2.5 border border-slate-300 rounded-xl text-sm font-medium text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-red-500/30 focus:border-red-500 transition-all cursor-pointer"
            >
              {sortOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex gap-8">
          {/* Sidebar filters */}
          <aside
            className={`${
              showFilters
                ? 'fixed inset-0 z-50 bg-white p-6 overflow-y-auto'
                : 'hidden'
            } lg:block lg:relative lg:w-64 lg:flex-shrink-0`}
          >
            {showFilters && (
              <div className="flex items-center justify-between mb-6 lg:hidden">
                <h3 className="font-bold text-lg">Filtros</h3>
                <button onClick={() => setShowFilters(false)}>
                  <X className="w-6 h-6" />
                </button>
              </div>
            )}
            <div className="lg:sticky lg:top-28">
              <h3 className="font-bold text-slate-900 mb-4 text-sm uppercase tracking-wide">
                Categorías
              </h3>
              <div className="flex flex-col gap-1">
                <button
                  onClick={() => {
                    onCategoryChange(null);
                    setShowFilters(false);
                  }}
                  className={`text-left px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    !selectedCategory
                      ? 'bg-red-50 text-red-600'
                      : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  Todas las categorías
                </button>
                {categories.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => {
                      onCategoryChange(cat.id);
                      setShowFilters(false);
                    }}
                    className={`text-left px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      selectedCategory === cat.id
                        ? 'bg-red-50 text-red-600'
                        : 'text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    {cat.name}
                  </button>
                ))}
              </div>
            </div>
          </aside>

          {/* Products grid */}
          <div className="flex-1">
            {error ? (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <AlertCircle className="w-12 h-12 text-red-500 mb-4" />
                <h3 className="font-bold text-slate-900 mb-2">Error al cargar productos</h3>
                <p className="text-sm text-slate-500">{error}</p>
              </div>
            ) : loading ? (
              <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
                {Array.from({ length: 8 }).map((_, i) => (
                  <div
                    key={i}
                    className="bg-white rounded-2xl border border-slate-200 overflow-hidden animate-pulse"
                  >
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
            ) : products.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <Package className="w-12 h-12 text-slate-300 mb-4" />
                <h3 className="font-bold text-slate-900 mb-2">No se encontraron productos</h3>
                <p className="text-sm text-slate-500">
                  Intenta con otra búsqueda o categoría
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
                {products.map((product) => (
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
        </div>
      </div>
    </section>
  );
}
