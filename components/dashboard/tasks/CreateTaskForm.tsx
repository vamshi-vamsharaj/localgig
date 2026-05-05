"use client";

import { useCallback, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import dynamic from "next/dynamic";
import { Loader2, MapPin } from "lucide-react";

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

// ─── Main form ────────────────────────────────────────────────────────────────

export default function CreateTaskForm() {
    const router = useRouter();
    const [isPending, startTransition] = useTransition();

    const {
        register,
        handleSubmit,
        setValue,
        watch,
        formState: { errors },
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
        startTransition(async () => {
            const result = await createTask(data);
            if (result.success) {
                router.push(`/tasks/${result.data.taskId}`);
            }
        });
    }

    return (
        <div className="w-full max-w-2xl mx-auto py-8 px-4 space-y-6">
            <h1 className="text-2xl font-bold text-zinc-900">Post a Task</h1>

            <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">

                {/* Basic fields */}
                <div>
                    <label className="text-sm font-medium text-zinc-700 block mb-1">Title</label>
                    <input
                        {...register("title")}
                        placeholder="e.g. Fix leaking kitchen sink"
                        className="w-full h-10 px-3 rounded-lg border border-zinc-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                        disabled={isPending}
                    />
                    {errors.title && <p className="text-xs text-red-500 mt-1">{errors.title.message}</p>}
                </div>

                <div>
                    <label className="text-sm font-medium text-zinc-700 block mb-1">Description</label>
                    <textarea
                        {...register("description")}
                        placeholder="Describe the task in detail…"
                        rows={4}
                        disabled={isPending}
                        className="w-full px-3 py-2 rounded-lg border border-zinc-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 resize-none"
                    />
                    {errors.description && <p className="text-xs text-red-500 mt-1">{errors.description.message}</p>}
                </div>

                <div>
                    <label className="text-sm font-medium text-zinc-700 block mb-1">Budget (₹)</label>
                    <input
                        type="number"
                        min={1}
                        {...register("budget", { valueAsNumber: true })}
                        placeholder="2000"
                        disabled={isPending}
                        className="w-full h-10 px-3 rounded-lg border border-zinc-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                    />
                    {errors.budget && <p className="text-xs text-red-500 mt-1">{errors.budget.message}</p>}
                </div>

                {/* ── Location ─────────────────────────────────────────────── */}
                <div>
                    <label className="text-sm font-medium text-zinc-700 block mb-1">Location</label>

                    {/* Hidden RHF fields */}
                    <input type="hidden" {...register("address")} />
                    <input type="hidden" {...register("longitude", { valueAsNumber: true })} />
                    <input type="hidden" {...register("latitude",  { valueAsNumber: true })} />

                    <div className="h-[360px] rounded-xl overflow-hidden border border-zinc-200">
                        <LocationPicker onLocationChange={handleLocationChange} />
                    </div>

                    {watch("address") && (
                        <div className="flex items-start gap-2 px-3 py-2.5 bg-blue-50 rounded-lg border border-blue-100 mt-2">
                            <MapPin className="h-4 w-4 text-blue-600 shrink-0 mt-0.5" />
                            <p className="text-sm text-blue-800 font-medium leading-snug">{watch("address")}</p>
                        </div>
                    )}

                    {errors.address && <p className="text-xs text-red-500 mt-1">{errors.address.message}</p>}
                </div>

                <button
                    type="submit"
                    disabled={isPending}
                    className="w-full h-10 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold transition disabled:opacity-50"
                >
                    {isPending ? "Posting…" : "Post Task"}
                </button>

            </form>
        </div>
    );
}