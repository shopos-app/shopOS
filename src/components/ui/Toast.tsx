import * as ToastPrimitive from '@radix-ui/react-toast';
import { CheckCircle2, XCircle, Info, X } from 'lucide-react';
import { createContext, useContext, useState, type ReactNode } from 'react';
import { cn } from '../../utils/cn';

type ToastType = 'success' | 'error' | 'info';

interface ToastItem {
  id: string;
  type: ToastType;
  message: string;
}

interface ToastContextValue {
  toast: (type: ToastType, message: string) => void;
}

const ToastContext = createContext<ToastContextValue>({ toast: () => {} });

export function useToast() {
  return useContext(ToastContext);
}

const icons = {
  success: <CheckCircle2 className="w-4 h-4 text-[var(--success)]" />,
  error:   <XCircle className="w-4 h-4 text-[var(--danger)]" />,
  info:    <Info className="w-4 h-4 text-[var(--primary)]" />,
};

const styles: Record<ToastType, string> = {
  success: 'border-green-200 dark:border-green-800',
  error:   'border-red-200 dark:border-red-800',
  info:    'border-blue-200 dark:border-blue-800',
};

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const toast = (type: ToastType, message: string) => {
    const id = Math.random().toString(36).slice(2);
    setToasts(prev => [...prev, { id, type, message }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 3500);
  };

  return (
    <ToastContext.Provider value={{ toast }}>
      <ToastPrimitive.Provider swipeDirection="right">
        {children}
        {toasts.map(t => (
          <ToastPrimitive.Root
            key={t.id}
            open
            className={cn(
              'flex items-start gap-3 rounded-xl px-4 py-3 shadow-lg border',
              'bg-[var(--bg-surface)] text-[var(--text-primary)]',
              'data-[state=open]:animate-in data-[state=closed]:animate-out',
              'data-[state=closed]:fade-out-80 data-[state=open]:fade-in-0',
              'data-[state=closed]:slide-out-to-right-full data-[state=open]:slide-in-from-top-full',
              styles[t.type]
            )}
          >
            <div className="mt-0.5">{icons[t.type]}</div>
            <ToastPrimitive.Description className="text-sm flex-1">
              {t.message}
            </ToastPrimitive.Description>
            <ToastPrimitive.Close className="text-[var(--text-muted)] hover:text-[var(--text-primary)]">
              <X className="w-4 h-4" />
            </ToastPrimitive.Close>
          </ToastPrimitive.Root>
        ))}
        <ToastPrimitive.Viewport className="fixed bottom-4 right-4 z-[100] flex flex-col gap-2 w-80 max-w-[calc(100vw-2rem)]" />
      </ToastPrimitive.Provider>
    </ToastContext.Provider>
  );
}
