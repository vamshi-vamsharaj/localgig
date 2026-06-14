"use client";

import dynamic from "next/dynamic";

function MapSkeleton() {
    return (
        <div className="w-full h-[260px] sm:h-[320px] rounded-2xl bg-zinc-100 border border-zinc-200 animate-pulse" />
    );
}

const TaskDetailMap = dynamic(
    () => import("@/components/dashboard/tasks/TaskDetailMap"),
    { ssr: false, loading: () => <MapSkeleton /> }
);

interface TaskDetailMapWrapperProps {
    coordinates: [number, number]; 
    address: string;
}

export default function TaskDetailMapWrapper(props: TaskDetailMapWrapperProps) {
    return <TaskDetailMap {...props} />;
}