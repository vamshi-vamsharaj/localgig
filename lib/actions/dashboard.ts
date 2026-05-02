"use server";

import connectDB from "@/lib/db";
import { Task, Application } from "@/lib/models";
import { Conversation } from "@/lib/models/message";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface DashboardStats {
    // Tasks posted (client side)
    totalTasks: number;
    activeTasks: number;
    applicationsReceived: number;
    unreadMessages: number;
    completedTasks: number;
    pendingApplications: number;

    // Tasks applied to (worker side)
    totalApplied: number;
    appliedPending: number;
    appliedAccepted: number;
    appliedRejected: number;
}

export interface RecentTask {
    _id: string;
    title: string;
    category: string;
    budget: number;
    status: string;
    applicantsCount: number;
    createdAt: string;
}

export interface RecentApplication {
    applicationId: string;
    status: "pending" | "accepted" | "rejected";
    proposedBudget?: number;
    appliedAt: string;
    taskTitle: string;
    workerName: string;
}

export interface DashboardData {
    stats: DashboardStats;
    recentTasks: RecentTask[];
    recentApplications: RecentApplication[];
}

// ─── Main fetch ───────────────────────────────────────────────────────────────

export async function getDashboardData(userId: string): Promise<DashboardData> {
    await connectDB();

    // 1. Get task IDs owned by user (needed for application queries)
    const myTaskIds = await Task.find({ clientId: userId }).distinct("_id");

    // 2. All stats + recent data in parallel
    const [
        totalTasks,
        activeTasks,
        completedTasks,
        applicationsReceived,
        pendingApplications,
        unreadMessages,
        recentTaskDocs,
        recentAppDocs,
        // Worker-side application stats
        totalApplied,
        appliedPending,
        appliedAccepted,
        appliedRejected,
    ] = await Promise.all([
        Task.countDocuments({ clientId: userId }),
        Task.countDocuments({ clientId: userId, status: "in_progress" }),
        Task.countDocuments({ clientId: userId, status: "completed" }),
        Application.countDocuments({ taskId: { $in: myTaskIds } }),
        Application.countDocuments({ taskId: { $in: myTaskIds }, status: "pending" }),
        // Sum unread count across all conversations for this user
        Conversation.aggregate([
            { $match: { $or: [{ clientId: { $eq: userId } }, { workerId: { $eq: userId } }] } },
            { $group: { _id: null, total: { $sum: "$unreadCount" } } },
        ]).then((res) => res[0]?.total ?? 0),
        // Recent 5 tasks posted
        Task.find({ clientId: userId })
            .select("_id title category budget status applicantsCount createdAt")
            .sort({ createdAt: -1 })
            .limit(5)
            .lean(),
        // Recent 5 applications on user's tasks, with worker name
        Application.find({ taskId: { $in: myTaskIds } })
            .populate("taskId", "title")
            .populate("workerId", "name")
            .sort({ createdAt: -1 })
            .limit(5)
            .lean(),
        // Worker side: tasks this user has applied to
        Application.countDocuments({ workerId: userId }),
        Application.countDocuments({ workerId: userId, status: "pending" }),
        Application.countDocuments({ workerId: userId, status: "accepted" }),
        Application.countDocuments({ workerId: userId, status: "rejected" }),
    ]);

    return {
        stats: {
            totalTasks,
            activeTasks,
            completedTasks,
            applicationsReceived,
            pendingApplications,
            unreadMessages,
            totalApplied,
            appliedPending,
            appliedAccepted,
            appliedRejected,
        },
        recentTasks: (recentTaskDocs as any[]).map((t) => ({
            _id:            t._id.toString(),
            title:          t.title,
            category:       t.category ?? "General",
            budget:         t.budget,
            status:         t.status,
            applicantsCount: t.applicantsCount ?? 0,
            createdAt:      t.createdAt.toISOString(),
        })),
        recentApplications: (recentAppDocs as any[]).map((app) => ({
            applicationId: app._id.toString(),
            status:         app.status,
            proposedBudget: app.proposedBudget,
            appliedAt:      app.createdAt.toISOString(),
            taskTitle:      app.taskId?.title ?? "Unknown task",
            workerName:     app.workerId?.name ?? "Unknown worker",
        })),
    };
}