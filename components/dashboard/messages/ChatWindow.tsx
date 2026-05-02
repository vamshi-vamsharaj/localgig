"use client";

import { useEffect, useState, useCallback } from "react";
import { Briefcase, Loader2, MessageSquare, MoreHorizontal } from "lucide-react";
import { getMessages, markMessagesRead } from "@/lib/actions/messages";
import MessageBubble, { DateDivider } from "@/components/dashboard/messages/MessageBubble";
import ChatInput from "@/components/dashboard/messages/ChatInput";
import type { ConversationSummary } from "./ConversationList";

// ─── Types ────────────────────────────────────────────────────────────────────

interface MessageItem {
    _id: string;
    conversationId: string;
    senderId: string;
    receiverId: string;
    taskId: string;
    content: string;
    status: "sent" | "delivered" | "read";
    isMine: boolean;
    createdAt: string;
    isOptimistic?: boolean;
}

function getInitials(name: string) {
    return name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);
}

function shouldShowDateDivider(curr: MessageItem, prev?: MessageItem): boolean {
    if (!prev) return true;
    const a = new Date(prev.createdAt).toDateString();
    const b = new Date(curr.createdAt).toDateString();
    return a !== b;
}

function shouldShowAvatar(messages: MessageItem[], index: number): boolean {
    if (messages[index].isMine) return false;
    const next = messages[index + 1];
    return !next || next.senderId !== messages[index].senderId || next.isMine;
}

const TASK_STATUS_CONFIG: Record<string, { label: string; color: string }> = {
    open:        { label: "Open",        color: "text-emerald-600 bg-emerald-50 ring-emerald-200" },
    in_progress: { label: "In Progress", color: "text-blue-600 bg-blue-50 ring-blue-200" },
    completed:   { label: "Completed",   color: "text-zinc-600 bg-zinc-100 ring-zinc-200" },
    cancelled:   { label: "Cancelled",   color: "text-red-600 bg-red-50 ring-red-200" },
};

// ─── Empty chat state ─────────────────────────────────────────────────────────

export function EmptyChat() {
    return (
        <div className="flex-1 flex flex-col items-center justify-center bg-zinc-50/50 gap-4">
            <div className="h-16 w-16 rounded-2xl bg-white border border-zinc-100 shadow-sm flex items-center justify-center">
                <MessageSquare className="h-7 w-7 text-blue-400" />
            </div>
            <div className="text-center">
                <p className="text-base font-bold text-zinc-800">Select a conversation</p>
                <p className="text-sm text-zinc-400 mt-1 font-medium">
                    Choose a chat from the left to start messaging
                </p>
            </div>
        </div>
    );
}

// ─── Chat window ──────────────────────────────────────────────────────────────

interface ChatWindowProps {
    conversation: ConversationSummary;
    userId: string;
}

export default function ChatWindow({ conversation, userId }: ChatWindowProps) {
    const [messages, setMessages] = useState<MessageItem[]>([]);
    const [loading, setLoading] = useState(true);

    const other = conversation.role === "client" ? conversation.worker : conversation.client;
    const taskStatusCfg = TASK_STATUS_CONFIG[conversation.taskStatus] ?? TASK_STATUS_CONFIG.open;

    // ── Load messages ──────────────────────────────────────────────────────────
    const loadMessages = useCallback(async () => {
        setLoading(true);
        const data = await getMessages(conversation._id, userId);
        setMessages(data as MessageItem[]);
        setLoading(false);

        // Mark as read after loading
        await markMessagesRead(conversation._id, userId);
    }, [conversation._id, userId]);

    useEffect(() => {
        loadMessages();
    }, [loadMessages]);

    async function handleSend(content: string) {
        // wired up in next commit
    }

    return (
        <div className="flex flex-col h-full bg-white">

            {/* ── Chat header ── */}
            <div className="flex items-center gap-4 px-5 py-4 border-b border-zinc-100 bg-white shrink-0">
                <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center text-sm font-bold text-blue-600 shrink-0 overflow-hidden">
                    {other.avatar
                        ? <img src={other.avatar} alt={other.name} className="h-full w-full object-cover" />
                        : getInitials(other.name)
                    }
                </div>
                <div className="flex-1 min-w-0">
                    <p className="text-base font-bold text-zinc-900 leading-tight truncate">{other.name}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                        <Briefcase className="h-3 w-3 text-zinc-400 shrink-0" />
                        <p className="text-xs text-zinc-500 font-medium truncate">{conversation.taskTitle}</p>
                        <span className={`inline-flex items-center text-[10px] font-bold px-2 py-0.5 rounded-full ring-1 ${taskStatusCfg.color}`}>
                            {taskStatusCfg.label}
                        </span>
                    </div>
                </div>
                <button className="h-8 w-8 flex items-center justify-center rounded-xl border border-zinc-200 text-zinc-400 hover:text-zinc-700 hover:border-zinc-300 transition shrink-0">
                    <MoreHorizontal className="h-4 w-4" />
                </button>
            </div>

            {/* ── Messages area ── */}
            <div className="flex-1 overflow-y-auto px-5 py-4 space-y-1.5 bg-zinc-50/30">
                {loading ? (
                    <div className="flex items-center justify-center h-full">
                        <div className="flex flex-col items-center gap-3">
                            <Loader2 className="h-6 w-6 animate-spin text-blue-400" />
                            <p className="text-sm text-zinc-400 font-medium">Loading messages...</p>
                        </div>
                    </div>
                ) : messages.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full gap-3 text-center">
                        <div className="h-12 w-12 rounded-2xl bg-white border border-zinc-100 shadow-sm flex items-center justify-center">
                            <MessageSquare className="h-5 w-5 text-blue-400" />
                        </div>
                        <div>
                            <p className="text-sm font-bold text-zinc-700">No messages yet</p>
                            <p className="text-xs text-zinc-400 mt-0.5">Say hello to start the conversation!</p>
                        </div>
                    </div>
                ) : (
                    <>
                        {messages.map((msg, i) => (
                            <div key={msg._id}>
                                {shouldShowDateDivider(msg, messages[i - 1]) && (
                                    <DateDivider iso={msg.createdAt} />
                                )}
                                <MessageBubble
                                    content={msg.content}
                                    isMine={msg.isMine}
                                    createdAt={msg.createdAt}
                                    status={msg.status}
                                    showAvatar={shouldShowAvatar(messages, i)}
                                    senderName={other.name}
                                    senderInitials={getInitials(other.name)}
                                />
                            </div>
                        ))}
                    </>
                )}
            </div>

            {/* ── Input ── */}
            <ChatInput onSend={handleSend} disabled={loading} />
        </div>
    );
}