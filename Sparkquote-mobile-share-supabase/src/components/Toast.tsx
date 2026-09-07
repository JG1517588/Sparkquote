import { useEffect } from 'react';
import { CheckCircle2, X } from 'lucide-react';

interface Props {
  message: string | null;
  onDismiss: () => void;
}

export function Toast({ message, onDismiss }: Props) {
  useEffect(() => {
    if (!message) return;
    const t = setTimeout(onDismiss, 2200);
    return () => clearTimeout(t);
  }, [message, onDismiss]);

  if (!message) return null;

  return (
    <div className="fixed bottom-6 left-1/2 z-50 -translate-x-1/2 px-4">
      <div className="flex items-center gap-2.5 rounded-lg bg-slate-900 px-4 py-3 text-sm font-medium text-white shadow-lg">
        <CheckCircle2 className="h-4 w-4 text-emerald-400" />
        <span>{message}</span>
        <button onClick={onDismiss} className="ml-1 text-slate-400 hover:text-white">
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
