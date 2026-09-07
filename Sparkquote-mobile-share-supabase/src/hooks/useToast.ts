import { useEffect, useState } from 'react';

export function useToast() {
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!message) return;
    const t = setTimeout(() => setMessage(null), 2200);
    return () => clearTimeout(t);
  }, [message]);

  const show = (msg: string) => setMessage(msg);

  return { message, show };
}

export type Toast = ReturnType<typeof useToast>;
