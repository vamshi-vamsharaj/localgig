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

export async function acceptApplication(
    applicationId: string,
    clientId: string
): Promise<ActionResult<{ conversationId: string }>> {
    await connectDB();

    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const application = await Application.findById(applicationId)
            .session(session)
            .lean();

        if (!application) {
            await session.abortTransaction();
            return { success: false, error: "Application not found" };
        }

        if (application.status !== "pending") {
            await session.abortTransaction();
            return { success: false, error: "Application is no longer pending" };
        }

        // Ownership check
        const task = await Task.findById(application.taskId)
            .select("clientId status")
            .session(session)
            .lean();

        if (!task) {
            await session.abortTransaction();
            return { success: false, error: "Task not found" };
        }

        if (task.clientId.toString() !== clientId) {
            await session.abortTransaction();
            return { success: false, error: "Unauthorized" };
        }

        if (task.status !== "open") {
            await session.abortTransaction();
            return { success: false, error: "Task is no longer accepting applications" };
        }

        // 1. Accept this application
        await Application.findByIdAndUpdate(
            applicationId,
            { status: "accepted" },
            { session }
        );

        // 2. Reject all other pending applications for this task
        await Application.updateMany(
            { taskId: application.taskId, _id: { $ne: applicationId }, status: "pending" },
            { status: "rejected" },
            { session }
        );

        // 3. Update task — assign worker + mark in_progress
        await Task.findByIdAndUpdate(
            application.taskId,
            { status: "in_progress", assignedWorkerId: application.workerId },
            { session }
        );

        // 4. Get or create a conversation between client and worker
        let conversation = await Conversation.findOne({
            taskId:   application.taskId,
            clientId,
            workerId: application.workerId,
        }).session(session);

        if (!conversation) {
            [conversation] = await Conversation.create(
                [{ taskId: application.taskId, clientId, workerId: application.workerId }],
                { session }
            );
        }

        await session.commitTransaction();

        return {
            success: true,
            data: { conversationId: conversation._id.toString() },
        };
    } catch (err) {
        await session.abortTransaction();
        console.error("[acceptApplication]", err);
        return { success: false, error: "Failed to accept application" };
    } finally {
        session.endSession();
    }
}
