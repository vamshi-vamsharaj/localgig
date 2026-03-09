import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import { Task } from "@/lib/models";
export async function GET() {
    try {
        await connectDB();

        const locations = await Task.distinct("address");

        return NextResponse.json(locations);

    } catch (error) {
        return NextResponse.json(
            { error: "Failed to fetch locations" },
            { status: 500 }
        );
    }
}