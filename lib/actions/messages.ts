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

// ─── Send a message ───────────────────────────────────────────────────────────

export async function sendMessage(
    conversationId: string,
    taskId: string,
    senderId: string,
    receiverId: string,
    content: string
): Promise<ActionResult<{ messageId: string }>> {
    if (!content.trim()) return { success: false, error: "Message cannot be empty" };
    if (content.length > 5000) return { success: false, error: "Message too long" };

    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        await connectDB();

        const [message] = await Message.create(
            [{ conversationId, taskId, senderId, receiverId, content: content.trim() }],
            { session }
        );

        // Update conversation snapshot
        await Conversation.findByIdAndUpdate(
            conversationId,
            {
                lastMessage:   content.trim().slice(0, 100),
                lastMessageAt: new Date(),
                $inc: { unreadCount: 1 },
            },
            { session }
        );

        await session.commitTransaction();
        return { success: true, data: { messageId: message._id.toString() } };
    } catch {
        await session.abortTransaction();
        return { success: false, error: "Failed to send message" };
    } finally {
        session.endSession();
    }
}

// ─── Get messages in a conversation ──────────────────────────────────────────

export async function getMessages(
    conversationId: string,
    requestingUserId: string
) {
    await connectDB();

    // Verify the user is part of this conversation
    const conversation = await Conversation.findById(conversationId)
        .select("clientId workerId")
        .lean();

    if (!conversation) return [];

    const participantIds = [
        conversation.clientId.toString(),
        conversation.workerId.toString(),
    ];

    if (!participantIds.includes(requestingUserId)) return [];

    const messages = await Message.find({ conversationId })
        .sort({ createdAt: 1 })
        .lean();

    return messages.map((m) => ({
        _id:            m._id.toString(),
        conversationId: m.conversationId.toString(),
        senderId:       m.senderId.toString(),
        receiverId:     m.receiverId.toString(),
        taskId:         m.taskId.toString(),
        content:        m.content,
        status:         m.status,
        isMine:         m.senderId.toString() === requestingUserId,
        createdAt:      (m.createdAt as Date).toISOString(),
    }));
}

export async function markMessagesRead(
    conversationId: string,
    userId: string
): Promise<ActionResult> {
    try {
        await connectDB();

        await Message.updateMany(
            { conversationId, receiverId: userId, status: { $ne: "read" } },
            { status: "read" }
        );

        await Conversation.findByIdAndUpdate(conversationId, { unreadCount: 0 });

        return { success: true, data: undefined };
    } catch {
        return { success: false, error: "Failed to mark messages as read" };
    }
}

// ─── Get all conversations for a user (inbox) ─────────────────────────────────

export async function getConversations(userId: string) {
    await connectDB();

    const oid = new mongoose.Types.ObjectId(userId);

    const conversations = await Conversation.find({
        $or: [{ clientId: oid }, { workerId: oid }],
    })
        .populate("taskId", "title status")
        .populate("clientId", "name avatar")
        .populate("workerId", "name avatar")
        .sort({ updatedAt: -1 })
        .lean();

    return conversations.map((c: any) => ({
        _id:           c._id.toString(),
        taskId:        c.taskId?._id?.toString(),
        taskTitle:     c.taskId?.title,
        taskStatus:    c.taskId?.status,
        client: {
            _id:    c.clientId?._id?.toString(),
            name:   c.clientId?.name,
            avatar: c.clientId?.avatar,
        },
        worker: {
            _id:    c.workerId?._id?.toString(),
            name:   c.workerId?.name,
            avatar: c.workerId?.avatar,
        },
        lastMessage:   c.lastMessage,
        lastMessageAt: c.lastMessageAt?.toISOString(),
        unreadCount:   c.unreadCount,
        updatedAt:     (c.updatedAt as Date).toISOString(),
        // Flag which side the current user is on
        role: c.clientId?._id?.toString() === userId ? "client" : "worker",
    }));
}