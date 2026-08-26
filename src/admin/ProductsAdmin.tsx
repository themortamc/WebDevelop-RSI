import { useEffect, useCallback, useState } from 'react';
import {
  Plus,
  Pencil,
  Trash2,
  Package,
  Search,
  Eye,
  EyeOff,
  X,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { supabase, type Product, type Category } from '@/lib/supabase';
import { formatPrice } from '@/lib/hooks';
import ProductForm from '@/admin/ProductForm';

type ProductsAdminProps = {
  categories: Category[];
};

const PAGE_SIZE = 50;

export default function ProductsAdmin({ categories }: ProductsAdminProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Product | null | 'new'>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [togglingId, setTogglingId] = useState<string | null>(null);

  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [draftsOnly, setDraftsOnly] = useState(false);
  const [page, setPage] = useState(0);

  const filtersActive = Boolean(search.trim() || categoryFilter || draftsOnly);

  // Debounce del buscador: espera a que el usuario deje de tipear antes
  // de pegarle a la base (si no, con 29mil productos dispara una query
  // por cada letra).
  useEffect(() => {
    const timeout = setTimeout(() => {
      setSearch(searchInput);
      setPage(0);
    }, 350);
    return () => clearTimeout(timeout);
  }, [searchInput]);

  useEffect(() => {
    setPage(0);
  }, [categoryFilter, draftsOnly]);

  // Trae UNA página de productos desde el servidor (no todo el catálogo).
  // Búsqueda, categoría y "solo borradores" también se resuelven en la
  // base con .range()/.or()/.eq(), no filtrando en el navegador.
  const load = useCallback(async () => {
    setLoading(true);
    const from = page * PAGE_SIZE;
    const to = from + PAGE_SIZE - 1;

    let query = supabase
      .from('products')
      .select('*, category:categories(*)', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(from, to);

    const term = search.trim();
    if (term) {
      const like = `%${term}%`;
      query = query.or(`name.ilike.${like},brand.ilike.${like},sku.ilike.${like}`);
    }
    if (categoryFilter) {
      query = query.eq('category_id', categoryFilter);
    }
    if (draftsOnly) {
      query = query.eq('published', false);
    }

    const { data, count } = await query;
    setProducts(data ?? []);
    setTotalCount(count ?? 0);
    setLoading(false);
  }, [page, search, categoryFilter, draftsOnly]);

  useEffect(() => {
    load();
  }, [load]);

  const handleDelete = async (product: Product) => {
    if (!confirm(`¿Eliminar "${product.name}" del catálogo? Esta acción no se puede deshacer.`)) {
      return;
    }
    setDeletingId(product.id);
    await supabase.from('products').delete().eq('id', product.id);
    setDeletingId(null);
    load();
  };

  const handleTogglePublish = async (product: Product) => {
    setTogglingId(product.id);
    const { error } = await supabase
      .from('products')
      .update({ published: !product.published })
      .eq('id', product.id);
    if (!error) {
      setProducts((prev) =>
        prev.map((p) => (p.id === product.id ? { ...p, published: !p.published } : p))
      );
    }
    setTogglingId(null);
  };

  const clearFilters = () => {
    setSearchInput('');
    setSearch('');
    setCategoryFilter('');
    setDraftsOnly(false);
    setPage(0);
  };

  const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE));

  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <h2 className="font-bold text-lg text-slate-900">Productos ({totalCount})</h2>
        <button
          onClick={() => setEditing('new')}
          className="flex items-center gap-2 px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white text-sm font-semibold rounded-xl transition-colors"
        >
          <Plus className="w-4 h-4" />
          Nuevo producto
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 p-4 mb-5 flex flex-col lg:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Buscar por nombre, marca o SKU..."
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-red-500/30 focus:border-red-500 transition-all"
          />
        </div>
        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="px-4 py-2.5 border border-slate-200 rounded-xl text-sm font-medium text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-red-500/30 focus:border-red-500 transition-all cursor-pointer lg:w-56"
        >
          <option value="">Todas las categorías</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
        <label className="flex items-center gap-2 px-4 py-2.5 border border-slate-200 rounded-xl text-sm font-medium text-slate-700 cursor-pointer select-none whitespace-nowrap">
          <input
            type="checkbox"
            checked={draftsOnly}
            onChange={(e) => setDraftsOnly(e.target.checked)}
            className="w-4 h-4 rounded border-slate-300 text-red-600 focus:ring-red-500/30"
          />
          Solo borradores
        </label>
        {filtersActive && (
          <button
            onClick={clearFilters}
            className="flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium text-slate-500 hover:text-red-600 transition-colors whitespace-nowrap"
          >
            <X className="w-4 h-4" />
            Limpiar filtros
          </button>
        )}
      </div>

      {loading ? (
        <p className="text-sm text-slate-500">Cargando...</p>
      ) : products.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center bg-white rounded-2xl border border-slate-100">
          <Package className="w-10 h-10 text-slate-300 mb-3" />
          <p className="text-slate-500 text-sm mb-3">
            {filtersActive
              ? 'Ningún producto coincide con estos filtros.'
              : 'Todavía no cargaste ningún producto.'}
          </p>
          {filtersActive && (
            <button
              onClick={clearFilters}
              className="text-sm font-semibold text-red-600 hover:text-red-700"
            >
              Limpiar filtros
            </button>
          )}
        </div>
      ) : (
        <>
          <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
            <div className="divide-y divide-slate-100">
              {products.map((p) => (
                <div key={p.id} className="flex items-center gap-4 p-4 hover:bg-slate-50 transition-colors">
                  <div className="w-14 h-14 rounded-lg overflow-hidden bg-slate-100 flex-shrink-0">
                    {p.image_url ? (
                      <img src={p.image_url} alt={p.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Package className="w-5 h-5 text-slate-300" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm text-slate-900 truncate">{p.name}</p>
                    <p className="text-xs text-slate-500">
                      {p.brand} · SKU {p.sku} · Stock: {p.stock}
                      {p.category?.name ? ` · ${p.category.name}` : ''}
                    </p>
                  </div>
                  <div className="font-bold text-sm text-slate-900 flex-shrink-0">
                    {formatPrice(p.price)}
                  </div>
                  <button
                    onClick={() => handleTogglePublish(p)}
                    disabled={togglingId === p.id}
                    title={p.published ? 'Ocultar de la tienda' : 'Publicar en la tienda'}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-colors disabled:opacity-50 flex-shrink-0 ${
                      p.published
                        ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                        : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                    }`}
                  >
                    {p.published ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                    {p.published ? 'Publicado' : 'Borrador'}
                  </button>
                  <div className="flex items-center gap-1 flex-shrink-0">
                    <button
                      onClick={() => setEditing(p)}
                      className="w-9 h-9 flex items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-900 transition-colors"
                      aria-label="Editar"
                    >
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(p)}
                      disabled={deletingId === p.id}
                      className="w-9 h-9 flex items-center justify-center rounded-lg text-slate-500 hover:bg-red-50 hover:text-red-600 transition-colors disabled:opacity-50"
                      aria-label="Eliminar"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-between mt-4">
            <p className="text-sm text-slate-500">
              Página {page + 1} de {totalPages}
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage((p) => Math.max(0, p - 1))}
                disabled={page === 0}
                className="flex items-center gap-1 px-3 py-2 rounded-lg text-sm font-medium text-slate-600 border border-slate-200 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
                Anterior
              </button>
              <button
                onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
                disabled={page >= totalPages - 1}
                className="flex items-center gap-1 px-3 py-2 rounded-lg text-sm font-medium text-slate-600 border border-slate-200 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                Siguiente
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </>
      )}

      {editing && (
        <ProductForm
          product={editing === 'new' ? null : editing}
          categories={categories}
          onClose={() => setEditing(null)}
          onSaved={() => {
            setEditing(null);
            load();
          }}
        />
      )}
    </div>
  );
}
