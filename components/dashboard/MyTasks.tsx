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
    MoreHorizontal,
} from "lucide-react";
import type { UserTask, TaskStatus } from "@/lib/actions/my-tasks";

interface Stats {
    total: number;
    open: number;
    inProgress: number;
    completed: number;
}

type ViewMode = "grid" | "list";
type SortKey = "newest" | "oldest" | "budget_high" | "budget_low";

const STATUS_CONFIG: Record<TaskStatus, { label: string; dot: string; badge: string }> = {
    open:        { label: "Open",        dot: "bg-emerald-400", badge: "bg-white text-emerald-600 border border-emerald-200" },
    in_progress: { label: "In Progress", dot: "bg-amber-400",   badge: "bg-amber-50 text-amber-700 ring-1 ring-amber-200" },
    completed:   { label: "Completed",   dot: "bg-blue-400",    badge: "bg-blue-50 text-blue-700 ring-1 ring-blue-200" },
    cancelled:   { label: "Cancelled",   dot: "bg-zinc-300",    badge: "bg-zinc-100 text-zinc-500 ring-1 ring-zinc-200" },
};

const CATEGORY_COLORS: Record<string, string> = {
    Moving: "bg-sky-50 text-sky-700", Delivery: "bg-amber-50 text-amber-700",
    Repair: "bg-rose-50 text-rose-700", Tutoring: "bg-violet-50 text-violet-700",
    Photography: "bg-pink-50 text-pink-700", Cleaning: "bg-teal-50 text-teal-700",
    General: "bg-zinc-100 text-zinc-600",
};

const FILTER_TABS: { label: string; value: TaskStatus | "all" }[] = [
    { label: "All", value: "all" },
    { label: "Open", value: "open" },
    { label: "In Progress", value: "in_progress" },
    { label: "Completed", value: "completed" },
    { label: "Cancelled", value: "cancelled" },
];

function timeAgo(iso: string) {
    const diff = Date.now() - new Date(iso).getTime();
    const days = Math.floor(diff / 86400000);
    if (days === 0) return "Today";
    if (days === 1) return "Yesterday";
    if (days < 30) return `${days}d ago`;
    return `${Math.floor(days / 30)}mo ago`;
}

function formatDeadline(iso?: string) {
    if (!iso) return null;
    return new Date(iso).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}

// ─── Stat Card ────────────────────────────────────────────────────────────────

function StatCard({ label, value, accent, active, onClick }: {
    label: string; value: number; accent: string; active: boolean; onClick: () => void;
}) {
    return (
        <button
            onClick={onClick}
            // FIX: removed min-w-[120px]; full width inside grid cell
            className={`w-full text-left rounded-xl sm:rounded-2xl px-3 sm:px-5 py-3 sm:py-4 border transition-all duration-200 ${
                active
                    ? "bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-200"
                    : "bg-white border-zinc-100 hover:border-zinc-300 shadow-sm"
            }`}
        >
            {/* FIX: text-2xl on mobile (text-3xl is too big in 2-col grid) */}
            <div className={`text-2xl sm:text-3xl font-bold tracking-tight tabular-nums ${active ? "text-white" : "text-zinc-900"}`}>
                {value}
            </div>
            <div className={`text-xs font-medium mt-1 flex items-center gap-1.5 ${active ? "text-white/70" : "text-zinc-400"}`}>
                <span className={`h-1.5 w-1.5 rounded-full ${accent}`} />
                <span className="truncate">{label}</span>
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

        <div className={`h-[4px] w-full ${s.dot}`} />

        <div className="p-4 sm:p-5 flex flex-col gap-3 sm:gap-4 flex-1">

            {/* Header */}
            <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                    <span className={`inline-flex items-center text-xs font-semibold uppercase tracking-wide px-2.5 py-0.5 rounded-full mb-2 ${categoryStyle}`}>
                        {task.category}
                    </span>

                    <h3 className="text-base font-semibold text-zinc-900 leading-snug line-clamp-2 group-hover:text-blue-600 transition-colors">
                        {task.title}
                    </h3>
                </div>

                <div className="shrink-0">
                    <button className="h-8 w-8 rounded-lg flex items-center justify-center text-zinc-300 hover:text-zinc-600 hover:bg-zinc-50 transition">
                        <MoreHorizontal className="h-4 w-4" />
                    </button>
                </div>
            </div>

            {/* Description */}
            <p className="text-sm text-zinc-500 line-clamp-2 leading-relaxed -mt-1">
                {task.description}
            </p>

            {/* Meta */}
            <div className="flex flex-col gap-1.5 text-sm text-zinc-500">
                <span className="flex items-center gap-1.5">
                    <MapPin className="h-3.5 w-3.5 shrink-0 text-zinc-400" />
                    <span className="truncate">{task.address}</span>
                </span>

                {task.estimatedHours && (
                    <span className="flex items-center gap-1.5">
                        <Clock className="h-3.5 w-3.5 shrink-0 text-zinc-400" />
                        {task.estimatedHours}h estimated
                    </span>
                )}

                {task.deadline && (
                    <span className="flex items-center gap-1.5">
                        <Calendar className="h-3.5 w-3.5 shrink-0 text-zinc-400" />
                        Due {formatDeadline(task.deadline)}
                    </span>
                )}
            </div>

            <div className="border-t border-zinc-50" />

            {/* Budget */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-0.5 font-bold text-zinc-900">
                    <IndianRupee className="h-4 w-4 text-zinc-400" />
                    <span className="text-lg tabular-nums">
                        {task.budget.toLocaleString("en-IN")}
                    </span>
                </div>

                <div className="flex items-center gap-2">
                    <span className="flex items-center gap-1 text-sm text-zinc-500">
                        <Users className="h-3.5 w-3.5" />
                        {task.applicantsCount}
                    </span>

                    <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-0.5 rounded-full ${s.badge}`}>
                        <span className={`h-1.5 w-1.5 rounded-full ${s.dot}`} />
                        {s.label}
                    </span>
                </div>
            </div>

            {/* Actions */}
            <div className="flex gap-2 pt-1">
                <Link
                    href={`/tasks/${task._id}`}
                    className="flex-1 flex items-center justify-center gap-1.5 h-9 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold transition"
                >
                    View <ArrowUpRight className="h-3.5 w-3.5" />
                </Link>

                <Link
                    href={`/tasks/${task._id}/edit`}
                    className="h-9 w-9 flex items-center justify-center rounded-xl border border-zinc-200 text-zinc-400 hover:text-zinc-700 hover:border-zinc-300 transition"
                >
                    <Pencil className="h-4 w-4" />
                </Link>
            </div>
        </div>

        <div className="px-4 sm:px-5 py-2.5 bg-zinc-50 border-t border-zinc-100 text-xs text-zinc-400 font-medium">
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
        // FIX: gap-2 sm:gap-4, px-3 sm:px-5
        <div className="group flex items-center gap-2 sm:gap-4 px-3 sm:px-5 py-3 sm:py-4 bg-white border border-zinc-100 rounded-2xl hover:border-zinc-200 hover:shadow-sm transition-all duration-150">
            <span className={`h-2.5 w-2.5 rounded-full shrink-0 ${s.dot}`} />
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
            <div className="hidden sm:flex items-center gap-0.5 font-bold text-zinc-900 shrink-0">
                <IndianRupee className="h-3 w-3 text-zinc-400" />
                <span className="text-sm tabular-nums">{task.budget.toLocaleString("en-IN")}</span>
            </div>
            <div className="hidden md:flex items-center gap-1 text-xs text-zinc-400 shrink-0 w-14">
                <Users className="h-3.5 w-3.5" />
                {task.applicantsCount}
            </div>
            {/* FIX: status badge always visible on mobile (was hidden sm:) */}
            <span className={`inline-flex items-center gap-1 text-[10px] font-semibold px-2 sm:px-2.5 py-1 rounded-full shrink-0 ${s.badge}`}>
                <span className={`h-1.5 w-1.5 rounded-full ${s.dot} hidden sm:block`} />
                <span className="hidden sm:inline">{s.label}</span>
                {/* Mobile: just the dot */}
                <span className={`h-2 w-2 rounded-full ${s.dot} sm:hidden`} />
            </span>
            <span className="hidden lg:block text-xs text-zinc-400 shrink-0 w-20 text-right">
                {timeAgo(task.createdAt)}
            </span>
            <div className="flex items-center gap-1.5 shrink-0">
                <Link
                    href={`/tasks/${task._id}`}
                    className="h-8 px-2.5 sm:px-3 flex items-center gap-1 rounded-lg bg-blue-600 text-white text-xs font-medium hover:bg-blue-500 transition"
                >
                    <span className="hidden sm:inline">View</span>
                    <ArrowUpRight className="h-3 w-3" />
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

export default function MyTasks({ tasks, stats }: { tasks: UserTask[]; stats: Stats }) {
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState<TaskStatus | "all">("all");
    const [sort, setSort] = useState<SortKey>("newest");
    const [view, setView] = useState<ViewMode>("grid");

    const filtered = useMemo(() => {
        let result = [...tasks];
        if (search.trim()) {
            const q = search.toLowerCase();
            result = result.filter((t) =>
                t.title.toLowerCase().includes(q) ||
                t.category.toLowerCase().includes(q) ||
                t.address.toLowerCase().includes(q)
            );
        }
        if (statusFilter !== "all") result = result.filter((t) => t.status === statusFilter);
        result.sort((a, b) => {
            if (sort === "newest")      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
            if (sort === "oldest")      return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
            if (sort === "budget_high") return b.budget - a.budget;
            if (sort === "budget_low")  return a.budget - b.budget;
            return 0;
        });
        return result;
    }, [tasks, search, statusFilter, sort]);

    return (
        <div className="space-y-4 sm:space-y-6">

            {/* ── Header ──────────────────────────────────────────────────── */}
            {/* FIX: flex-col on mobile */}
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 sm:gap-4">
                <div>
                    <h1 className="text-xl sm:text-2xl font-bold text-zinc-900 tracking-tight">My Tasks</h1>
                    <p className="text-sm text-zinc-400 mt-0.5">Manage all the tasks you've posted on LocalGig</p>
                </div>
                <Link
                    href="/tasks/new"
                    className="self-start inline-flex items-center gap-2 h-9 px-4 rounded-xl bg-blue-600 text-white text-sm font-semibold hover:bg-blue-500 transition shadow-sm shadow-blue-200"
                >
                    <Plus className="h-4 w-4" />
                    Post New Task
                </Link>
            </div>

            {/* ── Stat Cards ──────────────────────────────────────────────── */}
            {/* FIX: grid-cols-2 sm:grid-cols-4 instead of flex-wrap with min-w */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3">
                <StatCard label="Total"       value={stats.total}      accent="bg-zinc-400"    active={statusFilter === "all"}         onClick={() => setStatusFilter("all")} />
                <StatCard label="Open"        value={stats.open}       accent="bg-emerald-400" active={statusFilter === "open"}        onClick={() => setStatusFilter("open")} />
                <StatCard label="In Progress" value={stats.inProgress} accent="bg-amber-400"   active={statusFilter === "in_progress"} onClick={() => setStatusFilter("in_progress")} />
                <StatCard label="Completed"   value={stats.completed}  accent="bg-blue-400"    active={statusFilter === "completed"}   onClick={() => setStatusFilter("completed")} />
            </div>

            {/* ── Toolbar ─────────────────────────────────────────────────── */}
            {/* FIX: two-row on mobile */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
                <div className="relative w-full sm:flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-300" />
                    <input
                        type="text"
                        placeholder="Search tasks..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full h-9 pl-9 pr-4 rounded-xl border border-zinc-200 bg-white text-sm text-zinc-800 placeholder-zinc-300 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition"
                    />
                </div>
                <div className="flex items-center gap-2">
                    {/* Status tabs — desktop */}
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
                    {/* Mobile status select */}
                    <div className="relative sm:hidden">
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value as TaskStatus | "all")}
                            className="h-9 pl-3 pr-8 rounded-xl border border-zinc-200 bg-white text-xs text-zinc-600 focus:outline-none appearance-none cursor-pointer"
                        >
                            {FILTER_TABS.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
                        </select>
                        <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-400 pointer-events-none" />
                    </div>
                    <div className="relative">
                        <select
                            value={sort}
                            onChange={(e) => setSort(e.target.value as SortKey)}
                            className="h-9 pl-3 pr-8 rounded-xl border border-zinc-200 bg-white text-xs text-zinc-600 focus:outline-none focus:ring-2 focus:ring-blue-500/20 appearance-none cursor-pointer"
                        >
                            <option value="newest">Newest</option>
                            <option value="oldest">Oldest</option>
                            <option value="budget_high">High budget</option>
                            <option value="budget_low">Low budget</option>
                        </select>
                        <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-400 pointer-events-none" />
                    </div>
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
            </div>

            <div className="flex items-center justify-between">
                <p className="text-xs text-zinc-400">
                    Showing <span className="font-semibold text-zinc-700">{filtered.length}</span> of{" "}
                    <span className="font-semibold text-zinc-700">{tasks.length}</span> tasks
                </p>
            </div>

            {filtered.length === 0 && (
                <div className="flex flex-col items-center justify-center py-16 sm:py-24 text-center bg-white rounded-2xl border border-dashed border-zinc-200">
                    <div className="h-12 w-12 rounded-2xl bg-zinc-100 flex items-center justify-center mb-4">
                        <Filter className="h-5 w-5 text-zinc-400" />
                    </div>
                    <p className="text-sm font-semibold text-zinc-800">No tasks found</p>
                    <p className="text-xs text-zinc-400 mt-1">
                        {search ? "Try a different search term or clear filters" : "Post your first task to get started"}
                    </p>
                    {!search && (
                        <Link href="/tasks/new" className="mt-4 inline-flex items-center gap-1.5 h-8 px-4 rounded-xl bg-blue-600 text-white text-xs font-semibold hover:bg-blue-500 transition">
                            <Plus className="h-3.5 w-3.5" /> Post a Task
                        </Link>
                    )}
                </div>
            )}

            {filtered.length > 0 && view === "grid" && (
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3 sm:gap-4">
                    {filtered.map((task) => <TaskCard key={task._id} task={task} />)}
                </div>
            )}

            {filtered.length > 0 && view === "list" && (
                <div className="flex flex-col gap-2">
                    <div className="hidden md:flex items-center gap-4 px-5 py-2 text-[10px] font-semibold uppercase tracking-wider text-zinc-400">
                        <span className="w-2.5" />
                        <span className="flex-1">Task</span>
                        <span className="hidden sm:block w-24">Budget</span>
                        <span className="hidden md:block w-14">Applicants</span>
                        <span className="hidden sm:block w-20">Status</span>
                        <span className="hidden lg:block w-20 text-right">Posted</span>
                        <span className="w-24">Actions</span>
                    </div>
                    {filtered.map((task) => <TaskRow key={task._id} task={task} />)}
                </div>
            )}

        </div>
    );
}