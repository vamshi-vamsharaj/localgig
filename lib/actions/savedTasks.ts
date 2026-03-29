"use server";

import connectDB from "@/lib/db";
import SavedTask from "@/lib/models/savedTask";
import task from "../models/task";
import type { ActionResult, Task as TaskType } from "@/lib/types";

// ─── Save a task ──────────────────────────────────────────────────────────────

export async function saveTask(
    userId: string,
    taskId: string
): Promise<ActionResult<{ saved: boolean }>> {
    try {
        await connectDB();

        await SavedTask.create({ userId, taskId });

        return { success: true, data: { saved: true } };
    } catch (err: any) {
        // code 11000 = duplicate key — already saved
        if (err.code === 11000) {
            return { success: false, error: "Task already saved" };
        }
        return { success: false, error: "Failed to save task" };
    }
}

// ─── Unsave a task ────────────────────────────────────────────────────────────

export async function unsaveTask(
    userId: string,
    taskId: string
): Promise<ActionResult<{ saved: boolean }>> {
    try {
        await connectDB();

        const result = await SavedTask.deleteOne({ userId, taskId });

        if (result.deletedCount === 0) {
            return { success: false, error: "Saved task not found" };
        }

        return { success: true, data: { saved: false } };
    } catch {
        return { success: false, error: "Failed to unsave task" };
    }
}

// ─── Toggle save (convenience) ────────────────────────────────────────────────

export async function toggleSaveTask(
    userId: string,
    taskId: string
): Promise<ActionResult<{ saved: boolean }>> {
    try {
        await connectDB();

        const existing = await SavedTask.findOne({ userId, taskId }).lean();

        if (existing) {
            await SavedTask.deleteOne({ userId, taskId });
            return { success: true, data: { saved: false } };
        }

        await SavedTask.create({ userId, taskId });
        return { success: true, data: { saved: true } };
    } catch {
        return { success: false, error: "Failed to toggle save" };
    }
}

// ─── Check if a task is saved ─────────────────────────────────────────────────

export async function isTaskSaved(
    userId: string,
    taskId: string
): Promise<boolean> {
    await connectDB();
    const doc = await SavedTask.exists({ userId, taskId });
    return !!doc;
}

// ─── Get all saved tasks for user ─────────────────────────────────────────────

export async function getSavedTasks(userId: string): Promise<TaskType[]> {
    await connectDB();

    const saved = await SavedTask.find({ userId })
        .populate<{ taskId: TaskType }>("taskId")
        .sort({ createdAt: -1 })
        .lean() as Array<{ taskId: TaskType | null }>;

    return saved
        .filter((s) => s.taskId !== null)
        .map((s) => {
            const t = s.taskId as any;
            return {
                _id:            t._id.toString(),
                title:          t.title,
                description:    t.description,
                budget:         t.budget,
                category:       t.category ?? "General",
                estimatedHours: t.estimatedHours,
                address:        t.address,
                location:       t.location,
                deadline:       t.deadline?.toISOString(),
                status:         t.status,
                clientId:       t.clientId.toString(),
                assignedWorkerId: t.assignedWorkerId?.toString(),
                applicantsCount: t.applicantsCount,
                createdAt:      t.createdAt.toISOString(),
                updatedAt:      t.updatedAt.toISOString(),
            } satisfies TaskType;
        });
}

// ─── Get saved task IDs for user (for UI "saved" state check) ─────────────────

export async function getSavedTaskIds(userId: string): Promise<string[]> {
    await connectDB();

    const saved = await SavedTask.find({ userId }).select("taskId").lean();
    return saved.map((s: any) => s.taskId.toString());
}