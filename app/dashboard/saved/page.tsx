import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/auth";
import { getSavedTasks, getSavedTaskIds } from "@/lib/actions/savedTasks";
import SavedTasksClient from "@/components/dashboard/savedTasksClient";
import type { Task } from "@/lib/models/models.types"; // <-- Add this import

export default async function SavedTasksPage() {
    const session = await getSession();
    if (!session?.user) redirect("/login");

    const userId = session.user.id;

    // Parallel fetch — tasks + savedIds in one round trip
    const [tasks, savedIds] = await Promise.all([
        getSavedTasks(userId),
        getSavedTaskIds(userId),
    ]);

    return (
        <SavedTasksClient
            initialTasks={tasks as unknown as Task[]} 
            initialSavedIds={savedIds}
            userId={userId}
        />
    );
}