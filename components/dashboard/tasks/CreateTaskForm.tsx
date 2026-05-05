"use client";

import { useState, useCallback, useTransition, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import dynamic from "next/dynamic";
import {
    Briefcase, FileText, IndianRupee, Clock, CalendarDays,
    MapPin, ChevronDown, Loader2, CheckCircle2, AlertCircle,
    Sparkles, ArrowRight, Tag,
} from "lucide-react";
import { format } from "date-fns";

import { createTask } from "@/lib/actions/tasks";
import { CreateTaskSchema, type CreateTaskInput } from "@/lib/schemas/tasks";

// ─── Lazy-load the map to avoid SSR issues ────────────────────────────────────

const LocationPicker = dynamic(() => import("./LocationPicker"), {
    ssr: false,
    loading: () => (
        <div className="w-full h-full min-h-[420px] rounded-2xl bg-zinc-100 flex items-center justify-center">
            <div className="flex flex-col items-center gap-3 text-zinc-400">
                <Loader2 className="h-6 w-6 animate-spin" />
                <p className="text-sm font-medium">Loading map…</p>
            </div>
        </div>
    ),
});

// ─── Config ───────────────────────────────────────────────────────────────────

const CATEGORIES = [
    "Moving", "Delivery", "Repair", "Tutoring",
    "Photography", "Cleaning", "IT & Tech", "Design",
    "Writing", "Event Help", "Other",
];

// ─── Small helpers ────────────────────────────────────────────────────────────

function FieldLabel({ children, required }: { children: React.ReactNode; required?: boolean }) {
    return (
        <label className="flex items-center gap-1.5 text-[11px] font-bold text-zinc-500 uppercase tracking-widest mb-1.5">
            {children}
            {required && <span className="text-blue-500">*</span>}
        </label>
    );
}

function FieldError({ message }: { message?: string }) {
    if (!message) return null;
    return (
        <p className="flex items-center gap-1 text-xs text-red-500 font-medium mt-1.5">
            <AlertCircle className="h-3 w-3 shrink-0" />
            {message}
        </p>
    );
}

const inputCls = `
    w-full h-11 px-4 rounded-xl border border-zinc-200 bg-white
    text-sm font-medium text-zinc-800 placeholder-zinc-300
    focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400
    transition-all duration-150
    disabled:opacity-50 disabled:cursor-not-allowed
`;

const textareaCls = `
    w-full px-4 py-3 rounded-xl border border-zinc-200 bg-white
    text-sm font-medium text-zinc-800 placeholder-zinc-300
    focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400
    transition-all duration-150 resize-none leading-relaxed
    disabled:opacity-50 disabled:cursor-not-allowed
`;

// ─── Section wrapper ──────────────────────────────────────────────────────────

function Section({
    icon: Icon, title, subtitle, children,
}: {
    icon: React.ElementType;
    title: string;
    subtitle: string;
    children: React.ReactNode;
}) {
    return (
        <div className="bg-white rounded-2xl border border-zinc-100 shadow-sm overflow-hidden">
            <div className="flex items-center gap-3 px-6 py-4 border-b border-zinc-50">
                <div className="h-8 w-8 rounded-lg bg-blue-50 flex items-center justify-center shrink-0">
                    <Icon className="h-4 w-4 text-blue-600" />
                </div>
                <div>
                    <p className="text-sm font-bold text-zinc-900 leading-tight">{title}</p>
                    <p className="text-xs text-zinc-400 font-medium">{subtitle}</p>
                </div>
            </div>
            <div className="px-6 py-5 space-y-5">
                {children}
            </div>
        </div>
    );
}

// ─── Main form ────────────────────────────────────────────────────────────────

export default function CreateTaskForm() {
    const router = useRouter();
    const [isPending, startTransition] = useTransition();
    const [submitResult, setSubmitResult] = useState<
        { success: true; taskId: string } | { success: false; error: string } | null
    >(null);

    const {
        register,
        handleSubmit,
        control,
        setValue,
        watch,
        formState: { errors, isValid },
    } = useForm<CreateTaskInput>({
        resolver: zodResolver(CreateTaskSchema),
        mode: "onChange",
        defaultValues: {
            category:  "",
            address:   "",
            longitude: undefined,
            latitude:  undefined,
        },
    });

    const descriptionValue = watch("description") ?? "";

    // ── Callback for LocationPicker ────────────────────────────────────────────
    const handleLocationChange = useCallback(
        (location: { address: string; longitude: number; latitude: number }) => {
            setValue("address",   location.address,   { shouldValidate: true });
            setValue("longitude", location.longitude, { shouldValidate: true });
            setValue("latitude",  location.latitude,  { shouldValidate: true });
        },
        [setValue]
    );

    // ── Submit ─────────────────────────────────────────────────────────────────
    function onSubmit(data: CreateTaskInput) {
        setSubmitResult(null);
        startTransition(async () => {
            const result = await createTask(data);
            if (result.success) {
                setSubmitResult({ success: true, taskId: result.data.taskId });
                setTimeout(() => {
                    router.push(`/tasks/${result.data.taskId}`);
                }, 1200);
            } else {
                setSubmitResult({ success: false, error: result.error });
            }
        });
    }

    return (
        <div className="w-full">

            {/* ── Page header ────────────────────────────────────────────────── */}
            <div className="mb-8">
                <div className="flex items-center gap-2 mb-2">
                    <div className="h-8 w-8 rounded-xl bg-blue-600 flex items-center justify-center">
                        <Sparkles className="h-4 w-4 text-white" />
                    </div>
                    <span className="text-xs font-bold text-blue-600 uppercase tracking-widest">New Task</span>
                </div>
                <h1 className="text-3xl font-bold text-zinc-900 tracking-tight">Post a Task</h1>
                <p className="text-base text-zinc-400 font-medium mt-1">
                    Describe what you need — workers nearby will apply and you pick the best fit.
                </p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} noValidate>
                {/* ── Two-column layout: form left, map right ─────────────── */}
                <div className="grid grid-cols-1 xl:grid-cols-[1fr_460px] gap-6 items-start">

                    {/* ── LEFT: Form sections ───────────────────────────────── */}
                    <div className="space-y-5 min-w-0">

                        {/* Section 1: Task Info */}
                        <Section icon={Briefcase} title="Task Information" subtitle="What do you need done?">

                            {/* Title */}
                            <div>
                                <FieldLabel required>Task Title</FieldLabel>
                                <input
                                    {...register("title")}
                                    placeholder="e.g. Fix leaking kitchen sink in my apartment"
                                    className={inputCls}
                                    disabled={isPending}
                                />
                                <FieldError message={errors.title?.message} />
                            </div>

                            {/* Category */}
                            <div>
                                <FieldLabel required>
                                    <Tag className="h-3.5 w-3.5" />
                                    Category
                                </FieldLabel>
                                <Controller
                                    name="category"
                                    control={control}
                                    render={({ field }) => (
                                        <div className="relative">
                                            <select
                                                {...field}
                                                disabled={isPending}
                                                className={`${inputCls} appearance-none pr-10 cursor-pointer`}
                                            >
                                                <option value="">Select a category…</option>
                                                {CATEGORIES.map((c) => (
                                                    <option key={c} value={c}>{c}</option>
                                                ))}
                                            </select>
                                            <ChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400 pointer-events-none" />
                                        </div>
                                    )}
                                />
                                <FieldError message={errors.category?.message} />
                            </div>

                            {/* Description */}
                            <div>
                                <FieldLabel required>
                                    <FileText className="h-3.5 w-3.5" />
                                    Description
                                </FieldLabel>
                                <textarea
                                    {...register("description")}
                                    placeholder="Describe the task in detail. Include any specific requirements, tools needed, access instructions, etc."
                                    rows={5}
                                    disabled={isPending}
                                    className={textareaCls}
                                />
                                <div className="flex items-center justify-between mt-1.5">
                                    <FieldError message={errors.description?.message} />
                                    <span className={`text-[11px] font-medium tabular-nums ml-auto ${
                                        descriptionValue.length > 1900 ? "text-red-400" : "text-zinc-400"
                                    }`}>
                                        {descriptionValue.length}/2000
                                    </span>
                                </div>
                            </div>
                        </Section>

                        {/* Section 2: Budget & Time */}
                        <Section icon={IndianRupee} title="Budget & Time" subtitle="Set your budget and timeline">

                            <div className="grid grid-cols-2 gap-4">
                                {/* Budget */}
                                <div>
                                    <FieldLabel required>
                                        <IndianRupee className="h-3.5 w-3.5" />
                                        Budget (₹)
                                    </FieldLabel>
                                    <div className="relative">
                                        <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm font-bold text-zinc-400">₹</span>
                                        <input
                                            type="number"
                                            min={1}
                                            step="1"
                                            {...register("budget", { valueAsNumber: true })}
                                            placeholder="2,000"
                                            disabled={isPending}
                                            className={`${inputCls} pl-8`}
                                        />
                                    </div>
                                    <FieldError message={errors.budget?.message} />
                                </div>

                                {/* Estimated Hours */}
                                <div>
                                    <FieldLabel>
                                        <Clock className="h-3.5 w-3.5" />
                                        Est. Hours
                                    </FieldLabel>
                                    <div className="relative">
                                        <input
                                            type="number"
                                            min={0.5}
                                            step={0.5}
                                            {...register("estimatedHours", { valueAsNumber: true })}
                                            placeholder="3"
                                            disabled={isPending}
                                            className={inputCls}
                                        />
                                        <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-medium text-zinc-400">hrs</span>
                                    </div>
                                    <FieldError message={errors.estimatedHours?.message} />
                                </div>
                            </div>

                            {/* Deadline */}
                            <div>
                                <FieldLabel>
                                    <CalendarDays className="h-3.5 w-3.5" />
                                    Deadline (Optional)
                                </FieldLabel>
                                <input
                                    type="date"
                                    {...register("deadline")}
                                    min={format(new Date(), "yyyy-MM-dd")}
                                    disabled={isPending}
                                    className={`${inputCls} cursor-pointer`}
                                />
                                <FieldError message={errors.deadline?.message} />
                            </div>
                        </Section>

                        {/* ── MOBILE: Map shows here below budget on small screens ── */}
                        <div className="xl:hidden">
                            <Section icon={MapPin} title="Task Location" subtitle="Pin exactly where the work needs to happen">
                                {/* Hidden fields for validation */}
                                <input type="hidden" {...register("address")} />
                                <input type="hidden" {...register("longitude", { valueAsNumber: true })} />
                                <input type="hidden" {...register("latitude",  { valueAsNumber: true })} />

                                <div className="h-[360px] rounded-xl overflow-hidden border border-zinc-200">
                                    <LocationPicker onLocationChange={handleLocationChange} />
                                </div>

                                {watch("address") && (
                                    <div className="flex items-start gap-2 px-3.5 py-3 bg-blue-50 rounded-xl border border-blue-100 mt-1">
                                        <MapPin className="h-4 w-4 text-blue-600 shrink-0 mt-0.5" />
                                        <p className="text-sm text-blue-800 font-medium leading-snug">{watch("address")}</p>
                                    </div>
                                )}
                                <FieldError message={errors.address?.message} />
                            </Section>
                        </div>

                        {/* ── Submit button + feedback ───────────────────────────── */}
                        <div className="bg-white rounded-2xl border border-zinc-100 shadow-sm px-6 py-5">

                            {/* Error feedback */}
                            {submitResult && !submitResult.success && (
                                <div className="flex items-start gap-3 px-4 py-3 bg-red-50 border border-red-200 rounded-xl mb-4">
                                    <AlertCircle className="h-4 w-4 text-red-500 shrink-0 mt-0.5" />
                                    <p className="text-sm text-red-700 font-medium">{submitResult.error}</p>
                                </div>
                            )}

                            {/* Success feedback */}
                            {submitResult?.success && (
                                <div className="flex items-center gap-3 px-4 py-3 bg-emerald-50 border border-emerald-200 rounded-xl mb-4">
                                    <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                                    <p className="text-sm text-emerald-700 font-semibold">
                                        Task posted! Redirecting…
                                    </p>
                                </div>
                            )}

                            <div className="flex items-center justify-between gap-4">
                                <p className="text-xs text-zinc-400 font-medium">
                                    Workers in your area will be notified once posted.
                                </p>
                                <button
                                    type="submit"
                                    disabled={isPending || submitResult?.success === true}
                                    className="inline-flex items-center gap-2 h-11 px-7 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-sm font-bold transition-all duration-150 shadow-md shadow-blue-200 disabled:opacity-50 disabled:cursor-not-allowed active:scale-95"
                                >
                                    {isPending ? (
                                        <>
                                            <Loader2 className="h-4 w-4 animate-spin" />
                                            Posting…
                                        </>
                                    ) : submitResult?.success ? (
                                        <>
                                            <CheckCircle2 className="h-4 w-4" />
                                            Posted!
                                        </>
                                    ) : (
                                        <>
                                            Post Task
                                            <ArrowRight className="h-4 w-4" />
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>

                    </div>

                    {/* ── RIGHT: Sticky map (desktop only) ──────────────────── */}
                    <div className="hidden xl:block sticky top-6 space-y-4">
                        <div className="bg-white rounded-2xl border border-zinc-100 shadow-sm overflow-hidden">
                            <div className="flex items-center gap-3 px-5 py-4 border-b border-zinc-50">
                                <div className="h-8 w-8 rounded-lg bg-blue-50 flex items-center justify-center shrink-0">
                                    <MapPin className="h-4 w-4 text-blue-600" />
                                </div>
                                <div>
                                    <p className="text-sm font-bold text-zinc-900">Task Location</p>
                                    <p className="text-xs text-zinc-400 font-medium">
                                        Search or drag the pin to set location
                                    </p>
                                </div>
                            </div>

                            {/* Hidden RHF fields */}
                            <input type="hidden" {...register("address")} />
                            <input type="hidden" {...register("longitude", { valueAsNumber: true })} />
                            <input type="hidden" {...register("latitude",  { valueAsNumber: true })} />

                            <div className="h-[420px]">
                                <LocationPicker onLocationChange={handleLocationChange} />
                            </div>

                            {/* Address display */}
                            <div className="px-5 py-4 border-t border-zinc-50">
                                {watch("address") ? (
                                    <div className="flex items-start gap-2.5 px-3.5 py-3 bg-blue-50 rounded-xl border border-blue-100">
                                        <MapPin className="h-4 w-4 text-blue-600 shrink-0 mt-0.5" />
                                        <p className="text-sm text-blue-800 font-semibold leading-snug">
                                            {watch("address")}
                                        </p>
                                    </div>
                                ) : (
                                    <p className="text-xs text-zinc-400 font-medium text-center py-1">
                                        No location selected yet — search or click the map
                                    </p>
                                )}
                                <FieldError message={errors.address?.message} />
                            </div>
                        </div>

                        {/* Tips card */}
                        <div className="bg-zinc-50 rounded-2xl border border-zinc-100 px-5 py-4 space-y-2.5">
                            <p className="text-xs font-bold text-zinc-600 uppercase tracking-widest">Tips for a great post</p>
                            {[
                                "Be specific — detailed tasks get better applicants",
                                "Set a realistic budget to attract skilled workers",
                                "Add a deadline if the task is time-sensitive",
                                "Pin the exact location so nearby workers can plan",
                            ].map((tip) => (
                                <div key={tip} className="flex items-start gap-2">
                                    <span className="h-1.5 w-1.5 rounded-full bg-blue-400 mt-1.5 shrink-0" />
                                    <p className="text-xs text-zinc-500 font-medium leading-relaxed">{tip}</p>
                                </div>
                            ))}
                        </div>
                    </div>

                </div>
            </form>
        </div>
    );
}