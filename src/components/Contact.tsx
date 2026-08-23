import { useState } from 'react';
import { MapPin, MessageCircle, Mail, Clock, Send, CheckCircle2 } from 'lucide-react';
import { WHATSAPP_NUMBER } from '@/lib/config';

export default function Contact() {
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', phone: '', message: '' });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      setForm({ name: '', email: '', phone: '', message: '' });
    }, 3000);
  };

  const contactInfo = [
    {
      icon: MapPin,
      title: 'Dirección',
      lines: ['Av. San Isidro 1234', 'Lima, Perú'],
    },
    {
      icon: MessageCircle,
      title: 'WhatsApp',
      lines: ['Respondemos por WhatsApp'],
      href: `https://wa.me/${WHATSAPP_NUMBER}`,
    },
    {
      icon: Mail,
      title: 'Email',
      lines: ['ventas@repuestossanisidro.com', 'info@repuestossanisidro.com'],
    },
    {
      icon: Clock,
      title: 'Horario',
      lines: ['Lun - Vie: 8:00 - 18:00', 'Sáb: 9:00 - 14:00'],
    },
  ];

  return (
    <section id="contacto" className="py-16 lg:py-24 bg-white scroll-mt-24">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-12">
          <span className="text-sm font-semibold text-red-600 uppercase tracking-wider">
            Contacto
          </span>
          <h2 className="text-3xl lg:text-4xl font-bold text-slate-900 mt-2">
            ¿Necesitas ayuda? Escríbenos
          </h2>
          <p className="text-slate-500 mt-3 max-w-xl mx-auto">
            Nuestro equipo está listo para asesorarte y ayudarte a encontrar el repuesto que necesitas
          </p>
        </div>

        <div className="grid lg:grid-cols-5 gap-8">
          {/* Contact info */}
          <div className="lg:col-span-2 space-y-4">
            {contactInfo.map((info) => {
              const Wrapper = info.href ? 'a' : 'div';
              return (
                <Wrapper
                  key={info.title}
                  {...(info.href
                    ? { href: info.href, target: '_blank', rel: 'noopener noreferrer' }
                    : {})}
                  className="flex gap-4 p-5 rounded-2xl bg-slate-50 border border-slate-100 hover:border-slate-200 transition-colors"
                >
                  <div className="w-11 h-11 rounded-xl bg-red-600 flex items-center justify-center flex-shrink-0">
                    <info.icon className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 mb-1">{info.title}</h3>
                    {info.lines.map((line) => (
                      <p key={line} className="text-sm text-slate-600 leading-relaxed">
                        {line}
                      </p>
                    ))}
                  </div>
                </Wrapper>
              );
            })}
          </div>

          {/* Form */}
          <div className="lg:col-span-3">
            <form
              onSubmit={handleSubmit}
              className="bg-slate-50 rounded-2xl p-6 lg:p-8 border border-slate-100"
            >
              {submitted ? (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                  <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mb-4">
                    <CheckCircle2 className="w-8 h-8 text-green-600" />
                  </div>
                  <h3 className="font-bold text-xl text-slate-900 mb-2">¡Mensaje enviado!</h3>
                  <p className="text-slate-500">Te contactaremos lo antes posible.</p>
                </div>
              ) : (
                <>
                  <div className="grid sm:grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1.5">
                        Nombre completo
                      </label>
                      <input
                        type="text"
                        required
                        value={form.name}
                        onChange={(e) => setForm({ ...form, name: e.target.value })}
                        className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-red-500/30 focus:border-red-500 transition-all"
                        placeholder="Tu nombre"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1.5">
                        Teléfono
                      </label>
                      <input
                        type="tel"
                        required
                        value={form.phone}
                        onChange={(e) => setForm({ ...form, phone: e.target.value })}
                        className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-red-500/30 focus:border-red-500 transition-all"
                        placeholder="+51 ..."
                      />
                    </div>
                  </div>
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">
                      Email
                    </label>
                    <input
                      type="email"
                      required
                      value={form.email}
                      onChange={(e) => setForm({ ...form, email: e.target.value })}
                      className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-red-500/30 focus:border-red-500 transition-all"
                      placeholder="tucorreo@email.com"
                    />
                  </div>
                  <div className="mb-6">
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">
                      Mensaje
                    </label>
                    <textarea
                      required
                      rows={5}
                      value={form.message}
                      onChange={(e) => setForm({ ...form, message: e.target.value })}
                      className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-red-500/30 focus:border-red-500 transition-all resize-none"
                      placeholder="Cuéntanos qué repuesto estás buscando..."
                    />
                  </div>
                  <button
                    type="submit"
                    className="w-full py-3.5 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-xl shadow-lg shadow-red-600/20 hover:scale-[1.01] transition-all flex items-center justify-center gap-2"
                  >
                    <Send className="w-5 h-5" />
                    Enviar mensaje
                  </button>
                </>
              )}
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}
