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



