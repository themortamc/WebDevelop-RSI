import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type Category = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  icon_name: string | null;
  created_at: string;
};

export type Product = {
  id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  sku: string;
  brand: string;
  category_id: string | null;
  stock: number;
  image_url: string | null;
  featured: boolean;
  published: boolean;
  rating: number;
  created_at: string;
  category?: Category | null;
};
