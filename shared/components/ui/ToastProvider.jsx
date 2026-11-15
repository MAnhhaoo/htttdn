import { createContext, useCallback, useContext, useState } from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const showToast = useCallback(
    (message, type = 'info', duration = 3200) => {
      const id = `${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
      setToasts((prev) => [...prev, { id, message, type }]);
      if (duration > 0) {
        setTimeout(() => removeToast(id), duration);
      }
    },
    [removeToast],
  );

  const toast = {
    success: (msg, duration) => showToast(msg, 'success', duration),
    error: (msg, duration) => showToast(msg, 'error', duration),
    info: (msg, duration) => showToast(msg, 'info', duration),
  };

  return (
    <ToastContext.Provider value={{ showToast, toast }}>
      {children}
      {toasts.length > 0 && (
        <div className="fixed bottom-4 right-4 z-[100] flex flex-col gap-2 max-w-sm w-full pointer-events-none">
          {toasts.map((item) => {
            const isSuccess = item.type === 'success';
            const isError = item.type === 'error';
            const Icon = isSuccess ? CheckCircle2 : isError ? AlertCircle : Info;
            return (
              <div
                key={item.id}
                className={`pointer-events-auto flex items-start gap-2.5 p-3.5 rounded-xl shadow-lg border text-xs font-medium transition-all ${
                  isSuccess
                    ? 'bg-emerald-50 dark:bg-emerald-950/90 border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200'
                    : isError
                      ? 'bg-rose-50 dark:bg-rose-950/90 border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-200'
                      : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100'
                }`}
              >
                <Icon className="w-4 h-4 shrink-0 mt-0.5" />
                <span className="flex-1 leading-relaxed">{item.message}</span>
                <button
                  type="button"
                  onClick={() => removeToast(item.id)}
                  className="opacity-60 hover:opacity-100 p-0.5"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            );
          })}
        </div>
      )}
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    return {
      showToast: (msg) => console.info('[Toast]', msg),
      toast: {
        success: (msg) => console.info('[Toast:success]', msg),
        error: (msg) => console.error('[Toast:error]', msg),
        info: (msg) => console.info('[Toast:info]', msg),
      },
    };
  }
  return ctx;
}

