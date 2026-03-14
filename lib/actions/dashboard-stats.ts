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

export async function getRecentPostedTasks(userId: string) {
  await connectDB()

  const tasks = await Task.find({ clientId: userId })
    .sort({ createdAt: -1 })
    .limit(5)
    .lean()

  return tasks.map((task: any) => ({
    _id: task._id.toString(),
    title: task.title,
    category: task.category,
    budget: task.budget,
    status: task.status,
  }))
}
export async function getRecentAppliedTasks(userId: string) {
  await connectDB()

  const applications = await Application.find({ workerId: userId })
    .sort({ createdAt: -1 })
    .limit(5)
    .populate("taskId")
    .lean()

  return applications.map((app: any) => ({
    _id: app.taskId._id.toString(),
    title: app.taskId.title,
    category: app.taskId.category,
    budget: app.taskId.budget,
    status: app.status,
  }))
}