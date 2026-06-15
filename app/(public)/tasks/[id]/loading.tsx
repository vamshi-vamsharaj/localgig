
export default function TaskDetailLoading() {
    return (
        <div className="min-h-screen bg-zinc-50/40">
            <div className="max-w-[1400px] mx-auto px-4 sm:px-6 py-8 sm:py-12">
                <div className="grid lg:grid-cols-[1fr_340px] xl:grid-cols-[1fr_360px] gap-10 xl:gap-14 items-start">

                    {/* ── Content column skeleton ──────────────────────────── */}
                    <div className="flex flex-col gap-10 animate-pulse">

                        {/* Breadcrumb */}
                        <div className="h-4 w-32 bg-zinc-200 rounded-full" />

                        {/* Header */}
                        <div className="flex flex-col gap-3">
                            <div className="flex gap-2">
                                <div className="h-6 w-20 bg-zinc-200 rounded-full" />
                                <div className="h-6 w-16 bg-zinc-200 rounded-full" />
                            </div>
                            <div className="h-8 w-3/4 bg-zinc-200 rounded-xl" />
                            <div className="h-5 w-1/2 bg-zinc-100 rounded-xl" />
                        </div>

                        {/* Description */}
                        <div className="flex flex-col gap-2">
                            <div className="h-5 w-40 bg-zinc-200 rounded-lg mb-2" />
                            <div className="h-4 w-full bg-zinc-100 rounded-lg" />
                            <div className="h-4 w-5/6 bg-zinc-100 rounded-lg" />
                            <div className="h-4 w-4/6 bg-zinc-100 rounded-lg" />
                        </div>

                        {/* Details grid */}
                        <div className="flex flex-col gap-2">
                            <div className="h-5 w-32 bg-zinc-200 rounded-lg mb-2" />
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                                {Array.from({ length: 5 }).map((_, i) => (
                                    <div key={i} className="h-20 bg-zinc-100 rounded-2xl" />
                                ))}
                            </div>
                        </div>

                        {/* Map */}
                        <div className="h-[280px] bg-zinc-100 rounded-2xl" />

                        {/* Client */}
                        <div className="flex items-start gap-4 p-5 bg-white rounded-2xl border border-zinc-100">
                            <div className="h-14 w-14 bg-zinc-200 rounded-2xl shrink-0" />
                            <div className="flex flex-col gap-2 flex-1">
                                <div className="h-5 w-32 bg-zinc-200 rounded-lg" />
                                <div className="h-4 w-24 bg-zinc-100 rounded-lg" />
                                <div className="h-4 w-28 bg-zinc-100 rounded-lg" />
                            </div>
                        </div>
                    </div>

                    <div className="hidden lg:block animate-pulse">
                        <div className="bg-white rounded-2xl border border-zinc-200 overflow-hidden">
                            <div className="px-6 pt-6 pb-5 border-b border-zinc-100 flex flex-col gap-2">
                                <div className="h-4 w-16 bg-zinc-200 rounded-full" />
                                <div className="h-10 w-32 bg-zinc-200 rounded-xl" />
                                <div className="h-3 w-24 bg-zinc-100 rounded-full" />
                            </div>
                            <div className="px-6 py-4 flex flex-col gap-3">
                                {Array.from({ length: 4 }).map((_, i) => (
                                    <div key={i} className="flex justify-between">
                                        <div className="h-3 w-20 bg-zinc-100 rounded-full" />
                                        <div className="h-3 w-24 bg-zinc-100 rounded-full" />
                                    </div>
                                ))}
                            </div>
                            <div className="px-6 pb-6 pt-2 flex flex-col gap-2">
                                <div className="h-11 bg-zinc-200 rounded-xl" />
                                <div className="flex gap-2">
                                    <div className="h-10 w-10 bg-zinc-100 rounded-xl" />
                                    <div className="h-10 flex-1 bg-zinc-100 rounded-xl" />
                                    <div className="h-10 w-10 bg-zinc-100 rounded-xl" />
                                </div>
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
}