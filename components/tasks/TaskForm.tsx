"use client";

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

                <form>
                    <CardContent className="space-y-8">

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
                                    className="h-11"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label>Description</Label>
                                <Textarea
                                    name="description"
                                    placeholder="Describe the task clearly..."
                                    className="min-h-[120px]"
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
                                        className="h-11"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label>Category</Label>
                                    <Input
                                        name="category"
                                        placeholder="Plumbing, Delivery, Tutoring..."
                                        className="h-11"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label>Estimated Hours</Label>
                                    <Input
                                        name="estimatedHours"
                                        type="number"
                                        placeholder="3"
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
                                    className="h-11"
                                />
                            </div>

                            <div className="grid md:grid-cols-2 gap-6">

                                <div className="space-y-2">
                                    <Label>Latitude</Label>
                                    <Input
                                        name="latitude"
                                        type="number"
                                        step="any"
                                        className="h-11"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label>Longitude</Label>
                                    <Input
                                        name="longitude"
                                        type="number"
                                        step="any"
                                        className="h-11"
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
                                className="h-11"
                            />
                        </div>

                    </CardContent>

                    <CardFooter className="pt-6">
                        <Button
                            type="submit"
                            className="w-full h-11 text-base font-semibold"
                        >
                            Post Task
                        </Button>
                    </CardFooter>
                </form>

            </Card>
        </div>
    );
}