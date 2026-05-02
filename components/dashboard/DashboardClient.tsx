"use client";

import type { DashboardData } from "@/lib/actions/dashboard";

function greeting() {
    const h = new Date().getHours();
    if (h < 12) return "Good morning";
    if (h < 17) return "Good afternoon";
    return "Good evening";
}

interface DashboardClientProps {
    data: DashboardData;
    userName: string;
}

export default function DashboardClient({ data, userName }: DashboardClientProps) {
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
        </div>
    );
}