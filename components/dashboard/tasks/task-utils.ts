// components/tasks/task-utils.ts
// Single source of truth for all shared task UI constants and helpers.
// Imported by: TaskCard, TaskRow, ApplyButton, BookmarkButton, FindTasks, TasksSection.

// ─── Category config ──────────────────────────────────────────────────────────

export const CATEGORY_CONFIG: Record<
    string,
    { bg: string; text: string; dot: string; iconBg: string }
> = {
    Moving:      { bg: "bg-sky-50",    text: "text-sky-700",    dot: "bg-sky-400",    iconBg: "bg-sky-100"    },
    Delivery:    { bg: "bg-amber-50",  text: "text-amber-700",  dot: "bg-amber-400",  iconBg: "bg-amber-100"  },
    Repair:      { bg: "bg-rose-50",   text: "text-rose-700",   dot: "bg-rose-400",   iconBg: "bg-rose-100"   },
    Tutoring:    { bg: "bg-violet-50", text: "text-violet-700", dot: "bg-violet-400", iconBg: "bg-violet-100" },
    Photography: { bg: "bg-pink-50",   text: "text-pink-700",   dot: "bg-pink-400",   iconBg: "bg-pink-100"   },
    Cleaning:    { bg: "bg-teal-50",   text: "text-teal-700",   dot: "bg-teal-400",   iconBg: "bg-teal-100"   },
    General:     { bg: "bg-zinc-100",  text: "text-zinc-600",   dot: "bg-zinc-400",   iconBg: "bg-zinc-100"   },
};

// ─── Category list ────────────────────────────────────────────────────────────

export const CATEGORIES = [
    "All",
    "Moving",
    "Delivery",
    "Repair",
    "Tutoring",
    "Photography",
    "Cleaning",
] as const;

export type Category = (typeof CATEGORIES)[number];

// ─── Budget ranges ────────────────────────────────────────────────────────────

export const BUDGET_RANGES = [
    { label: "Any Budget",     min: 0,    max: Infinity },
    { label: "Under ₹500",     min: 0,    max: 499      },
    { label: "₹500 – ₹1,000",  min: 500,  max: 1000     },
    { label: "₹1,000 – ₹2,000",min: 1000, max: 2000     },
    { label: "₹2,000 – ₹5,000",min: 2000, max: 5000     },
    { label: "Above ₹5,000",   min: 5000, max: Infinity  },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

export function timeAgo(iso: string): string {
    const diff = Date.now() - new Date(iso).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 60) return mins <= 1 ? "Just now" : `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    const days = Math.floor(hrs / 24);
    if (days < 30) return `${days}d ago`;
    return `${Math.floor(days / 30)}mo ago`;
}

export function formatDate(iso?: string): string | null {
    if (!iso) return null;
    return new Date(iso).toLocaleDateString("en-IN", {
        day: "numeric", month: "short", year: "numeric",
    });
}