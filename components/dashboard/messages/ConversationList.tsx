"use client";

import { MessageSquare } from "lucide-react";

export interface ConversationSummary {
    _id: string;
    taskId: string;
    taskTitle: string;
    taskStatus: string;
    client: { _id: string; name: string; avatar?: string };
    worker: { _id: string; name: string; avatar?: string };
    lastMessage?: string;
    lastMessageAt?: string;
    unreadCount: number;
    updatedAt: string;
    role: "client" | "worker";
}

function timeShort(iso?: string) {
    if (!iso) return "";
    const d = new Date(iso);
    const now = new Date();
    const diff = now.getTime() - d.getTime();
    if (diff < 86400000) {
        return d.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", hour12: true });
    }
    if (diff < 604800000) {
        return d.toLocaleDateString("en-IN", { weekday: "short" });
    }
    return d.toLocaleDateString("en-IN", { day: "numeric", month: "short" });
}

function getInitials(name: string) {
    return name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);
}

const TASK_STATUS_DOT: Record<string, string> = {
    open:        "bg-emerald-400",
    in_progress: "bg-blue-400",
    completed:   "bg-zinc-300",
    cancelled:   "bg-red-300",
};

interface ConversationListProps {
    conversations: ConversationSummary[];
    selectedId: string | null;
    userId: string;
    onSelect: (conv: ConversationSummary) => void;
}

export default function ConversationList({
    conversations,
    selectedId,
    userId,
    onSelect,
}: ConversationListProps) {
    return (
        <div className="flex flex-col h-full bg-white border-r border-zinc-100">

            {/* ── Header ── */}
            <div className="px-5 pt-6 pb-4 border-b border-zinc-100">
                <h2 className="text-xl font-bold text-zinc-900 tracking-tight">Messages</h2>
            </div>

            {/* ── List ── */}
            <div className="flex-1 overflow-y-auto">
                {conversations.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
                        <div className="h-12 w-12 rounded-2xl bg-zinc-50 flex items-center justify-center mb-3">
                            <MessageSquare className="h-5 w-5 text-zinc-300" />
                        </div>
                        <p className="text-sm font-semibold text-zinc-500">No messages yet</p>
                        <p className="text-xs text-zinc-400 mt-1">Accept an application to start chatting</p>
                    </div>
                ) : (
                    <ul className="py-2">
                        {conversations.map((conv) => {
                            const other = conv.role === "client" ? conv.worker : conv.client;
                            const statusDot = TASK_STATUS_DOT[conv.taskStatus] ?? "bg-zinc-300";

                            return (
                                <li key={conv._id}>
                                    <button
                                        onClick={() => onSelect(conv)}
                                        className="w-full flex items-start gap-3 px-4 py-3.5 text-left transition-all duration-100 hover:bg-zinc-50"
                                    >
                                        {/* Avatar */}
                                        <div className="relative shrink-0">
                                            <div className="h-11 w-11 rounded-full flex items-center justify-center text-sm font-bold overflow-hidden bg-zinc-100 text-zinc-600">
                                                {other.avatar
                                                    ? <img src={other.avatar} alt={other.name} className="h-full w-full object-cover" />
                                                    : getInitials(other.name)
                                                }
                                            </div>
                                            {/* Task status dot */}
                                            <span className={`absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-white ${statusDot}`} />
                                        </div>

                                        {/* Content */}
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center justify-between gap-1 mb-0.5">
                                                <p className="text-sm font-bold truncate text-zinc-900">
                                                    {other.name}
                                                </p>
                                                <span className="text-[10px] text-zinc-400 font-medium shrink-0">
                                                    {timeShort(conv.lastMessageAt ?? conv.updatedAt)}
                                                </span>
                                            </div>
                                            <p className="text-xs text-zinc-500 font-medium truncate mb-1">
                                                📋 {conv.taskTitle ?? "Task"}
                                            </p>
                                            <p className="text-xs text-zinc-400 truncate leading-snug">
                                                {conv.lastMessage ?? "Start the conversation..."}
                                            </p>
                                        </div>
                                    </button>
                                </li>
                            );
                        })}
                    </ul>
                )}
            </div>
        </div>
    );
}