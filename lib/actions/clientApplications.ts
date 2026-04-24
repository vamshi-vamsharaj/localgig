"use server";

import mongoose from "mongoose";
import connectDB from "@/lib/db";
import { Application, Task } from "@/lib/models";
import { Conversation } from "@/lib/models/message";
import type { ActionResult } from "@/lib/types";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface WorkerSummary {
    _id: string;
    name: string;
    email: string;
    role: string;
    avatar?: string;
}

export interface ApplicationItem {
    applicationId: string;
    status: "pending" | "accepted" | "rejected";
    message?: string;
    proposedBudget?: number;
    appliedAt: string;
    worker: WorkerSummary;
}

export interface TaskWithApplications {
    taskId: string;
    title: string;
    budget: number;
    category: string;
    status: string;
    address: string;
    applications: ApplicationItem[];
}


export async function getClientApplications(
    clientId: string
): Promise<TaskWithApplications[]> {
    await connectDB();

    // 1. Find all tasks owned by this client that have at least one application
    const clientTasks = await Task.find({ clientId })
        .select("_id title budget category status address")
        .sort({ createdAt: -1 })
        .lean();

    if (clientTasks.length === 0) return [];

    const taskIds = clientTasks.map((t: any) => t._id);

    // 2. Fetch all applications for those tasks with worker details populated
    const applications = await Application.find({ taskId: { $in: taskIds } })
  .populate("workerId", "name email role avatar")
  .sort({ createdAt: -1 })
  .lean();

    // 3. Group applications by taskId
    const appsByTask = new Map<string, ApplicationItem[]>();

    for (const app of applications) {
        const taskKey = app.taskId.toString();
        const worker = app.workerId;

        if (!appsByTask.has(taskKey)) appsByTask.set(taskKey, []);

        appsByTask.get(taskKey)!.push({
            applicationId: app._id.toString(),
            status:         app.status,
            message:        app.message,
            proposedBudget: app.proposedBudget,
            appliedAt:      (app.createdAt as Date).toISOString(),
            worker: {
                _id:    worker?._id?.toString() ?? "",
                name:   worker?.name ?? "Unknown Worker",
                email:  worker?.email ?? "",
                role:   worker?.role ?? "worker",
                avatar: worker?.avatar,
            },
        });
    }

    // 4. Merge — only return tasks that have applications
    const result: TaskWithApplications[] = clientTasks
        .filter((t: any) => appsByTask.has(t._id.toString()))
        .map((t: any) => ({
            taskId:       t._id.toString(),
            title:        t.title,
            budget:       t.budget,
            category:     t.category ?? "General",
            status:       t.status,
            address:      t.address,
            applications: appsByTask.get(t._id.toString()) ?? [],
        }));

    return result;
}

