"use client";

import { useState, useMemo } from "react";
import {
    Search,
    X,
    Hourglass,
    CheckCircle2,
    XCircle,
    Briefcase,
    ChevronDown,
    ChevronUp,
    IndianRupee,
    MapPin,
} from "lucide-react";
import ApplicationCard from "@/components/dashboard/ApplicationCard";
import type { TaskWithApplications } from "@/lib/actions/clientApplications";

type Tab = "all" | "pending" | "accepted" | "rejected";

const TAB_CONFIG: { value: Tab; label: string; icon: React.ElementType; activeClass: string; activeBg: string }[] = [
    { value: "all",      label: "All",      icon: Briefcase,    activeClass: "bg-blue-600 text-white",   activeBg: "bg-blue-600" },
    { value: "pending",  label: "Pending",  icon: Hourglass,    activeClass: "bg-amber-500 text-white",  activeBg: "bg-amber-500" },
    { value: "accepted", label: "Accepted", icon: CheckCircle2, activeClass: "bg-emerald-600 text-white",activeBg: "bg-emerald-600" },
    { value: "rejected", label: "Rejected", icon: XCircle,      activeClass: "bg-red-500 text-white",    activeBg: "bg-red-500" },
];

const TASK_STATUS_CONFIG: Record<string, { label: string; badge: string; dot: string }> = {
    open:        { label: "Open",        badge: "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200", dot: "bg-emerald-400" },
    in_progress: { label: "In Progress", badge: "bg-blue-50 text-blue-700 ring-1 ring-blue-200",          dot: "bg-blue-400" },
    completed:   { label: "Completed",   badge: "bg-zinc-100 text-zinc-600 ring-1 ring-zinc-200",          dot: "bg-zinc-400" },
    cancelled:   { label: "Cancelled",   badge: "bg-red-50 text-red-600 ring-1 ring-red-200",              dot: "bg-red-300" },
};

function TaskGroup({ task, clientId, activeTab, search }: {
    task: TaskWithApplications; clientId: string; activeTab: Tab; search: string;
}) {
    const [collapsed, setCollapsed] = useState(false);
    const [localApps, setLocalApps] = useState(task.applications);

    const taskStatus = TASK_STATUS_CONFIG[task.status] ?? TASK_STATUS_CONFIG.open;
    const taskHasAccepted = localApps.some((a) => a.status === "accepted");

    const visibleApps = useMemo(() => {
        let apps = localApps;
        if (activeTab !== "all") apps = apps.filter((a) => a.status === activeTab);
        if (search.trim()) {
            const q = search.toLowerCase();
            apps = apps.filter((a) =>
                a.worker.name.toLowerCase().includes(q) ||
                a.worker.email.toLowerCase().includes(q) ||
                (a.message ?? "").toLowerCase().includes(q)
            );
        }
        return apps;
    }, [localApps, activeTab, search]);

    if (visibleApps.length === 0) return null;

    function handleStatusChange(applicationId: string, newStatus: "accepted" | "rejected") {
        setLocalApps((prev) =>
            prev.map((a) => a.applicationId === applicationId ? { ...a, status: newStatus } : a)
        );
    }

    const counts = {
        pending:  localApps.filter((a) => a.status === "pending").length,
        accepted: localApps.filter((a) => a.status === "accepted").length,
        rejected: localApps.filter((a) => a.status === "rejected").length,
    };

    return (
        <div className="bg-white rounded-2xl border border-zinc-100 shadow-sm overflow-hidden">
            {/* ── Task header ─────────────────────────────────────────────── */}
            <button
                onClick={() => setCollapsed((c) => !c)}
                // FIX: px-4 sm:px-6 py-4 sm:py-5 for mobile
                className="w-full flex items-center justify-between gap-3 sm:gap-4 px-4 sm:px-6 py-4 sm:py-5 text-left hover:bg-zinc-50/60 transition-colors"
            >
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
                        <h2 className="text-sm sm:text-base font-bold text-zinc-900 truncate">{task.title}</h2>
                        <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2 sm:px-2.5 py-0.5 rounded-full ${taskStatus.badge}`}>
                            <span className={`h-1.5 w-1.5 rounded-full ${taskStatus.dot}`} />
                            {taskStatus.label}
                        </span>
                    </div>
                    {/* FIX: gap-2 sm:gap-4 on mobile meta row; truncate address */}
                    <div className="flex items-center gap-2 sm:gap-4 mt-1 sm:mt-1.5 text-xs sm:text-sm text-zinc-400 font-medium flex-wrap">
                        <span className="flex items-center gap-1 sm:gap-1.5">
                            <IndianRupee className="h-3 sm:h-3.5 w-3 sm:w-3.5" />
                            {task.budget.toLocaleString("en-IN")}
                        </span>
                        <span className="flex items-center gap-1 sm:gap-1.5 truncate">
                            <MapPin className="h-3 sm:h-3.5 w-3 sm:w-3.5 shrink-0" />
                            <span className="truncate">{task.address}</span>
                        </span>
                    </div>
                </div>

                {/* Count badges — hide text on very small screens */}
                <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
                    {counts.pending > 0 && (
                        <span className="inline-flex items-center gap-0.5 sm:gap-1 text-xs font-bold px-1.5 sm:px-2 py-1 rounded-full bg-amber-50 text-amber-700 ring-1 ring-amber-200">
                            <Hourglass className="h-3 w-3" />
                            <span className="hidden sm:inline">{counts.pending}</span>
                            <span className="sm:hidden">{counts.pending}</span>
                        </span>
                    )}
                    {counts.accepted > 0 && (
                        <span className="inline-flex items-center gap-0.5 sm:gap-1 text-xs font-bold px-1.5 sm:px-2 py-1 rounded-full bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200">
                            <CheckCircle2 className="h-3 w-3" /> {counts.accepted}
                        </span>
                    )}
                    {counts.rejected > 0 && (
                        <span className="inline-flex items-center gap-0.5 sm:gap-1 text-xs font-bold px-1.5 sm:px-2 py-1 rounded-full bg-red-50 text-red-600 ring-1 ring-red-200">
                            <XCircle className="h-3 w-3" /> {counts.rejected}
                        </span>
                    )}
                    {collapsed
                        ? <ChevronDown className="h-4 w-4 text-zinc-400 ml-0.5 sm:ml-1" />
                        : <ChevronUp className="h-4 w-4 text-zinc-400 ml-0.5 sm:ml-1" />
                    }
                </div>
            </button>

            {/* ── Application cards grid ───────────────────────────────────── */}
            {!collapsed && (
                // FIX: px-3 sm:px-6 pb-4 sm:pb-6 for mobile
                <div className="px-3 sm:px-6 pb-4 sm:pb-6 border-t border-zinc-50">
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3 sm:gap-4 pt-4 sm:pt-5">
                        {visibleApps.map((app) => (
                            <ApplicationCard
                                key={app.applicationId}
                                application={app}
                                clientId={clientId}
                                taskBudget={task.budget}
                                taskAccepted={taskHasAccepted && app.status === "pending"}
                                onStatusChange={handleStatusChange}
                            />
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}

// ─── Stat Card ────────────────────────────────────────────────────────────────

function StatCard({ label, value, icon: Icon, active, onClick, colorClass }: {
    label: string; value: number; icon: React.ElementType;
    active: boolean; onClick: () => void; colorClass: string;
}) {
    return (
        <button
            onClick={onClick}
            // FIX: removed min-w-[120px]; full width inside grid cell
            className={`w-full text-left rounded-xl sm:rounded-2xl px-3 sm:px-5 py-3 sm:py-4 border transition-all duration-200 ${
                active
                    ? `${colorClass} shadow-lg scale-[1.01] border-transparent`
                    : "bg-white border-zinc-100 hover:border-zinc-300 shadow-sm hover:shadow-md"
            }`}
        >
            <div className={`h-7 w-7 sm:h-8 sm:w-8 rounded-lg sm:rounded-xl flex items-center justify-center mb-2 sm:mb-3 ${active ? "bg-white/20" : "bg-zinc-100"}`}>
                <Icon className={`h-3.5 w-3.5 sm:h-4 sm:w-4 ${active ? "text-white" : "text-zinc-600"}`} />
            </div>
            {/* FIX: text-2xl on mobile */}
            <p className={`text-2xl sm:text-3xl font-bold tracking-tight tabular-nums ${active ? "text-white" : "text-zinc-900"}`}>
                {value}
            </p>
            <p className={`text-xs font-semibold mt-0.5 truncate ${active ? "text-white/70" : "text-zinc-400"}`}>
                {label}
            </p>
        </button>
    );
}

// ─── Main Component ───────────────────────────────────────────────────────────

interface Props {
    tasks: TaskWithApplications[];
    clientId: string;
}

export default function ApplicationsClient({ tasks, clientId }: Props) {
    const [activeTab, setActiveTab] = useState<Tab>("all");
    const [search, setSearch] = useState("");

    const allApplications = tasks.flatMap((t) => t.applications);
    const counts = {
        all:      allApplications.length,
        pending:  allApplications.filter((a) => a.status === "pending").length,
        accepted: allApplications.filter((a) => a.status === "accepted").length,
        rejected: allApplications.filter((a) => a.status === "rejected").length,
    };

    const visibleTasks = useMemo(() => {
        return tasks.filter((task) => {
            let apps = task.applications;
            if (activeTab !== "all") apps = apps.filter((a) => a.status === activeTab);
            if (search.trim()) {
                const q = search.toLowerCase();
                apps = apps.filter((a) =>
                    a.worker.name.toLowerCase().includes(q) ||
                    (a.message ?? "").toLowerCase().includes(q)
                );
            }
            return apps.length > 0;
        });
    }, [tasks, activeTab, search]);

    return (
        <div className="space-y-5 sm:space-y-7">

            {/* ── Header ──────────────────────────────────────────────────── */}
            <div>
                {/* FIX: text-xl on mobile, sm:text-3xl */}
                <h1 className="text-xl sm:text-3xl font-bold text-zinc-900 tracking-tight">Applications</h1>
                <p className="text-sm sm:text-base text-zinc-400 mt-1 font-medium">
                    Review and respond to workers who applied to your tasks
                </p>
            </div>

            {/* ── Stat Cards ──────────────────────────────────────────────── */}
            {/* FIX: grid-cols-2 sm:grid-cols-4 instead of flex-wrap with min-w */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3">
                <StatCard label="Total"    value={counts.all}      icon={Briefcase}    active={activeTab === "all"}      onClick={() => setActiveTab("all")}      colorClass="bg-blue-600" />
                <StatCard label="Pending"  value={counts.pending}  icon={Hourglass}    active={activeTab === "pending"}  onClick={() => setActiveTab("pending")}  colorClass="bg-amber-500" />
                <StatCard label="Accepted" value={counts.accepted} icon={CheckCircle2} active={activeTab === "accepted"} onClick={() => setActiveTab("accepted")} colorClass="bg-emerald-600" />
                <StatCard label="Rejected" value={counts.rejected} icon={XCircle}      active={activeTab === "rejected"} onClick={() => setActiveTab("rejected")} colorClass="bg-red-500" />
            </div>

            {/* ── Search + Tab Pills ───────────────────────────────────────── */}
            {/* FIX: flex-col on mobile, search full width, tabs wrap below */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
                <div className="relative w-full sm:flex-1">
                    <Search className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-300" />
                    <input
                        type="text"
                        placeholder="Search by worker name or message..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full h-10 sm:h-11 pl-10 sm:pl-11 pr-9 rounded-xl border border-zinc-200 bg-white text-sm font-medium text-zinc-800 placeholder-zinc-300 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition"
                    />
                    {search && (
                        <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-300 hover:text-zinc-500 transition">
                            <X className="h-4 w-4" />
                        </button>
                    )}
                </div>

                {/* Tab pills — icon+label on sm+; mobile shows a select */}
                <div className="hidden sm:flex items-center bg-zinc-100 rounded-xl p-1 gap-0.5">
                    {TAB_CONFIG.map(({ value, label, icon: Icon, activeBg }) => (
                        <button
                            key={value}
                            onClick={() => setActiveTab(value)}
                            className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-semibold transition-all ${
                                activeTab === value
                                    ? `${activeBg} text-white shadow-sm`
                                    : "text-zinc-500 hover:text-zinc-700 hover:bg-white/60"
                            }`}
                        >
                            <Icon className="h-3.5 w-3.5" />
                            {label}
                            <span className={`text-xs font-bold px-1.5 py-0.5 rounded-full ${
                                activeTab === value ? "bg-white/20 text-white" : "bg-zinc-200 text-zinc-500"
                            }`}>
                                {counts[value]}
                            </span>
                        </button>
                    ))}
                </div>

                {/* Mobile tab select */}
                <div className="relative sm:hidden">
                    <select
                        value={activeTab}
                        onChange={(e) => setActiveTab(e.target.value as Tab)}
                        className="w-full h-10 pl-3 pr-8 rounded-xl border border-zinc-200 bg-white text-sm font-semibold text-zinc-700 focus:outline-none appearance-none cursor-pointer"
                    >
                        {TAB_CONFIG.map((t) => (
                            <option key={t.value} value={t.value}>
                                {t.label} ({counts[t.value]})
                            </option>
                        ))}
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400 pointer-events-none" />
                </div>
            </div>

            <p className="text-sm text-zinc-400 font-medium">
                Showing applications for{" "}
                <span className="font-bold text-zinc-700">{visibleTasks.length}</span>{" "}
                task{visibleTasks.length !== 1 ? "s" : ""}
            </p>

            {visibleTasks.length === 0 && (
                <div className="flex flex-col items-center justify-center py-16 sm:py-28 text-center bg-white rounded-2xl border border-dashed border-zinc-200">
                    <div className="h-12 sm:h-14 w-12 sm:w-14 rounded-2xl bg-zinc-50 flex items-center justify-center mb-4 sm:mb-5">
                        <Briefcase className="h-5 sm:h-6 w-5 sm:w-6 text-zinc-400" />
                    </div>
                    <p className="text-base sm:text-lg font-bold text-zinc-800">No applications found</p>
                    <p className="text-sm text-zinc-400 mt-1.5 font-medium">
                        {search ? "Try a different search term" : activeTab !== "all" ? `No ${activeTab} applications yet` : "Workers haven't applied to your tasks yet"}
                    </p>
                    {(search || activeTab !== "all") && (
                        <button
                            onClick={() => { setSearch(""); setActiveTab("all"); }}
                            className="mt-4 sm:mt-5 inline-flex items-center gap-2 h-9 sm:h-10 px-4 sm:px-5 rounded-xl bg-zinc-900 hover:bg-zinc-700 text-white text-sm font-bold transition-colors"
                        >
                            <X className="h-4 w-4" /> Clear Filters
                        </button>
                    )}
                </div>
            )}

            {visibleTasks.length > 0 && (
                <div className="space-y-4 sm:space-y-5">
                    {visibleTasks.map((task) => (
                        <TaskGroup
                            key={task.taskId}
                            task={task}
                            clientId={clientId}
                            activeTab={activeTab}
                            search={search}
                        />
                    ))}
                </div>
            )}

        </div>
    );
}