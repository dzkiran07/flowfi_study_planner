"use client";

import { createContext, useCallback, useContext, useState } from "react";
import { CheckCircle2, AlertTriangle, AlertCircle, Info, X, type LucideIcon } from "lucide-react";

export type ToastVariant = "success" | "error" | "warning" | "info";

export type ToastOptions = {
  message?: string;
  actionLabel?: string;
  onAction?: () => void;
  /** Auto-dismiss delay in ms. Defaults to 5000. */
  duration?: number;
};

type ToastItem = {
  id: number;
  variant: ToastVariant;
  title: string;
  message?: string;
  actionLabel?: string;
  onAction?: () => void;
  duration: number;
};

type ToastContextType = {
  showToast: (variant: ToastVariant, title: string, options?: ToastOptions) => void;
  success: (title: string, options?: ToastOptions) => void;
  error: (title: string, options?: ToastOptions) => void;
  warning: (title: string, options?: ToastOptions) => void;
  info: (title: string, options?: ToastOptions) => void;
};

const noop = () => {};

const ToastContext = createContext<ToastContextType>({
  showToast: noop,
  success: noop,
  error: noop,
  warning: noop,
  info: noop,
});

const VARIANT_META: Record<
  ToastVariant,
  { icon: LucideIcon; iconBg: string; bg: string; border: string; title: string; bar: string }
> = {
  success: {
    icon: CheckCircle2,
    iconBg: "bg-emerald-500 text-white",
    bg: "bg-emerald-50 dark:bg-emerald-500/10",
    border: "border-emerald-100 dark:border-emerald-500/30",
    title: "text-emerald-700 dark:text-emerald-300",
    bar: "bg-emerald-500",
  },
  warning: {
    icon: AlertTriangle,
    iconBg: "bg-orange-500 text-white",
    bg: "bg-orange-50 dark:bg-orange-500/10",
    border: "border-orange-100 dark:border-orange-500/30",
    title: "text-orange-700 dark:text-orange-300",
    bar: "bg-orange-500",
  },
  info: {
    icon: Info,
    iconBg: "bg-indigo-500 text-white",
    bg: "bg-indigo-50 dark:bg-indigo-500/10",
    border: "border-indigo-100 dark:border-indigo-500/30",
    title: "text-indigo-700 dark:text-indigo-300",
    bar: "bg-indigo-500",
  },
  error: {
    icon: AlertCircle,
    iconBg: "bg-red-500 text-white",
    bg: "bg-red-50 dark:bg-red-500/10",
    border: "border-red-100 dark:border-red-500/30",
    title: "text-red-700 dark:text-red-300",
    bar: "bg-red-500",
  },
};

let nextId = 1;

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const remove = useCallback((id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const showToast = useCallback((variant: ToastVariant, title: string, options: ToastOptions = {}) => {
    const id = nextId++;
    const duration = options.duration ?? 5000;
    setToasts((prev) => [
      ...prev,
      {
        id,
        variant,
        title,
        message: options.message,
        actionLabel: options.actionLabel,
        onAction: options.onAction,
        duration,
      },
    ]);
  }, []);

  const success = useCallback((title: string, options?: ToastOptions) => showToast("success", title, options), [showToast]);
  const error = useCallback((title: string, options?: ToastOptions) => showToast("error", title, options), [showToast]);
  const warning = useCallback((title: string, options?: ToastOptions) => showToast("warning", title, options), [showToast]);
  const info = useCallback((title: string, options?: ToastOptions) => showToast("info", title, options), [showToast]);

  return (
    <ToastContext.Provider value={{ showToast, success, error, warning, info }}>
      {children}
      <div className="pointer-events-none fixed right-4 top-4 z-[200] flex w-full max-w-sm flex-col gap-3">
        {toasts.map((toast) => (
          <ToastCard key={toast.id} toast={toast} onClose={() => remove(toast.id)} />
        ))}
      </div>
    </ToastContext.Provider>
  );
}

function ToastCard({ toast, onClose }: { toast: ToastItem; onClose: () => void }) {
  const meta = VARIANT_META[toast.variant];
  const Icon = meta.icon;

  return (
    <div
      role="status"
      className={`animate-toast-in pointer-events-auto relative overflow-hidden rounded-xl border ${meta.border} ${meta.bg} p-4 shadow-lg backdrop-blur-sm`}
    >
      <div className="flex items-start gap-3">
        <span className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full ${meta.iconBg}`}>
          <Icon className="h-3.5 w-3.5" />
        </span>
        <div className="min-w-0 flex-1">
          <p className={`text-sm font-semibold ${meta.title}`}>{toast.title}</p>
          {toast.message && (
            <p className="mt-0.5 text-sm text-slate-600 dark:text-slate-300">{toast.message}</p>
          )}
          {toast.actionLabel && (
            <button
              type="button"
              onClick={() => {
                toast.onAction?.();
                onClose();
              }}
              className={`mt-1.5 text-sm font-medium underline underline-offset-2 ${meta.title} press-feedback`}
            >
              {toast.actionLabel}
            </button>
          )}
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label="Dismiss notification"
          className="shrink-0 rounded p-0.5 text-slate-400 transition-colors hover:text-slate-600 dark:hover:text-slate-200"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
      <div
        className={`absolute bottom-0 left-0 h-1 w-full origin-left ${meta.bar}`}
        style={{ animation: `toast-progress ${toast.duration}ms linear forwards` }}
        onAnimationEnd={onClose}
      />
    </div>
  );
}

export function useToast() {
  return useContext(ToastContext);
}
