import connectDB from "@/lib/db";
import { Task } from "@/lib/models";

export type TaskStatus = "open" | "in_progress" | "completed" | "cancelled";

export interface UserTask {
    _id: string;
    title: string;
    description: string;
    category: string;
    budget: number;
    estimatedHours?: number;
    address: string;
    status: TaskStatus;
    applicantsCount: number;
    deadline?: string;
    createdAt: string;
}

export async function getMyTasks(userId: string): Promise<UserTask[]> {
    await connectDB();

    const tasks = await Task.find({ clientId: userId })
        .sort({ createdAt: -1 })
        .lean();

    return tasks.map((t: any) => ({
        _id: t._id.toString(),
        title: t.title,
        description: t.description,
        category: t.category ?? "General",
        budget: t.budget,
        estimatedHours: t.estimatedHours,
        address: t.address,
        status: t.status,
        applicantsCount: t.applicantsCount ?? 0,
        deadline: t.deadline ? new Date(t.deadline).toISOString() : undefined,
        createdAt: new Date(t.createdAt).toISOString(),
    }));
}

export async function getMyTaskStats(userId: string) {
    await connectDB();

    const [total, open, inProgress, completed] = await Promise.all([
        Task.countDocuments({ clientId: userId }),
        Task.countDocuments({ clientId: userId, status: "open" }),
        Task.countDocuments({ clientId: userId, status: "in_progress" }),
        Task.countDocuments({ clientId: userId, status: "completed" }),
    ]);

    return { total, open, inProgress, completed };
}