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
    Bookmark,
} from "lucide-react";
import type { FindTask } from "@/lib/actions/find-tasks";
import { toggleSaveTask } from "@/lib/actions/savedTasks";

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

// ─── Apply Button ─────────────────────────────────────────────────────────────

function ApplyButton({ taskId, hasApplied }: { taskId: string; hasApplied: boolean }) {
    const [applied, setApplied] = useState(hasApplied);
    const [isPending, startTransition] = useTransition();

    async function handleApply() {
        if (applied || isPending) return;
        startTransition(async () => {
            try {
                const res = await fetch("/api/applications", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ taskId }),
                });
                if (res.ok) setApplied(true);
            } catch {
                // silently fail — user can retry
            }
        });
    }

    if (applied) {
        return (
            <span className="flex items-center gap-1.5 h-9 px-4 rounded-xl bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200 text-xs font-semibold">
                <CheckCircle2 className="h-3.5 w-3.5" />
                Applied
            </span>
        );
    }

    return (
        <button
            onClick={handleApply}
            disabled={isPending}
            className="flex items-center justify-center gap-1.5 h-9 px-4 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold transition-colors shadow-sm shadow-blue-200 disabled:opacity-70 disabled:cursor-not-allowed"
        >
            {isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : "Apply Now"}
        </button>
    );
}

// ─── Bookmark Button ──────────────────────────────────────────────────────────
// Self-contained: owns its own optimistic state, calls toggleSaveTask directly.

function BookmarkButton({
    taskId,
    userId,
    isSaved: initialSaved,
    size = "md",
}: {
    taskId: string;
    userId: string;
    isSaved: boolean;
    size?: "sm" | "md";
}) {
    const [saved, setSaved] = useState(initialSaved);
    const [isPending, startTransition] = useTransition();

    function handleToggle() {
        if (isPending) return;

        // Optimistic update — instant
        setSaved((prev) => !prev);

        startTransition(async () => {
            const result = await toggleSaveTask(userId, taskId);
            if (!result.success) {
                // Rollback if server call fails
                setSaved((prev) => !prev);
            }
        });
    }

    const sizeClasses = size === "sm"
        ? "h-9 w-9"
        : "h-10 w-10";

    return (
        <button
            onClick={handleToggle}
            disabled={isPending}
            title={saved ? "Remove from saved" : "Save task"}
            aria-label={saved ? "Remove from saved" : "Save task"}
            className={`
                ${sizeClasses} shrink-0 flex items-center justify-center rounded-xl border
                transition-all duration-200
                ${saved
                    ? "bg-blue-600 border-blue-600 text-white hover:bg-red-500 hover:border-red-500 shadow-sm shadow-blue-200"
                    : "border-zinc-200 text-zinc-400 hover:border-blue-300 hover:text-blue-600 bg-white"
                }
                disabled:opacity-60 disabled:cursor-not-allowed
            `}
        >
            {isPending
                ? <Loader2 className="h-4 w-4 animate-spin" />
                : <Bookmark className="h-4 w-4" fill={saved ? "currentColor" : "none"} strokeWidth={2} />
            }
        </button>
    );
}


// ─── Task Card (grid) ─────────────────────────────────────────────────────────

function TaskCard({ task, userId, isSaved }: { task: FindTask; userId: string; isSaved: boolean }) {
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
                        <h3 className="text-sm sm:text-base font-semibold text-zinc-900 leading-snug line-clamp-2 group-hover:text-blue-600 transition-colors">
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
                <p className="text-xs sm:text-sm text-zinc-400 line-clamp-2 leading-relaxed -mt-1">
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
                    <ApplyButton taskId={task._id} hasApplied={task.hasApplied} />
                    <BookmarkButton taskId={task._id} userId={userId} isSaved={isSaved} />
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

function TaskRow({ task, userId, isSaved }: { task: FindTask; userId: string; isSaved: boolean }) {
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
                <ApplyButton taskId={task._id} hasApplied={task.hasApplied} />
                <BookmarkButton taskId={task._id} userId={userId} isSaved={isSaved} size="sm" />
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


interface FindTasksProps {
    tasks: FindTask[];
    stats: Stats;
    initialSavedIds: string[];
    userId: string;
}

export default function FindTasks({ tasks, stats, initialSavedIds, userId }: FindTasksProps) {
    const [search, setSearch] = useState("");
    const [category, setCategory] = useState<Category>("All");
    const [budgetRange, setBudgetRange] = useState(0); // index into BUDGET_RANGES
    const [sort, setSort] = useState<SortKey>("newest");
    const [view, setView] = useState<ViewMode>("grid");
    const [showFilters, setShowFilters] = useState(false);

    const [savedIds] = useState<Set<string>>(new Set(initialSavedIds));

    const categoryCount: Record<Category, number> = {
        All: stats.total, Moving: stats.moving, Delivery: stats.delivery,
        Repair: stats.repair, Tutoring: stats.tutoring,
        Photography: stats.photography, Cleaning: stats.cleaning,
    };

    const filtered = useMemo(() => {
        let result = [...tasks];

        if (search.trim()) {
            const q = search.toLowerCase();
            result = result.filter((t) =>
                t.title.toLowerCase().includes(q) ||
                t.description.toLowerCase().includes(q) ||
                t.category.toLowerCase().includes(q) ||
                t.address.toLowerCase().includes(q)
            );
        }

        if (category !== "All") result = result.filter((t) => t.category === category);

        const { min, max } = BUDGET_RANGES[budgetRange];
        if (min > 0 || max < Infinity) result = result.filter((t) => t.budget >= min && t.budget <= max);

        result.sort((a, b) => {
            if (sort === "newest") return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
            if (sort === "oldest") return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
            if (sort === "budget_high") return b.budget - a.budget;
            if (sort === "budget_low") return a.budget - b.budget;
            if (sort === "applicants") return b.applicantsCount - a.applicantsCount;
            return 0;
        });

        return result;
    }, [tasks, search, category, budgetRange, sort]);

    const hasFilters = search || category !== "All" || budgetRange !== 0;
    function clearFilters() { setSearch(""); setCategory("All"); setBudgetRange(0); }

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
                {/* <Link
                    href="/tasks/new"
                    className="inline-flex items-center gap-2 h-9 px-4 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold transition-colors shadow-sm shadow-blue-200"
                >
                    <Briefcase className="h-4 w-4" />
                    Post a Task
                </Link> */}
                <div className="flex items-center gap-2">
                    {savedIds.size > 0 && (
                        <Link
                            href="/dashboard/saved"
                            className="inline-flex items-center gap-2 h-11 px-4 rounded-xl border border-zinc-200 bg-white text-zinc-600 hover:border-blue-300 hover:text-blue-600 text-sm font-semibold transition-colors"
                        >
                            <Bookmark className="h-4 w-4" fill="currentColor" />
                            {savedIds.size} saved
                        </Link>
                    )}
                    <Link
                        href="/tasks/new"
                        className="inline-flex items-center gap-2 h-11 px-5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-sm font-bold transition-colors shadow-md shadow-blue-200"
                    >
                        <Briefcase className="h-4 w-4" />
                        Post a Task
                    </Link>
                </div>
            </div>

            {/* ── Category Pills ───────────────────────────────────────────── */}
            <div className="flex gap-2 flex-wrap">
                {CATEGORIES.map((cat) => (
                    <CategoryPill
                        key={cat}
                        label={cat}
                        count={categoryCount[cat]}
                        active={category === cat}
                        onClick={() => setCategory(cat)}
                    />
                ))}
            </div>

            {/* ── Toolbar ─────────────────────────────────────────────────── */}
            <div className="flex items-center gap-3 flex-wrap">

                {/* Search */}
                <div className="flex-1 min-w-[220px] relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-300" />
                    <input
                        type="text"
                        placeholder="Search tasks, categories, locations..."
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

                {/* Filter toggle */}
                <button
                    onClick={() => setShowFilters(!showFilters)}
                    className={`h-9 px-3.5 flex items-center gap-1.5 rounded-xl border text-xs font-medium transition-all ${showFilters || budgetRange !== 0
                            ? "border-blue-300 bg-blue-50 text-blue-600"
                            : "border-zinc-200 text-zinc-500 hover:border-blue-300 hover:text-blue-600 bg-white"
                        }`}
                >
                    <SlidersHorizontal className="h-3.5 w-3.5" />
                    Filters
                    {budgetRange !== 0 && (
                        <span className="h-4 w-4 rounded-full bg-blue-600 text-white text-[9px] font-bold flex items-center justify-center">1</span>
                    )}
                </button>

                {/* Sort */}
                <div className="relative">
                    <select
                        value={sort}
                        onChange={(e) => setSort(e.target.value as SortKey)}
                        className="h-9 pl-3 pr-8 rounded-xl border border-zinc-200 bg-white text-xs text-zinc-600 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 appearance-none cursor-pointer transition"
                    >
                        <option value="newest">Newest first</option>
                        <option value="oldest">Oldest first</option>
                        <option value="budget_high">Budget: High → Low</option>
                        <option value="budget_low">Budget: Low → High</option>
                        <option value="applicants">Most applicants</option>
                    </select>
                    <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-400 pointer-events-none" />
                </div>

                {/* View toggle */}
                <div className="flex items-center bg-zinc-100 rounded-xl p-1 gap-0.5">
                    {([["grid", LayoutGrid], ["list", List]] as const).map(([mode, Icon]) => (
                        <button
                            key={mode}
                            onClick={() => setView(mode)}
                            className={`h-7 w-7 flex items-center justify-center rounded-lg transition-all ${view === mode
                                    ? "bg-blue-600 text-white shadow-sm"
                                    : "text-zinc-400 hover:text-zinc-600 hover:bg-white/60"
                                }`}
                        >
                            <Icon className="h-3.5 w-3.5" />
                        </button>
                    ))}
                </div>
            </div>

            {/* ── Expanded Filters ─────────────────────────────────────────── */}
            {showFilters && (
                <div className="bg-white rounded-2xl border border-zinc-100 shadow-sm p-5">
                    <div className="flex items-center justify-between mb-4">
                        <p className="text-sm font-semibold text-zinc-800">Budget Range</p>
                        {budgetRange !== 0 && (
                            <button
                                onClick={() => setBudgetRange(0)}
                                className="text-xs text-blue-600 hover:text-blue-700 font-medium"
                            >
                                Clear
                            </button>
                        )}
                    </div>
                    <div className="flex flex-wrap gap-2">
                        {BUDGET_RANGES.map((range, i) => (
                            <button
                                key={i}
                                onClick={() => setBudgetRange(i)}
                                className={`px-3.5 py-1.5 rounded-xl border text-xs font-medium transition-all ${budgetRange === i
                                        ? "bg-blue-600 border-blue-600 text-white shadow-sm shadow-blue-200"
                                        : "border-zinc-200 text-zinc-600 hover:border-blue-300 hover:text-blue-600 bg-white"
                                    }`}
                            >
                                {range.label}
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {/* ── Active filters bar ───────────────────────────────────────── */}
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
                    {budgetRange !== 0 && (
                        <span className="inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 ring-1 ring-blue-200">
                            {BUDGET_RANGES[budgetRange].label}
                            <button onClick={() => setBudgetRange(0)}><X className="h-3 w-3" /></button>
                        </span>
                    )}
                    <button
                        onClick={clearFilters}
                        className="text-xs text-zinc-400 hover:text-red-500 font-medium transition-colors ml-1"
                    >
                        Clear all
                    </button>
                </div>
            )}

            {/* ── Results count ────────────────────────────────────────────── */}
            <p className="text-xs text-zinc-400">
                Showing <span className="font-semibold text-blue-600">{filtered.length}</span> of{" "}
                <span className="font-semibold text-zinc-700">{tasks.length}</span> tasks
            </p>

            {/* ── Empty state ──────────────────────────────────────────────── */}
            {filtered.length === 0 && (
                <div className="flex flex-col items-center justify-center py-24 text-center bg-white rounded-2xl border border-dashed border-blue-100">
                    <div className="h-12 w-12 rounded-2xl bg-blue-50 flex items-center justify-center mb-4">
                        <Briefcase className="h-5 w-5 text-blue-600" />
                    </div>
                    <p className="text-sm font-semibold text-zinc-800">No tasks found</p>
                    <p className="text-xs text-zinc-400 mt-1">
                        {hasFilters ? "Try adjusting your search or filters" : "No open tasks available right now"}
                    </p>
                    {hasFilters && (
                        <button
                            onClick={clearFilters}
                            className="mt-4 inline-flex items-center gap-1.5 h-8 px-4 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold transition-colors shadow-sm shadow-blue-200"
                        >
                            <X className="h-3.5 w-3.5" /> Clear Filters
                        </button>
                    )}
                </div>
            )}

            {/* ── Grid ─────────────────────────────────────────────────────── */}
            {filtered.length > 0 && view === "grid" && (
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                    {filtered.map((task) => (
                        <TaskCard
                            key={task._id}
                            task={task}
                            userId={userId}
                            isSaved={savedIds.has(task._id)}
                        />
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
                        <span className="w-24 hidden md:block">Applicants</span>
                        <span className="w-20 hidden lg:block text-right">Posted</span>
                        <span className="w-32">Actions</span>
                    </div>
                    {filtered.map((task) => (
                        <TaskRow
                            key={task._id}
                            task={task}
                            userId={userId}
                            isSaved={savedIds.has(task._id)}
                        />
                    ))}
                </div>
            )}

        </div>
    );
}