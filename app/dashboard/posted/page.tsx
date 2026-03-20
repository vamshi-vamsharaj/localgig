import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/auth";
import { getMyTasks, getMyTaskStats } from "@/lib/actions/my-tasks";
import MyTasks from "@/components/dashboard/MyTasks";

export default async function MyTasksPage() {
    const session = await getSession();
    if (!session?.user) redirect("/login");

    const userId = (session.user as { id: string }).id;

    const [tasks, stats] = await Promise.all([
        getMyTasks(userId),
        getMyTaskStats(userId),
    ]);

    return <MyTasks  tasks={tasks} stats={stats} />;
}