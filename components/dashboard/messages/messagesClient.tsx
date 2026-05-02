"use client";

import { useState } from "react";
import ConversationList, { type ConversationSummary } from "./ConversationList";
import ChatWindow, { EmptyChat } from "./ChatWindow";

interface MessagesClientProps {
    initialConversations: ConversationSummary[];
    userId: string;
}

export default function MessagesClient({ initialConversations, userId }: MessagesClientProps) {
    const [conversations] = useState<ConversationSummary[]>(initialConversations);
    const [selected, setSelected] = useState<ConversationSummary | null>(null);

    // On mobile, show either the list or the chat, not both
    const [mobileView, setMobileView] = useState<"list" | "chat">("list");

    function handleSelect(conv: ConversationSummary) {
        setSelected(conv);
        setMobileView("chat");
    }

    function handleBack() {
        setMobileView("list");
    }

    return (
        // Fills the dashboard content area (assumes parent has fixed height)
        <div className="flex h-[calc(100vh-4rem)] rounded-2xl border border-zinc-100 shadow-sm overflow-hidden bg-white">

            {/* ── LEFT: Conversation list ──────────────────────────────────── */}
            <div className={`
                w-full md:w-80 lg:w-96 shrink-0 flex flex-col border-r border-zinc-100
                ${mobileView === "chat" ? "hidden md:flex" : "flex"}
            `}>
                <ConversationList
                    conversations={conversations}
                    selectedId={selected?._id ?? null}
                    userId={userId}
                    onSelect={handleSelect}
                />
            </div>

            {/* ── RIGHT: Chat window ───────────────────────────────────────── */}
            <div className={`
                flex-1 min-w-0 flex flex-col
                ${mobileView === "list" ? "hidden md:flex" : "flex"}
            `}>
                {selected ? (
                    <ChatWindow
                        conversation={selected}
                        userId={userId}
                        onBack={handleBack}
                    />
                ) : (
                    <EmptyChat />
                )}
            </div>

        </div>
    );
}