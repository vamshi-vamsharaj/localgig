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

export default function MyTasks({
    tasks,
    stats,
}: {
    tasks: UserTask[];
    stats: Stats;
}) {
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState<TaskStatus | "all">("all");
    const [sort, setSort] = useState<SortKey>("newest");
    const [view, setView] = useState<ViewMode>("grid");

    const filtered = useMemo(() => {
        let result = [...tasks];

        if (search.trim()) {
            const q = search.toLowerCase();
            result = result.filter(
                (t) =>
                    t.title.toLowerCase().includes(q) ||
                    t.category.toLowerCase().includes(q) ||
                    t.address.toLowerCase().includes(q)
            );
        }

        if (statusFilter !== "all") {
            result = result.filter((t) => t.status === statusFilter);
        }

        result.sort((a, b) => {
            if (sort === "newest") return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
            if (sort === "oldest") return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
            if (sort === "budget_high") return b.budget - a.budget;
            if (sort === "budget_low") return a.budget - b.budget;
            return 0;
        });

        return result;
    }, [tasks, search, statusFilter, sort]);

    return (
        <div className="space-y-6">

            {/* ── Page Header ─────────────────────────────────────────────── */}
            <div className="flex items-start justify-between gap-4 flex-wrap">
                <div>
                    <h1 className="text-2xl font-bold text-zinc-900 tracking-tight">My Tasks</h1>
                    <p className="text-sm text-zinc-400 mt-0.5">
                        Manage all the tasks you've posted on LocalGig
                    </p>
                </div>
                <Link
                    href="/tasks/new"
                    className="inline-flex items-center gap-2 h-9 px-4 rounded-xl bg-blue-600 text-white text-sm font-semibold hover:bg-blue-500 transition shadow-sm shadow-blue-200"
                >
                    <Plus className="h-4 w-4" />
                    Post New Task
                </Link>
            </div>

            {/* ── Stat Cards ──────────────────────────────────────────────── */}
            <div className="flex gap-3 flex-wrap">
                <StatCard label="Total" value={stats.total} accent="bg-zinc-400" active={statusFilter === "all"} onClick={() => setStatusFilter("all")} />
                <StatCard label="Open" value={stats.open} accent="bg-emerald-400" active={statusFilter === "open"} onClick={() => setStatusFilter("open")} />
                <StatCard label="In Progress" value={stats.inProgress} accent="bg-amber-400" active={statusFilter === "in_progress"} onClick={() => setStatusFilter("in_progress")} />
                <StatCard label="Completed" value={stats.completed} accent="bg-blue-400" active={statusFilter === "completed"} onClick={() => setStatusFilter("completed")} />
            </div>

            {/* ── Toolbar ─────────────────────────────────────────────────── */}
            <div className="flex items-center gap-3 flex-wrap">

                {/* Search */}
                <div className="flex-1 min-w-[200px] relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-300" />
                    <input
                        type="text"
                        placeholder="Search tasks..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full h-9 pl-9 pr-4 rounded-xl border border-zinc-200 bg-white text-sm text-zinc-800 placeholder-zinc-300 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition"
                    />
                </div>

                {/* Status filter tabs */}
                <div className="hidden sm:flex items-center bg-zinc-100 rounded-xl p-1 gap-0.5">
                    {FILTER_TABS.map((tab) => (
                        <button
                            key={tab.value}
                            onClick={() => setStatusFilter(tab.value)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                                statusFilter === tab.value
                                    ? "bg-white text-zinc-900 shadow-sm"
                                    : "text-zinc-500 hover:text-zinc-700"
                            }`}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* Sort */}
                <div className="relative">
                    <select
                        aria-label="Sort tasks"
                        value={sort}
                        onChange={(e) => setSort(e.target.value as SortKey)}
                        className="h-9 pl-3 pr-8 rounded-xl border border-zinc-200 bg-white text-xs text-zinc-600 focus:outline-none focus:ring-2 focus:ring-blue-500/20 appearance-none cursor-pointer"
                    >
                        <option value="newest">Newest first</option>
                        <option value="oldest">Oldest first</option>
                        <option value="budget_high">Budget: High → Low</option>
                        <option value="budget_low">Budget: Low → High</option>
                    </select>
                    <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-400 pointer-events-none" />
                </div>

                {/* View toggle */}
                <div className="flex items-center bg-zinc-100 rounded-xl p-1 gap-0.5">
                    <button
                        onClick={() => setView("grid")}
                        className={`h-7 w-7 flex items-center justify-center rounded-lg transition ${view === "grid" ? "bg-white shadow-sm text-zinc-900" : "text-zinc-400 hover:text-zinc-600"}`}
                    >
                        <LayoutGrid className="h-3.5 w-3.5" />
                    </button>
                    <button
                        onClick={() => setView("list")}
                        className={`h-7 w-7 flex items-center justify-center rounded-lg transition ${view === "list" ? "bg-white shadow-sm text-zinc-900" : "text-zinc-400 hover:text-zinc-600"}`}
                    >
                        <List className="h-3.5 w-3.5" />
                    </button>
                </div>
            </div>

            {/* ── Results count ────────────────────────────────────────────── */}
            <div className="flex items-center justify-between">
                <p className="text-xs text-zinc-400">
                    Showing <span className="font-semibold text-zinc-700">{filtered.length}</span> of{" "}
                    <span className="font-semibold text-zinc-700">{tasks.length}</span> tasks
                </p>
            </div>

            {/* ── Empty state ──────────────────────────────────────────────── */}
            {filtered.length === 0 && (
                <div className="flex flex-col items-center justify-center py-24 text-center bg-white rounded-2xl border border-dashed border-zinc-200">
                    <div className="h-12 w-12 rounded-2xl bg-zinc-100 flex items-center justify-center mb-4">
                        <Filter className="h-5 w-5 text-zinc-400" />
                    </div>
                    <p className="text-sm font-semibold text-zinc-800">No tasks found</p>
                    <p className="text-xs text-zinc-400 mt-1">
                        {search ? "Try a different search term or clear filters" : "Post your first task to get started"}
                    </p>
                    {!search && (
                        <Link
                            href="/tasks/new"
                            className="mt-4 inline-flex items-center gap-1.5 h-8 px-4 rounded-xl bg-blue-600 text-white text-xs font-semibold hover:bg-blue-500 transition"
                        >
                            <Plus className="h-3.5 w-3.5" /> Post a Task
                        </Link>
                    )}
                </div>
            )}

            {/* ── Grid view ────────────────────────────────────────────────── */}
            {filtered.length > 0 && view === "grid" && (
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                    {filtered.map((task) => (
                        <TaskCard key={task._id} task={task} />
                    ))}
                </div>
            )}

            {/* ── List view ────────────────────────────────────────────────── */}
            {filtered.length > 0 && view === "list" && (
                <div className="flex flex-col gap-2">
                    {/* List header */}
                    <div className="hidden md:flex items-center gap-4 px-5 py-2 text-[10px] font-semibold uppercase tracking-wider text-zinc-400">
                        <span className="w-2.5" />
                        <span className="flex-1">Task</span>
                        <span className="w-24 hidden sm:block">Budget</span>
                        <span className="w-14 hidden md:block">Applicants</span>
                        <span className="w-20 hidden sm:block">Status</span>
                        <span className="w-20 hidden lg:block text-right">Posted</span>
                        <span className="w-24">Actions</span>
                    </div>
                    {filtered.map((task) => (
                        <TaskRow key={task._id} task={task} />
                    ))}
                </div>
            )}

        </div>
    );
}