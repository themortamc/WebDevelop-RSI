import { Wrench, MapPin, MessageCircle } from 'lucide-react';
import { WHATSAPP_NUMBER } from '@/lib/config';

type FooterProps = {
  onNavigate: (section: string) => void;
};

export default function Footer({ onNavigate }: FooterProps) {
  const quickLinks = [
    { label: 'Inicio', section: 'inicio' },
    { label: 'Catálogo', section: 'catalogo' },
    { label: 'Categorías', section: 'categorias' },
    { label: 'Nosotros', section: 'nosotros' },
    { label: 'Contacto', section: 'contacto' },
  ];

  const categories = ['Motor', 'Frenos', 'Suspensión', 'Eléctrico', 'Filtros', 'Iluminación'];

  return (
    <footer className="bg-slate-900 text-slate-400">
      <div className="max-w-7xl mx-auto px-4 py-16">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-red-600 to-red-700 flex items-center justify-center">
                <Wrench className="w-5 h-5 text-white" strokeWidth={2.5} />
              </div>
              <div>
                <div className="font-bold text-white text-lg leading-tight">
                  Repuestos San Isidro
                </div>
                <div className="text-[10px] text-slate-500 font-medium tracking-wide">
                  AUTO PARTS & ACCESSORIES
                </div>
              </div>
            </div>
            <p className="text-sm leading-relaxed mb-5">
              Tu tienda de confianza en repuestos automotrices. Más de 25 años brindando
              calidad y servicio experto.
            </p>
          </div>

          {/* Quick links */}
          <div>
            <h3 className="font-bold text-white mb-4 text-sm uppercase tracking-wide">
              Enlaces
            </h3>
            <ul className="space-y-2.5">
              {quickLinks.map((link) => (
                <li key={link.section}>
                  <button
                    onClick={() => onNavigate(link.section)}
                    className="text-sm hover:text-red-400 transition-colors"
                  >
                    {link.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Categories */}
          <div>
            <h3 className="font-bold text-white mb-4 text-sm uppercase tracking-wide">
              Categorías
            </h3>
            <ul className="space-y-2.5">
              {categories.map((cat) => (
                <li key={cat}>
                  <button
                    onClick={() => onNavigate('catalogo')}
                    className="text-sm hover:text-red-400 transition-colors"
                  >
                    {cat}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="font-bold text-white mb-4 text-sm uppercase tracking-wide">
              Contacto
            </h3>
            <ul className="space-y-3">
              <li className="flex items-start gap-3">
                <MapPin className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
                <span className="text-sm">Argentina, Mendoza, Rivadavia — Calle San Isidro N.º 1388</span>
              </li>
              <li className="flex items-start gap-3">
                <MessageCircle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
                <a
                  href={`https://wa.me/${WHATSAPP_NUMBER}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm hover:text-red-400 transition-colors"
                >
                  WhatsApp
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-slate-800 mt-12 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-slate-500">
            © {new Date().getFullYear()} Repuestos San Isidro. Todos los derechos reservados.
          </p>
          <div className="flex items-center gap-4 text-xs text-slate-500">
            <a href="#" className="hover:text-slate-300 transition-colors">Términos y condiciones</a>
            <a href="#" className="hover:text-slate-300 transition-colors">Política de privacidad</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
