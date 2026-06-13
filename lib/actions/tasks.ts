"use server";

import { redirect } from "next/navigation";
import connectDB from "@/lib/db";
import { Task } from "@/lib/models";
import { getSession } from "@/lib/auth/auth";
import type { ActionResult } from "@/lib/types";
import { CreateTaskSchema, type CreateTaskInput } from "@/lib/schemas/tasks";
import User from "@/lib/models/user";
import Application from "@/lib/models/application";
import SavedTask from "@/lib/models/savedTask";

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

export async function getTasks(params: GetTasksParams = {}) {
    try {
        await connectDB();

        const query: any = {};

        if (params.category) {
            query.category = params.category;
        }

        if (params.budget) {
            query.budget = { $lte: params.budget };
        }

        const tasks = await Task.find(query)
            .populate("clientId")
            .sort({ createdAt: -1 });

        return tasks;

    } catch (error) {
        console.error("[getTasks]", error);
        throw new Error("Failed to fetch tasks");
    }
}

export interface TaskDetail {
    _id: string;
    title: string;
    description: string;
    category: string;
    budget: number;
    estimatedHours?: number;
    address: string;
    coordinates: [number, number]; // [lng, lat]  — GeoJSON order
    deadline?: string;
    status: "open" | "in_progress" | "completed" | "cancelled";
    applicantsCount: number;
    createdAt: string;
    client: {
        _id: string;
        name: string;
        avatar?: string;
        joinedAt: string;
        tasksPosted: number;
    };
    // viewer-specific
    hasApplied: boolean;
    isSaved: boolean;
}

export interface SimilarTask {
    _id: string;
    title: string;
    description: string;
    category: string;
    budget: number;
    estimatedHours?: number;
    address: string;
    status: "open" | "in_progress" | "completed" | "cancelled";
    applicantsCount: number;
    deadline?: string;
    createdAt: string;
    clientId: string;
    hasApplied: boolean;
}

export async function getTaskDetail(
    taskId: string,
    userId: string = "",
): Promise<TaskDetail | null> {
    try {
        await connectDB();

        const doc = await Task.findById(taskId).lean() as any;
        if (!doc) return null;

        // Client info
        const clientDoc = await User.findById(doc.clientId).lean() as any;
        const tasksPosted = await Task.countDocuments({ clientId: doc.clientId });

        // Viewer-specific
        const [applicationExists, savedExists] = await Promise.all([
            userId
                ? Application.exists({ taskId: doc._id, workerId: userId })
                : Promise.resolve(null),
            userId
                ? SavedTask.exists({ userId, taskId: doc._id })
                : Promise.resolve(null),
        ]);

        return {
            _id:             String(doc._id),
            title:           doc.title,
            description:     doc.description ?? "",
            category:        doc.category ?? "General",
            budget:          doc.budget,
            estimatedHours:  doc.estimatedHours ?? undefined,
            address:         doc.address ?? "",
            coordinates:     doc.location?.coordinates ?? [0, 0],
            deadline:        doc.deadline ? new Date(doc.deadline).toISOString() : undefined,
            status:          doc.status,
            applicantsCount: doc.applicantsCount ?? 0,
            createdAt:       new Date(doc.createdAt).toISOString(),
            client: {
                _id:         String(clientDoc?._id ?? doc.clientId),
                name:        clientDoc?.name ?? "Anonymous",
                avatar:      clientDoc?.avatar ?? undefined,
                joinedAt:    clientDoc?.createdAt ? new Date(clientDoc.createdAt).toISOString() : new Date().toISOString(),
                tasksPosted,
            },
            hasApplied: !!applicationExists,
            isSaved:    !!savedExists,
        };
    } catch (err) {
        console.error("[getTaskDetail]", err);
        return null;
    }
}

export async function getSimilarTasks(
    taskId: string,
    category: string,
    limit: number = 3,
): Promise<SimilarTask[]> {
    try {
        await connectDB();

        const docs = await Task.find({
            _id:      { $ne: taskId },
            category,
            status:   "open",
        })
            .sort({ createdAt: -1 })
            .limit(limit)
            .lean() as any[];

        return docs.map((d) => ({
            _id:             String(d._id),
            title:           d.title,
            description:     d.description ?? "",
            category:        d.category ?? "General",
            budget:          d.budget,
            estimatedHours:  d.estimatedHours ?? undefined,
            address:         d.address ?? "",
            status:          d.status,
            applicantsCount: d.applicantsCount ?? 0,
            deadline:        d.deadline ? new Date(d.deadline).toISOString() : undefined,
            createdAt:       new Date(d.createdAt).toISOString(),
            clientId:        String(d.clientId),
            hasApplied:      false,
        }));
    } catch (err) {
        console.error("[getSimilarTasks]", err);
        return [];
    }
}