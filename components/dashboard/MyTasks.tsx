"use client";

import type { UserTask, TaskStatus } from "@/lib/actions/my-tasks";

// ─── Types ────────────────────────────────────────────────────────────────────

interface Stats {
    total: number;
    open: number;
    inProgress: number;
    completed: number;
}

type ViewMode = "grid" | "list";
type SortKey = "newest" | "oldest" | "budget_high" | "budget_low";

// ─── Constants ────────────────────────────────────────────────────────────────

const STATUS_CONFIG: Record<
    TaskStatus,
    { label: string; dot: string; badge: string }
> = {
    open: {
        label: "Open",
        dot: "bg-emerald-400",
badge: "bg-white text-emerald-600 border border-emerald-200",    },
    in_progress: {
        label: "In Progress",
        dot: "bg-amber-400",
        badge: "bg-amber-50 text-amber-700 ring-1 ring-amber-200",
    },
    completed: {
        label: "Completed",
        dot: "bg-blue-400",
        badge: "bg-blue-50 text-blue-700 ring-1 ring-blue-200",
    },
    cancelled: {
        label: "Cancelled",
        dot: "bg-zinc-300",
        badge: "bg-zinc-100 text-zinc-500 ring-1 ring-zinc-200",
    },
};

const CATEGORY_COLORS: Record<string, string> = {
    Moving: "bg-sky-50 text-sky-700",
    Delivery: "bg-amber-50 text-amber-700",
    Repair: "bg-rose-50 text-rose-700",
    Tutoring: "bg-violet-50 text-violet-700",
    Photography: "bg-pink-50 text-pink-700",
    Cleaning: "bg-teal-50 text-teal-700",
    General: "bg-zinc-100 text-zinc-600",
};

const FILTER_TABS: { label: string; value: TaskStatus | "all" }[] = [
    { label: "All", value: "all" },
    { label: "Open", value: "open" },
    { label: "In Progress", value: "in_progress" },
    { label: "Completed", value: "completed" },
    { label: "Cancelled", value: "cancelled" },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function timeAgo(iso: string) {
    const diff = Date.now() - new Date(iso).getTime();
    const days = Math.floor(diff / 86400000);
    if (days === 0) return "Today";
    if (days === 1) return "Yesterday";
    if (days < 30) return `${days}d ago`;
    const months = Math.floor(days / 30);
    return `${months}mo ago`;
}

function formatDeadline(iso?: string) {
    if (!iso) return null;
    return new Date(iso).toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
    });
}
