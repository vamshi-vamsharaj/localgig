"use client";

import Link from "next/link";

interface Task {
    _id: string
    title: string
    category: string
    budget: number
    status: string
}

interface Props {
    title: string
    viewAllHref: string
    tasks: Task[]
}

export default function TasksTable({ title, viewAllHref, tasks }: Props) {
    return (
        <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm">

            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-200 dark:border-zinc-800">
                <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
                    {title}
                </h2>

                <Link
                    href={viewAllHref}
                    className="text-sm font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400"
                >
                    View All →
                </Link>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
                <table className="w-full text-sm">

                    <thead className="bg-zinc-50 dark:bg-zinc-800">
                        <tr className="text-left text-zinc-600 dark:text-zinc-400">
                            <th className="px-6 py-3 font-medium">Task</th>
                            <th className="px-6 py-3 font-medium">Category</th>
                            <th className="px-6 py-3 font-medium">Budget</th>
                            <th className="px-6 py-3 font-medium">Status</th>
                        </tr>
                    </thead>

                    <tbody>
                        {tasks.map((task) => (
                            <tr
                                key={task._id}
                                className="border-t border-zinc-100 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition"
                            >
                                <td className="px-6 py-4 font-medium text-zinc-900 dark:text-zinc-100">
                                    {task.title}
                                </td>

                                <td className="px-6 py-4 text-zinc-600 dark:text-zinc-400">
                                    {task.category}
                                </td>

                                <td className="px-6 py-4 text-zinc-700 dark:text-zinc-300">
                                    ₹{task.budget}
                                </td>

                                <td className="px-6 py-4">
                                    <span
                                        className={`px-3 py-1 text-xs rounded-full font-medium
                    ${task.status === "open"
                                                ? "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400"
                                                : task.status === "in_progress"
                                                    ? "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-400"
                                                    : "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-400"
                                            }`}
                                    >
                                        {task.status.replace("_", " ")}
                                    </span>
                                </td>
                            </tr>
                        ))}
                    </tbody>

                </table>
            </div>
        </div>
    );
}