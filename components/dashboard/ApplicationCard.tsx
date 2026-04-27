"use client";

import { IndianRupee, MessageSquare, Clock, User2 } from "lucide-react";
import Link from "next/link";
import type { ApplicationItem } from "@/lib/actions/clientApplications";

function getInitials(name: string) {
    return name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);
}

interface ApplicationCardProps {
    application: ApplicationItem;
    taskBudget: number;
}

export default function ApplicationCard({
    application,
    taskBudget,
}: ApplicationCardProps) {
    const initials = getInitials(application.worker.name);
    const budgetDiff = application.proposedBudget
        ? application.proposedBudget - taskBudget
        : null;

    return (
        <div className="flex flex-col gap-4 bg-white rounded-2xl border border-zinc-100 p-5 shadow-sm">

            {/* ── Worker header ── */}
            <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-xl bg-blue-50 flex items-center justify-center text-sm font-bold text-blue-600 shrink-0">
                        {application.worker.avatar
                            ? <img src={application.worker.avatar} alt={application.worker.name} className="h-full w-full rounded-xl object-cover" />
                            : initials
                        }
                    </div>
                    <div>
                        <p className="text-sm font-bold text-zinc-900 leading-tight">{application.worker.name}</p>
                        <p className="text-xs text-zinc-400 font-medium mt-0.5">{application.worker.email}</p>
                    </div>
                </div>
            </div>

            {/* ── Budget ── */}
            <div className="flex items-center gap-3">
                <div className="flex-1 bg-zinc-50 rounded-xl px-4 py-3">
                    <p className="text-xs text-zinc-400 font-medium mb-0.5">Proposed Budget</p>
                    <div className="flex items-center gap-0.5 font-extrabold text-zinc-900">
                        <IndianRupee className="h-4 w-4 text-zinc-400" />
                        <span className="text-lg tabular-nums">
                            {application.proposedBudget?.toLocaleString("en-IN") ?? taskBudget.toLocaleString("en-IN")}
                        </span>
                    </div>
                    {budgetDiff !== null && (
                        <p className="text-xs font-semibold mt-0.5 text-zinc-400">
                            {budgetDiff > 0
                                ? `+₹${budgetDiff.toLocaleString("en-IN")} over budget`
                                : budgetDiff < 0
                                ? `₹${Math.abs(budgetDiff).toLocaleString("en-IN")} under budget`
                                : "Matches budget"}
                        </p>
                    )}
                </div>
                <div className="text-right">
                    <p className="text-xs text-zinc-400 font-medium">Applied</p>
                    <p className="text-xs font-semibold text-zinc-600 mt-0.5 flex items-center gap-1 justify-end">
                        <Clock className="h-3 w-3" />
                        {new Date(application.appliedAt).toLocaleDateString()}
                    </p>
                </div>
            </div>

            {/* ── Cover message ── */}
            {application.message && (
                <div className="bg-zinc-50 rounded-xl p-3.5">
                    <div className="flex items-center gap-1.5 text-xs text-zinc-400 font-semibold mb-1.5">
                        <MessageSquare className="h-3.5 w-3.5" />
                        Cover Message
                    </div>
                    <p className="text-sm text-zinc-600 leading-relaxed line-clamp-3">
                        {application.message}
                    </p>
                </div>
            )}

            {/* ── Actions (placeholder) ── */}
            <div className="flex gap-2 pt-1">
                <button className="flex-1 h-9 rounded-xl bg-emerald-600 text-white text-sm font-semibold">
                    Accept
                </button>
                <button className="flex-1 h-9 rounded-xl border border-red-200 text-red-600 text-sm font-semibold">
                    Reject
                </button>
                <Link
                    href={`/profile/${application.worker._id}`}
                    className="h-9 w-9 flex items-center justify-center rounded-xl border border-zinc-200 text-zinc-400 hover:text-blue-600 hover:border-blue-300 transition-colors"
                    title="View worker profile"
                >
                    <User2 className="h-4 w-4" />
                </Link>
            </div>
        </div>
    );
}