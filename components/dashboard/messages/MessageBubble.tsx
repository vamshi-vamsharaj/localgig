"use client";

import { Check, CheckCheck } from "lucide-react";

interface MessageBubbleProps {
    content: string;
    isMine: boolean;
    createdAt: string;
    status: "sent" | "delivered" | "read";
    showAvatar?: boolean;
    senderName?: string;
    senderInitials?: string;
}

function formatTime(iso: string) {
    return new Date(iso).toLocaleTimeString("en-IN", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
    });
}

function formatDateDivider(iso: string) {
    const d = new Date(iso);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);

    if (d.toDateString() === today.toDateString()) return "Today";
    if (d.toDateString() === yesterday.toDateString()) return "Yesterday";
    return d.toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" });
}

export function DateDivider({ iso }: { iso: string }) {
    return (
        <div className="flex items-center gap-3 my-4">
            <div className="flex-1 h-px bg-zinc-100" />
            <span className="text-xs text-zinc-400 font-semibold px-2">
                {formatDateDivider(iso)}
            </span>
            <div className="flex-1 h-px bg-zinc-100" />
        </div>
    );
}

function ReadIcon({ status }: { status: "sent" | "delivered" | "read" }) {
    if (status === "read") return <CheckCheck className="h-3 w-3 text-blue-400" />;
    if (status === "delivered") return <CheckCheck className="h-3 w-3 text-zinc-400" />;
    return <Check className="h-3 w-3 text-zinc-400" />;
}

export default function MessageBubble({
    content,
    isMine,
    createdAt,
    status,
    showAvatar,
    senderName,
    senderInitials,
}: MessageBubbleProps) {
    return (
        <div className={`flex items-end gap-2 group ${isMine ? "flex-row-reverse" : "flex-row"}`}>

            {/* Avatar — shown for other user only */}
            <div className="shrink-0 w-7">
                {!isMine && showAvatar && (
                    <div className="h-7 w-7 rounded-full bg-blue-100 flex items-center justify-center text-xs font-bold text-blue-600">
                        {senderInitials ?? senderName?.[0]?.toUpperCase() ?? "?"}
                    </div>
                )}
            </div>

            {/* Bubble */}
            <div className={`flex flex-col gap-1 max-w-[70%] ${isMine ? "items-end" : "items-start"}`}>
                <div
                    className={`
                        px-4 py-2.5 rounded-2xl text-sm leading-relaxed break-words
                        ${isMine
                            ? "bg-blue-600 text-white rounded-br-md shadow-sm shadow-blue-200"
                            : "bg-white text-zinc-800 border border-zinc-100 rounded-bl-md shadow-sm"
                        }
                    `}
                >
                    {content}
                </div>

                {/* Timestamp + read receipt — revealed on hover */}
                <div className={`flex items-center gap-1 px-1 opacity-0 group-hover:opacity-100 transition-opacity duration-150 ${isMine ? "flex-row-reverse" : "flex-row"}`}>
                    <span className="text-[10px] text-zinc-400 font-medium">
                        {formatTime(createdAt)}
                    </span>
                    {isMine && <ReadIcon status={status} />}
                </div>
            </div>
        </div>
    );
}