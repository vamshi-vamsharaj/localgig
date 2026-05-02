"use client";

import Link from "next/link";
import {
    ClipboardList,
    Zap,
    Users,
    MessageSquare,
    CheckCircle2,
    Clock,
    ArrowUpRight,
    IndianRupee,
    ChevronRight,
    Send,
    Hourglass,
    ThumbsUp,
    XCircle,
} from "lucide-react";
import type { DashboardData } from "@/lib/actions/dashboard";

function timeAgo(iso: string) {
    const diff = Date.now() - new Date(iso).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    return `${Math.floor(hrs / 24)}d ago`;
}

function greeting() {
    const h = new Date().getHours();
    if (h < 12) return "Good morning";
    if (h < 17) return "Good afternoon";
    return "Good evening";
}

const TASK_STATUS: Record<string, { label: string; dot: string; text: string }> = {
    open:        { label: "Open",        dot: "bg-emerald-400", text: "text-emerald-700" },
    in_progress: { label: "In Progress", dot: "bg-blue-400",    text: "text-blue-700" },
    completed:   { label: "Completed",   dot: "bg-zinc-300",    text: "text-zinc-500" },
    cancelled:   { label: "Cancelled",   dot: "bg-red-300",     text: "text-red-500" },
};

const APP_STATUS: Record<string, { label: string; badge: string }> = {
    pending:  { label: "Pending",  badge: "bg-amber-50 text-amber-700 ring-amber-200" },
    accepted: { label: "Accepted", badge: "bg-emerald-50 text-emerald-700 ring-emerald-200" },
    rejected: { label: "Rejected", badge: "bg-red-50 text-red-600 ring-red-200" },
};

// ─── Stat Card ────────────────────────────────────────────────────────────────

function StatCard({
    icon: Icon, label, value, sub, href, accent,
}: {
    icon: React.ElementType;
    label: string;
    value: number;
    sub?: string;
    href: string;
    accent: string;
}) {
    return (
        <Link
            href={href}
            className="group flex items-center gap-3 bg-white rounded-xl border border-zinc-100 px-3 sm:px-4 py-3 sm:py-3.5 shadow-sm hover:shadow-md hover:border-zinc-200 transition-all duration-150"
        >
            <div className={`h-8 w-8 rounded-lg flex items-center justify-center shrink-0 ${accent}`}>
                <Icon className="h-4 w-4" />
            </div>
            <div className="flex-1 min-w-0">
                <p className="text-[10px] sm:text-xs font-medium text-zinc-400 leading-none mb-1 truncate">{label}</p>
                <p className="text-lg sm:text-xl font-bold text-zinc-900 tabular-nums leading-none">{value}</p>
                {sub && <p className="text-[10px] sm:text-[11px] text-zinc-400 mt-1 font-medium truncate">{sub}</p>}
            </div>
            <ChevronRight className="h-3.5 w-3.5 text-zinc-300 group-hover:text-zinc-500 group-hover:translate-x-0.5 transition-all shrink-0" />
        </Link>
    );
}

function SectionHeader({ title, href, linkLabel }: { title: string; href: string; linkLabel: string }) {
    return (
        <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-bold text-zinc-700">{title}</h2>
            <Link
                href={href}
                className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-0.5 transition-colors"
            >
                {linkLabel} <ArrowUpRight className="h-3 w-3" />
            </Link>
        </div>
    );
}

function RecentTasks({ tasks }: { tasks: DashboardData["recentTasks"] }) {
    if (tasks.length === 0) {
        return (
            <div className="flex items-center justify-center py-10 text-center">
                <div>
                    <ClipboardList className="h-7 w-7 text-zinc-200 mx-auto mb-2" />
                    <p className="text-xs text-zinc-400 font-medium">No tasks yet</p>
                    <Link href="/tasks/new" className="text-xs text-blue-600 hover:underline mt-1 inline-block">
                        Post your first task →
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <ul className="space-y-1">
            {tasks.map((task) => {
                const s = TASK_STATUS[task.status] ?? TASK_STATUS.open;
                return (
                    <li key={task._id}>
                        <Link
                            href={`/tasks/${task._id}`}
                            className="flex items-center gap-2.5 px-2.5 sm:px-3.5 py-2.5 rounded-lg hover:bg-zinc-50 transition-colors group"
                        >
                            <span className={`h-2 w-2 rounded-full shrink-0 ${s.dot}`} />
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-semibold text-zinc-800 truncate group-hover:text-blue-600 transition-colors">
                                    {task.title}
                                </p>
                                <p className="text-xs text-zinc-400 font-medium mt-0.5">{task.category}</p>
                            </div>
                            <div className="hidden sm:flex items-center gap-0.5 text-sm font-bold text-zinc-700 shrink-0 tabular-nums">
                                <IndianRupee className="h-3 w-3 text-zinc-400" />
                                {task.budget.toLocaleString("en-IN")}
                            </div>
                            <div className="flex items-center gap-1 text-xs text-zinc-400 shrink-0">
                                <Users className="h-3 w-3" />
                                {task.applicantsCount}
                            </div>
                            <span className="hidden md:block text-[11px] text-zinc-400 shrink-0 w-14 text-right font-medium">
                                {timeAgo(task.createdAt)}
                            </span>
                        </Link>
                    </li>
                );
            })}
        </ul>
    );
}

function RecentApplications({ applications }: { applications: DashboardData["recentApplications"] }) {
    if (applications.length === 0) {
        return (
            <div className="flex items-center justify-center py-10 text-center">
                <div>
                    <Users className="h-7 w-7 text-zinc-200 mx-auto mb-2" />
                    <p className="text-xs text-zinc-400 font-medium">No applications yet</p>
                </div>
            </div>
        );
    }

    return (
        <ul className="space-y-1">
            {applications.map((app) => {
                const s = APP_STATUS[app.status] ?? APP_STATUS.pending;
                return (
                    <li key={app.applicationId}>
                        <Link
                            href="/dashboard/applicants"
                            className="flex items-center gap-2.5 px-2.5 sm:px-3.5 py-2.5 rounded-lg hover:bg-zinc-50 transition-colors group"
                        >
                            <div className="h-7 w-7 rounded-full bg-zinc-100 flex items-center justify-center text-[11px] font-bold text-zinc-500 shrink-0">
                                {app.workerName[0]?.toUpperCase()}
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-semibold text-zinc-800 truncate group-hover:text-blue-600 transition-colors">
                                    {app.workerName}
                                </p>
                                <p className="text-xs text-zinc-400 font-medium truncate mt-0.5">{app.taskTitle}</p>
                            </div>
                            {app.proposedBudget && (
                                <div className="hidden sm:flex items-center gap-0.5 text-sm font-bold text-zinc-700 shrink-0 tabular-nums">
                                    <IndianRupee className="h-3 w-3 text-zinc-400" />
                                    {app.proposedBudget.toLocaleString("en-IN")}
                                </div>
                            )}
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ring-1 shrink-0 ${s.badge}`}>
                                {s.label}
                            </span>
                            <span className="hidden md:block text-[11px] text-zinc-400 shrink-0 w-14 text-right font-medium">
                                {timeAgo(app.appliedAt)}
                            </span>
                        </Link>
                    </li>
                );
            })}
        </ul>
    );
}

interface DashboardClientProps {
    data: DashboardData;
    userName: string;
}

export default function DashboardClient({ data, userName }: DashboardClientProps) {
    const { stats, recentTasks, recentApplications } = data;

    const today = new Date().toLocaleDateString("en-IN", {
        weekday: "long", month: "long", day: "numeric",
    });

    return (
        <div className="space-y-4 sm:space-y-6">

            {/* ── Header ──────────────────────────────────────────────────── */}
            <div>
                <p className="text-xs font-medium text-zinc-400 mb-0.5">{today}</p>
                <h1 className="text-xl sm:text-2xl font-bold text-zinc-900 tracking-tight">
                    {greeting()}, {userName.split(" ")[0]} 👋
                </h1>
                <p className="text-sm text-zinc-400 font-medium mt-0.5">
                    Here's what's happening on your LocalGig dashboard
                </p>
            </div>

            {/* ── Tasks Posted — Stat Cards ────────────────────────────────── */}
            <div>
                <p className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider mb-2 px-0.5">
                    Tasks Posted
                </p>
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3">
                    <StatCard
                        icon={ClipboardList}
                        label="Total Tasks"
                        value={stats.totalTasks}
                        sub={`${stats.completedTasks} completed`}
                        href="/dashboard/posted"
                        accent="bg-blue-50 text-blue-600"
                    />
                    <StatCard
                        icon={Zap}
                        label="Active Tasks"
                        value={stats.activeTasks}
                        sub="in progress"
                        href="/dashboard/posted"
                        accent="bg-amber-50 text-amber-600"
                    />
                    <StatCard
                        icon={Users}
                        label="Applications"
                        value={stats.applicationsReceived}
                        sub={`${stats.pendingApplications} pending`}
                        href="/dashboard/applicants"
                        accent="bg-violet-50 text-violet-600"
                    />
                    <StatCard
                        icon={MessageSquare}
                        label="Unread Messages"
                        value={stats.unreadMessages}
                        sub="across all chats"
                        href="/dashboard/messages"
                        accent="bg-teal-50 text-teal-600"
                    />
                </div>
            </div>

            {/* ── Tasks Applied To — Stat Cards ───────────────────────────── */}
            <div>
                <p className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider mb-2 px-0.5">
                    Tasks Applied To
                </p>
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3">
                    <StatCard
                        icon={Send}
                        label="Total Applied"
                        value={stats.totalApplied}
                        sub="all time"
                        href="/dashboard/applied"
                        accent="bg-indigo-50 text-indigo-600"
                    />
                    <StatCard
                        icon={Hourglass}
                        label="Awaiting Response"
                        value={stats.appliedPending}
                        sub="pending review"
                        href="/dashboard/applied"
                        accent="bg-amber-50 text-amber-600"
                    />
                    <StatCard
                        icon={ThumbsUp}
                        label="Accepted"
                        value={stats.appliedAccepted}
                        sub="offers received"
                        href="/dashboard/applied"
                        accent="bg-emerald-50 text-emerald-600"
                    />
                    <StatCard
                        icon={XCircle}
                        label="Rejected"
                        value={stats.appliedRejected}
                        sub="not selected"
                        href="/dashboard/applied"
                        accent="bg-red-50 text-red-500"
                    />
                </div>
            </div>

            {/* ── Split: Recent Tasks + Recent Applications ────────────────── */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4">
                <div className="bg-white rounded-xl border border-zinc-100 shadow-sm">
                    <div className="px-3 sm:px-4 pt-4 pb-3 border-b border-zinc-50">
                        <SectionHeader title="Recent Tasks" href="/dashboard/posted" linkLabel="View all" />
                    </div>
                    <div className="px-1 sm:px-2 py-2">
                        <RecentTasks tasks={recentTasks} />
                    </div>
                </div>
                <div className="bg-white rounded-xl border border-zinc-100 shadow-sm">
                    <div className="px-3 sm:px-4 pt-4 pb-3 border-b border-zinc-50">
                        <SectionHeader title="Recent Applications" href="/dashboard/applied" linkLabel="View all" />
                    </div>
                    <div className="px-1 sm:px-2 py-2">
                        <RecentApplications applications={recentApplications} />
                    </div>
                </div>
            </div>

            {/* ── Summary row ──────────────────────────────────────────────── */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3">
                {[
                    { label: "Open Tasks",      value: recentTasks.filter(t => t.status === "open").length, icon: Clock,        color: "text-emerald-600" },
                    { label: "In Progress",     value: stats.activeTasks,                                    icon: Zap,          color: "text-blue-600" },
                    { label: "Completed",       value: stats.completedTasks,                                 icon: CheckCircle2, color: "text-zinc-500" },
                    { label: "Pending Reviews", value: stats.pendingApplications,                            icon: Users,        color: "text-amber-600" },
                ].map(({ label, value, icon: Icon, color }) => (
                    <div key={label} className="flex items-center gap-2 bg-white rounded-xl border border-zinc-100 px-3 sm:px-3.5 py-3 shadow-sm">
                        <Icon className={`h-4 w-4 shrink-0 ${color}`} />
                        <div className="min-w-0">
                            <p className="text-base sm:text-lg font-bold text-zinc-900 tabular-nums leading-none">{value}</p>
                            <p className="text-[10px] sm:text-[11px] text-zinc-400 font-medium mt-0.5 truncate">{label}</p>
                        </div>
                    </div>
                ))}
            </div>

        </div>
    );
}