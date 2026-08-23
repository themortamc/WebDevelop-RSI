import { ShieldCheck, Truck, Clock, ArrowRight } from 'lucide-react';

type HeroProps = {
  onShopNow: () => void;
  onViewCategories: () => void;
};

export default function Hero({ onShopNow, onViewCategories }: HeroProps) {
  return (
    <section id="inicio" className="relative overflow-hidden bg-slate-900">
      {/* Background image */}
      <div className="absolute inset-0">
        <img
          src="https://images.pexels.com/photos/5158155/pexels-photo-5158155.jpeg?auto=compress&cs=tinysrgb&w=1920"
          alt="Repuestos de automóviles"
          className="w-full h-full object-cover opacity-30"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-slate-900 via-slate-900/90 to-slate-900/40" />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 py-20 lg:py-32">
        <div className="max-w-2xl">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-red-600/20 border border-red-500/30 mb-6 animate-[fadeIn_0.6s_ease-out]">
            <ShieldCheck className="w-4 h-4 text-red-400" />
            <span className="text-sm font-medium text-red-300">Más de 25 años de experiencia</span>
          </div>

          <h1 className="text-4xl lg:text-6xl font-bold text-white leading-[1.1] mb-6 animate-[fadeIn_0.7s_ease-out]">
            Repuestos originales para
            <span className="block text-red-500">tu vehículo</span>
          </h1>

          <p className="text-lg text-slate-300 mb-8 max-w-xl leading-relaxed animate-[fadeIn_0.8s_ease-out]">
            Encuentra las mejores marcas en repuestos y accesorios automotrices.
            Calidad garantizada, asesoría experta y envíos a todo el país.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 mb-12 animate-[fadeIn_0.9s_ease-out]">
            <button
              onClick={onShopNow}
              className="group inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-xl shadow-lg shadow-red-600/30 hover:shadow-red-600/40 hover:scale-[1.02] transition-all"
            >
              Ver Catálogo
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
            <button
              onClick={onViewCategories}
              className="inline-flex items-center justify-center px-6 py-3.5 bg-white/10 hover:bg-white/15 text-white font-semibold rounded-xl border border-white/20 backdrop-blur-sm transition-all"
            >
              Explorar Categorías
            </button>
          </div>

          {/* Trust indicators */}
          <div className="grid grid-cols-3 gap-4 max-w-lg animate-[fadeIn_1s_ease-out]">
            <div className="text-center sm:text-left">
              <div className="flex items-center justify-center sm:justify-start gap-2 mb-1">
                <Truck className="w-5 h-5 text-red-400" />
                <span className="text-white font-bold text-lg">24h</span>
              </div>
              <p className="text-xs text-slate-400">Envío express</p>
            </div>
            <div className="text-center sm:text-left">
              <div className="flex items-center justify-center sm:justify-start gap-2 mb-1">
                <ShieldCheck className="w-5 h-5 text-red-400" />
                <span className="text-white font-bold text-lg">100%</span>
              </div>
              <p className="text-xs text-slate-400">Garantía real</p>
            </div>
            <div className="text-center sm:text-left">
              <div className="flex items-center justify-center sm:justify-start gap-2 mb-1">
                <Clock className="w-5 h-5 text-red-400" />
                <span className="text-white font-bold text-lg">25+</span>
              </div>
              <p className="text-xs text-slate-400">Años de experiencia</p>
            </div>
          </div>
        </div>
      </div>

      {/* Wave divider */}
      <div className="relative">
        <svg className="w-full h-12 text-white" viewBox="0 0 1440 48" preserveAspectRatio="none" fill="currentColor">
          <path d="M0 48L1440 0L1440 48L0 48Z" />
        </svg>
      </div>
    </section>
  );
}
