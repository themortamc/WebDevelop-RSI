import { useEffect } from 'react';
import { CheckCircle2, X } from 'lucide-react';

type ToastProps = {
  message: string;
  onClose: () => void;
};

export default function Toast({ message, onClose }: ToastProps) {
  useEffect(() => {
    const timer = setTimeout(onClose, 2500);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[70] animate-[slideUp_0.3s_ease-out]">
      <div className="flex items-center gap-3 px-5 py-3.5 bg-slate-900 text-white rounded-xl shadow-2xl">
        <CheckCircle2 className="w-5 h-5 text-green-400 flex-shrink-0" />
        <span className="text-sm font-medium">{message}</span>
        <button onClick={onClose} className="ml-2 text-slate-400 hover:text-white transition-colors">
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
