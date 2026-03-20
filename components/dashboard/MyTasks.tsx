"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import {
    Search,
    Plus,
    MapPin,
    Clock,
    Users,
    IndianRupee,
    Calendar,
    ChevronDown,
    Filter,
    LayoutGrid,
    List,
    ArrowUpRight,
    Pencil,
    Trash2,
    MoreHorizontal,
} from "lucide-react";
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

// ─── Stat Card ────────────────────────────────────────────────────────────────

function StatCard({
    label,
    value,
    accent,
    active,
    onClick,
}: {
    label: string;
    value: number;
    accent: string;
    active: boolean;
    onClick: () => void;
}) {
    return (
        <button
            onClick={onClick}
            className={`
                flex-1 min-w-[120px] text-left rounded-2xl px-5 py-4 border transition-all duration-200
                ${active
  ? "bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-200"
                    : "bg-white border-zinc-100 hover:border-zinc-300 shadow-sm"
                }
            `}
        >
            <div className={`text-3xl font-bold tracking-tight tabular-nums ${active ? "text-white" : "text-zinc-900"}`}>
                {value}
            </div>
            <div className={`text-xs font-medium mt-1 flex items-center gap-1.5 ${active ? "text-zinc-400" : "text-zinc-400"}`}>
                <span className={`h-1.5 w-1.5 rounded-full ${accent}`} />
                {label}
            </div>
        </button>
    );
}

// ─── Task Card (grid view) ────────────────────────────────────────────────────

function TaskCard({ task }: { task: UserTask }) {
    const s = STATUS_CONFIG[task.status];
    const categoryStyle = CATEGORY_COLORS[task.category] ?? CATEGORY_COLORS.General;

    return (
<div className="group bg-white rounded-2xl border border-gray-200 shadow-sm hover:shadow-md hover:border-blue-200 hover:-translate-y-0.5 transition-all duration-200 flex flex-col overflow-hidden">
            {/* Top accent */}
            <div className={`h-[3px] w-full ${s.dot.replace("bg-", "bg-")}`} />

            <div className="p-5 flex flex-col gap-4 flex-1">

                {/* Header row */}
                <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                        <span className={`inline-flex items-center text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full mb-2 ${categoryStyle}`}>
                            {task.category}
                        </span>
                        <h3 className="text-sm font-semibold text-zinc-900 leading-snug line-clamp-2 group-hover:text-blue-600 transition-colors">
                            {task.title}
                        </h3>
                    </div>
                    <div className="shrink-0 relative">
                        <button className="h-7 w-7 rounded-lg flex items-center justify-center text-zinc-300 hover:text-zinc-600 hover:bg-zinc-50 transition">
                            <MoreHorizontal className="h-4 w-4" />
                        </button>
                    </div>
                </div>

                {/* Description */}
                <p className="text-xs text-zinc-400 line-clamp-2 leading-relaxed -mt-1">
                    {task.description}
                </p>

                {/* Meta */}
                <div className="flex flex-col gap-1.5 text-xs text-zinc-400">
                    <span className="flex items-center gap-1.5">
                        <MapPin className="h-3 w-3 shrink-0 text-zinc-300" />
                        <span className="truncate">{task.address}</span>
                    </span>
                    {task.estimatedHours && (
                        <span className="flex items-center gap-1.5">
                            <Clock className="h-3 w-3 shrink-0 text-zinc-300" />
                            {task.estimatedHours}h estimated
                        </span>
                    )}
                    {task.deadline && (
                        <span className="flex items-center gap-1.5">
                            <Calendar className="h-3 w-3 shrink-0 text-zinc-300" />
                            Due {formatDeadline(task.deadline)}
                        </span>
                    )}
                </div>

                {/* Divider */}
                <div className="border-t border-zinc-50" />

                {/* Footer */}
                <div className="flex items-center justify-between">
                    {/* Budget */}
                    <div className="flex items-center gap-0.5 font-bold text-zinc-900">
                        <IndianRupee className="h-3.5 w-3.5 text-zinc-400" />
                        <span className="text-base tabular-nums">{task.budget.toLocaleString("en-IN")}</span>
                    </div>

                    {/* Status + applicants */}
                    <div className="flex items-center gap-2">
                        <span className="flex items-center gap-1 text-xs text-zinc-400">
                            <Users className="h-3 w-3" />
                            {task.applicantsCount}
                        </span>
                        <span className={`inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full ${s.badge}`}>
                            <span className={`h-1.5 w-1.5 rounded-full ${s.dot}`} />
                            {s.label}
                        </span>
                    </div>
                </div>

                {/* Action buttons */}
                <div className="flex gap-2 pt-1">
                    <Link
                        href={`/tasks/${task._id}`}
                        className="flex-1 flex items-center justify-center gap-1.5 h-8 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold  transition"
                    >
                        View <ArrowUpRight className="h-3 w-3" />
                    </Link>
                    <Link
                        href={`/tasks/${task._id}/edit`}
                        className="h-8 w-8 flex items-center justify-center rounded-xl border border-zinc-200 text-zinc-400 hover:text-zinc-700 hover:border-zinc-300 transition"
                    >
                        <Pencil className="h-3.5 w-3.5" />
                    </Link>
                </div>

            </div>

            {/* Posted time footer */}
            <div className="px-5 py-2.5 bg-zinc-50 border-t border-zinc-100 text-[10px] text-zinc-400 font-medium">
                Posted {timeAgo(task.createdAt)}
            </div>
        </div>
    );
}

// ─── Task Row (list view) ─────────────────────────────────────────────────────

function TaskRow({ task }: { task: UserTask }) {
    const s = STATUS_CONFIG[task.status];
    const categoryStyle = CATEGORY_COLORS[task.category] ?? CATEGORY_COLORS.General;

    return (
        <div className="group flex items-center gap-4 px-5 py-4 bg-white border border-zinc-100 rounded-2xl hover:border-zinc-200 hover:shadow-sm transition-all duration-150">

            {/* Status dot */}
            <span className={`h-2.5 w-2.5 rounded-full shrink-0 ${s.dot}`} />

            {/* Title + category */}
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

            {/* Budget */}
            <div className="hidden sm:flex items-center gap-0.5 font-bold text-zinc-900 shrink-0">
                <IndianRupee className="h-3 w-3 text-zinc-400" />
                <span className="text-sm tabular-nums">{task.budget.toLocaleString("en-IN")}</span>
            </div>

            {/* Applicants */}
            <div className="hidden md:flex items-center gap-1 text-xs text-zinc-400 shrink-0 w-14">
                <Users className="h-3.5 w-3.5" />
                {task.applicantsCount}
            </div>

            {/* Status badge */}
            <span className={`hidden sm:inline-flex items-center gap-1 text-[10px] font-semibold px-2.5 py-1 rounded-full shrink-0 ${s.badge}`}>
                {s.label}
            </span>

            {/* Posted */}
            <span className="hidden lg:block text-xs text-zinc-400 shrink-0 w-20 text-right">
                {timeAgo(task.createdAt)}
            </span>

            {/* Actions */}
            <div className="flex items-center gap-1.5 shrink-0">
                <Link
                    href={`/tasks/${task._id}`}
                    className="h-8 px-3 flex items-center gap-1 rounded-lg bg-blue-600 text-white text-xs font-medium hover:bg-blue-500 transition"
                >
                    View <ArrowUpRight className="h-3 w-3" />
                </Link>
                <Link
                    href={`/tasks/${task._id}/edit`}
                    className="h-8 w-8 flex items-center justify-center rounded-lg border border-zinc-200 text-zinc-400 hover:text-zinc-700 hover:border-zinc-300 transition"
                >
                    <Pencil className="h-3.5 w-3.5" />
                </Link>
            </div>

        </div>
    );
}

