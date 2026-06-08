import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { headers } from "next/headers";
import { auth } from "@/lib/auth/auth";
import { getLatestTasksForHomepage } from "@/lib/actions/find-tasks";
import { getSavedTaskIds } from "@/lib/actions/savedTasks";
import TasksSectionGrid from "./TasksSectionGrid";
import TaskCard from "../dashboard/tasks/TaskCard";


export default async function TasksSection() {
    // ── Session ──────────────────────────────────────────────────────────────
    const session = await auth.api.getSession({ headers: await headers() });
    const userId = session?.user?.id ?? "";

    const [allTasks, savedIds] = await Promise.all([
        getLatestTasksForHomepage(12, userId),
        userId ? getSavedTaskIds(userId) : Promise.resolve([] as string[]),
    ]);

    const savedSet = new Set(savedIds);

    const tasks = allTasks
        .filter((t) => !t.hasApplied)
        .slice(0, 6);

    return (
        <section className="bg-zinc-50/60 border-t border-zinc-100 py-20 sm:py-28">
            <div className="max-w-[1400px] mx-auto px-4 sm:px-6">

                {/* ── Section header ──────────────────────────────────────── */}
                <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10">
                    <div>
                        <span className="inline-flex items-center gap-2 text-xs font-semibold px-3 py-1.5 rounded-full border border-blue-200/80 bg-blue-50 text-blue-700 mb-3">
                            <span className="h-1.5 w-1.5 rounded-full bg-blue-500 animate-pulse" />
                            Live marketplace
                        </span>
                        <h2 className="text-3xl sm:text-4xl font-bold text-zinc-900 tracking-tight leading-tight">
                            Recent Opportunities<br className="hidden sm:block" /> Near You
                        </h2>
                        <p className="mt-2 text-sm text-zinc-500 max-w-md">
                            Real tasks posted by people in your city. Apply and start earning today.
                        </p>
                    </div>
                    <Link
                        href="/tasks"
                        className="group inline-flex items-center gap-2 h-10 px-5 rounded-xl border border-zinc-200 bg-white text-sm font-semibold text-zinc-700 hover:border-zinc-300 hover:bg-zinc-50 transition-all shadow-sm shrink-0"
                    >
                        View All Tasks
                        <ArrowRight className="h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
                    </Link>
                </div>

                {/* ── Grid or empty state ─────────────────────────────────── */}
                {tasks.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 text-center bg-white rounded-2xl border border-dashed border-blue-100">
                        <p className="text-sm font-semibold text-zinc-700">No open tasks right now</p>
                        <p className="text-xs text-zinc-400 mt-1">Check back soon or be the first to post one.</p>
                        <Link
                            href="/tasks/new"
                            className="mt-4 inline-flex items-center gap-1.5 h-9 px-5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-sm shadow-blue-200 transition-colors"
                        >
                            Post a Task
                        </Link>
                    </div>
                ) : (
                    <TasksSectionGrid>
                        {tasks.map((task) => (
                            <TaskCard
                                key={task._id}
                                task={task}
                                userId={userId}
                                isSaved={savedSet.has(task._id)}
                            />
                        ))}
                    </TasksSectionGrid>
                )}

                {/* ── Bottom CTA ──────────────────────────────────────────── */}
                <div className="mt-10 text-center">
                    <Link
                        href="/tasks"
                        className="group inline-flex items-center gap-2 h-11 px-8 rounded-xl bg-zinc-900 text-white text-sm font-semibold hover:bg-zinc-800 transition-colors shadow-md shadow-zinc-900/15"
                    >
                        Browse All Tasks
                        <ArrowRight className="h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
                    </Link>
                    <p className="text-xs text-zinc-400 mt-3">
                        {tasks.length > 0
                            ? `Showing ${tasks.length} latest opportunities — hundreds more on the marketplace`
                            : "Tasks go live as soon as they're posted"}
                    </p>
                </div>

            </div>
        </section>
    );
}