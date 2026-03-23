import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/auth";
import { getAppliedTasks, getAppliedTaskStats } from "@/lib/actions/appliedTasks";
import AppliedTasks from "@/components/dashboard/AppliedTasks";

export default async function ApplicationsPage() {
    const session = await getSession();
    if (!session?.user) redirect("/login");

    const userId = (session.user as { id: string }).id;

    // ── Parallel fetch ───────────────────────────────────────────────────────
    const [applications, stats] = await Promise.all([
        getAppliedTasks(userId),
        getAppliedTaskStats(userId),
    ]);

    return <AppliedTasks applications={applications} stats={stats} />;
}