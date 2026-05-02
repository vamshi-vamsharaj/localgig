import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/auth";
import { getDashboardData } from "@/lib/actions/dashboard";
import DashboardClient from "@/components/dashboard/DashboardClient";

export default async function DashboardPage() {
    const session = await getSession();
    if (!session?.user) redirect("/sign-in");

    const userId = (session.user as { id: string; name?: string }).id;
    const userName = (session.user as { id: string; name?: string }).name ?? "there";

    const data = await getDashboardData(userId);

    return <DashboardClient data={data} userName={userName} />;
}

