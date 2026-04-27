"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import {
    IndianRupee,
    MessageSquare,
    CheckCircle2,
    XCircle,
    Loader2,
    Clock,
    User2,
    AlertTriangle,
    MessageCircle,
} from "lucide-react";
import { acceptApplication, rejectApplication } from "@/lib/actions/clientApplications";
import type { ApplicationItem } from "@/lib/actions/clientApplications";

// ─── Config ───────────────────────────────────────────────────────────────────

const STATUS_CONFIG = {
    pending:  { label: "Pending",  badge: "bg-amber-50 text-amber-700 ring-1 ring-amber-200",   dot: "bg-amber-400" },
    accepted: { label: "Accepted", badge: "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200", dot: "bg-emerald-400" },
    rejected: { label: "Rejected", badge: "bg-red-50 text-red-600 ring-1 ring-red-200",          dot: "bg-red-400" },
} as const;

function timeAgo(iso: string) {
    const diff = Date.now() - new Date(iso).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return "Just now";
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    const days = Math.floor(hrs / 24);
    if (days < 30) return `${days}d ago`;
    return `${Math.floor(days / 30)}mo ago`;
}

function getInitials(name: string) {
    return name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);
}

// ─── Confirm Dialog ───────────────────────────────────────────────────────────

function ConfirmDialog({
    workerName,
    onConfirm,
    onCancel,
    isPending,
}: {
    workerName: string;
    onConfirm: () => void;
    onCancel: () => void;
    isPending: boolean;
}) {
    return (
        <div className="absolute inset-0 z-10 bg-white/95 backdrop-blur-sm rounded-2xl flex flex-col items-center justify-center gap-4 p-6 text-center">
            <div className="h-12 w-12 rounded-2xl bg-amber-50 flex items-center justify-center">
                <AlertTriangle className="h-6 w-6 text-amber-500" />
            </div>
            <div>
                <p className="text-sm font-bold text-zinc-900">Accept this application?</p>
                <p className="text-xs text-zinc-500 mt-1 leading-relaxed">
                    Accepting <span className="font-semibold text-zinc-700">{workerName}</span> will reject all other applicants and start the task.
                </p>
            </div>
            <div className="flex gap-2 w-full">
                <button
                    onClick={onCancel}
                    disabled={isPending}
                    className="flex-1 h-9 rounded-xl border border-zinc-200 text-sm font-semibold text-zinc-600 hover:border-zinc-300 hover:bg-zinc-50 transition-colors disabled:opacity-50"
                >
                    Cancel
                </button>
                <button
                    onClick={onConfirm}
                    disabled={isPending}
                    className="flex-1 h-9 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-semibold transition-colors shadow-sm shadow-emerald-200 disabled:opacity-60 flex items-center justify-center gap-2"
                >
                    {isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <CheckCircle2 className="h-3.5 w-3.5" />}
                    Confirm
                </button>
            </div>
        </div>
    );
}

// ─── Props ────────────────────────────────────────────────────────────────────

interface ApplicationCardProps {
    application: ApplicationItem;
    clientId: string;
    taskBudget: number;
    taskAccepted: boolean; // true if another application for this task is already accepted
    onStatusChange: (applicationId: string, newStatus: "accepted" | "rejected", conversationId?: string) => void;
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function ApplicationCard({
    application,
    clientId,
    taskBudget,
    taskAccepted,
    onStatusChange,
}: ApplicationCardProps) {
    const [status, setStatus] = useState(application.status);
    const [conversationId, setConversationId] = useState<string | null>(null);
    const [showConfirm, setShowConfirm] = useState(false);
    const [isPending, startTransition] = useTransition();
    const [error, setError] = useState<string | null>(null);

    const s = STATUS_CONFIG[status];
    const initials = getInitials(application.worker.name);
    const budgetDiff = application.proposedBudget
        ? application.proposedBudget - taskBudget
        : null;

    function handleAcceptClick() {
        if (status !== "pending" || taskAccepted) return;
        setShowConfirm(true);
        setError(null);
    }

    function handleConfirmAccept() {
        startTransition(async () => {
            const result = await acceptApplication(application.applicationId, clientId);
            if (result.success) {
                setStatus("accepted");
                setConversationId(result.data.conversationId);
                setShowConfirm(false);
                onStatusChange(application.applicationId, "accepted", result.data.conversationId);
            } else {
                setError(result.error);
                setShowConfirm(false);
            }
        });
    }

    function handleReject() {
        if (status !== "pending") return;
        startTransition(async () => {
            const result = await rejectApplication(application.applicationId, clientId);
            if (result.success) {
                setStatus("rejected");
                onStatusChange(application.applicationId, "rejected");
            } else {
                setError(result.error);
            }
        });
    }

    return (
        <div className={`relative flex flex-col gap-4 bg-white rounded-2xl border p-5 shadow-sm transition-all duration-200 ${
            status === "accepted" ? "border-emerald-200 shadow-emerald-50" :
            status === "rejected" ? "border-zinc-100 opacity-60" :
            "border-zinc-100 hover:border-blue-100 hover:shadow-md"
        }`}>

            {/* Confirm overlay */}
            {showConfirm && (
                <ConfirmDialog
                    workerName={application.worker.name}
                    onConfirm={handleConfirmAccept}
                    onCancel={() => setShowConfirm(false)}
                    isPending={isPending}
                />
            )}

            {/* ── Worker header ────────────────────────────────────────────── */}
            <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                    {/* Avatar */}
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

                {/* Status badge */}
                <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full shrink-0 ${s.badge}`}>
                    <span className={`h-1.5 w-1.5 rounded-full ${s.dot}`} />
                    {s.label}
                </span>
            </div>

            {/* ── Budget ──────────────────────────────────────────────────── */}
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
                        <p className={`text-xs font-semibold mt-0.5 ${budgetDiff > 0 ? "text-red-500" : budgetDiff < 0 ? "text-emerald-600" : "text-zinc-400"}`}>
                            {budgetDiff > 0 ? `+₹${budgetDiff.toLocaleString("en-IN")} over budget` :
                             budgetDiff < 0 ? `₹${Math.abs(budgetDiff).toLocaleString("en-IN")} under budget` :
                             "Matches budget"}
                        </p>
                    )}
                </div>
                <div className="text-right">
                    <p className="text-xs text-zinc-400 font-medium">Applied</p>
                    <p className="text-xs font-semibold text-zinc-600 mt-0.5 flex items-center gap-1 justify-end">
                        <Clock className="h-3 w-3" />
                        {timeAgo(application.appliedAt)}
                    </p>
                </div>
            </div>

            {/* ── Message ─────────────────────────────────────────────────── */}
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

            {/* ── Error ───────────────────────────────────────────────────── */}
            {error && (
                <p className="text-xs text-red-500 font-medium px-1">{error}</p>
            )}

            {/* ── Actions ─────────────────────────────────────────────────── */}
            <div className="flex gap-2 pt-1">
                {status === "accepted" ? (
                    // Show "Start Chat" after acceptance
                    <Link
                        href={`/dashboard/messages/${conversationId ?? ""}`}
                        className="flex-1 flex items-center justify-center gap-2 h-9 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold transition-colors shadow-sm shadow-blue-200"
                    >
                        <MessageCircle className="h-4 w-4" />
                        Start Chat
                    </Link>
                ) : status === "rejected" ? (
                    <div className="flex-1 flex items-center justify-center gap-1.5 h-9 rounded-xl bg-zinc-50 text-zinc-400 text-sm font-semibold border border-zinc-100">
                        <XCircle className="h-4 w-4" />
                        Rejected
                    </div>
                ) : (
                    // Pending — show Accept + Reject
                    <>
                        <button
                            onClick={handleAcceptClick}
                            disabled={isPending || taskAccepted}
                            title={taskAccepted ? "Another application was already accepted" : "Accept this worker"}
                            className="flex-1 flex items-center justify-center gap-2 h-9 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-semibold transition-colors shadow-sm shadow-emerald-200 disabled:opacity-40 disabled:cursor-not-allowed"
                        >
                            {isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <CheckCircle2 className="h-3.5 w-3.5" />}
                            Accept
                        </button>
                        <button
                            onClick={handleReject}
                            disabled={isPending}
                            className="flex-1 flex items-center justify-center gap-2 h-9 rounded-xl border border-red-200 text-red-600 hover:bg-red-50 text-sm font-semibold transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                        >
                            {isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <XCircle className="h-3.5 w-3.5" />}
                            Reject
                        </button>
                    </>
                )}

                {/* View worker profile */}
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