// components/dashboard/settings/Toggle.tsx
"use client";

interface ToggleProps {
    checked: boolean;
    onChange: (checked: boolean) => void;
    disabled?: boolean;
    label?: string;
    description?: string;
}

export default function Toggle({ checked, onChange, disabled, label, description }: ToggleProps) {
    return (
        <div className="flex items-center justify-between gap-4 py-1">
            {(label || description) && (
                <div className="flex-1 min-w-0">
                    {label && (
                        <p className="text-sm font-semibold text-zinc-800">{label}</p>
                    )}
                    {description && (
                        <p className="text-xs text-zinc-400 font-medium mt-0.5">{description}</p>
                    )}
                </div>
            )}
            <button
                role="switch"
                aria-checked={checked}
                onClick={() => !disabled && onChange(!checked)}
                disabled={disabled}
                className={`
                    relative shrink-0 h-6 w-11 rounded-full border-2 transition-all duration-200
                    focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2
                    ${checked
                        ? "bg-blue-600 border-blue-600"
                        : "bg-zinc-200 border-zinc-200"
                    }
                    ${disabled ? "opacity-40 cursor-not-allowed" : "cursor-pointer"}
                `}
            >
                <span
                    className={`
                        block h-4 w-4 rounded-full bg-white shadow-sm transition-transform duration-200
                        ${checked ? "translate-x-5" : "translate-x-0"}
                    `}
                />
            </button>
        </div>
    );
}
