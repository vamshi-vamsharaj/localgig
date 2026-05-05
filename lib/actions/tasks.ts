"use server";

import { redirect } from "next/navigation";
import connectDB from "@/lib/db";
import { Task } from "@/lib/models";
import { getSession } from "@/lib/auth/auth";
import type { ActionResult } from "@/lib/types";
import { CreateTaskSchema, type CreateTaskInput } from "@/lib/schemas/tasks";

// ─── Server Action ────────────────────────────────────────────────────────────

export async function createTask(
    data: CreateTaskInput
): Promise<ActionResult<{ taskId: string }>> {
    try {
        // 1. Auth
        const session = await getSession();
        if (!session?.user) {
            return { success: false, error: "You must be signed in to post a task" };
        }
        const clientId = (session.user as { id: string }).id;

        // 2. Validate
        const parsed = CreateTaskSchema.safeParse(data);
        if (!parsed.success) {
            const firstError = parsed.error.issues[0]?.message ?? "Invalid input";
            return { success: false, error: firstError };
        }

        const {
            title, description, budget, category,
            estimatedHours, deadline, address, longitude, latitude,
        } = parsed.data;

        // 3. Persist
        await connectDB();

        const task = await Task.create({
            title:          title.trim(),
            description:    description.trim(),
            budget,
            category,
            estimatedHours: estimatedHours ?? undefined,
            deadline:       deadline ? new Date(deadline) : undefined,
            address:        address.trim(),
            location: {
                type:        "Point",
                coordinates: [longitude, latitude], // GeoJSON: [lng, lat]
            },
            clientId,
            status:          "open",
            applicantsCount: 0,
        });

        return { success: true, data: { taskId: task._id.toString() } };
    } catch (err) {
        console.error("[createTask]", err);
        return { success: false, error: "Failed to create task. Please try again." };
    }
}

interface GetTasksParams {
  category?: string;
  location?: string;
  budget?: number;
}