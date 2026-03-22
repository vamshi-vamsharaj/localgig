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

// ─── Stat Card ────────────────────────────────────────────────────────────────

function StatCard({
    label, value, icon: Icon, active, onClick,
}: {
    label: string; value: number; icon: React.ElementType; active: boolean; onClick: () => void;
}) {
    return (
        <button
            onClick={onClick}
            className={`flex-1 min-w-[130px] text-left rounded-2xl px-5 py-4 border transition-all duration-200 ${
                active
                    ? "bg-blue-600 border-blue-600 shadow-lg shadow-blue-600/25 scale-[1.01]"
                    : "bg-white border-zinc-100 hover:border-blue-200 hover:shadow-md shadow-sm"
            }`}
        >
            <div className="flex items-center justify-between mb-3">
                <div className={`h-8 w-8 rounded-xl flex items-center justify-center ${active ? "bg-white/20" : "bg-blue-50"}`}>
                    <Icon className={`h-4 w-4 ${active ? "text-white" : "text-blue-600"}`} />
                </div>
            </div>
            <p className={`text-3xl font-bold tracking-tight tabular-nums ${active ? "text-white" : "text-zinc-900"}`}>
                {value}
            </p>
            <p className={`text-xs font-medium mt-0.5 ${active ? "text-blue-100" : "text-zinc-400"}`}>
                {label}
            </p>
        </button>
    );
}

// ─── Application Card (grid) ──────────────────────────────────────────────────

function ApplicationCard({ item }: { item: AppliedTask }) {
    const appS = APP_STATUS_CONFIG[item.applicationStatus];
    const AppIcon = appS.icon;
    const task = item.task;
    const categoryStyle = CATEGORY_COLORS[task?.category ?? ""] ?? CATEGORY_COLORS.General;

    if (!task) {
        return (
            <div className="bg-white rounded-2xl border border-zinc-100 shadow-sm p-5">
                <p className="text-sm text-zinc-400">Task no longer available</p>
            </div>
        );
    }

    return (
        <div className="group bg-white rounded-2xl border border-zinc-100 shadow-sm hover:shadow-lg hover:border-blue-100 hover:-translate-y-0.5 transition-all duration-200 flex flex-col overflow-hidden">

            {/* Status accent bar */}
            <div className={`h-[3px] w-full ${appS.bar}`} />

            <div className="p-5 flex flex-col gap-4 flex-1">

                {/* Header */}
                <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                        <span className={`inline-flex items-center text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full mb-2 ${categoryStyle}`}>
                            {task.category}
                        </span>
                        <h3 className="text-sm font-semibold text-zinc-900 leading-snug line-clamp-2 group-hover:text-blue-600 transition-colors">
                            {task.title}
                        </h3>
                    </div>
                    <span className={`shrink-0 inline-flex items-center gap-1 text-[10px] font-semibold px-2.5 py-1 rounded-full ${appS.badge}`}>
                        <AppIcon className="h-2.5 w-2.5" />
                        {appS.label}
                    </span>
                </div>

                {/* Description */}
                <p className="text-xs text-zinc-400 line-clamp-2 leading-relaxed -mt-1">
                    {task.description}
                </p>

                {/* Meta */}
                <div className="flex flex-col gap-1.5 text-xs text-zinc-400">
                    <span className="flex items-center gap-1.5">
                        <MapPin className="h-3 w-3 shrink-0 text-blue-300" />
                        <span className="truncate">{task.address}</span>
                    </span>
                    {task.estimatedHours && (
                        <span className="flex items-center gap-1.5">
                            <Clock className="h-3 w-3 shrink-0 text-blue-300" />
                            {task.estimatedHours}h estimated
                        </span>
                    )}
                    {task.deadline && (
                        <span className="flex items-center gap-1.5">
                            <Calendar className="h-3 w-3 shrink-0 text-blue-300" />
                            Due {formatDate(task.deadline)}
                        </span>
                    )}
                </div>

                <div className="border-t border-zinc-50" />

                {/* Budget */}
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-[10px] text-zinc-400 mb-0.5">Task Budget</p>
                        <div className="flex items-center gap-0.5 font-bold text-zinc-900">
                            <IndianRupee className="h-3.5 w-3.5 text-zinc-400" />
                            <span className="text-base tabular-nums">{task.budget.toLocaleString("en-IN")}</span>
                        </div>
                    </div>
                    {item.proposedBudget && (
                        <div className="text-right">
                            <p className="text-[10px] text-zinc-400 mb-0.5">Your Offer</p>
                            <div className="flex items-center gap-0.5 font-bold text-blue-600">
                                <IndianRupee className="h-3.5 w-3.5" />
                                <span className="text-base tabular-nums">{item.proposedBudget.toLocaleString("en-IN")}</span>
                            </div>
                        </div>
                    )}
                </div>

                {/* CTA */}
                <Link
                    href={`/tasks/${task._id}`}
                    className="flex items-center justify-center gap-1.5 h-9 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold transition-colors shadow-sm shadow-blue-200"
                >
                    View Task <ArrowUpRight className="h-3.5 w-3.5" />
                </Link>
            </div>

            <div className="px-5 py-2.5 bg-zinc-50/80 border-t border-zinc-100 text-[10px] text-zinc-400 font-medium">
                Applied {timeAgo(item.appliedAt)}
            </div>
        </div>
    );
}

// ─── Application Row (list) ───────────────────────────────────────────────────

function ApplicationRow({ item }: { item: AppliedTask }) {
    const appS = APP_STATUS_CONFIG[item.applicationStatus];
    const AppIcon = appS.icon;
    const task = item.task;
    const categoryStyle = CATEGORY_COLORS[task?.category ?? ""] ?? CATEGORY_COLORS.General;

    if (!task) {
        return (
            <div className="flex items-center px-5 py-4 bg-white border border-zinc-100 rounded-2xl text-sm text-zinc-400">
                Task no longer available
            </div>
        );
    }

    return (
        <div className="group flex items-center gap-4 px-5 py-4 bg-white border border-zinc-100 rounded-2xl hover:border-blue-200 hover:shadow-sm transition-all duration-150">
            <span className={`h-2.5 w-2.5 rounded-full shrink-0 ${appS.dot}`} />

            <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="text-sm font-semibold text-zinc-900 group-hover:text-blue-600 transition-colors truncate">
                        {task.title}
                    </h3>
                    <span className={`hidden sm:inline-flex items-center text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full ${categoryStyle}`}>
                        {task.category}
                    </span>
                </div>
                <p className="text-xs text-zinc-400 truncate mt-0.5">{task.address}</p>
            </div>

            <div className="hidden sm:flex items-center gap-0.5 font-semibold text-zinc-900 shrink-0 w-24">
                <IndianRupee className="h-3 w-3 text-zinc-400" />
                <span className="text-sm tabular-nums">{task.budget.toLocaleString("en-IN")}</span>
            </div>

            <div className="hidden md:flex items-center gap-0.5 shrink-0 w-24">
                {item.proposedBudget ? (
                    <>
                        <IndianRupee className="h-3 w-3 text-blue-400" />
                        <span className="text-sm font-semibold text-blue-600 tabular-nums">
                            {item.proposedBudget.toLocaleString("en-IN")}
                        </span>
                    </>
                ) : (
                    <span className="text-xs text-zinc-300">—</span>
                )}
            </div>

            <span className={`hidden sm:inline-flex items-center gap-1.5 text-[10px] font-semibold px-2.5 py-1 rounded-full shrink-0 ${appS.badge}`}>
                <AppIcon className="h-2.5 w-2.5" />
                {appS.label}
            </span>

            <span className="hidden lg:block text-xs text-zinc-400 shrink-0 w-20 text-right">
                {timeAgo(item.appliedAt)}
            </span>

            <Link
                href={`/tasks/${task._id}`}
                className="h-8 px-3.5 flex items-center gap-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold transition-colors shadow-sm shadow-blue-200 shrink-0"
            >
                View <ArrowUpRight className="h-3 w-3" />
            </Link>
        </div>
    );
}
