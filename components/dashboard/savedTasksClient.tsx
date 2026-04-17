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

// ─── Types ────────────────────────────────────────────────────────────────────

type ViewMode = "grid" | "list";
type SortKey = "newest" | "oldest" | "budget_high" | "budget_low";

const CATEGORIES = ["All", "Moving", "Delivery", "Repair", "Tutoring", "Photography", "Cleaning"] as const;
type Category = (typeof CATEGORIES)[number];

const CATEGORY_COLORS: Record<string, string> = {
    Moving: "bg-sky-50 text-sky-700",
    Delivery: "bg-amber-50 text-amber-700",
    Repair: "bg-rose-50 text-rose-700",
    Tutoring: "bg-violet-50 text-violet-700",
    Photography: "bg-pink-50 text-pink-700",
    Cleaning: "bg-teal-50 text-teal-700",
    General: "bg-zinc-100 text-zinc-600",
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

    const STATUS_DOT: Record<string, string> = {
        open: "bg-emerald-400",
        in_progress: "bg-amber-400",
        completed: "bg-blue-400",
        cancelled: "bg-zinc-300",
    };

    return (
        <div className="group flex items-center gap-5 px-6 py-5 bg-white border border-zinc-100 rounded-2xl hover:border-blue-200 hover:shadow-md transition-all duration-150">
            <span className={`h-3 w-3 rounded-full shrink-0 ${STATUS_DOT[task.status] ?? "bg-zinc-300"}`} />

            <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="text-base font-bold text-zinc-900 group-hover:text-blue-600 transition-colors truncate">
                        {task.title}
                    </h3>
                    <span className={`hidden sm:inline-flex text-xs font-semibold uppercase tracking-wide px-2.5 py-0.5 rounded-full ${categoryStyle}`}>
                        {task.category ?? "General"}
                    </span>
                </div>
                <p className="text-sm text-zinc-400 truncate mt-0.5 font-medium">{task.address}</p>
            </div>

            <div className="hidden sm:flex items-center gap-0.5 font-extrabold text-zinc-900 shrink-0 w-32">
                <span className="text-zinc-400 text-sm">₹</span>
                <span className="text-base tabular-nums">{task.budget.toLocaleString("en-IN")}</span>
            </div>

            <div className="flex items-center gap-2 shrink-0">
                <Link
                    href={`/tasks/${task._id}`}
                    className="h-9 px-4 flex items-center gap-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-sm font-bold transition-colors shadow-sm shadow-blue-200"
                >
                    View
                </Link>
                <button
                    onClick={() => onUnsave(task._id)}
                    disabled={isUnsaving}
                    className={`h-9 w-9 flex items-center justify-center rounded-xl border transition-all ${isSaved
                            ? "bg-blue-600 border-blue-600 text-white hover:bg-red-500 hover:border-red-500"
                            : "border-zinc-200 text-zinc-400 hover:border-blue-300 hover:text-blue-600"
                        } disabled:opacity-50`}
                >
                    <Bookmark className="h-4 w-4" fill={isSaved ? "currentColor" : "none"} />
                </button>
            </div>
        </div>
    );
}

// ─── Empty State ──────────────────────────────────────────────────────────────

function EmptyState({ hasFilters, onClear }: { hasFilters: boolean; onClear: () => void }) {
    return (
        <div className="flex flex-col items-center justify-center py-28 text-center bg-white rounded-2xl border border-dashed border-blue-100">
            <div className="h-16 w-16 rounded-2xl bg-blue-50 flex items-center justify-center mb-5">
                {hasFilters
                    ? <Search className="h-7 w-7 text-blue-600" />
                    : <Bookmark className="h-7 w-7 text-blue-600" />
                }
            </div>
            <p className="text-xl font-bold text-zinc-800">
                {hasFilters ? "No matching tasks" : "No saved tasks yet"}
            </p>
            <p className="text-sm text-zinc-400 mt-2 font-medium max-w-xs">
                {hasFilters
                    ? "Try a different search or clear your filters"
                    : "Browse available tasks and bookmark the ones you're interested in"
                }
            </p>
            {hasFilters ? (
                <button
                    onClick={onClear}
                    className="mt-5 inline-flex items-center gap-2 h-10 px-5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-sm font-bold transition-colors shadow-sm shadow-blue-200"
                >
                    <X className="h-4 w-4" /> Clear Filters
                </button>
            ) : (
                <Link
                    href="/dashboard/tasks"
                    className="mt-5 inline-flex items-center gap-2 h-10 px-5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-sm font-bold transition-colors shadow-sm shadow-blue-200"
                >
                    <Compass className="h-4 w-4" /> Browse Tasks
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
    // ── State ─────────────────────────────────────────────────────────────────
    const [tasks, setTasks] = useState<Task[]>(initialTasks);
    const [savedIds, setSavedIds] = useState<Set<string>>(new Set(initialSavedIds));
    const [unsavingIds, setUnsavingIds] = useState<Set<string>>(new Set());
    const [search, setSearch] = useState("");
    const [category, setCategory] = useState<Category>("All");
    const [sort, setSort] = useState<SortKey>("newest");
    const [view, setView] = useState<ViewMode>("grid");
    const [isPending, startTransition] = useTransition();

// ── Unsave handler (optimistic) ───────────────────────────────────────────
    function handleUnsave(taskId: string) {
        if (unsavingIds.has(taskId)) return;

        // 1. Instant UI: mark as unsaving → remove from list
        setUnsavingIds((prev) => new Set(prev).add(taskId));

        // Small delay so user sees the animation before removal
        setTimeout(() => {
            setTasks((prev) => prev.filter((t) => t._id !== taskId));
            setSavedIds((prev) => { const next = new Set(prev); next.delete(taskId); return next; });
            setUnsavingIds((prev) => { const next = new Set(prev); next.delete(taskId); return next; });
        }, 300);

        // 2. Background server call
        startTransition(async () => {
            const result = await toggleSaveTask(userId, taskId);
            if (!result.success) {
                // Rollback: restore the task
                setTasks((prev) => {
                    const removed = initialTasks.find((t) => t._id === taskId);
                    if (!removed) return prev;
                    return [removed, ...prev];
                });
                setSavedIds((prev) => new Set(prev).add(taskId));
            }
        });
    }



    const hasFilters = search.trim() !== "" || category !== "All";
    function clearFilters() { setSearch(""); setCategory("All"); }

    // ── Render ────────────────────────────────────────────────────────────────
    return (
        <div className="space-y-7">

            {/* ── Header ──────────────────────────────────────────────────── */}
            <div className="flex items-start justify-between gap-4 flex-wrap">
                <div>
                    <div className="flex items-center gap-3">
                        <h1 className="text-3xl font-bold text-zinc-900 tracking-tight">Saved Tasks</h1>
                        <span className="inline-flex items-center gap-1.5 text-sm font-semibold px-3 py-1 rounded-full bg-blue-50 text-blue-600 ring-1 ring-blue-200">
                            <Bookmark className="h-3.5 w-3.5" fill="currentColor" />
                            {tasks.length} saved
                        </span>
                    </div>
                    <p className="text-base text-zinc-400 mt-1 font-medium">
                        Tasks you've bookmarked for later
                    </p>
                </div>
                <Link
                    href="/dashboard/tasks"
                    className="inline-flex items-center gap-2 h-11 px-5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-sm font-bold transition-colors shadow-md shadow-blue-200"
                >
                    <Compass className="h-4 w-4" />
                    Browse Tasks
                </Link>
            </div>



        </div>
    );
}