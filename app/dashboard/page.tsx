import { getSession } from "@/lib/auth/auth";
import connectDB from "@/lib/db";
import { redirect } from "next/navigation";
import { Suspense } from "react";

async function DashboardPage() {
    const session = await getSession();

    return (
        <div >
            DashBoard
        </div>
    );
}

export default async function Dashboard() {
    return (
        <Suspense fallback={<p>Loading...</p>}>
            <DashboardPage />
        </Suspense>
    );
}