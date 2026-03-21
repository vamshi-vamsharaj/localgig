import connectDB from "@/lib/db";
import { Application } from "@/lib/models";

export type AppStatus = "pending" | "accepted" | "rejected";
export type TaskStatus = "open" | "in_progress" | "completed" | "cancelled";

export interface AppliedTask {
    applicationId: string;
    applicationStatus: AppStatus;
    proposedBudget?: number;
    appliedAt: string;
    task: {
        _id: string;
        title: string;
        description: string;
        category: string;
        budget: number;
        estimatedHours?: number;
        address: string;
        status: TaskStatus;
        deadline?: string;
        clientId: string;
    } | null;
}

export async function getAppliedTasks(userId: string): Promise<AppliedTask[]> {
    await connectDB();

    const applications = await Application.find({ workerId: userId })
        .populate("taskId")
        .sort({ createdAt: -1 })
        .lean();

    return applications.map((app: any) => ({
        applicationId: app._id.toString(),
        applicationStatus: app.status,
        proposedBudget: app.proposedBudget,
        appliedAt: new Date(app.createdAt).toISOString(),
        task: app.taskId
            ? {
                  _id: app.taskId._id.toString(),
                  title: app.taskId.title,
                  description: app.taskId.description,
                  category: app.taskId.category ?? "General",
                  budget: app.taskId.budget,
                  estimatedHours: app.taskId.estimatedHours,
                  address: app.taskId.address,
                  status: app.taskId.status,
                  deadline: app.taskId.deadline
                      ? new Date(app.taskId.deadline).toISOString()
                      : undefined,
                  clientId: app.taskId.clientId?.toString() ?? "",
              }
            : null,
    }));
}

export async function getAppliedTaskStats(userId: string) {
    await connectDB();

    const [total, pending, accepted, rejected] = await Promise.all([
        Application.countDocuments({ workerId: userId }),
        Application.countDocuments({ workerId: userId, status: "pending" }),
        Application.countDocuments({ workerId: userId, status: "accepted" }),
        Application.countDocuments({ workerId: userId, status: "rejected" }),
    ]);

    return { total, pending, accepted, rejected };
}