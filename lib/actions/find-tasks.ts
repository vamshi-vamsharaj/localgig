// lib/actions/find-tasks.ts
import connectDB from "@/lib/db";
import { Task, Application } from "@/lib/models";

export type TaskStatus = "open" | "in_progress" | "completed" | "cancelled";

export interface FindTask {
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
    clientId: string;
    hasApplied: boolean;
}

// ─── /tasks page ─────────────────────────────────────────────────────────────

export async function getAllOpenTasks(userId: string): Promise<FindTask[]> {
    await connectDB();

    const [tasks, myApplications] = await Promise.all([
        Task.find({ status: "open" }).sort({ createdAt: -1 }).lean(),
        Application.find({ workerId: userId }).distinct("taskId"),
    ]);

    const appliedSet = new Set(myApplications.map((id: any) => id.toString()));

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
        clientId: t.clientId?.toString() ?? "",
        hasApplied: appliedSet.has(t._id.toString()),
    }));
}

export async function getFindTaskStats() {
    await connectDB();

    const [total, moving, delivery, repair, tutoring, photography, cleaning] =
        await Promise.all([
            Task.countDocuments({ status: "open" }),
            Task.countDocuments({ status: "open", category: "Moving" }),
            Task.countDocuments({ status: "open", category: "Delivery" }),
            Task.countDocuments({ status: "open", category: "Repair" }),
            Task.countDocuments({ status: "open", category: "Tutoring" }),
            Task.countDocuments({ status: "open", category: "Photography" }),
            Task.countDocuments({ status: "open", category: "Cleaning" }),
        ]);

    return { total, moving, delivery, repair, tutoring, photography, cleaning };
}

// ─── Homepage preview ─────────────────────────────────────────────────────────
// Fetches the N most recent open tasks.
// Pass userId (from session) so hasApplied is accurate — used by TasksSection
// to filter out already-applied tasks before rendering. Guests pass "".

export async function getLatestTasksForHomepage(
    limit: number = 12,
    userId: string = "",
): Promise<FindTask[]> {
    try {
        await connectDB();

        // Fetch extra docs + the user's existing applications in parallel.
        const [docs, myApplications] = await Promise.all([
            Task.find({ status: "open" }).sort({ createdAt: -1 }).limit(limit).lean(),
            userId
                ? Application.find({ workerId: userId }).distinct("taskId")
                : Promise.resolve([]),
        ]);

        const appliedSet = new Set(
            (myApplications as any[]).map((id) => id.toString()),
        );

        return docs.map((doc: any) => ({
            _id:             String(doc._id),
            title:           doc.title,
            description:     doc.description ?? "",
            category:        doc.category ?? "General",
            budget:          doc.budget,
            address:         doc.address ?? "",
            estimatedHours:  doc.estimatedHours ?? undefined,
            deadline:        doc.deadline ? new Date(doc.deadline).toISOString() : undefined,
            applicantsCount: doc.applicantsCount ?? 0,
            createdAt:       new Date(doc.createdAt as Date).toISOString(),
            status:          doc.status,
            clientId:        String(doc.clientId ?? ""),
            hasApplied:      appliedSet.has(String(doc._id)),
        }));
    } catch (err) {
        console.error("[getLatestTasksForHomepage]", err);
        return [];
    }
}