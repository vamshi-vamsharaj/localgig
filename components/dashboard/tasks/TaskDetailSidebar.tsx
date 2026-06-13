"use client";

import { useState } from "react";
import Link from "next/link";
import {
    IndianRupee,
    MapPin,
    Clock,
    Calendar,
    Users,
    Share2,
    CheckCircle2,
    ExternalLink,
} from "lucide-react";
import type { TaskDetail } from "@/lib/actions/tasks";
import ApplyButton from "./ApplyButton";
import BookmarkButton from "./BookmarkButton";
import { formatDate, timeAgo } from "./task-utils";

// ─── Share helper ─────────────────────────────────────────────────────────────

function ShareButton({ taskId, title }: { taskId: string; title: string }) {
    const [copied, setCopied] = useState(false);

    async function handleShare() {
        const url = `${window.location.origin}/tasks/${taskId}`;
        if (navigator.share) {
            try { await navigator.share({ title, url }); return; } catch { /* user cancelled */ }
        }
        await navigator.clipboard.writeText(url);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    }

    return (
        <button
            onClick={handleShare}
            className="flex-1 flex items-center justify-center gap-2 h-10 rounded-xl border border-zinc-200 text-zinc-500 hover:border-zinc-300 hover:bg-zinc-50 text-xs font-semibold transition-colors"
        >
            {copied ? (
                <>
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                    Copied
                </>
            ) : (
                <>
                    <Share2 className="h-3.5 w-3.5" />
                    Share
                </>
            )}
        </button>
    );
}

// ─── Meta row ─────────────────────────────────────────────────────────────────

function MetaRow({
    icon: Icon,
    label,
    value,
    valueClass = "text-zinc-900",
}: {
    icon: React.ElementType;
    label: string;
    value: string;
    valueClass?: string;
}) {
    return (
        <div className="flex items-center justify-between gap-2 py-3 border-b border-zinc-100 last:border-0">
            <span className="flex items-center gap-2 text-xs font-medium text-zinc-400">
                <Icon className="h-3.5 w-3.5 text-blue-400 shrink-0" />
                {label}
            </span>
            <span className={`text-xs font-semibold text-right max-w-[140px] truncate ${valueClass}`}>{value}</span>
        </div>
    );
}

// ─── Props ────────────────────────────────────────────────────────────────────

interface SidebarProps {
    task: TaskDetail;
    userId: string;
}

// ─── Component ───────────────────────────────────────────────────────────────

export default function TaskDetailSidebar({ task, userId }: SidebarProps) {
    const STATUS_LABEL: Record<string, { text: string; classes: string }> = {
        open:        { text: "Open",        classes: "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200" },
        in_progress: { text: "In Progress", classes: "bg-amber-50 text-amber-700 ring-1 ring-amber-200" },
        completed:   { text: "Completed",   classes: "bg-blue-50 text-blue-700 ring-1 ring-blue-200" },
        cancelled:   { text: "Cancelled",   classes: "bg-zinc-100 text-zinc-500 ring-1 ring-zinc-200" },
    };
    const statusCfg = STATUS_LABEL[task.status] ?? STATUS_LABEL.open;

    return (
        <aside className="hidden lg:flex flex-col gap-0 sticky top-24 w-full">
            <div className="bg-white rounded-2xl border border-zinc-200 shadow-sm overflow-hidden">

                {/* ── Budget hero ─────────────────────────────────────────── */}
                <div className="px-6 pt-6 pb-5 border-b border-zinc-100">
                    <div className="flex items-start justify-between gap-2 mb-1">
                        <div>
                            <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1">Budget</p>
                            <div className="flex items-center gap-1">
                                <IndianRupee className="h-5 w-5 text-zinc-400" />
                                <span className="text-3xl font-bold text-zinc-900 tabular-nums tracking-tight">
                                    {task.budget.toLocaleString("en-IN")}
                                </span>
                            </div>
                        </div>
                        <span className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-1 rounded-full shrink-0 ${statusCfg.classes}`}>
                            <span className="h-1.5 w-1.5 rounded-full bg-current opacity-70" />
                            {statusCfg.text}
                        </span>
                    </div>
                    <p className="text-xs text-zinc-400 mt-1">
                        {task.applicantsCount === 0
                            ? "Be the first to apply"
                            : `${task.applicantsCount} worker${task.applicantsCount === 1 ? "" : "s"} applied`}
                    </p>
                </div>

                {/* ── Meta ────────────────────────────────────────────────── */}
                <div className="px-6 py-2">
                    <MetaRow icon={MapPin}   label="Location"       value={task.address} />
                    {task.estimatedHours && (
                        <MetaRow icon={Clock} label="Duration" value={`${task.estimatedHours}h estimated`} />
                    )}
                    {task.deadline && (
                        <MetaRow
                            icon={Calendar}
                            label="Deadline"
                            value={formatDate(task.deadline) ?? ""}
                            valueClass="text-amber-600 font-bold"
                        />
                    )}
                    <MetaRow icon={Users} label="Applicants" value={String(task.applicantsCount)} />
                    <MetaRow icon={Clock} label="Posted"     value={timeAgo(task.createdAt)} />
                </div>

                {/* ── Actions ─────────────────────────────────────────────── */}
                <div className="px-6 pb-6 pt-3 flex flex-col gap-2.5">
                    {task.status === "open" ? (
                        <ApplyButton taskId={task._id} hasApplied={task.hasApplied} />
                    ) : (
                        <div className="flex items-center justify-center h-11 rounded-xl bg-zinc-100 text-zinc-400 text-sm font-semibold cursor-not-allowed">
                            Task no longer open
                        </div>
                    )}

                    <div className="flex gap-2">
                        <BookmarkButton
                            taskId={task._id}
                            userId={userId}
                            isSaved={task.isSaved}
                        />
                        <ShareButton taskId={task._id} title={task.title} />
                        <Link
                            href={`/tasks/${task._id}`}
                            target="_blank"
                            className="flex items-center justify-center h-10 w-10 rounded-xl border border-zinc-200 text-zinc-400 hover:text-blue-600 hover:border-blue-300 transition-colors shrink-0"
                            title="Open in new tab"
                        >
                            <ExternalLink className="h-3.5 w-3.5" />
                        </Link>
                    </div>
                </div>
            </div>

            {/* ── Safety note ─────────────────────────────────────────────── */}
            <p className="text-center text-[11px] text-zinc-400 mt-3 px-2 leading-relaxed">
                Always meet in safe, public places. LocalGig does not handle payments directly.
            </p>
        </aside>
    );
}