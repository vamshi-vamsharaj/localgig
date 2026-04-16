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
        open:        "bg-emerald-400",
        in_progress: "bg-amber-400",
        completed:   "bg-blue-400",
        cancelled:   "bg-zinc-300",
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
                    className={`h-9 w-9 flex items-center justify-center rounded-xl border transition-all ${
                        isSaved
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
