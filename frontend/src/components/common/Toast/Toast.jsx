import { createContext, useContext, useState, useCallback, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

const ToastContext = createContext(null);

export const useToast = () => {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within ToastProvider');
  return ctx;
};

let nextId = 0;

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const removeToast = useCallback((id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  const addToast = useCallback((message, type, duration) => {
    const id = ++nextId;
    setToasts(prev => [...prev, { id, message, type }]);
    if (duration > 0) {
      setTimeout(() => removeToast(id), duration);
    }
    return id;
  }, [removeToast]);

  const toast = useMemo(() => ({
    success: (msg) => addToast(msg, 'success', 3000),
    error: (msg) => addToast(msg, 'error', 5000),
    info: (msg) => addToast(msg, 'info', 3000),
    warning: (msg) => addToast(msg, 'warning', 4000),
  }), [addToast]);

  return (
    <ToastContext.Provider value={toast}>
      {children}
      {createPortal(
        <>
          <div className="fixed top-4 right-4 z-[9999] flex flex-col gap-2.5 w-full max-w-[360px] pointer-events-none">
            {toasts.map(t => (
              <ToastItem key={t.id} {...t} onClose={() => removeToast(t.id)} />
            ))}
          </div>
          <style>{`
            @keyframes toastSlideIn {
              from { transform: translateX(calc(100% + 1rem)); opacity: 0; }
              to { transform: translateX(0); opacity: 1; }
            }
            .animate-toast-in {
              animation: toastSlideIn 0.3s cubic-bezier(0.16, 1, 0.3, 1);
            }
          `}</style>
        </>,
        document.body
      )}
    </ToastContext.Provider>
  );
}

const toastConfig = {
  success: { icon: CheckCircle2, iconColor: 'text-emerald-500', bgAccent: 'bg-emerald-500/5 dark:bg-emerald-500/10' },
  error: { icon: AlertCircle, iconColor: 'text-red-500', bgAccent: 'bg-red-500/5 dark:bg-red-500/10' },
  info: { icon: Info, iconColor: 'text-primary', bgAccent: 'bg-primary/5 dark:bg-primary/10' },
  warning: { icon: AlertCircle, iconColor: 'text-amber-500', bgAccent: 'bg-amber-500/5 dark:bg-amber-500/10' },
};

function ToastItem({ message, type, onClose }) {
  const config = toastConfig[type] || toastConfig.info;
  const Icon = config.icon;

  return (
    <div className={`pointer-events-auto flex items-start gap-3 px-4 py-3.5 rounded-xl border border-light-border dark:border-dark-border bg-white dark:bg-dark-card shadow-xl animate-toast-in ${config.bgAccent}`}>
      <Icon className={`w-5 h-5 ${config.iconColor} shrink-0 mt-0.5`} />
      <p className="text-sm font-medium text-light-text dark:text-dark-text flex-1 leading-snug">{message}</p>
      <button
        onClick={onClose}
        className="text-light-muted dark:text-dark-muted hover:text-light-text dark:hover:text-dark-text transition-colors shrink-0 -mt-0.5 -mr-1 p-1 rounded-lg hover:bg-light-surface dark:hover:bg-dark-surface"
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}
