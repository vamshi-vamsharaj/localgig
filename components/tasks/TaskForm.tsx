"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
    Card,
    CardHeader,
    CardTitle,
    CardDescription,
    CardContent,
    CardFooter,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

export default function TaskForm() {
    const router = useRouter();

    const [formData, setFormData] = useState({
        title: "",
        description: "",
        budget: "",
        category: "",
        estimatedHours: "",
        address: "",
        latitude: "",
        longitude: "",
        deadline: "",
    });

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    function handleChange(
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
    ) {
        const { name, value } = e.target;

        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const res = await fetch("/api/tasks", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    title: formData.title,
                    description: formData.description,
                    budget: Number(formData.budget),
                    category: formData.category,
                    estimatedHours: Number(formData.estimatedHours) || undefined,
                    address: formData.address,
                    deadline: formData.deadline
                        ? new Date(formData.deadline)
                        : undefined,
                    location: {
                        type: "Point",
                        coordinates: [
                            Number(formData.longitude),
                            Number(formData.latitude),
                        ],
                    },
                }),
            });

            const data = await res.json();

            if (res.ok) {
                router.push("/dashboard");
            } else {
                setError(data.error || "Failed to create task");
            }
        } catch (err) {
            setError("Something went wrong");
        }

        setLoading(false);
    }

    return (
        <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 py-10 px-4 flex justify-center">
            <Card className="w-full max-w-3xl shadow-2xl border-0 rounded-2xl">
                <CardHeader className="space-y-2 border-b pb-6">
                    <CardTitle className="text-3xl font-bold">
                        Post a New Task
                    </CardTitle>
                    <CardDescription className="text-gray-600 text-base">
                        Tell workers what help you need. Provide clear details so the right
                        people can apply.
                    </CardDescription>
                </CardHeader>

                <form onSubmit={handleSubmit}>
                    <CardContent className="space-y-8">

                        {error && (
                            <p className="text-sm text-red-500">{error}</p>
                        )}

                        {/* TASK INFO */}
                        <div className="space-y-5">
                            <h3 className="text-lg font-semibold text-gray-800">
                                Task Information
                            </h3>

                            <div className="space-y-2">
                                <Label>Title</Label>
                                <Input
                                    name="title"
                                    placeholder="Fix kitchen sink"
                                    value={formData.title}
                                    onChange={handleChange}
                                    className="h-11"
                                    required
                                />
                            </div>

                            <div className="space-y-2">
                                <Label>Description</Label>
                                <Textarea
                                    name="description"
                                    placeholder="Describe the task clearly..."
                                    className="min-h-[120px]"
                                    value={formData.description}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                        </div>

                        {/* BUDGET + CATEGORY */}
                        <div className="space-y-5">
                            <h3 className="text-lg font-semibold text-gray-800">
                                Budget & Category
                            </h3>

                            <div className="grid md:grid-cols-3 gap-6">
                                <div className="space-y-2">
                                    <Label>Budget (₹)</Label>
                                    <Input
                                        name="budget"
                                        type="number"
                                        placeholder="2000"
                                        value={formData.budget}
                                        onChange={handleChange}
                                        className="h-11"
                                        required
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label>Category</Label>
                                    <Input
                                        name="category"
                                        placeholder="Plumbing, Delivery, Tutoring..."
                                        value={formData.category}
                                        onChange={handleChange}
                                        className="h-11"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label>Estimated Hours</Label>
                                    <Input
                                        name="estimatedHours"
                                        type="number"
                                        placeholder="3"
                                        value={formData.estimatedHours}
                                        onChange={handleChange}
                                        className="h-11"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* LOCATION */}
                        <div className="space-y-5">
                            <h3 className="text-lg font-semibold text-gray-800">
                                Location
                            </h3>

                            <div className="space-y-2">
                                <Label>Address</Label>
                                <Input
                                    name="address"
                                    placeholder="Full task address"
                                    value={formData.address}
                                    onChange={handleChange}
                                    className="h-11"
                                    required
                                />
                            </div>

                            <div className="grid md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <Label>Latitude</Label>
                                    <Input
                                        name="latitude"
                                        type="number"
                                        step="any"
                                        value={formData.latitude}
                                        onChange={handleChange}
                                        className="h-11"
                                        required
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label>Longitude</Label>
                                    <Input
                                        name="longitude"
                                        type="number"
                                        step="any"
                                        value={formData.longitude}
                                        onChange={handleChange}
                                        className="h-11"
                                        required
                                    />
                                </div>
                            </div>
                        </div>

                        {/* DEADLINE */}
                        <div className="space-y-2">
                            <Label>Deadline (Optional)</Label>
                            <Input
                                name="deadline"
                                type="date"
                                value={formData.deadline}
                                onChange={handleChange}
                                className="h-11"
                            />
                        </div>

                    </CardContent>

                    <CardFooter className="pt-6">
                        <Button
                            type="submit"
                            className="w-full h-11 text-base font-semibold"
                            disabled={loading}
                        >
                            {loading ? "Posting Task..." : "Post Task"}
                        </Button>
                    </CardFooter>
                </form>
            </Card>
        </div>
    );
}

