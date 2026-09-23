import { useState, useRef, useCallback } from 'react';
import Header from '@/components/Header';
import Hero from '@/components/Hero';
import CategoryGrid from '@/components/CategoryGrid';
import FeaturedProducts from '@/components/FeaturedProducts';
import Catalog from '@/components/Catalog';
import About from '@/components/About';
import Contact from '@/components/Contact';
import Footer from '@/components/Footer';
import CartDrawer from '@/components/CartDrawer';
import QuickViewModal from '@/components/QuickViewModal';
import Toast from '@/components/Toast';
import { useCategories, useCart } from '@/lib/hooks';
import { WHATSAPP_NUMBER } from '@/lib/config';
import type { Product } from '@/lib/supabase';

export default function App() {
  const { categories } = useCategories();
  const cart = useCart();
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  const catalogRef = useRef<HTMLDivElement>(null);

  const scrollToSection = useCallback((section: string) => {
    const element = document.getElementById(section);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, []);

  const handleAddToCart = useCallback(
    (product: Product, quantity = 1) => {
      cart.addItem(product, quantity);
      setToast(`${product.name} agregado al carrito`);
    },
    [cart]
  );

  const handleCheckout = useCallback(() => {
    const lines = cart.items.map(
      (item) => `• ${item.quantity}x ${item.product.name} (SKU ${item.product.sku})`
    );
    const message = [
      '¡Hola! Quiero consultar precio y disponibilidad de este pedido:',
      '',
      ...lines,
    ].join('\n');

    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`, '_blank');

    cart.setIsOpen(false);
    setToast('Te llevamos a WhatsApp para confirmar tu pedido.');
    cart.clear();
  }, [cart]);

  const handleCategorySelect = useCallback(
    (categoryId: string | null) => {
      setSelectedCategory(categoryId);
      setTimeout(() => scrollToSection('catalogo'), 100);
    },
    [scrollToSection]
  );

  return (
    <div className="min-h-screen bg-white">
      <Header
        cartCount={cart.count}
        onCartClick={() => cart.setIsOpen(true)}
        onNavigate={scrollToSection}
        onSearch={setSearch}
        searchValue={search}
      />

      <main>
        <Hero
          onShopNow={() => scrollToSection('catalogo')}
          onViewCategories={() => scrollToSection('categorias')}
        />

        <CategoryGrid
          categories={categories}
          onSelect={handleCategorySelect}
          selectedId={selectedCategory}
        />

        <FeaturedProducts
          onAddToCart={handleAddToCart}
          onQuickView={setQuickViewProduct}
        />

        <Catalog
          categories={categories}
          selectedCategory={selectedCategory}
          onCategoryChange={setSelectedCategory}
          search={search}
          onAddToCart={handleAddToCart}
          onQuickView={setQuickViewProduct}
          catalogRef={catalogRef}
        />

        <About />
        <Contact />
      </main>

      <Footer onNavigate={scrollToSection} />

      <CartDrawer
        isOpen={cart.isOpen}
        onClose={() => cart.setIsOpen(false)}
        items={cart.items}
        onUpdateQuantity={cart.updateQuantity}
        onRemove={cart.removeItem}
        onClear={cart.clear}
        onCheckout={handleCheckout}
      />

      <QuickViewModal
        product={quickViewProduct}
        onClose={() => setQuickViewProduct(null)}
        onAddToCart={handleAddToCart}
      />

      {toast && <Toast message={toast} onClose={() => setToast(null)} />}
    </div>
  );
}
