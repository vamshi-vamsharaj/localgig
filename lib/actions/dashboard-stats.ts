import connectDB from "@/lib/db";
import { Task, Application } from "@/lib/models";

export async function getDashboardStats(userId: string) {
    await connectDB()

    const taskIds = await Task.find({ clientId: userId }).distinct("_id")

    const [
        tasksPosted,
        applicationsReceived,
        activeTasks,
        completedTasks,
        tasksApplied,
        workerActiveTasks,
        workerCompletedTasks
    ] = await Promise.all([
        Task.countDocuments({ clientId: userId }),
        Application.countDocuments({ taskId: { $in: taskIds } }),
        Task.countDocuments({ clientId: userId, status: "in_progress" }),
        Task.countDocuments({ clientId: userId, status: "completed" }),

        Application.countDocuments({ workerId: userId }),

        Application.countDocuments({
            workerId: userId,
            status: "accepted"
        }),

        Application.countDocuments({
            workerId: userId,
            status: "completed"
        })
    ])

    const earnings = workerCompletedTasks * 500

    return {
        tasksPosted,
        applicationsReceived,
        activeTasks,
        completedTasks,
        earnings,
        tasksApplied,
        workerActiveTasks,
        workerCompletedTasks
    }
}
