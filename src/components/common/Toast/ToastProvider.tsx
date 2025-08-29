import { createContext, useCallback, useContext, useMemo, useState } from "react";
import styles from "./ToastProvider.module.css";

type ToastType = "info" | "success" | "error";

type Toast = {
  id: string;
  type: ToastType;
  message: string;
  durationMs?: number;
};

type ToastContextValue = {
  showToast: (t: Omit<Toast, "id"> & { id?: string }) => string;
  dismissToast: (id: string) => void;
};

const ToastContext = createContext<ToastContextValue | undefined>(undefined);

export const useToast = (): ToastContextValue => {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within ToastProvider");
  return ctx;
};

export const ToastProvider: React.FC<React.PropsWithChildren> = ({ children }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const showToast = useCallback(
    (t: Omit<Toast, "id"> & { id?: string }) => {
      const id = t.id ?? Math.random().toString(36).slice(2);
      const toast: Toast = { id, type: t.type, message: t.message, durationMs: t.durationMs };
      setToasts((prev) => [...prev, toast]);
      if (toast.durationMs !== 0) {
        const timeout = setTimeout(() => dismissToast(id), toast.durationMs ?? 3000);
        // No need to store timeout refs as we remove toast anyway
        void timeout;
      }
      return id;
    },
    [dismissToast]
  );

  const value = useMemo(() => ({ showToast, dismissToast }), [showToast, dismissToast]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className={styles.container}>
        {toasts.map((t) => (
          <div key={t.id} className={`${styles.toast} ${styles[t.type]}`}>
            {t.message}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};


