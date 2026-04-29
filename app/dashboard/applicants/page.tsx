import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/auth";
import { getClientApplications } from "@/lib/actions/clientApplications";
import ApplicationsClient from "@/components/dashboard/ApplicationsClient";

export default async function ApplicationsPage() {
    const session = await getSession();
    if (!session?.user) redirect("/login");

    const clientId = (session.user as { id: string }).id;

    const tasks = await getClientApplications(clientId);

    return (
        <ApplicationsClient
            tasks={tasks}
            clientId={clientId}
        />
    );
}