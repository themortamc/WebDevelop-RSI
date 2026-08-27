import { useState, useEffect } from 'react';
import { ShoppingCart, Menu, X, Search, Wrench, MessageCircle } from 'lucide-react';
import { WHATSAPP_NUMBER } from '@/lib/config';

type HeaderProps = {
  cartCount: number;
  onCartClick: () => void;
  onNavigate: (section: string) => void;
  onSearch: (query: string) => void;
  searchValue: string;
};

export default function Header({ cartCount, onCartClick, onNavigate, onSearch, searchValue }: HeaderProps) {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handler);
    return () => window.removeEventListener('scroll', handler);
  }, []);

  const navItems = [
    { label: 'Inicio', section: 'inicio' },
    { label: 'Catálogo', section: 'catalogo' },
    { label: 'Categorías', section: 'categorias' },
    { label: 'Nosotros', section: 'nosotros' },
    { label: 'Contacto', section: 'contacto' },
  ];

  const handleNav = (section: string) => {
    onNavigate(section);
    setMobileOpen(false);
  };

  return (
    <>
      {/* Top bar */}
      <div className="bg-slate-900 text-slate-300 text-xs hidden md:block">
        <div className="max-w-7xl mx-auto px-4 py-2 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <a
              href={`https://wa.me/${WHATSAPP_NUMBER}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 hover:text-white transition-colors"
            >
              <MessageCircle className="w-3.5 h-3.5" />
              Escribinos por WhatsApp
            </a>
            <span className="text-slate-500">|</span>
            <span>Repuestos originales y de calidad</span>
          </div>
          <div className="flex items-center gap-4">
            <span>Más de 25 años de experiencia</span>
            <span className="text-slate-500">|</span>
            <span>Garantía en todos nuestros productos</span>
          </div>
        </div>
      </div>

      <header
        className={`sticky top-0 z-50 transition-all duration-300 ${
          scrolled
            ? 'bg-white shadow-lg shadow-slate-200/50'
            : 'bg-white/95 backdrop-blur-sm'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between h-16 lg:h-20">
            {/* Logo */}
            <button
              onClick={() => handleNav('inicio')}
              className="flex items-center gap-2.5 group"
            >
              <div className="w-10 h-10 lg:w-12 lg:h-12 rounded-xl bg-gradient-to-br from-red-600 to-red-700 flex items-center justify-center shadow-md shadow-red-600/20 group-hover:scale-105 transition-transform">
                <Wrench className="w-5 h-5 lg:w-6 lg:h-6 text-white" strokeWidth={2.5} />
              </div>
              <div className="text-left">
                <div className="font-bold text-slate-900 text-lg lg:text-xl leading-tight">
                  Repuestos San Isidro
                </div>
                <div className="text-[10px] lg:text-xs text-slate-500 leading-tight font-medium tracking-wide">
                  AUTO PARTS & ACCESSORIES
                </div>
              </div>
            </button>

            {/* Desktop nav */}
            <nav className="hidden lg:flex items-center gap-1">
              {navItems.map((item) => (
                <button
                  key={item.section}
                  onClick={() => handleNav(item.section)}
                  className="px-4 py-2 text-sm font-medium text-slate-700 hover:text-red-600 rounded-lg hover:bg-red-50 transition-colors"
                >
                  {item.label}
                </button>
              ))}
            </nav>

            {/* Actions */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setSearchOpen(!searchOpen)}
                className="w-10 h-10 flex items-center justify-center rounded-lg text-slate-700 hover:bg-slate-100 transition-colors"
                aria-label="Buscar"
              >
                {searchOpen ? <X className="w-5 h-5" /> : <Search className="w-5 h-5" />}
              </button>

              <button
                onClick={onCartClick}
                className="relative w-10 h-10 flex items-center justify-center rounded-lg text-slate-700 hover:bg-slate-100 transition-colors"
                aria-label="Carrito"
              >
                <ShoppingCart className="w-5 h-5" />
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-600 text-white text-[10px] font-bold rounded-full flex items-center justify-center animate-[pop_0.2s_ease-out]">
                    {cartCount}
                  </span>
                )}
              </button>

              <button
                onClick={() => setMobileOpen(!mobileOpen)}
                className="lg:hidden w-10 h-10 flex items-center justify-center rounded-lg text-slate-700 hover:bg-slate-100 transition-colors"
                aria-label="Menú"
              >
                {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {/* Search bar */}
          {searchOpen && (
            <div className="pb-4 animate-[slideDown_0.2s_ease-out]">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type="text"
                  value={searchValue}
                  onChange={(e) => onSearch(e.target.value)}
                  placeholder="Buscar repuestos por nombre, marca o SKU..."
                  autoFocus
                  className="w-full pl-12 pr-4 py-3 bg-slate-100 rounded-xl text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-red-500/30 focus:bg-white transition-all"
                />
              </div>
            </div>
          )}
        </div>

        {/* Mobile nav */}
        {mobileOpen && (
          <nav className="lg:hidden border-t border-slate-100 bg-white animate-[slideDown_0.2s_ease-out]">
            <div className="max-w-7xl mx-auto px-4 py-3 flex flex-col gap-1">
              {navItems.map((item) => (
                <button
                  key={item.section}
                  onClick={() => handleNav(item.section)}
                  className="px-4 py-3 text-left text-sm font-medium text-slate-700 hover:text-red-600 rounded-lg hover:bg-red-50 transition-colors"
                >
                  {item.label}
                </button>
              ))}
            </div>
          </nav>
        )}
      </header>
    </>
  );
}
