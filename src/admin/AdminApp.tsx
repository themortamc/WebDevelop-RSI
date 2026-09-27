import { useCallback, useEffect, useState } from 'react';
import { Wrench, LogOut, Package, Tag } from 'lucide-react';
import { useAuth } from '@/lib/auth';
import { supabase, type Category } from '@/lib/supabase';
import AdminLogin from '@/admin/AdminLogin';
import ProductsAdmin from '@/admin/ProductsAdmin';
import CategoriesAdmin from '@/admin/CategoriesAdmin';

export default function AdminApp() {
  const { isAuthenticated, isAdmin, loading, signOut } = useAuth();
  const [tab, setTab] = useState<'products' | 'categories'>('products');
  const [categories, setCategories] = useState<Category[]>([]);

  const loadCategories = useCallback(async () => {
    const { data } = await supabase.from('categories').select('*').order('name');
    setCategories(data ?? []);
  }, []);

  useEffect(() => {
    if (isAdmin) loadCategories();
  }, [isAdmin, loadCategories]);

  if (loading) {
    return <div className="min-h-screen bg-slate-100" />;
  }

  if (!isAuthenticated) {
    return <AdminLogin />;
  }

  if (!isAdmin) {
    return (
      <main className="min-h-screen bg-slate-100 flex items-center justify-center p-6">
        <div className="bg-white rounded-xl p-6 max-w-md space-y-4">
          <h1 className="font-bold text-xl">Acceso administrativo no disponible</h1>
          <p>No se pudieron verificar tus permisos. Tu cuenta y sesión se conservan. Contactá al responsable del sitio o intentá nuevamente.</p>
          <a href="/" className="block text-blue-600">Volver a la tienda</a>
          <button onClick={() => window.location.reload()} className="block text-blue-600">Reintentar</button>
          <button onClick={signOut} className="block text-slate-600">Cerrar sesión</button>
        </div>
      </main>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100">
      <header className="bg-white border-b border-slate-200">
        <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
          <a href="/" className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-blue-600 to-blue-700 flex items-center justify-center">
              <Wrench className="w-4 h-4 text-white" strokeWidth={2.5} />
            </div>
            <span className="font-bold text-slate-900">Panel de administración</span>
          </a>
          <button
            onClick={signOut}
            className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Cerrar sesión
          </button>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-4 py-8">
        <div className="flex gap-2 mb-6 bg-white p-1.5 rounded-xl border border-slate-200 w-fit">
          <button
            onClick={() => setTab('products')}
            className={`flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-lg transition-colors ${
              tab === 'products' ? 'bg-blue-600 text-white' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Package className="w-4 h-4" />
            Productos
          </button>
          <button
            onClick={() => setTab('categories')}
            className={`flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-lg transition-colors ${
              tab === 'categories' ? 'bg-blue-600 text-white' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Tag className="w-4 h-4" />
            Categorías
          </button>
        </div>

        {tab === 'products' ? (
          <ProductsAdmin categories={categories} />
        ) : (
          <CategoriesAdmin categories={categories} onChanged={loadCategories} />
        )}
      </div>
    </div>
  );
}
