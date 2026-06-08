"use client";

// components/tasks/BookmarkButton.tsx
// Extracted verbatim from FindTasks.tsx. Used by TaskCard and TaskRow.
// Optimistic update with rollback. Redirects unauthenticated users to /sign-in.

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "@/lib/auth/auth-client";
import { toggleSaveTask } from "@/lib/actions/savedTasks";
import { Bookmark, Loader2 } from "lucide-react";

interface BookmarkButtonProps {
    taskId: string;
    userId: string;
    isSaved: boolean;
    size?: "sm" | "md";
}

export default function BookmarkButton({
    taskId,
    userId,
    isSaved: initialSaved,
    size = "md",
}: BookmarkButtonProps) {
    const [saved, setSaved] = useState(initialSaved);
    const [isPending, startTransition] = useTransition();
    const router = useRouter();
    const { data: session } = useSession();

    function handleToggle() {
        if (!session?.user) {
            router.push("/sign-in");
            return;
        }
        if (isPending) return;

        // Optimistic update — instant
        setSaved((prev) => !prev);

        startTransition(async () => {
            const result = await toggleSaveTask(userId, taskId);
            if (!result.success) {
                // Rollback if server call fails
                setSaved((prev) => !prev);
            }
        });
    }

    const sizeClasses = size === "sm" ? "h-9 w-9" : "h-10 w-10";

    return (
        <button
            onClick={handleToggle}
            disabled={isPending}
            title={saved ? "Remove from saved" : "Save task"}
            aria-label={saved ? "Remove from saved" : "Save task"}
            className={`
                ${sizeClasses} shrink-0 flex items-center justify-center rounded-xl border
                transition-all duration-200
                ${saved
                    ? "bg-blue-600 border-blue-600 text-white hover:bg-red-500 hover:border-red-500 shadow-sm shadow-blue-200"
                    : "border-zinc-200 text-zinc-400 hover:border-blue-300 hover:text-blue-600 bg-white"
                }
                disabled:opacity-60 disabled:cursor-not-allowed
            `}
        >
            {isPending
                ? <Loader2 className="h-4 w-4 animate-spin" />
                : <Bookmark className="h-4 w-4" fill={saved ? "currentColor" : "none"} strokeWidth={2} />
            }
        </button>
    );
}