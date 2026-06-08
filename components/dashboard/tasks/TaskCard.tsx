"use client";

// components/tasks/TaskCard.tsx
// The single shared grid card component for LocalGig.
// Used by: components/dashboard/FindTasks.tsx  AND  components/sections/TasksSection.tsx
// No local duplicates anywhere. All styling is canonical here.

import Link from "next/link";
import {
    MapPin,
    Clock,
    IndianRupee,
    Calendar,
    ArrowUpRight,
    Users,
} from "lucide-react";
import type { FindTask } from "@/lib/actions/find-tasks";
import ApplyButton from "./ApplyButton";
import BookmarkButton from "./BookmarkButton";
import { CATEGORY_CONFIG, timeAgo, formatDate } from "./task-utils";

interface TaskCardProps {
    task: FindTask;
    userId: string;
    isSaved: boolean;
}

export default function TaskCard({ task, userId, isSaved }: TaskCardProps) {
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
                <div className="flex flex-col gap-1.5 text-sm text-zinc-500">
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

                    {task.deadline && (
                        <span className="flex items-center gap-1.5">
                            <Calendar className="h-3.5 w-3.5 shrink-0 text-blue-400" />
                            Due {formatDate(task.deadline)}
                        </span>
                    )}
                </div>

                <div className="border-t border-zinc-50" />

                {/* Footer row */}
                <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5 text-sm text-zinc-500">
                        <Users className="h-3.5 w-3.5 text-blue-400" />
                        <span>{task.applicantsCount} applied</span>
                    </div>
                    <span className="text-xs text-zinc-400">{timeAgo(task.createdAt)}</span>
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                    <ApplyButton taskId={task._id} hasApplied={task.hasApplied} />

                    <BookmarkButton taskId={task._id} userId={userId} isSaved={isSaved} />

                    <Link
                        href={`/tasks/${task._id}`}
                        className="flex items-center justify-center h-10 w-10 rounded-xl border border-zinc-200 text-zinc-400 hover:text-blue-600 hover:border-blue-300 transition-colors"
                    >
                        <ArrowUpRight className="h-4 w-4" />
                    </Link>
                </div>

            </div>
        </div>
    );
}