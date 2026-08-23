import { useEffect, useState, useCallback } from 'react';
import { supabase, type Product, type Category } from '@/lib/supabase';

export function useCategories() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
 setLoading(!cancelled);
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('name');
      if (cancelled) return;
      if (error) {
        setError(error.message);
      } else {
        setCategories(data ?? []);
      }
      setLoading(false);
    })();
    return () => { cancelled = true; };
  }, []);

  return { categories, loading, error };
}

export type ProductFilters = {
  categoryId?: string | null;
  search?: string;
  sort?: 'featured' | 'price-asc' | 'price-desc' | 'name';
  featuredOnly?: boolean;
};

export function useProducts(filters: ProductFilters = {}) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { categoryId, search, sort = 'featured', featuredOnly } = filters;

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    (async () => {
      let query = supabase
        .from('products')
        .select('*, category:categories(*)')
        .eq('published', true);

      if (categoryId) {
        query = query.eq('category_id', categoryId);
      }
      if (search && search.trim()) {
        query = query.or(`name.ilike.%${search.trim()}%,description.ilike.%${search.trim()}%,brand.ilike.%${search.trim()}%,sku.ilike.%${search.trim()}%`);
      }
      if (featuredOnly) {
        query = query.eq('featured', true);
      }
      if (sort === 'price-asc') {
        query = query.order('price', { ascending: true });
      } else if (sort === 'price-desc') {
        query = query.order('price', { ascending: false });
      } else if (sort === 'name') {
        query = query.order('name', { ascending: true });
      } else {
        query = query.order('featured', { ascending: false }).order('rating', { ascending: false });
      }

      const { data, error } = await query.limit(60);
      if (cancelled) return;
      if (error) {
        setError(error.message);
      } else {
        setProducts(data ?? []);
      }
      setLoading(false);
    })();
    return () => { cancelled = true; };
  }, [categoryId, search, sort, featuredOnly]);

  return { products, loading, error };
}

export type CartItem = {
  product: Product;
  quantity: number;
};

export function useCart() {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isOpen, setIsOpen] = useState(false);

  const addItem = useCallback((product: Product, quantity = 1) => {
    setItems((prev) => {
      const existing = prev.find((i) => i.product.id === product.id);
      if (existing) {
        return prev.map((i) =>
          i.product.id === product.id
            ? { ...i, quantity: Math.min(i.quantity + quantity, 99) }
            : i
        );
      }
      return [...prev, { product, quantity }];
    });
    setIsOpen(true);
  }, []);

  const removeItem = useCallback((productId: string) => {
    setItems((prev) => prev.filter((i) => i.product.id !== productId));
  }, []);

  const updateQuantity = useCallback((productId: string, quantity: number) => {
    if (quantity <= 0) {
      setItems((prev) => prev.filter((i) => i.product.id !== productId));
      return;
    }
    setItems((prev) =>
      prev.map((i) =>
        i.product.id === productId ? { ...i, quantity: Math.min(quantity, 99) } : i
      )
    );
  }, []);

  const clear = useCallback(() => setItems([]), []);

  const count = items.reduce((sum, i) => sum + i.quantity, 0);
  const total = items.reduce((sum, i) => sum + i.product.price * i.quantity, 0);

  return { items, isOpen, setIsOpen, addItem, removeItem, updateQuantity, clear, count, total };
}

export function formatPrice(price: number): string {
  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price);
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}
