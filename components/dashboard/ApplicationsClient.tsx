"use client";

import {
    Hourglass,
    CheckCircle2,
    XCircle,
    Briefcase,
} from "lucide-react";
import type { TaskWithApplications } from "@/lib/actions/clientApplications";

// ─── Stat Card ────────────────────────────────────────────────────────────────

function StatCard({ label, value, icon: Icon }: {
    label: string;
    value: number;
    icon: React.ElementType;
}) {
    return (
        <div className="w-full text-left rounded-2xl px-5 py-4 border bg-white border-zinc-100 shadow-sm">
            <div className="h-8 w-8 rounded-xl flex items-center justify-center mb-3 bg-zinc-100">
                <Icon className="h-4 w-4 text-zinc-600" />
            </div>
            <p className="text-3xl font-bold tracking-tight tabular-nums text-zinc-900">
                {value}
            </p>
            <p className="text-xs font-semibold mt-0.5 text-zinc-400">{label}</p>
        </div>
    );
}

// ─── Main Component ───────────────────────────────────────────────────────────

interface Props {
    tasks: TaskWithApplications[];
    clientId: string;
}

export default function ApplicationsClient({ tasks, clientId }: Props) {
    const allApplications = tasks.flatMap((t) => t.applications);
    const counts = {
        all:      allApplications.length,
        pending:  allApplications.filter((a) => a.status === "pending").length,
        accepted: allApplications.filter((a) => a.status === "accepted").length,
        rejected: allApplications.filter((a) => a.status === "rejected").length,
    };

    return (
        <div className="space-y-7">

            {/* ── Header ── */}
            <div>
                <h1 className="text-3xl font-bold text-zinc-900 tracking-tight">Applications</h1>
                <p className="text-base text-zinc-400 mt-1 font-medium">
                    Review and respond to workers who applied to your tasks
                </p>
            </div>

            {/* ── Stat Cards ── */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <StatCard label="Total"    value={counts.all}      icon={Briefcase}    />
                <StatCard label="Pending"  value={counts.pending}  icon={Hourglass}    />
                <StatCard label="Accepted" value={counts.accepted} icon={CheckCircle2} />
                <StatCard label="Rejected" value={counts.rejected} icon={XCircle}      />
            </div>

            {/* ── Empty state ── */}
            {tasks.length === 0 && (
                <div className="flex flex-col items-center justify-center py-28 text-center bg-white rounded-2xl border border-dashed border-zinc-200">
                    <div className="h-14 w-14 rounded-2xl bg-zinc-50 flex items-center justify-center mb-5">
                        <Briefcase className="h-6 w-6 text-zinc-400" />
                    </div>
                    <p className="text-lg font-bold text-zinc-800">No applications found</p>
                    <p className="text-sm text-zinc-400 mt-1.5 font-medium">
                        Workers haven't applied to your tasks yet
                    </p>
                </div>
            )}

        </div>
    );
}