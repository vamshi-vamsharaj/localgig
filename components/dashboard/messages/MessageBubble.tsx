// components/dashboard/messages/MessageBubble.tsx
"use client";

interface MessageBubbleProps {
    content: string;
    isMine: boolean;
    createdAt: string;
}

function formatTime(iso: string) {
    return new Date(iso).toLocaleTimeString("en-IN", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
    });
}

export default function MessageBubble({
    content,
    isMine,
    createdAt,
}: MessageBubbleProps) {
    return (
        <div className={`flex items-end gap-2 ${isMine ? "flex-row-reverse" : "flex-row"}`}>

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

                {/* Timestamp */}
                <span className={`text-[10px] text-zinc-400 font-medium px-1`}>
                    {formatTime(createdAt)}
                </span>
            </div>
        </div>
    );
}