"use client";

import { useState, useMemo, useTransition } from "react";
import Link from "next/link";
import {
    Search,
    Bookmark,
    LayoutGrid,
    List,
    ChevronDown,
    X,
    Compass,
} from "lucide-react";
import { toggleSaveTask } from "@/lib/actions/savedTasks";
import SavedTaskCard from "./savedTaskCard";
import type { Task } from "@/lib/models/models.types";

type ViewMode = "grid" | "list";
type SortKey  = "newest" | "oldest" | "budget_high" | "budget_low";

const CATEGORIES = ["All", "Moving", "Delivery", "Repair", "Tutoring", "Photography", "Cleaning"] as const;
type Category = (typeof CATEGORIES)[number];

const CATEGORY_COLORS: Record<string, string> = {
    Moving:      "bg-sky-50 text-sky-700",
    Delivery:    "bg-amber-50 text-amber-700",
    Repair:      "bg-rose-50 text-rose-700",
    Tutoring:    "bg-violet-50 text-violet-700",
    Photography: "bg-pink-50 text-pink-700",
    Cleaning:    "bg-teal-50 text-teal-700",
    General:     "bg-zinc-100 text-zinc-600",
};

const STATUS_DOT: Record<string, string> = {
    open:        "bg-emerald-400",
    in_progress: "bg-amber-400",
    completed:   "bg-blue-400",
    cancelled:   "bg-zinc-300",
};

// ─── List Row ─────────────────────────────────────────────────────────────────

function SavedTaskRow({
    task,
    isSaved,
    isUnsaving,
    onUnsave,
}: {
    task: Task;
    isSaved: boolean;
    isUnsaving: boolean;
    onUnsave: (id: string) => void;
}) {
    const categoryStyle = CATEGORY_COLORS[task.category ?? "General"] ?? CATEGORY_COLORS.General;

    return (
        <div className="group flex items-center gap-3 sm:gap-4 px-3 sm:px-5 py-3 sm:py-4 bg-white border border-zinc-100 rounded-2xl hover:border-blue-200 hover:shadow-sm transition-all duration-150">
            <span className={`h-2.5 w-2.5 rounded-full shrink-0 ${STATUS_DOT[task.status] ?? "bg-zinc-300"}`} />

            <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="text-sm font-semibold text-zinc-900 group-hover:text-blue-600 transition-colors truncate">
                        {task.title}
                    </h3>
                    <span className={`hidden sm:inline-flex text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full ${categoryStyle}`}>
                        {task.category ?? "General"}
                    </span>
                </div>
                <p className="text-xs text-zinc-400 truncate mt-0.5">{task.address}</p>
            </div>

            {/* Budget */}
            <div className="hidden sm:flex items-center gap-0.5 font-bold text-zinc-900 shrink-0 w-28">
                <span className="text-zinc-400 text-sm">₹</span>
                <span className="text-sm tabular-nums">{task.budget.toLocaleString("en-IN")}</span>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
                <Link
                    href={`/tasks/${task._id}`}
                    className="h-8 sm:h-9 px-3 sm:px-4 flex items-center gap-1 sm:gap-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold transition-colors shadow-sm shadow-blue-200"
                >
                    View
                </Link>
                <button
                    onClick={() => onUnsave(task._id)}
                    disabled={isUnsaving}
                    className={`h-8 w-8 sm:h-9 sm:w-9 flex items-center justify-center rounded-xl border transition-all ${
                        isSaved
                            ? "bg-blue-600 border-blue-600 text-white hover:bg-red-500 hover:border-red-500"
                            : "border-zinc-200 text-zinc-400 hover:border-blue-300 hover:text-blue-600"
                    } disabled:opacity-50`}
                >
                    <Bookmark className="h-3.5 w-3.5" fill={isSaved ? "currentColor" : "none"} />
                </button>
            </div>
        </div>
    );
}

// ─── Empty State ──────────────────────────────────────────────────────────────

function EmptyState({ hasFilters, onClear }: { hasFilters: boolean; onClear: () => void }) {
    return (
        <div className="flex flex-col items-center justify-center py-24 text-center bg-white rounded-2xl border border-dashed border-blue-100 px-4">
            <div className="h-12 w-12 rounded-2xl bg-blue-50 flex items-center justify-center mb-4">
                {hasFilters
                    ? <Search className="h-5 w-5 text-blue-600" />
                    : <Bookmark className="h-5 w-5 text-blue-600" />
                }
            </div>
            <p className="text-sm font-semibold text-zinc-800">
                {hasFilters ? "No matching tasks" : "No saved tasks yet"}
            </p>
            <p className="text-xs text-zinc-400 mt-1 max-w-xs">
                {hasFilters
                    ? "Try a different search or clear your filters"
                    : "Browse available tasks and bookmark the ones you're interested in"
                }
            </p>
            {hasFilters ? (
                <button
                    onClick={onClear}
                    className="mt-4 inline-flex items-center gap-1.5 h-8 px-4 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold transition-colors shadow-sm shadow-blue-200"
                >
                    <X className="h-3.5 w-3.5" /> Clear Filters
                </button>
            ) : (
                <Link
                    href="/dashboard/tasks"
                    className="mt-4 inline-flex items-center gap-1.5 h-8 px-4 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold transition-colors shadow-sm shadow-blue-200"
                >
                    <Compass className="h-3.5 w-3.5" /> Browse Tasks
                </Link>
            )}
        </div>
    );
}

// ─── Main Client Component ────────────────────────────────────────────────────

interface Props {
    initialTasks: Task[];
    initialSavedIds: string[];
    userId: string;
}

export default function SavedTasksClient({ initialTasks, initialSavedIds, userId }: Props) {
    const [tasks, setTasks]             = useState<Task[]>(initialTasks);
    const [savedIds, setSavedIds]       = useState<Set<string>>(new Set(initialSavedIds));
    const [unsavingIds, setUnsavingIds] = useState<Set<string>>(new Set());
    const [search, setSearch]           = useState("");
    const [category, setCategory]       = useState<Category>("All");
    const [sort, setSort]               = useState<SortKey>("newest");
    const [view, setView]               = useState<ViewMode>("grid");
    const [isPending, startTransition]  = useTransition();

    function handleUnsave(taskId: string) {
        if (unsavingIds.has(taskId)) return;
        setUnsavingIds((prev) => new Set(prev).add(taskId));
        setTimeout(() => {
            setTasks((prev) => prev.filter((t) => t._id !== taskId));
            setSavedIds((prev) => { const next = new Set(prev); next.delete(taskId); return next; });
            setUnsavingIds((prev) => { const next = new Set(prev); next.delete(taskId); return next; });
        }, 300);
        startTransition(async () => {
            const result = await toggleSaveTask(userId, taskId);
            if (!result.success) {
                setTasks((prev) => {
                    const removed = initialTasks.find((t) => t._id === taskId);
                    if (!removed) return prev;
                    return [removed, ...prev];
                });
                setSavedIds((prev) => new Set(prev).add(taskId));
            }
        });
    }

    const filtered = useMemo(() => {
        let result = [...tasks];
        if (search.trim()) {
            const q = search.toLowerCase();
            result = result.filter(
                (t) =>
                    t.title.toLowerCase().includes(q) ||
                    (t.category ?? "").toLowerCase().includes(q) ||
                    t.address.toLowerCase().includes(q)
            );
        }
        if (category !== "All") {
            result = result.filter((t) => (t.category ?? "General") === category);
        }
        result.sort((a, b) => {
            if (sort === "newest")      return new Date(b.createdAt as unknown as string).getTime() - new Date(a.createdAt as unknown as string).getTime();
            if (sort === "oldest")      return new Date(a.createdAt as unknown as string).getTime() - new Date(b.createdAt as unknown as string).getTime();
            if (sort === "budget_high") return b.budget - a.budget;
            if (sort === "budget_low")  return a.budget - b.budget;
            return 0;
        });
        return result;
    }, [tasks, search, category, sort]);

    const hasFilters = search.trim() !== "" || category !== "All";
    function clearFilters() { setSearch(""); setCategory("All"); }

    return (
        <div className="space-y-6">

            {/* ── Header ──────────────────────────────────────────────────── */}
            <div className="flex items-start justify-between gap-4 flex-wrap">
                <div>
                    <div className="flex items-center gap-2">
                        <h1 className="text-2xl font-bold text-zinc-900 tracking-tight">Saved Tasks</h1>
                        <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full bg-blue-50 text-blue-600 ring-1 ring-blue-200">
                            <Bookmark className="h-3 w-3" fill="currentColor" />
                            {tasks.length} saved
                        </span>
                    </div>
                    <p className="text-sm text-zinc-400 mt-0.5">
                        Tasks you've bookmarked for later
                    </p>
                </div>
                <Link
                    href="/dashboard/tasks"
                    className="inline-flex items-center gap-2 h-9 px-4 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold transition-colors shadow-sm shadow-blue-200"
                >
                    <Compass className="h-3.5 w-3.5" />
                    Browse Tasks
                </Link>
            </div>

            {/* ── Toolbar ─────────────────────────────────────────────────── */}
            {tasks.length > 0 && (
                <div className="flex items-center gap-3 flex-wrap">

                    {/* Search */}
                    <div className="flex-1 min-w-[220px] relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-300" />
                        <input
                            type="text"
                            placeholder="Search by title, category or location..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full h-9 pl-9 pr-4 rounded-xl border border-zinc-200 bg-white text-sm text-zinc-800 placeholder-zinc-300 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition"
                        />
                        {search && (
                            <button
                                onClick={() => setSearch("")}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-300 hover:text-zinc-500 transition"
                            >
                                <X className="h-3.5 w-3.5" />
                            </button>
                        )}
                    </div>

                    {/* Category — pill tabs on sm+, native select on mobile */}
                    <div className="sm:hidden">
                        <div className="relative">
                            <select
                                value={category}
                                onChange={(e) => setCategory(e.target.value as Category)}
                                className="h-9 pl-3 pr-8 rounded-xl border border-zinc-200 bg-white text-xs font-medium text-zinc-600 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 appearance-none cursor-pointer transition"
                            >
                                {CATEGORIES.map((cat) => (
                                    <option key={cat} value={cat}>{cat}</option>
                                ))}
                            </select>
                            <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-400 pointer-events-none" />
                        </div>
                    </div>

                    {/* Category pill tabs — desktop only */}
                    <div className="hidden sm:flex items-center bg-zinc-100 rounded-xl p-1 gap-0.5">
                        {CATEGORIES.map((cat) => (
                            <button
                                key={cat}
                                onClick={() => setCategory(cat)}
                                className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                                    category === cat
                                        ? "bg-blue-600 text-white shadow-sm"
                                        : "text-zinc-500 hover:text-zinc-700 hover:bg-white/60"
                                }`}
                            >
                                {cat}
                            </button>
                        ))}
                    </div>

                    {/* Sort */}
                    <div className="relative">
                        <select
                            value={sort}
                            onChange={(e) => setSort(e.target.value as SortKey)}
                            className="h-9 pl-3 pr-8 rounded-xl border border-zinc-200 bg-white text-xs text-zinc-600 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 appearance-none cursor-pointer transition"
                        >
                            <option value="newest">Newest first</option>
                            <option value="oldest">Oldest first</option>
                            <option value="budget_high">High → Low</option>
                            <option value="budget_low">Low → High</option>
                        </select>
                        <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-400 pointer-events-none" />
                    </div>

                    {/* View toggle */}
                    <div className="flex items-center bg-zinc-100 rounded-xl p-1 gap-0.5">
                        {([["grid", LayoutGrid], ["list", List]] as const).map(([mode, Icon]) => (
                            <button
                                key={mode}
                                onClick={() => setView(mode)}
                                className={`h-7 w-7 flex items-center justify-center rounded-lg transition-all ${
                                    view === mode
                                        ? "bg-blue-600 text-white shadow-sm"
                                        : "text-zinc-400 hover:text-zinc-600 hover:bg-white/60"
                                }`}
                            >
                                <Icon className="h-3.5 w-3.5" />
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {/* ── Active filter chips ──────────────────────────────────────── */}
            {hasFilters && (
                <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs text-zinc-400 font-medium">Active:</span>
                    {search && (
                        <span className="inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 ring-1 ring-blue-200">
                            "{search}"
                            <button onClick={() => setSearch("")}><X className="h-3 w-3" /></button>
                        </span>
                    )}
                    {category !== "All" && (
                        <span className="inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 ring-1 ring-blue-200">
                            {category}
                            <button onClick={() => setCategory("All")}><X className="h-3 w-3" /></button>
                        </span>
                    )}
                    <button onClick={clearFilters} className="text-xs text-zinc-400 hover:text-red-500 font-medium transition-colors ml-1">
                        Clear all
                    </button>
                </div>
            )}

            {/* ── Results count ────────────────────────────────────────────── */}
            {tasks.length > 0 && (
                <p className="text-xs text-zinc-400">
                    Showing <span className="font-semibold text-blue-600">{filtered.length}</span> of{" "}
                    <span className="font-semibold text-zinc-700">{tasks.length}</span> saved tasks
                </p>
            )}

            {/* ── Empty state ──────────────────────────────────────────────── */}
            {filtered.length === 0 && (
                <EmptyState hasFilters={hasFilters} onClear={clearFilters} />
            )}

            {/* ── Grid ─────────────────────────────────────────────────────── */}
            {filtered.length > 0 && view === "grid" && (
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                    {filtered.map((task) => (
                        <div
                            key={task._id}
                            className={`transition-all duration-300 ${
                                unsavingIds.has(task._id) ? "opacity-40 scale-95 pointer-events-none" : "opacity-100 scale-100"
                            }`}
                        >
                            <SavedTaskCard
                                task={task}
                                isSaved={savedIds.has(task._id)}
                                isUnsaving={unsavingIds.has(task._id)}
                                onUnsave={handleUnsave}
                            />
                        </div>
                    ))}
                </div>
            )}

            {/* ── List ─────────────────────────────────────────────────────── */}
            {filtered.length > 0 && view === "list" && (
                <div className="flex flex-col gap-2">
                    <div className="hidden md:flex items-center gap-4 px-5 py-2 text-[10px] font-semibold uppercase tracking-wider text-zinc-400">
                        <span className="w-2.5" />
                        <span className="flex-1">Task</span>
                        <span className="w-28 hidden sm:block">Budget</span>
                        <span className="w-32">Actions</span>
                    </div>
                    {filtered.map((task) => (
                        <div
                            key={task._id}
                            className={`transition-all duration-300 ${
                                unsavingIds.has(task._id) ? "opacity-40 scale-[0.98] pointer-events-none" : "opacity-100 scale-100"
                            }`}
                        >
                            <SavedTaskRow
                                task={task}
                                isSaved={savedIds.has(task._id)}
                                isUnsaving={unsavingIds.has(task._id)}
                                onUnsave={handleUnsave}
                            />
                        </div>
                    ))}
                </div>
            )}

        </div>
    );
}