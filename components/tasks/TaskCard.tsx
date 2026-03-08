"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Task } from "@/lib/models/models.types";
import { MapPin, Clock, IndianRupee } from "lucide-react"
interface JobCardProps {
    task: Task;
}
export default function JobCard({ task }: JobCardProps) {

    async function applyToJob() {

        const res = await fetch("/api/applications", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ taskId: task._id }),
        });

        if (res.ok) {
            alert("Applied successfully!");
        } else {
            alert("Application failed");
        }
    }

    return (
        <Card className="group rounded-2xl border bg-white shadow-sm transition-all hover:shadow-lg hover:-translate-y-1">
            <CardContent className="p-6 flex flex-col gap-4">

                <div className="flex items-start justify-between gap-4">
                    <h2 className="text-lg font-semibold leading-snug group-hover:text-primary transition line-clamp-2">
                        {task.title}
                    </h2>

                    <div className="flex items-center gap-1 text-lg font-semibold text-primary whitespace-nowrap">
                        <IndianRupee className="h-4 w-4" />
                        {task.budget}
                    </div>
                </div>

                <p className="text-sm text-muted-foreground line-clamp-2">
                    {task.description}
                </p>

                <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">

                    <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4" />
                        <span className="line-clamp-1">{task.address}</span>
                    </div>

                    <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4" />
                        <span>{task.estimatedHours} hours</span>
                    </div>

                </div>

                <Badge variant="secondary" className="w-fit rounded-md px-2 py-1 text-xs">
                    {task.category || "General"}
                </Badge>

                <div className="flex gap-3 pt-2">
                    <Button className="flex-1 font-medium" onClick={applyToJob}>
                        Apply Now
                    </Button>

                    <Button variant="outline" className="flex-1">
                        See Details
                    </Button>
                </div>

            </CardContent>
        </Card>
    );
}