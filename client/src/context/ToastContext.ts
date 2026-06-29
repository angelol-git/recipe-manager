import { createContext } from "react";
import type { Dispatch, SetStateAction } from "react";

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
