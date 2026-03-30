"use server";

import mongoose from "mongoose";
import connectDB from "@/lib/db";
import { Conversation, Message } from "@/lib/models/message";
import type { ActionResult } from "@/lib/types";

// ─── Get or create a conversation ────────────────────────────────────────────

export async function getOrCreateConversation(
    taskId: string,
    clientId: string,
    workerId: string
): Promise<ActionResult<{ conversationId: string }>> {
    try {
        await connectDB();

        const existing = await Conversation.findOne({
            taskId, clientId, workerId,
        }).lean();

        if (existing) {
            return { success: true, data: { conversationId: existing._id.toString() } };
        }

        const created = await Conversation.create({ taskId, clientId, workerId });
        return { success: true, data: { conversationId: created._id.toString() } };
    } catch {
        return { success: false, error: "Failed to create conversation" };
    }
}
