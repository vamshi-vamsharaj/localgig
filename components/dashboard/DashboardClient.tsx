"use client";

import Link from "next/link";
import {
    ClipboardList,
    Zap,
    Users,
    MessageSquare,
    ChevronRight,
} from "lucide-react";
import type { DashboardData } from "@/lib/actions/dashboard";

function greeting() {
    const h = new Date().getHours();
    if (h < 12) return "Good morning";
    if (h < 17) return "Good afternoon";
    return "Good evening";
}

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

interface DashboardClientProps {
    data: DashboardData;
    userName: string;
}

export default function DashboardClient({ data, userName }: DashboardClientProps) {
    const { stats } = data;

    const today = new Date().toLocaleDateString("en-IN", {
        weekday: "long", month: "long", day: "numeric",
    });

    return (
        <div className="space-y-4 sm:space-y-6">

            <div>
                <p className="text-xs font-medium text-zinc-400 mb-0.5">{today}</p>
                <h1 className="text-xl sm:text-2xl font-bold text-zinc-900 tracking-tight">
                    {greeting()}, {userName.split(" ")[0]} 👋
                </h1>
                <p className="text-sm text-zinc-400 font-medium mt-0.5">
                    Here's what's happening on your LocalGig dashboard
                </p>
            </div>

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

        </div>
    );
}