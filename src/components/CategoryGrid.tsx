import * as Icons from 'lucide-react';
import { ArrowRight } from 'lucide-react';
import type { Category } from '@/lib/supabase';

type CategoryGridProps = {
  categories: Category[];
  onSelect: (categoryId: string | null) => void;
  selectedId?: string | null;
};

export default function CategoryGrid({ categories, onSelect, selectedId }: CategoryGridProps) {
  return (
    <section id="categorias" className="py-16 lg:py-24 bg-slate-50">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-12">
          <span className="text-sm font-semibold text-blue-600 uppercase tracking-wider">
            Categorías
          </span>
          <h2 className="text-3xl lg:text-4xl font-bold text-slate-900 mt-2">
            Explora por categoría
          </h2>
          <p className="text-slate-500 mt-3 max-w-xl mx-auto">
            Encuentra el repuesto que necesitas navegando por nuestras categorías especializadas
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {categories.map((cat, idx) => {
            const Icon = (Icons[cat.icon_name as keyof typeof Icons] as Icons.LucideIcon) ?? Icons.Wrench;
            const isActive = selectedId === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => onSelect(isActive ? null : cat.id)}
                className={`group relative p-6 rounded-2xl border-2 transition-all duration-300 text-left animate-[fadeIn_0.4s_ease-out] ${
                  isActive
                    ? 'border-blue-500 bg-blue-50 shadow-lg shadow-blue-500/10'
                    : 'border-slate-200 bg-white hover:border-blue-300 hover:shadow-lg hover:shadow-slate-200/50 hover:-translate-y-1'
                }`}
                style={{ animationDelay: `${idx * 60}ms` }}
              >
                <div
                  className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 transition-colors ${
                    isActive
                      ? 'bg-blue-600 text-white'
                      : 'bg-slate-100 text-slate-700 group-hover:bg-blue-600 group-hover:text-white'
                  }`}
                >
                  <Icon className="w-6 h-6" strokeWidth={2} />
                </div>
                <h3 className="font-bold text-slate-900 mb-1">{cat.name}</h3>
                <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                  {cat.description ?? 'Repuestos de calidad'}
                </p>
                <div className={`flex items-center gap-1 mt-3 text-xs font-semibold transition-colors ${
                  isActive ? 'text-blue-600' : 'text-slate-400 group-hover:text-blue-600'
                }`}>
                  Ver productos
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
}
