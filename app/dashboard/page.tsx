import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/auth";
import {
    getDashboardStats,
} from "@/lib/actions/dashboard-stats";

import DashboardStats from "@/components/dashboard/dashboard-stats";

export default async function DashboardPage() {
    const session = await getSession();
    if (!session?.user) redirect("/login");

    const userId = (session.user as { id: string }).id;

    const [stats] = await Promise.all([
        getDashboardStats(userId),
    ]);

    return (
        <div className="space-y-6 max-w-[1200px] mx-auto">
            <DashboardStats stats={stats} />
        </div>
    );
}