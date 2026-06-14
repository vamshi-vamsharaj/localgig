"use client";

import { IndianRupee } from "lucide-react";
import type { TaskDetail } from "@/lib/actions/tasks";
import ApplyButton from "./ApplyButton";
import BookmarkButton from "./BookmarkButton";

interface BottomBarProps {
    task: TaskDetail;
    userId: string;
}

export default function TaskDetailBottomBar({ task, userId }: BottomBarProps) {
    return (
        <div className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-t border-zinc-200 shadow-[0_-4px_24px_rgba(0,0,0,0.08)]">
            <div className="max-w-2xl mx-auto px-4 py-3 flex items-center gap-3">

                <div className="flex-1 min-w-0">
                    <p className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider leading-none mb-0.5">Budget</p>
                    <div className="flex items-center gap-0.5">
                        <IndianRupee className="h-4 w-4 text-zinc-400" />
                        <span className="text-xl font-bold text-zinc-900 tabular-nums tracking-tight">
                            {task.budget.toLocaleString("en-IN")}
                        </span>
                    </div>
                </div>

                {/* Bookmark */}
                <BookmarkButton
                    taskId={task._id}
                    userId={userId}
                    isSaved={task.isSaved}
                />

                {/* Apply — primary CTA */}
                {task.status === "open" ? (
                    <div className="shrink-0">
                        <ApplyButton taskId={task._id} hasApplied={task.hasApplied} />
                    </div>
                ) : (
                    <div className="h-10 px-5 flex items-center justify-center rounded-xl bg-zinc-100 text-zinc-400 text-xs font-semibold shrink-0">
                        Closed
                    </div>
                )}
            </div>

            {/* Safe area spacer for devices with a home indicator */}
            <div className="h-safe-area-inset-bottom" />
        </div>
    );
}