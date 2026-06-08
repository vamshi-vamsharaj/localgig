"use client";

// components/tasks/ApplyButton.tsx
// Extracted verbatim from FindTasks.tsx. Used by TaskCard and TaskRow.
// Redirects unauthenticated users to /sign-in instead of blocking.

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "@/lib/auth/auth-client";
import { CheckCircle2, Loader2 } from "lucide-react";

interface ApplyButtonProps {
    taskId: string;
    hasApplied: boolean;
}

export default function ApplyButton({ taskId, hasApplied }: ApplyButtonProps) {
    const [applied, setApplied] = useState(hasApplied);
    const [isPending, startTransition] = useTransition();
    const router = useRouter();
    const { data: session } = useSession();

    async function handleApply() {
        if (!session?.user) {
            router.push("/sign-in");
            return;
        }
        if (applied || isPending) return;

        startTransition(async () => {
            try {
                const res = await fetch("/api/applications", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ taskId }),
                });
                if (res.ok) setApplied(true);
            } catch {
                // silently fail
            }
        });
    }

    if (applied) {
        return (
            <span className="flex items-center gap-1.5 h-9 px-4 rounded-xl bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200 text-xs font-semibold">
                <CheckCircle2 className="h-3.5 w-3.5" />
                Applied
            </span>
        );
    }

    return (
        <button
            onClick={handleApply}
            disabled={isPending}
            className="flex items-center justify-center gap-1.5 h-9 px-4 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold transition-colors shadow-sm shadow-blue-200 disabled:opacity-70 disabled:cursor-not-allowed"
        >
            {isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : "Apply Now"}
        </button>
    );
}