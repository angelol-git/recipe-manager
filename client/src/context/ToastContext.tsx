import { createContext, useState, useCallback, useRef, useEffect } from "react";
import type { ReactNode, Dispatch, SetStateAction } from "react";

export type ToastType = "error" | "success";

export type ToastValue = {
  message: string;
  type: ToastType;
};

export type ToastContextValue = {
  toast: ToastValue | null;
  setToast: Dispatch<SetStateAction<ToastValue | null>>;
  showToast: (message: string, type?: ToastType, duration?: number) => void;
};

export const ToastContext = createContext<ToastContextValue | null>(null);

type ToastProviderProps = {
  children: ReactNode;
};

export function ToastProvider({ children }: ToastProviderProps) {
  const [toast, setToast] = useState<ToastValue | null>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearToastTimeout = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }, []);

  const showToast = useCallback(
    (message: string, type: ToastType = "error", duration = 3000) => {
      clearToastTimeout();
      setToast({ message, type });

      timeoutRef.current = setTimeout(() => {
        setToast(null);
        timeoutRef.current = null;
      }, duration);
    },
    [clearToastTimeout],
  );

  useEffect(() => {
    return () => {
      clearToastTimeout();
    };
  }, [clearToastTimeout]);

  const value = {
    toast,
    setToast,
    showToast,
  };

  return (
    <ToastContext.Provider value={value}>{children}</ToastContext.Provider>
  );
}
