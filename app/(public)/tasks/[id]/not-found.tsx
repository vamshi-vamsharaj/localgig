
import Link from "next/link";
import { Briefcase, ArrowLeft } from "lucide-react";

export default function TaskNotFound() {
    return (
        <div className="min-h-[60vh] flex flex-col items-center justify-center px-4 py-24 text-center">
            <div className="h-16 w-16 rounded-2xl bg-blue-50 flex items-center justify-center mb-6">
                <Briefcase className="h-8 w-8 text-blue-600" />
            </div>
            <h1 className="text-2xl font-bold text-zinc-900 mb-2">Task not found</h1>
            <p className="text-sm text-zinc-500 max-w-sm mb-8">
                This task may have been removed or the link is invalid. Browse all open tasks below.
            </p>
            <Link
                href="/tasks"
                className="inline-flex items-center gap-2 h-10 px-6 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-white text-sm font-semibold transition-colors shadow-sm"
            >
                <ArrowLeft className="h-4 w-4" />
                Back to all tasks
            </Link>
        </div>
    );
}