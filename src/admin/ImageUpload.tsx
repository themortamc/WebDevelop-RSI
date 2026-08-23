import { useState, useRef } from 'react';
import { Upload, X, Loader2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';

type ImageUploadProps = {
  value: string | null;
  onChange: (url: string | null) => void;
};

export default function ImageUpload({ value, onChange }: ImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = async (file: File) => {
    setError(null);

    if (!file.type.startsWith('image/')) {
      setError('El archivo tiene que ser una imagen.');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setError('La imagen no puede pesar más de 5MB.');
      return;
    }

    setUploading(true);
    const ext = file.name.split('.').pop();
    const path = `${crypto.randomUUID()}.${ext}`;

    const { error: uploadError } = await supabase.storage
      .from('product-images')
      .upload(path, file, { upsert: false });

    if (uploadError) {
      setError('No se pudo subir la imagen: ' + uploadError.message);
      setUploading(false);
      return;
    }

    const { data } = supabase.storage.from('product-images').getPublicUrl(path);
    onChange(data.publicUrl);
    setUploading(false);
  };

  return (
    <div>
      <label className="block text-sm font-medium text-slate-700 mb-1.5">Foto del producto</label>

      {value ? (
        <div className="relative w-full h-40 rounded-xl overflow-hidden bg-slate-100 border border-slate-200">
          <img src={value} alt="Producto" className="w-full h-full object-cover" />
          <button
            type="button"
            onClick={() => onChange(null)}
            className="absolute top-2 right-2 w-8 h-8 bg-white/90 hover:bg-white rounded-lg flex items-center justify-center text-slate-700 hover:text-red-600 shadow-sm transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          className="w-full h-40 rounded-xl border-2 border-dashed border-slate-300 hover:border-red-400 hover:bg-red-50/30 flex flex-col items-center justify-center gap-2 text-slate-400 hover:text-red-500 transition-colors"
        >
          {uploading ? (
            <>
              <Loader2 className="w-6 h-6 animate-spin" />
              <span className="text-sm">Subiendo...</span>
            </>
          ) : (
            <>
              <Upload className="w-6 h-6" />
              <span className="text-sm">Subir foto desde tu compu o celu</span>
            </>
          )}
        </button>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleFile(file);
          e.target.value = '';
        }}
      />

      {error && <p className="text-xs text-red-600 mt-1.5">{error}</p>}
    </div>
  );
}
