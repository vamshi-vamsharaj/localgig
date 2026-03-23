"use client";

import { useState, useMemo, useTransition } from "react";
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
    Briefcase,
    CheckCircle2,
    Loader2,
    Users,
    SlidersHorizontal,
    X,
    Sparkles,
} from "lucide-react";
import type { FindTask } from "@/lib/actions/find-tasks";

// ─── Types ────────────────────────────────────────────────────────────────────

interface Stats {
    total: number;
    moving: number;
    delivery: number;
    repair: number;
    tutoring: number;
    photography: number;
    cleaning: number;
}

type ViewMode = "grid" | "list";
type SortKey = "newest" | "oldest" | "budget_high" | "budget_low" | "applicants";

// ─── Config ───────────────────────────────────────────────────────────────────

const CATEGORIES = [
    "All",
    "Moving",
    "Delivery",
    "Repair",
    "Tutoring",
    "Photography",
    "Cleaning",
] as const;

type Category = (typeof CATEGORIES)[number];

const CATEGORY_CONFIG: Record<
    string,
    { bg: string; text: string; dot: string; iconBg: string }
> = {
    Moving: { bg: "bg-sky-50", text: "text-sky-700", dot: "bg-sky-400", iconBg: "bg-sky-100" },
    Delivery: { bg: "bg-amber-50", text: "text-amber-700", dot: "bg-amber-400", iconBg: "bg-amber-100" },
    Repair: { bg: "bg-rose-50", text: "text-rose-700", dot: "bg-rose-400", iconBg: "bg-rose-100" },
    Tutoring: { bg: "bg-violet-50", text: "text-violet-700", dot: "bg-violet-400", iconBg: "bg-violet-100" },
    Photography: { bg: "bg-pink-50", text: "text-pink-700", dot: "bg-pink-400", iconBg: "bg-pink-100" },
    Cleaning: { bg: "bg-teal-50", text: "text-teal-700", dot: "bg-teal-400", iconBg: "bg-teal-100" },
    General: { bg: "bg-zinc-100", text: "text-zinc-600", dot: "bg-zinc-400", iconBg: "bg-zinc-100" },
};

const BUDGET_RANGES = [
    { label: "Any Budget", min: 0, max: Infinity },
    { label: "Under ₹500", min: 0, max: 499 },
    { label: "₹500 – ₹1,000", min: 500, max: 1000 },
    { label: "₹1,000 – ₹2,000", min: 1000, max: 2000 },
    { label: "₹2,000 – ₹5,000", min: 2000, max: 5000 },
    { label: "Above ₹5,000", min: 5000, max: Infinity },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function timeAgo(iso: string) {
    const diff = Date.now() - new Date(iso).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 60) return mins <= 1 ? "Just now" : `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    const days = Math.floor(hrs / 24);
    if (days < 30) return `${days}d ago`;
    return `${Math.floor(days / 30)}mo ago`;
}

function formatDate(iso?: string) {
    if (!iso) return null;
    return new Date(iso).toLocaleDateString("en-IN", {
        day: "numeric", month: "short", year: "numeric",
    });
}

// ─── Category Stat Pill ───────────────────────────────────────────────────────

function CategoryPill({
    label,
    count,
    active,
    onClick,
}: {
    label: Category;
    count: number;
    active: boolean;
    onClick: () => void;
}) {
    const cfg = label === "All" ? null : CATEGORY_CONFIG[label] ?? CATEGORY_CONFIG.General;
    return (
        <button
            onClick={onClick}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border text-sm font-medium transition-all duration-150 whitespace-nowrap ${active
                    ? "bg-blue-600 border-blue-600 text-white shadow-md shadow-blue-600/20"
                    : "bg-white border-zinc-200 text-zinc-600 hover:border-blue-300 hover:text-blue-600"
                }`}
        >
            {cfg && (
                <span className={`h-2 w-2 rounded-full ${active ? "bg-white/70" : cfg.dot}`} />
            )}
            {label}
            <span className={`text-xs font-semibold px-1.5 py-0.5 rounded-full ${active ? "bg-white/20 text-white" : "bg-zinc-100 text-zinc-500"
                }`}>
                {count}
            </span>
        </button>
    );
}


// ─── Task Card (grid) ─────────────────────────────────────────────────────────

function TaskCard({ task }: { task: FindTask }) {
    const cfg = CATEGORY_CONFIG[task.category] ?? CATEGORY_CONFIG.General;

    return (
        <div className="group bg-white rounded-2xl border border-zinc-100 shadow-sm hover:shadow-lg hover:border-blue-100 hover:-translate-y-0.5 transition-all duration-200 flex flex-col overflow-hidden">

            {/* Top accent */}
            <div className={`h-[3px] w-full ${cfg.dot}`} />

            <div className="p-5 flex flex-col gap-4 flex-1">

                {/* Header */}
                <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                        <span className={`inline-flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full mb-2 ${cfg.bg} ${cfg.text}`}>
                            <span className={`h-1.5 w-1.5 rounded-full ${cfg.dot}`} />
                            {task.category}
                        </span>
                        <h3 className="text-0.7lg font-semibold text-zinc-900 leading-snug line-clamp-2 group-hover:text-blue-600 transition-colors">
                            {task.title}
                        </h3>
                    </div>

                    {/* Budget */}
                    <div className="shrink-0 text-right">
                        <div className="flex items-center gap-0.5 font-bold text-zinc-900 justify-end">
                            <IndianRupee className="h-3.5 w-3.5 text-zinc-400" />
                            <span className="text-lg tabular-nums">{task.budget.toLocaleString("en-IN")}</span>
                        </div>
                        <p className="text-[10px] text-zinc-400 mt-0.5">budget</p>
                    </div>
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

                {/* Footer row */}
                <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1 text-xs text-zinc-400">
                        <Users className="h-3 w-3 text-blue-300" />
                        <span>{task.applicantsCount} applied</span>
                    </div>
                    <span className="text-[10px] text-zinc-400">{timeAgo(task.createdAt)}</span>
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                    <Link
                        href={`/tasks/${task._id}`}
                        className="flex items-center justify-center h-9 w-9 rounded-xl border border-zinc-200 text-zinc-400 hover:text-blue-600 hover:border-blue-300 transition-colors"
                    >
                        <ArrowUpRight className="h-3.5 w-3.5" />
                    </Link>
                </div>

            </div>
        </div>
    );
}

// ─── Task Row (list) ──────────────────────────────────────────────────────────

function TaskRow({ task }: { task: FindTask }) {
    const cfg = CATEGORY_CONFIG[task.category] ?? CATEGORY_CONFIG.General;

    return (
        <div className="group flex items-center gap-4 px-5 py-4 bg-white border border-zinc-100 rounded-2xl hover:border-blue-200 hover:shadow-sm transition-all duration-150">
            <span className={`h-2.5 w-2.5 rounded-full shrink-0 ${cfg.dot}`} />

            {/* Title + meta */}
            <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="text-sm font-semibold text-zinc-900 group-hover:text-blue-600 transition-colors truncate">
                        {task.title}
                    </h3>
                    <span className={`hidden sm:inline-flex items-center text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full ${cfg.bg} ${cfg.text}`}>
                        {task.category}
                    </span>
                </div>
                <p className="text-xs text-zinc-400 truncate mt-0.5 flex items-center gap-1">
                    <MapPin className="h-3 w-3 text-blue-300 shrink-0" />
                    {task.address}
                </p>
            </div>

            {/* Budget */}
            <div className="hidden sm:flex items-center gap-0.5 font-bold text-zinc-900 shrink-0 w-28">
                <IndianRupee className="h-3 w-3 text-zinc-400" />
                <span className="text-sm tabular-nums">{task.budget.toLocaleString("en-IN")}</span>
            </div>

            {/* Applicants */}
            <div className="hidden md:flex items-center gap-1 text-xs text-zinc-400 shrink-0 w-24">
                <Users className="h-3.5 w-3.5 text-blue-300" />
                {task.applicantsCount} applied
            </div>

            {/* Time */}
            <span className="hidden lg:block text-xs text-zinc-400 shrink-0 w-20 text-right">
                {timeAgo(task.createdAt)}
            </span>

            {/* Actions */}
            <div className="flex items-center gap-2 shrink-0">
                <Link
                    href={`/tasks/${task._id}`}
                    className="h-9 w-9 flex items-center justify-center rounded-xl border border-zinc-200 text-zinc-400 hover:text-blue-600 hover:border-blue-300 transition-colors"
                >
                    <ArrowUpRight className="h-3.5 w-3.5" />
                </Link>
            </div>
        </div>
    );
}

// ─── Main ─────────────────────────────────────────────────────────────────────

export default function FindTasks({
    tasks,
    stats,
}: {
    tasks: FindTask[];
    stats: Stats;
}) {

    return (
        <div className="space-y-6">

            {/* ── Header ──────────────────────────────────────────────────── */}
            <div className="flex items-start justify-between gap-4 flex-wrap">
                <div>
                    <div className="flex items-center gap-2">
                        <h1 className="text-2xl font-bold text-zinc-900 tracking-tight">Find Tasks</h1>
                        <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full bg-blue-50 text-blue-600 ring-1 ring-blue-200">
                            <Sparkles className="h-3 w-3" />
                            {stats.total} open
                        </span>
                    </div>
                    <p className="text-sm text-zinc-400 mt-0.5">
                        Browse all available gigs near you on LocalGig
                    </p>
                </div>
                <Link
                    href="/tasks/new"
                    className="inline-flex items-center gap-2 h-9 px-4 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold transition-colors shadow-sm shadow-blue-200"
                >
                    <Briefcase className="h-4 w-4" />
                    Post a Task
                </Link>
            </div>

            <div>
                {tasks.map((task) => (
                    <TaskCard key={task._id} task={task} />
                ))}
            </div>


            <div>
                {tasks.map((task) => (
                    <TaskRow key={task._id} task={task} />
                ))}
            </div>


        </div>
    );
}