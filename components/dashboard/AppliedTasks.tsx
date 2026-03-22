"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import {
    Search,
    MapPin,
    Clock,
    IndianRupee,
    Calendar,
    ChevronDown,
    LayoutGrid,
    List,
    ArrowUpRight,
    CheckCircle2,
    XCircle,
    Hourglass,
    Briefcase,
    Filter,
    TrendingUp,
} from "lucide-react";
import type { AppliedTask, AppStatus } from "@/lib/actions/appliedTasks";

// ─── Types ────────────────────────────────────────────────────────────────────

interface Stats {
    total: number;
    pending: number;
    accepted: number;
    rejected: number;
}

type ViewMode = "grid" | "list";
type SortKey = "newest" | "oldest" | "budget_high" | "budget_low";

// ─── Config ───────────────────────────────────────────────────────────────────

const APP_STATUS_CONFIG: Record<
    AppStatus,
    { label: string; icon: React.ElementType; dot: string; badge: string; bar: string }
> = {
    pending: {
        label: "Pending",
        icon: Hourglass,
        dot: "bg-amber-400",
        badge: "bg-amber-50 text-amber-700 ring-1 ring-amber-200",
        bar: "bg-amber-400",
    },
    accepted: {
        label: "Accepted",
        icon: CheckCircle2,
        dot: "bg-emerald-400",
        badge: "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200",
        bar: "bg-emerald-400",
    },
    rejected: {
        label: "Rejected",
        icon: XCircle,
        dot: "bg-red-400",
        badge: "bg-red-50 text-red-600 ring-1 ring-red-200",
        bar: "bg-red-400",
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

const FILTER_TABS: { label: string; value: AppStatus | "all" }[] = [
    { label: "All", value: "all" },
    { label: "Pending", value: "pending" },
    { label: "Accepted", value: "accepted" },
    { label: "Rejected", value: "rejected" },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function timeAgo(iso: string) {
    const diff = Date.now() - new Date(iso).getTime();
    const days = Math.floor(diff / 86400000);
    if (days === 0) return "Today";
    if (days === 1) return "Yesterday";
    if (days < 30) return `${days}d ago`;
    return `${Math.floor(days / 30)}mo ago`;
}

function formatDate(iso?: string) {
    if (!iso) return null;
    return new Date(iso).toLocaleDateString("en-IN", {
        day: "numeric", month: "short", year: "numeric",
    });
}

