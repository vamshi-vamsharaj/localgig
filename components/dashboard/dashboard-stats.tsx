"use client";

import {
    ClipboardList,
    Mail,
    Briefcase,
    CheckCircle2,
    MoreHorizontal,
} from "lucide-react";

interface Stats {
    tasksPosted: number;
    applicationsReceived: number;
    activeTasks: number;
    completedTasks: number;

    earnings: number;
    tasksApplied: number;
    workerActiveTasks: number;
    workerCompletedTasks: number;
}

export default function DashboardStats({ stats }: { stats: Stats }) {
    return (
        <div className="space-y-8">

            {/* CLIENT OVERVIEW */}
            <div>

                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">

                    {/* Tasks Posted */}
                    <div className="relative rounded-2xl bg-gradient-to-br from-blue-600 to-blue-500 p-6 text-white shadow-lg hover:shadow-xl transition">
                        <div className="absolute -top-6 -right-6 w-32 h-32 bg-white/10 rounded-full blur-3xl" />

                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center backdrop-blur">
                                <ClipboardList className="w-5 h-5" />
                            </div>

                            <div>
                                <p className="text-sm text-blue-100 font-medium">Tasks Posted</p>
                                <p className="text-3xl font-bold mt-1">{stats.tasksPosted}</p>
                            </div>
                        </div>
                    </div>

                    {/* Applications */}
                    <div className="rounded-2xl bg-white border border-zinc-200 p-6 shadow-sm hover:shadow-md transition">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-xl bg-sky-100 flex items-center justify-center">
                                <Mail className="w-5 h-5 text-sky-600" />
                            </div>

                            <div>
                                <p className="text-sm text-zinc-500 font-medium">Applications</p>
                                <p className="text-3xl font-bold text-zinc-900 mt-1">
                                    {stats.applicationsReceived}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Active Tasks */}
                    <div className="rounded-2xl bg-white border border-zinc-200 p-6 shadow-sm hover:shadow-md transition">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-xl bg-zinc-100 flex items-center justify-center">
                                <Briefcase className="w-5 h-5 text-zinc-600" />
                            </div>

                            <div>
                                <p className="text-sm text-zinc-500 font-medium">Active Tasks</p>
                                <p className="text-3xl font-bold text-zinc-900 mt-1">
                                    {stats.activeTasks}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Completed Tasks */}
                    <div className="rounded-2xl bg-white border border-zinc-200 p-6 shadow-sm hover:shadow-md transition">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-xl bg-emerald-100 flex items-center justify-center">
                                    <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                                </div>

                                <div>
                                    <p className="text-sm text-zinc-500 font-medium">
                                        Completed Tasks
                                    </p>
                                    <p className="text-3xl font-bold text-zinc-900 mt-1">
                                        {stats.completedTasks}
                                    </p>
                                </div>
                            </div>

                            <button className="text-zinc-400 hover:text-zinc-600 transition">
                                <MoreHorizontal className="w-4 h-4" />
                            </button>
                        </div>
                    </div>

                </div>
            </div>

            {/* WORKER OVERVIEW */}
            <div>

                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">

                    {/* Earnings */}
                    <div className="rounded-2xl bg-white border border-zinc-200 p-6 shadow-sm hover:shadow-md transition">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-xl bg-green-100 flex items-center justify-center">
                                <span className="text-green-600 font-bold">₹</span>
                            </div>

                            <div>
                                <p className="text-sm text-zinc-500 font-medium">Earnings</p>
                                <p className="text-3xl font-bold text-zinc-900 mt-1">
                                    {stats.earnings}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Tasks Applied */}
                    <div className="rounded-2xl bg-white border border-zinc-200 p-6 shadow-sm hover:shadow-md transition">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-xl bg-purple-100 flex items-center justify-center">
                                <Mail className="w-5 h-5 text-purple-600" />
                            </div>

                            <div>
                                <p className="text-sm text-zinc-500 font-medium">
                                    Tasks Applied
                                </p>
                                <p className="text-3xl font-bold text-zinc-900 mt-1">
                                    {stats.tasksApplied}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Worker Active Tasks */}
                    <div className="rounded-2xl bg-white border border-zinc-200 p-6 shadow-sm hover:shadow-md transition">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-xl bg-yellow-100 flex items-center justify-center">
                                <Briefcase className="w-5 h-5 text-yellow-600" />
                            </div>

                            <div>
                                <p className="text-sm text-zinc-500 font-medium">
                                    Active Tasks
                                </p>
                                <p className="text-3xl font-bold text-zinc-900 mt-1">
                                    {stats.workerActiveTasks}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Worker Completed Tasks */}
                    <div className="rounded-2xl bg-white border border-zinc-200 p-6 shadow-sm hover:shadow-md transition">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-xl bg-emerald-100 flex items-center justify-center">
                                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                            </div>

                            <div>
                                <p className="text-sm text-zinc-500 font-medium">
                                    Completed Tasks
                                </p>
                                <p className="text-3xl font-bold text-zinc-900 mt-1">
                                    {stats.workerCompletedTasks}
                                </p>
                            </div>
                        </div>
                    </div>

                </div>
            </div>

        </div>
    );
}