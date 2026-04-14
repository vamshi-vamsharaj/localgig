import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/auth";
import { getAllOpenTasks, getFindTaskStats } from "@/lib/actions/find-tasks";
import { getSavedTaskIds } from "@/lib/actions/savedTasks";
import FindTasks from "@/components/dashboard/FindTasks";

export default async function FindTasksPage() {
    const session = await getSession();
    if (!session?.user) redirect("/login");

    const userId = (session.user as { id: string }).id;

    // ── All three fetches run in parallel ────────────────────────────────────
    const [tasks, stats, savedIds] = await Promise.all([
        getAllOpenTasks(userId),
        getFindTaskStats(),
        getSavedTaskIds(userId),
    ]);

    return (
        <FindTasks
            tasks={tasks}
            stats={stats}
            initialSavedIds={savedIds}
            userId={userId}
        />
    );
}