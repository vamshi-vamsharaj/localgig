"use client";

import { Button } from "@/components/ui/button";
import {
    Select,
    SelectTrigger,
    SelectValue,
    SelectItem,
    SelectContent,
} from "@/components/ui/select";
import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export default function JobsFilters() {
    const router = useRouter();
    const searchParams = useSearchParams();

    const [locations, setLocations] = useState<string[]>([]);

    const category = searchParams.get("category") || "all";
    const location = searchParams.get("location") || "all";
    const budget = searchParams.get("budget") || "0";

    useEffect(() => {
        async function fetchLocations() {
            const res = await fetch("/api/tasks/locations");
            const data = await res.json();
            setLocations(data);
        }

        fetchLocations();
    }, []);

    function updateFilter(key: string, value: string) {
        const params = new URLSearchParams(searchParams.toString());

        if (value === "all" || value === "0") {
            params.delete(key);
        } else {
            params.set(key, value);
        }

        router.push(`/tasks?${params.toString()}`);
        router.refresh();
    }

    function resetFilters() {
        router.push("/tasks");
    }

    return (
        <div className="w-64 space-y-6 border rounded-lg p-5 bg-white shadow-sm sticky top-24 h-fit">

            <h2 className="text-lg font-semibold">Filters</h2>

            {/* CATEGORY */}
            <div className="space-y-2">
                <p className="text-sm font-medium">Category</p>

                <Select value={category} onValueChange={(v) => updateFilter("category", v)}>
                    <SelectTrigger>
                        <SelectValue placeholder="All Categories" />
                    </SelectTrigger>

                    <SelectContent>
                        <SelectItem value="all">All Categories</SelectItem>
                        <SelectItem value="Moving">Moving</SelectItem>
                        <SelectItem value="Delivery">Delivery</SelectItem>
                        <SelectItem value="Repair">Repair</SelectItem>
                        <SelectItem value="Tutoring">Tutoring</SelectItem>
                        <SelectItem value="Photography">Photography</SelectItem>
                        <SelectItem value="Cleaning">Cleaning</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            {/* LOCATION */}
            <div className="space-y-2">
                <p className="text-sm font-medium">Location</p>

                <Select value={location} onValueChange={(v) => updateFilter("location", v)}>
                    <SelectTrigger>
                        <SelectValue placeholder="All Locations" />
                    </SelectTrigger>

                    <SelectContent>
                        <SelectItem value="all">All Locations</SelectItem>

                        {locations.map((loc) => {
                            const clean = loc.split(",")[0];
                            return (
                                <SelectItem key={loc} value={clean}>
                                    {clean}
                                </SelectItem>
                            );
                        })}
                    </SelectContent>
                </Select>
            </div>

            {/* BUDGET */}
            <div className="space-y-2">
                <p className="text-sm font-medium">Minimum Budget</p>

                <Select value={budget} onValueChange={(v) => updateFilter("budget", v)}>
                    <SelectTrigger>
                        <SelectValue placeholder="Any Budget" />
                    </SelectTrigger>

                    <SelectContent>
                        <SelectItem value="0">Any Budget</SelectItem>
                        <SelectItem value="500">₹500+</SelectItem>
                        <SelectItem value="1000">₹1000+</SelectItem>
                        <SelectItem value="2000">₹2000+</SelectItem>
                        <SelectItem value="5000">₹5000+</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            <Button variant="outline" className="w-full" onClick={resetFilters}>
                Reset Filters
            </Button>

        </div>
    );
}