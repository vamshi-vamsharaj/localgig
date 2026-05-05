import { getSession } from "@/lib/auth/auth";
import { getAllOpenTasks, getFindTaskStats } from "@/lib/actions/find-tasks";
import { getSavedTaskIds } from "@/lib/actions/savedTasks";
import FindTasks from "@/components/dashboard/FindTasks";

export default async function FindTasksPage() {
    const session = await getSession();
    const userId = session?.user ? (session.user as { id: string }).id : null;

    const [tasks, stats, savedIds] = await Promise.all([
        getAllOpenTasks(userId ?? ""),
        getFindTaskStats(),
        userId ? getSavedTaskIds(userId) : Promise.resolve([]),
    ]);

    return (
        <div className="max-w-[1520px] px-4 sm:px-6 lg:px-15 py-6 mx-auto">
            <FindTasks
                tasks={tasks}
                stats={stats}
                initialSavedIds={savedIds}
                userId={userId ?? ""}
            />
        </div>
    );
}