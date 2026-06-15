
import { notFound } from "next/navigation";
import Link from "next/link";
import { headers } from "next/headers";
import {
    ArrowLeft,
    MapPin,
    Clock,
    Calendar,
    Users,
    IndianRupee,
    Briefcase,
    BadgeCheck,
    Tag,
} from "lucide-react";
import { auth } from "@/lib/auth/auth";
import { getTaskDetail, getSimilarTasks } from "@/lib/actions/tasks";
import { getSavedTaskIds } from "@/lib/actions/savedTasks";
import type { TaskDetail } from "@/lib/actions/tasks";
import TaskDetailSidebar from "@/components/dashboard/tasks/TaskDetailSidebar";
import TaskDetailBottomBar from "@/components/dashboard/tasks/TaskDetailBottomBar";
import TaskDetailClient from "@/components/dashboard/tasks/TaskDetailClient";
import TaskCard from "@/components/dashboard/tasks/TaskCard";
import { CATEGORY_CONFIG, formatDate, timeAgo } from "@/components/dashboard/tasks/task-utils";
import TaskDetailMapWrapper from "@/components/dashboard/tasks/TaskDetailMapWrapper";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const task = await getTaskDetail(id);
    if (!task) return { title: "Task not found — LocalGig" };
    return {
        title: `${task.title} — LocalGig`,
        description: task.description.slice(0, 160),
    };
}

// ─── Status config ────────────────────────────────────────────────────────────

const STATUS_CONFIG = {
    open:        { label: "Open",        badge: "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200", dot: "bg-emerald-400" },
    in_progress: { label: "In Progress", badge: "bg-amber-50  text-amber-700  ring-1 ring-amber-200",   dot: "bg-amber-400" },
    completed:   { label: "Completed",   badge: "bg-blue-50   text-blue-700   ring-1 ring-blue-200",     dot: "bg-blue-400" },
    cancelled:   { label: "Cancelled",   badge: "bg-zinc-100  text-zinc-500   ring-1 ring-zinc-200",     dot: "bg-zinc-300" },
} as const;

// ─── Section label ────────────────────────────────────────────────────────────

function SectionLabel({ children }: { children: React.ReactNode }) {
    return (
        <h2 className="text-base font-bold text-zinc-900 mb-4 flex items-center gap-2">
            {children}
        </h2>
    );
}


function TaskHeader({ task }: { task: TaskDetail }) {
    const cfg     = CATEGORY_CONFIG[task.category] ?? CATEGORY_CONFIG.General;
    const status  = STATUS_CONFIG[task.status]     ?? STATUS_CONFIG.open;

    return (
        <div className="flex flex-col gap-4">
            {/* Breadcrumb */}
            <div className="flex items-center gap-2 text-xs text-zinc-400">
                <Link href="/tasks" className="hover:text-blue-600 transition-colors flex items-center gap-1">
                    <ArrowLeft className="h-3 w-3" />
                    All Tasks
                </Link>
                <span>/</span>
                <span className={`${cfg.text} font-medium`}>{task.category}</span>
            </div>

            {/* Category + Status pills */}
            <div className="flex items-center gap-2 flex-wrap">
                <span className={`inline-flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider px-3 py-1 rounded-full ${cfg.bg} ${cfg.text}`}>
                    <span className={`h-1.5 w-1.5 rounded-full ${cfg.dot}`} />
                    {task.category}
                </span>
                <span className={`inline-flex items-center gap-1.5 text-[11px] font-semibold px-3 py-1 rounded-full ${status.badge}`}>
                    <span className={`h-1.5 w-1.5 rounded-full ${status.dot}`} />
                    {status.label}
                </span>
            </div>

            {/* Title */}
            <h1 className="text-2xl sm:text-3xl font-bold text-zinc-900 leading-tight tracking-tight">
                {task.title}
            </h1>

            {/* Quick meta strip */}
            <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-zinc-500">
                <span className="flex items-center gap-1.5">
                    <MapPin className="h-4 w-4 text-blue-400 shrink-0" />
                    {task.address}
                </span>
                <span className="flex items-center gap-1.5">
                    <Users className="h-4 w-4 text-blue-400 shrink-0" />
                    {task.applicantsCount} {task.applicantsCount === 1 ? "applicant" : "applicants"}
                </span>
                <span className="flex items-center gap-1.5">
                    <Clock className="h-4 w-4 text-zinc-300 shrink-0" />
                    Posted {timeAgo(task.createdAt)}
                </span>
            </div>

            {/* Mobile budget hero (hidden on lg — sidebar handles it) */}
            <div className="lg:hidden flex items-center gap-2 py-4 px-5 bg-zinc-50 rounded-2xl border border-zinc-200">
                <IndianRupee className="h-5 w-5 text-zinc-400 shrink-0" />
                <span className="text-2xl font-bold text-zinc-900 tabular-nums">
                    {task.budget.toLocaleString("en-IN")}
                </span>
                <span className="text-sm text-zinc-400 font-medium">budget</span>
            </div>
        </div>
    );
}


function TaskDescription({ description }: { description: string }) {
    const paragraphs = description.split(/\n\n+/).filter(Boolean);

    return (
        <div>
            <SectionLabel>About this task</SectionLabel>
            <div className="prose prose-sm prose-zinc max-w-none space-y-4">
                {paragraphs.length > 1
                    ? paragraphs.map((p, i) => (
                        <p key={i} className="text-sm sm:text-base text-zinc-600 leading-relaxed">
                            {p}
                        </p>
                    ))
                    : (
                        <p className="text-sm sm:text-base text-zinc-600 leading-relaxed whitespace-pre-wrap">
                            {description}
                        </p>
                    )
                }
            </div>
        </div>
    );
}


function DetailItem({
    icon: Icon,
    label,
    value,
    valueClass = "text-zinc-900",
}: {
    icon: React.ElementType;
    label: string;
    value: string;
    valueClass?: string;
}) {
    return (
        <div className="flex flex-col gap-1.5 p-4 bg-zinc-50 rounded-2xl border border-zinc-100">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-zinc-400 uppercase tracking-wider">
                <Icon className="h-3.5 w-3.5 text-blue-400" />
                {label}
            </div>
            <p className={`text-sm font-bold ${valueClass}`}>{value}</p>
        </div>
    );
}

function TaskDetails({ task }: { task: TaskDetail }) {
    return (
        <div>
            <SectionLabel>Task details</SectionLabel>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <DetailItem
                    icon={Tag}
                    label="Category"
                    value={task.category}
                />
                <DetailItem
                    icon={IndianRupee}
                    label="Budget"
                    value={`₹${task.budget.toLocaleString("en-IN")}`}
                    valueClass="text-blue-600"
                />
                <DetailItem
                    icon={Users}
                    label="Applicants"
                    value={String(task.applicantsCount)}
                />
                {task.estimatedHours && (
                    <DetailItem
                        icon={Clock}
                        label="Duration"
                        value={`${task.estimatedHours}h`}
                    />
                )}
                {task.deadline && (
                    <DetailItem
                        icon={Calendar}
                        label="Deadline"
                        value={formatDate(task.deadline) ?? "—"}
                        valueClass="text-amber-600"
                    />
                )}
                <DetailItem
                    icon={Clock}
                    label="Posted"
                    value={timeAgo(task.createdAt)}
                />
            </div>
        </div>
    );
}

function TaskLocation({ task }: { task: TaskDetail }) {
    return (
        <div>
            <SectionLabel>
                <MapPin className="h-4 w-4 text-blue-500" />
                Location
            </SectionLabel>
            <TaskDetailMapWrapper
                coordinates={task.coordinates}
                address={task.address}
            />
        </div>
    );
}


function ClientProfile({ client }: { client: TaskDetail["client"] }) {
    const initials = client.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2);

    const joinYear = new Date(client.joinedAt).getFullYear();

    return (
        <div>
            <SectionLabel>Posted by</SectionLabel>
            <div className="flex items-start gap-4 p-5 bg-white rounded-2xl border border-zinc-100 shadow-sm">
                {/* Avatar */}
                {client.avatar ? (
                    <img
                        src={client.avatar}
                        alt={client.name}
                        className="h-14 w-14 rounded-2xl object-cover shrink-0 border border-zinc-200"
                    />
                ) : (
                    <div className="h-14 w-14 rounded-2xl bg-blue-50 flex items-center justify-center text-lg font-bold text-blue-600 shrink-0 border border-blue-100">
                        {initials}
                    </div>
                )}

                {/* Info */}
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                        <p className="text-base font-bold text-zinc-900">{client.name}</p>
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full ring-1 ring-emerald-200">
                            <BadgeCheck className="h-3 w-3" />
                            Verified
                        </span>
                    </div>

                    <p className="text-xs text-zinc-400 mt-0.5">Member since {joinYear}</p>

                    <div className="flex items-center gap-4 mt-3 flex-wrap">
                        <div className="flex items-center gap-1.5 text-xs text-zinc-500">
                            <Briefcase className="h-3.5 w-3.5 text-blue-400" />
                            <span>
                                <span className="font-bold text-zinc-900">{client.tasksPosted}</span>{" "}
                                {client.tasksPosted === 1 ? "task" : "tasks"} posted
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

// ─── Similar Tasks ────────────────────────────────────────────────────────────

function SimilarTasks({
    tasks,
    userId,
    savedIds,
}: {
    tasks: Awaited<ReturnType<typeof getSimilarTasks>>;
    userId: string;
    savedIds: Set<string>;
}) {
    if (tasks.length === 0) return null;

    const asFindTasks = tasks as unknown as Parameters<typeof TaskCard>[0]["task"][];

    return (
        <div className="border-t border-zinc-100 pt-10">
            <SectionLabel>Similar tasks</SectionLabel>
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                {asFindTasks.map((t) => (
                    <TaskCard
                        key={t._id}
                        task={t}
                        userId={userId}
                        isSaved={savedIds.has(t._id)}
                    />
                ))}
            </div>
        </div>
    );
}


export default async function TaskDetailPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { id } = await params;

    // ── Auth (non-blocking — guests see the page, just can't apply) ──────────
    const session = await auth.api.getSession({ headers: await headers() });
    const userId  = (session?.user as { id?: string } | undefined)?.id ?? "";

    // ── Parallel data fetch ───────────────────────────────────────────────────
    const [task, savedIds] = await Promise.all([
        getTaskDetail(id, userId),
        userId ? getSavedTaskIds(userId) : Promise.resolve([] as string[]),
    ]);

    if (!task) notFound();

    // Fetch similar tasks after we know the category
    const similar = await getSimilarTasks(id, task.category, 3);
    const savedSet = new Set(savedIds);

    return (
        <>
            {/* ── Main layout ─────────────────────────────────────────────── */}
            <div className="min-h-screen bg-zinc-50/40">
                <div className="max-w-[1400px] mx-auto px-4 sm:px-6 py-8 sm:py-12">

                    {/* Two-column grid: content | sidebar */}
                    <div className="grid lg:grid-cols-[1fr_340px] xl:grid-cols-[1fr_360px] gap-10 xl:gap-14 items-start">

                        {/* ── Left: content column ──────────────────────── */}
                        <TaskDetailClient
                            header={<TaskHeader task={task} />}

                            description={<TaskDescription description={task.description} />}

                            details={<TaskDetails task={task} />}

                            map={<TaskLocation task={task} />}

                            client={<ClientProfile client={task.client} />}

                            similar={
                                similar.length > 0 ? (
                                    <SimilarTasks
                                        tasks={similar}
                                        userId={userId}
                                        savedIds={savedSet}
                                    />
                                ) : null
                            }
                        />

                        {/* ── Right: sticky sidebar (desktop only) ──────── */}
                        <TaskDetailSidebar task={task} userId={userId} />
                    </div>
                </div>
            </div>

            {/* ── Mobile bottom bar ───────────────────────────────────────── */}
            <TaskDetailBottomBar task={task} userId={userId} />
        </>
    );
}