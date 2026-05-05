// components/dashboard/settings/Toast.tsx
"use client";

import { useEffect, useState } from "react";
import { CheckCircle2, XCircle, X } from "lucide-react";

export interface ToastMessage {
    id: number;
    type: "success" | "error";
    message: string;
}

interface ToastProps {
    toast: ToastMessage;
    onDismiss: (id: number) => void;
}

export function Toast({ toast, onDismiss }: ToastProps) {
    useEffect(() => {
        const timer = setTimeout(() => onDismiss(toast.id), 3500);
        return () => clearTimeout(timer);
    }, [toast.id, onDismiss]);

    return (
        <div className={`
            flex items-center gap-3 px-4 py-3 rounded-2xl shadow-lg border text-sm font-medium
            transition-all duration-300 animate-in slide-in-from-bottom-2
            ${toast.type === "success"
                ? "bg-white border-emerald-200 text-emerald-800"
                : "bg-white border-red-200 text-red-700"
            }
        `}>
            {toast.type === "success"
                ? <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                : <XCircle className="h-4 w-4 text-red-500 shrink-0" />
            }
            <span>{toast.message}</span>
            <button
                onClick={() => onDismiss(toast.id)}
                className="ml-1 text-zinc-300 hover:text-zinc-500 transition"
            >
                <X className="h-3.5 w-3.5" />
            </button>
        </div>
    );
}

export function ToastContainer({ toasts, onDismiss }: {
    toasts: ToastMessage[];
    onDismiss: (id: number) => void;
}) {
    if (toasts.length === 0) return null;
    return (
        <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2">
            {toasts.map((t) => (
                <Toast key={t.id} toast={t} onDismiss={onDismiss} />
            ))}
        </div>
    );
}
