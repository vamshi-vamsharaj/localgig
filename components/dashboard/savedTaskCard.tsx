"use client";

import Link from "next/link";
import {
    Bookmark,
    MapPin,
    Clock,
    IndianRupee,
    Calendar,
    Users,
    ArrowUpRight,
    Loader2,
} from "lucide-react";
import type { Task } from "@/lib/models/models.types";

type TaskStatus = "open" | "in_progress" | "completed" | "cancelled";

const STATUS_CONFIG: Record<TaskStatus, { label: string; badge: string; dot: string }> = {
    open:        { label: "Open",        badge: "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200", dot: "bg-emerald-400" },
    in_progress: { label: "In Progress", badge: "bg-amber-50 text-amber-700 ring-1 ring-amber-200",     dot: "bg-amber-400" },
    completed:   { label: "Completed",   badge: "bg-blue-50 text-blue-700 ring-1 ring-blue-200",         dot: "bg-blue-400" },
    cancelled:   { label: "Cancelled",   badge: "bg-zinc-100 text-zinc-500 ring-1 ring-zinc-200",        dot: "bg-zinc-300" },
};

const CATEGORY_COLORS: Record<string, { bg: string; text: string; dot: string }> = {
    Moving:      { bg: "bg-sky-50",    text: "text-sky-700",    dot: "bg-sky-400" },
    Delivery:    { bg: "bg-amber-50",  text: "text-amber-700",  dot: "bg-amber-400" },
    Repair:      { bg: "bg-rose-50",   text: "text-rose-700",   dot: "bg-rose-400" },
    Tutoring:    { bg: "bg-violet-50", text: "text-violet-700", dot: "bg-violet-400" },
    Photography: { bg: "bg-pink-50",   text: "text-pink-700",   dot: "bg-pink-400" },
    Cleaning:    { bg: "bg-teal-50",   text: "text-teal-700",   dot: "bg-teal-400" },
    General:     { bg: "bg-zinc-100",  text: "text-zinc-600",   dot: "bg-zinc-400" },
};

function formatDeadline(iso?: string) {
    if (!iso) return null;
    return new Date(iso).toLocaleDateString("en-IN", {
        day: "numeric", month: "short", year: "numeric",
    });
}

function timeAgo(iso: string) {
    const diff = Date.now() - new Date(iso).getTime();
    const days = Math.floor(diff / 86400000);
    if (days === 0) return "Today";
    if (days === 1) return "Yesterday";
    if (days < 30) return `${days}d ago`;
    return `${Math.floor(days / 30)}mo ago`;
}

interface SavedTaskCardProps {
    task: Task;
    isSaved: boolean;
    isUnsaving: boolean;
    onUnsave: (taskId: string) => void;
}

export default function SavedTaskCard({
    task,
    isSaved,
    isUnsaving,
    onUnsave,
}: SavedTaskCardProps) {
    const status = STATUS_CONFIG[task.status] ?? STATUS_CONFIG.open;
    const cfg = CATEGORY_COLORS[task.category ?? "General"] ?? CATEGORY_COLORS.General;
    const deadline = typeof task.deadline === "string"
        ? task.deadline
        : task.deadline?.toISOString();

    return (
        <div className="group relative bg-white rounded-2xl border border-zinc-100 shadow-sm hover:shadow-lg hover:border-blue-100 hover:-translate-y-0.5 transition-all duration-200 flex flex-col overflow-hidden">

            {/* Top status accent — matches FindTasks h-[3px] */}
            <div className={`h-[3px] w-full shrink-0 ${cfg.dot}`} />

            <div className="p-4 sm:p-5 flex flex-col gap-3 sm:gap-4 flex-1">

                {/* ── Header ─────────────────────────────────────────────── */}
                <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                        {/* Category badge — compact, matches FindTasks text-[10px] tracking-wider */}
                        <span className={`inline-flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full mb-1.5 ${cfg.bg} ${cfg.text}`}>
                            <span className={`h-1.5 w-1.5 rounded-full ${cfg.dot}`} />
                            {task.category ?? "General"}
                        </span>
                        <h3 className="text-sm sm:text-base font-semibold text-zinc-900 leading-snug line-clamp-2 group-hover:text-blue-600 transition-colors">
                            {task.title}
                        </h3>
                    </div>

                    {/* Budget — right-aligned like FindTasks TaskCard */}
                    <div className="shrink-0 text-right">
                        <div className="flex items-center gap-0.5 font-bold text-zinc-900 justify-end">
                            <IndianRupee className="h-3.5 w-3.5 text-zinc-400" />
                            <span className="text-base tabular-nums">{task.budget.toLocaleString("en-IN")}</span>
                        </div>
                        <p className="text-[10px] text-zinc-400 mt-0.5">budget</p>
                    </div>
                </div>

                {/* ── Description ─────────────────────────────────────────── */}
                <p className="text-xs sm:text-sm text-zinc-400 line-clamp-2 leading-relaxed -mt-1">
                    {task.description}
                </p>

            {/* ── Meta ────────────────────────────────────────────────── */}
<div className="flex flex-col gap-1.5 text-xs sm:text-sm text-zinc-500">
    <span className="flex items-center gap-1.5">
        <MapPin className="h-3.5 w-3.5 shrink-0 text-blue-400" />
        <span className="truncate">{task.address}</span>
    </span>

    {task.estimatedHours && (
        <span className="flex items-center gap-1.5">
            <Clock className="h-3.5 w-3.5 shrink-0 text-blue-400" />
            {task.estimatedHours}h estimated
        </span>
    )}

    {deadline && (
        <span className="flex items-center gap-1.5">
            <Calendar className="h-3.5 w-3.5 shrink-0 text-blue-400" />
            Due {formatDeadline(deadline)}
        </span>
    )}
</div>

<div className="border-t border-zinc-100" />

{/* ── Footer row ──────────────────────────────────────────── */}
<div className="flex items-center justify-between gap-2">
    <div className="flex items-center gap-1 text-xs sm:text-sm text-zinc-500">
        <Users className="h-3.5 w-3.5 text-blue-400" />
        <span>{task.applicantsCount} applied</span>
    </div>

    <span
        className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full ${status.badge}`}
    >
        <span className={`h-1.5 w-1.5 rounded-full ${status.dot}`} />
        {status.label}
    </span>
</div>

{/* ── Actions ─────────────────────────────────────────────── */}
<div className="flex gap-2">
    <Link
        href={`/tasks/${task._id}`}
        className="flex-1 flex items-center justify-center gap-1.5 h-9 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs sm:text-sm font-semibold transition-colors shadow-sm shadow-blue-200"
    >
        View Task
        <ArrowUpRight className="h-3.5 w-3.5" />
    </Link>

    <button
        onClick={() => onUnsave(task._id)}
        disabled={isUnsaving}
        title={isSaved ? "Remove from saved" : "Save"}
        className={`h-9 w-9 flex items-center justify-center rounded-xl border transition-all duration-150 shrink-0 ${
            isSaved
                ? "bg-blue-600 border-blue-600 text-white hover:bg-red-500 hover:border-red-500 shadow-sm shadow-blue-200"
                : "border-zinc-200 text-zinc-400 hover:border-blue-300 hover:text-blue-600"
        } disabled:opacity-50 disabled:cursor-not-allowed`}
    >
        {isUnsaving ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
        ) : (
            <Bookmark
                className="h-3.5 w-3.5"
                fill={isSaved ? "currentColor" : "none"}
            />
        )}
    </button>
</div>

{/* Saved timestamp footer */}
<div className="px-4 sm:px-5 py-2 bg-zinc-50 border-t border-zinc-100 text-[11px] text-zinc-400 font-medium shrink-0">
    Saved {timeAgo(task.createdAt as unknown as string)}
</div>
</div>
        </div>
    );
}