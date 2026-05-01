"use client";

import { useState, useRef, useTransition, KeyboardEvent } from "react";
import { Send, Loader2 } from "lucide-react";

interface ChatInputProps {
    onSend: (content: string) => Promise<void>;
    disabled?: boolean;
}

export default function ChatInput({ onSend, disabled }: ChatInputProps) {
    const [content, setContent] = useState("");
    const [isPending, startTransition] = useTransition();
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    function autoResize() {
        const el = textareaRef.current;
        if (!el) return;
        el.style.height = "auto";
        el.style.height = Math.min(el.scrollHeight, 120) + "px";
    }

    function handleSend() {
        const trimmed = content.trim();
        if (!trimmed || isPending || disabled) return;

        setContent("");
        if (textareaRef.current) {
            textareaRef.current.style.height = "auto";
        }

        startTransition(async () => {
            await onSend(trimmed);
        });
    }

    function handleKeyDown(e: KeyboardEvent<HTMLTextAreaElement>) {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    }

    return (
        <div className="flex items-end gap-3 px-5 py-4 border-t border-zinc-100 bg-white">
            <textarea
                ref={textareaRef}
                value={content}
                onChange={(e) => { setContent(e.target.value); autoResize(); }}
                onKeyDown={handleKeyDown}
                placeholder="Type a message... (Enter to send, Shift+Enter for new line)"
                disabled={disabled || isPending}
                rows={1}
                className="flex-1 resize-none rounded-2xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm text-zinc-800 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 focus:bg-white transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed overflow-hidden leading-relaxed"
                style={{ minHeight: "44px" }}
            />
            <button
                onClick={handleSend}
                disabled={!content.trim() || isPending || disabled}
                className="h-11 w-11 shrink-0 flex items-center justify-center rounded-2xl bg-blue-600 hover:bg-blue-500 text-white transition-all duration-150 shadow-sm shadow-blue-200 disabled:opacity-40 disabled:cursor-not-allowed disabled:shadow-none active:scale-95"
            >
                {isPending
                    ? <Loader2 className="h-4 w-4 animate-spin" />
                    : <Send className="h-4 w-4" />
                }
            </button>
        </div>
    );
}