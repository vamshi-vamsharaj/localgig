import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth/auth";
import connectDB from "@/lib/db";
import { Application } from "@/lib/models";
export async function POST(req: NextRequest) {
    try {
        await connectDB();

        const session = await getSession();

        if (!session?.user) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            );
        }

        const body = await req.json();
        const { taskId } = body;

        const application = await Application.create({
            taskId,
            workerId: session.user.id,
        });

        return NextResponse.json(application, { status: 201 });

    } catch (error: any) {
        if (error.code === 11000) {
            return NextResponse.json(
                { error: "You already applied to this job" },
                { status: 400 }
            );
        }

        return NextResponse.json(
            { error: "Failed to apply" },
            { status: 500 }
        );
    }
}