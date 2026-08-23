import { Wrench, ShieldCheck, Truck, Headphones, Award, Users, Building2, CheckCircle2 } from 'lucide-react';

export default function About() {
  const stats = [
    { icon: Users, value: '5,000+', label: 'Clientes satisfechos' },
    { icon: Award, value: '25+', label: 'Años de experiencia' },
    { icon: Truck, value: '24h', label: 'Envío express' },
    { icon: ShieldCheck, value: '100%', label: 'Garantía real' },
  ];

  const features = [
    {
      icon: ShieldCheck,
      title: 'Calidad Garantizada',
      description: 'Todos nuestros repuestos cuentan con garantía y son de marcas reconocidas mundialmente.',
    },
    {
      icon: Truck,
      title: 'Envío a Todo el País',
      description: 'Despachamos a cualquier ciudad con entrega en 24 a 48 horas hábiles.',
    },
    {
      icon: Headphones,
      title: 'Asesoría Experta',
      description: 'Nuestro equipo te ayuda a encontrar el repuesto correcto para tu vehículo.',
    },
    {
      icon: Award,
      title: 'Mejores Marcas',
      description: 'Trabajamos con Bosch, Brembo, NGK, Michelin y más marcas de primera línea.',
    },
  ];

  return (
    <section id="nosotros" className="py-16 lg:py-24 bg-slate-50 scroll-mt-24">
      <div className="max-w-7xl mx-auto px-4">
        {/* Story */}
        <div className="grid lg:grid-cols-2 gap-12 items-center mb-20">
          <div>
            <span className="text-sm font-semibold text-red-600 uppercase tracking-wider">
              Nosotros
            </span>
            <h2 className="text-3xl lg:text-4xl font-bold text-slate-900 mt-2 mb-6">
              Más de 25 años abasteciendo al sector automotriz
            </h2>
            <p className="text-slate-600 leading-relaxed mb-4">
              En <strong className="text-slate-900">Repuestos San Isidro</strong> somos una empresa
              dedicada a la venta de repuestos y accesorios automotrices con más de dos décadas de
              experiencia en el rubro. Nos destacamos por ofrecer productos de calidad original y
              de las mejores marcas del mercado.
            </p>
            <p className="text-slate-600 leading-relaxed mb-6">
              Nuestro compromiso es brindar a cada cliente la mejor asesoría técnica para encontrar
              el repuesto adecuado para su vehículo, garantizando compatibilidad, durabilidad y el
              mejor precio del mercado.
            </p>
            <div className="space-y-2.5">
              {[
                'Repuestos originales y de aftermarket de calidad',
                'Asesoría técnica especializada sin costo',
                'Garantía en todos nuestros productos',
                'Atención personalizada a talleres y particulares',
              ].map((item) => (
                <div key={item} className="flex items-center gap-3">
                  <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0" />
                  <span className="text-sm text-slate-700">{item}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="relative">
            <div className="relative rounded-2xl overflow-hidden shadow-2xl">
              <img
                src="https://images.pexels.com/photos/4480461/pexels-photo-4480461.jpeg?auto=compress&cs=tinysrgb&w=940"
                alt="Taller de repuestos automotrices"
                className="w-full aspect-[4/3] object-cover"
              />
            </div>
            <div className="absolute -bottom-6 -left-6 bg-white rounded-2xl shadow-xl p-5 hidden sm:block">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-red-600 flex items-center justify-center">
                  <Building2 className="w-6 h-6 text-white" />
                </div>
                <div>
                  <div className="font-bold text-slate-900">San Isidro</div>
                  <div className="text-xs text-slate-500">Empresa confiable</div>
                </div>
              </div>
            </div>
            <div className="absolute -top-4 -right-4 bg-red-600 text-white rounded-2xl shadow-xl p-4 hidden sm:block">
              <div className="flex items-center gap-2">
                <Wrench className="w-5 h-5" />
                <span className="font-bold text-sm">Desde 1999</span>
              </div>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-20">
          {stats.map((stat) => (
            <div
              key={stat.label}
              className="bg-white rounded-2xl p-6 text-center border border-slate-100 hover:shadow-lg hover:shadow-slate-200/50 transition-shadow"
            >
              <div className="w-12 h-12 rounded-xl bg-red-50 flex items-center justify-center mx-auto mb-3">
                <stat.icon className="w-6 h-6 text-red-600" />
              </div>
              <div className="text-3xl font-bold text-slate-900 mb-1">{stat.value}</div>
              <div className="text-sm text-slate-500">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Features */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="bg-white rounded-2xl p-6 border border-slate-100 hover:border-red-200 hover:shadow-lg hover:shadow-slate-200/40 transition-all"
            >
              <div className="w-11 h-11 rounded-xl bg-slate-900 flex items-center justify-center mb-4">
                <feature.icon className="w-5 h-5 text-white" />
              </div>
              <h3 className="font-bold text-slate-900 mb-2">{feature.title}</h3>
              <p className="text-sm text-slate-500 leading-relaxed">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
