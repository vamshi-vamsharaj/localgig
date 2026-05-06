import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth/auth";
import { createTask, getTasks } from "@/lib/actions/tasks";

export async function POST(req: NextRequest) {
    try {
        const session = await getSession();

        if (!session?.user) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            );
        }

        const body = await req.json();

        const {
            title,
            description,
            budget,
            category,
            estimatedHours,
            location,
            address,
            deadline,
        } = body;

       const task = await createTask({
    title,
    description,
    budget,
    category,
    estimatedHours,
    longitude: location.longitude,
    latitude: location.latitude,
    address,
    deadline,
});

        return NextResponse.json(task, { status: 201 });

    } catch (error: any) {
        console.error(error);

        return NextResponse.json(
            { error: error.message },
            { status: 500 }
        );
    }
}
export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const category = searchParams.get("category") || undefined;
        const budget = searchParams.get("budget")
            ? Number(searchParams.get("budget"))
            : undefined;
        const tasks = await getTasks({
            category,
            budget,
        });
        return NextResponse.json(tasks);
    } catch (error) {
        console.error(error);
        return NextResponse.json(
            { error: "Failed to fetch tasks" },
            { status: 500 }
        );
    }
}
