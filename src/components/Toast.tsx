import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  CheckCircle2, 
  XCircle, 
  AlertTriangle, 
  Info, 
  X, 
  Sparkles, 
  Loader2, 
  ArrowRight 
} from 'lucide-react';

export type ToastType = 'success' | 'error' | 'warning' | 'info' | 'loading';

export interface ToastAction {
  label: string;
  onClick: () => void;
}

export interface ToastItem {
  id: string;
  type: ToastType;
  title: string;
  description?: string;
  duration?: number;
  action?: ToastAction;
  createdAt: number;
}

interface ToastContextType {
  toasts: ToastItem[];
  addToast: (toast: Omit<ToastItem, 'id' | 'createdAt'>) => string;
  removeToast: (id: string) => void;
  success: (title: string, description?: string, options?: Partial<ToastItem>) => string;
  error: (title: string, description?: string, options?: Partial<ToastItem>) => string;
  warning: (title: string, description?: string, options?: Partial<ToastItem>) => string;
  info: (title: string, description?: string, options?: Partial<ToastItem>) => string;
  loading: (title: string, description?: string) => string;
}

const ToastContext = createContext<ToastContextType | null>(null);

// Event-based global dispatch for imperative calls `toast.success(...)` outside React components
type ToastEventListener = (toast: ToastItem) => void;
type DismissEventListener = (id: string) => void;

const listeners: Set<ToastEventListener> = new Set();
const dismissListeners: Set<DismissEventListener> = new Set();

export const toast = {
  success: (title: string, description?: string, options?: Partial<ToastItem>): string => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const item: ToastItem = {
      id,
      type: 'success',
      title,
      description,
      duration: options?.duration ?? 4000,
      action: options?.action,
      createdAt: Date.now(),
      ...options,
    };
    listeners.forEach((fn) => fn(item));
    return id;
  },
  error: (title: string, description?: string, options?: Partial<ToastItem>): string => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const item: ToastItem = {
      id,
      type: 'error',
      title,
      description,
      duration: options?.duration ?? 5000,
      action: options?.action,
      createdAt: Date.now(),
      ...options,
    };
    listeners.forEach((fn) => fn(item));
    return id;
  },
  warning: (title: string, description?: string, options?: Partial<ToastItem>): string => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const item: ToastItem = {
      id,
      type: 'warning',
      title,
      description,
      duration: options?.duration ?? 4500,
      action: options?.action,
      createdAt: Date.now(),
      ...options,
    };
    listeners.forEach((fn) => fn(item));
    return id;
  },
  info: (title: string, description?: string, options?: Partial<ToastItem>): string => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const item: ToastItem = {
      id,
      type: 'info',
      title,
      description,
      duration: options?.duration ?? 4000,
      action: options?.action,
      createdAt: Date.now(),
      ...options,
    };
    listeners.forEach((fn) => fn(item));
    return id;
  },
  loading: (title: string, description?: string): string => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const item: ToastItem = {
      id,
      type: 'loading',
      title,
      description,
      duration: 0, // indefinite until dismissed
      createdAt: Date.now(),
    };
    listeners.forEach((fn) => fn(item));
    return id;
  },
  dismiss: (id: string) => {
    dismissListeners.forEach((fn) => fn(id));
  },
};

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    return {
      toasts: [],
      addToast: (t: any) => toast.success(t.title, t.description),
      removeToast: toast.dismiss,
      success: toast.success,
      error: toast.error,
      warning: toast.warning,
      info: toast.info,
      loading: toast.loading,
    };
  }
  return ctx;
}

// -------------------------------------------------------------
// INDIVIDUAL TOAST CARD COMPONENT
// -------------------------------------------------------------

interface ToastCardProps {
  item: ToastItem;
  onDismiss: (id: string) => void;
}

const ToastCard: React.FC<ToastCardProps> = ({
  item,
  onDismiss,
}) => {
  const [isPaused, setIsPaused] = useState(false);
  const [remainingTime, setRemainingTime] = useState(item.duration || 4000);
  const totalDuration = item.duration || 4000;
  const isAutoDismiss = totalDuration > 0;

  useEffect(() => {
    if (!isAutoDismiss || isPaused) return;

    const startTime = Date.now();
    const startRemaining = remainingTime;

    const timer = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const nextRemaining = Math.max(0, startRemaining - elapsed);
      setRemainingTime(nextRemaining);

      if (nextRemaining <= 0) {
        clearInterval(timer);
        onDismiss(item.id);
      }
    }, 50);

    return () => clearInterval(timer);
  }, [isAutoDismiss, isPaused, item.id, onDismiss]);

  const progressPercent = isAutoDismiss ? (remainingTime / totalDuration) * 100 : 100;

  const getTypeStyles = () => {
    switch (item.type) {
      case 'success':
        return {
          icon: <CheckCircle2 className="h-5 w-5 text-[#22c55e]" />,
          iconBg: 'bg-[#22c55e]/15 border-[#22c55e]/30 text-[#22c55e]',
          border: 'border-[#22c55e]/40 hover:border-[#22c55e]/60',
          glow: 'shadow-[0_12px_40px_rgba(0,0,0,0.85),0_0_25px_rgba(34,197,94,0.15)]',
          progressBar: 'bg-gradient-to-r from-[#22c55e] to-[#a3e635]',
          badge: 'bg-[#22c55e]/10 text-[#22c55e]',
          tag: 'Sucesso',
        };
      case 'error':
        return {
          icon: <XCircle className="h-5 w-5 text-[#ef4444]" />,
          iconBg: 'bg-[#ef4444]/15 border-[#ef4444]/30 text-[#ef4444]',
          border: 'border-[#ef4444]/40 hover:border-[#ef4444]/60',
          glow: 'shadow-[0_12px_40px_rgba(0,0,0,0.85),0_0_25px_rgba(239,68,68,0.15)]',
          progressBar: 'bg-gradient-to-r from-[#ef4444] to-[#f87171]',
          badge: 'bg-[#ef4444]/10 text-[#ef4444]',
          tag: 'Erro',
        };
      case 'warning':
        return {
          icon: <AlertTriangle className="h-5 w-5 text-[#f59e0b]" />,
          iconBg: 'bg-[#f59e0b]/15 border-[#f59e0b]/30 text-[#f59e0b]',
          border: 'border-[#f59e0b]/40 hover:border-[#f59e0b]/60',
          glow: 'shadow-[0_12px_40px_rgba(0,0,0,0.85),0_0_25px_rgba(245,158,11,0.15)]',
          progressBar: 'bg-gradient-to-r from-[#f59e0b] to-[#fbbf24]',
          badge: 'bg-[#f59e0b]/10 text-[#f59e0b]',
          tag: 'Aviso',
        };
      case 'loading':
        return {
          icon: <Loader2 className="h-5 w-5 text-[#38bdf8] animate-spin" />,
          iconBg: 'bg-[#38bdf8]/15 border-[#38bdf8]/30 text-[#38bdf8]',
          border: 'border-[#38bdf8]/40 hover:border-[#38bdf8]/60',
          glow: 'shadow-[0_12px_40px_rgba(0,0,0,0.85),0_0_25px_rgba(56,189,248,0.15)]',
          progressBar: 'bg-gradient-to-r from-[#38bdf8] to-[#818cf8] animate-pulse',
          badge: 'bg-[#38bdf8]/10 text-[#38bdf8]',
          tag: 'Processando',
        };
      case 'info':
      default:
        return {
          icon: <Sparkles className="h-5 w-5 text-[#a3e635]" />,
          iconBg: 'bg-[#a3e635]/15 border-[#a3e635]/30 text-[#a3e635]',
          border: 'border-[#a3e635]/40 hover:border-[#a3e635]/60',
          glow: 'shadow-[0_12px_40px_rgba(0,0,0,0.85),0_0_25px_rgba(163,230,53,0.15)]',
          progressBar: 'bg-gradient-to-r from-[#a3e635] to-[#22c55e]',
          badge: 'bg-[#a3e635]/10 text-[#a3e635]',
          tag: 'Informação',
        };
    }
  };

  const style = getTypeStyles();

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: -20, scale: 0.92, filter: 'blur(10px)' }}
      animate={{ opacity: 1, y: 0, scale: 1, filter: 'blur(0px)' }}
      exit={{ opacity: 0, y: -16, scale: 0.94, filter: 'blur(8px)', transition: { duration: 0.2 } }}
      transition={{ type: 'spring', damping: 25, stiffness: 350 }}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      className={`relative w-full max-w-sm sm:max-w-md overflow-hidden rounded-2xl border bg-[#0a0f0b]/95 backdrop-blur-2xl p-4 transition-all duration-300 pointer-events-auto select-none ${style.border} ${style.glow}`}
    >
      {/* Subtle top reflective rim highlight */}
      <div className="absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-white/20 to-transparent" />

      <div className="flex items-start gap-3.5">
        {/* Type Icon with subtle aura */}
        <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border ${style.iconBg}`}>
          {style.icon}
        </div>

        {/* Content Area */}
        <div className="flex-1 min-w-0 pr-6">
          <div className="flex items-center gap-2 mb-0.5">
            <span className={`text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-full ${style.badge}`}>
              {style.tag}
            </span>
          </div>

          <h4 className="font-display text-sm font-bold text-white tracking-tight leading-snug">
            {item.title}
          </h4>

          {item.description && (
            <p className="mt-1 text-xs text-neutral-300 leading-relaxed font-sans">
              {item.description}
            </p>
          )}

          {/* Action button if present */}
          {item.action && (
            <div className="mt-2.5">
              <button
                type="button"
                onClick={() => {
                  item.action?.onClick();
                  onDismiss(item.id);
                }}
                className="inline-flex items-center gap-1.5 text-xs font-bold text-[#a3e635] hover:text-white transition-colors bg-white/5 hover:bg-white/10 px-2.5 py-1 rounded-lg border border-[#a3e635]/30 cursor-pointer"
              >
                <span>{item.action.label}</span>
                <ArrowRight className="h-3 w-3" />
              </button>
            </div>
          )}
        </div>

        {/* Close Button */}
        <button
          type="button"
          onClick={() => onDismiss(item.id)}
          className="absolute right-3 top-3 p-1 rounded-lg text-neutral-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          title="Fechar notificação"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* Progress Bar Countdown Indicator */}
      {isAutoDismiss && (
        <div className="absolute bottom-0 inset-x-0 h-[3px] bg-neutral-900/80 overflow-hidden">
          <motion.div
            className={`h-full ${style.progressBar}`}
            style={{ width: `${progressPercent}%` }}
            transition={{ ease: 'linear', duration: 0.05 }}
          />
        </div>
      )}
    </motion.div>
  );
}

// -------------------------------------------------------------
// TOAST PROVIDER & CONTAINER
// -------------------------------------------------------------

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const addToast = useCallback((toastData: Omit<ToastItem, 'id' | 'createdAt'>) => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const newToast: ToastItem = {
      id,
      ...toastData,
      createdAt: Date.now(),
    };
    setToasts((prev) => [newToast, ...prev.slice(0, 4)]); // Keep maximum 5 stacked toasts
    return id;
  }, []);

  // Listen to imperative calls
  useEffect(() => {
    const handleAdd = (toastItem: ToastItem) => {
      setToasts((prev) => [toastItem, ...prev.slice(0, 4)]);
    };

    const handleDismiss = (id: string) => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    };

    listeners.add(handleAdd);
    dismissListeners.add(handleDismiss);

    return () => {
      listeners.delete(handleAdd);
      dismissListeners.delete(handleDismiss);
    };
  }, []);

  const success = useCallback(
    (title: string, description?: string, options?: Partial<ToastItem>) => {
      return addToast({ type: 'success', title, description, duration: 4000, ...options });
    },
    [addToast]
  );

  const error = useCallback(
    (title: string, description?: string, options?: Partial<ToastItem>) => {
      return addToast({ type: 'error', title, description, duration: 5000, ...options });
    },
    [addToast]
  );

  const warning = useCallback(
    (title: string, description?: string, options?: Partial<ToastItem>) => {
      return addToast({ type: 'warning', title, description, duration: 4500, ...options });
    },
    [addToast]
  );

  const info = useCallback(
    (title: string, description?: string, options?: Partial<ToastItem>) => {
      return addToast({ type: 'info', title, description, duration: 4000, ...options });
    },
    [addToast]
  );

  const loading = useCallback(
    (title: string, description?: string) => {
      return addToast({ type: 'loading', title, description, duration: 0 });
    },
    [addToast]
  );

  return (
    <ToastContext.Provider
      value={{
        toasts,
        addToast,
        removeToast,
        success,
        error,
        warning,
        info,
        loading,
      }}
    >
      {children}

      {/* Floating Stacked Toasts Container */}
      <div 
        aria-live="polite"
        className="fixed top-5 right-5 z-[99999] flex flex-col gap-2.5 max-w-sm sm:max-w-md w-full px-4 sm:px-0 pointer-events-none"
      >
        <AnimatePresence mode="popLayout">
          {toasts.map((toastItem) => (
            <ToastCard key={toastItem.id} item={toastItem} onDismiss={removeToast} />
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}

export default ToastProvider;
