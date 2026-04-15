// components/dashboard/SavedTaskCard.tsx
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

// ─── Config ───────────────────────────────────────────────────────────────────

type TaskStatus = "open" | "in_progress" | "completed" | "cancelled";

const STATUS_CONFIG: Record<TaskStatus, { label: string; badge: string; dot: string }> = {
    open:        { label: "Open",        badge: "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200", dot: "bg-emerald-400" },
    in_progress: { label: "In Progress", badge: "bg-amber-50 text-amber-700 ring-1 ring-amber-200",     dot: "bg-amber-400" },
    completed:   { label: "Completed",   badge: "bg-blue-50 text-blue-700 ring-1 ring-blue-200",         dot: "bg-blue-400" },
    cancelled:   { label: "Cancelled",   badge: "bg-zinc-100 text-zinc-500 ring-1 ring-zinc-200",        dot: "bg-zinc-300" },
};

const CATEGORY_COLORS: Record<string, string> = {
    Moving:      "bg-sky-50 text-sky-700",
    Delivery:    "bg-amber-50 text-amber-700",
    Repair:      "bg-rose-50 text-rose-700",
    Tutoring:    "bg-violet-50 text-violet-700",
    Photography: "bg-pink-50 text-pink-700",
    Cleaning:    "bg-teal-50 text-teal-700",
    General:     "bg-zinc-100 text-zinc-600",
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

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

// ─── Props ────────────────────────────────────────────────────────────────────

interface SavedTaskCardProps {
    task: Task;
    isSaved: boolean;
    isUnsaving: boolean;
    onUnsave: (taskId: string) => void;
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function SavedTaskCard({
    task,
    isSaved,
    isUnsaving,
    onUnsave,
}: SavedTaskCardProps) {
    const status = STATUS_CONFIG[task.status] ?? STATUS_CONFIG.open;
    const categoryStyle = CATEGORY_COLORS[task.category ?? "General"] ?? CATEGORY_COLORS.General;
    const deadline = typeof task.deadline === "string"
        ? task.deadline
        : task.deadline?.toISOString();

    return (
        <div className="group relative bg-white rounded-2xl border border-zinc-100 shadow-sm hover:shadow-lg hover:border-blue-100 hover:-translate-y-0.5 transition-all duration-200 flex flex-col overflow-hidden">

            {/* Top status accent */}
            <div className={`h-1 w-full ${status.dot}`} />

            <div className="p-6 flex flex-col gap-5 flex-1">

                {/* ── Header ─────────────────────────────────────────────── */}
                <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                        {/* Category pill */}
                        <span className={`inline-flex items-center text-xs font-semibold uppercase tracking-wide px-2.5 py-0.5 rounded-full mb-2.5 ${categoryStyle}`}>
                            {task.category ?? "General"}
                        </span>
                        {/* Title */}
                        <h3 className="text-base font-bold text-zinc-900 leading-snug line-clamp-2 group-hover:text-blue-600 transition-colors">
                            {task.title}
                        </h3>
                    </div>

                    {/* Bookmark / unsave button */}
                    <button
                        onClick={() => onUnsave(task._id)}
                        disabled={isUnsaving}
                        title={isSaved ? "Remove from saved" : "Save"}
                        className={`shrink-0 h-9 w-9 rounded-xl flex items-center justify-center border transition-all duration-150 ${
                            isSaved
                                ? "bg-blue-600 border-blue-600 text-white hover:bg-red-500 hover:border-red-500 shadow-sm shadow-blue-200"
                                : "border-zinc-200 text-zinc-400 hover:border-blue-300 hover:text-blue-600"
                        } disabled:opacity-50 disabled:cursor-not-allowed`}
                    >
                        {isUnsaving
                            ? <Loader2 className="h-4 w-4 animate-spin" />
                            : <Bookmark className="h-4 w-4" fill={isSaved ? "currentColor" : "none"} />
                        }
                    </button>
                </div>

                {/* ── Description ─────────────────────────────────────────── */}
                <p className="text-sm text-zinc-500 line-clamp-2 leading-relaxed -mt-1">
                    {task.description}
                </p>

                {/* ── Meta ────────────────────────────────────────────────── */}
                <div className="flex flex-col gap-2 text-sm text-zinc-500">
                    <span className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 shrink-0 text-blue-400" />
                        <span className="truncate">{task.address}</span>
                    </span>
                    {task.estimatedHours && (
                        <span className="flex items-center gap-2">
                            <Clock className="h-4 w-4 shrink-0 text-blue-400" />
                            {task.estimatedHours}h estimated
                        </span>
                    )}
                    {deadline && (
                        <span className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 shrink-0 text-blue-400" />
                            Due {formatDeadline(deadline)}
                        </span>
                    )}
                </div>

                <div className="border-t border-zinc-100" />

                {/* ── Footer row ──────────────────────────────────────────── */}
                <div className="flex items-center justify-between gap-2">
                    {/* Budget */}
                    <div className="flex items-center gap-0.5 font-extrabold text-zinc-900">
                        <IndianRupee className="h-4 w-4 text-zinc-400 mt-0.5" />
                        <span className="text-xl tabular-nums">{task.budget.toLocaleString("en-IN")}</span>
                    </div>

                    {/* Status + applicants */}
                    <div className="flex items-center gap-2">
                        <span className="flex items-center gap-1.5 text-sm text-zinc-400 font-medium">
                            <Users className="h-4 w-4 text-blue-400" />
                            {task.applicantsCount}
                        </span>
                        <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full ${status.badge}`}>
                            <span className={`h-1.5 w-1.5 rounded-full ${status.dot}`} />
                            {status.label}
                        </span>
                    </div>
                </div>

                {/* ── Actions ─────────────────────────────────────────────── */}
                <div className="flex gap-2">
                    <Link
                        href={`/tasks/${task._id}`}
                        className="flex-1 flex items-center justify-center gap-2 h-10 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-sm font-bold transition-colors shadow-sm shadow-blue-200"
                    >
                        View Task <ArrowUpRight className="h-4 w-4" />
                    </Link>
                </div>

            </div>

            {/* Saved timestamp footer */}
            <div className="px-6 py-2.5 bg-zinc-50 border-t border-zinc-100 text-xs text-zinc-400 font-medium">
                Saved {timeAgo(task.createdAt as unknown as string)}
            </div>

        </div>
    );
}