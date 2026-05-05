import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/auth";
import CreateTaskForm from "@/components/dashboard/tasks/CreateTaskForm";

export const metadata = {
    title: "Post a Task — LocalGig",
    description: "Describe your task, set a budget, and get matched with nearby workers.",
};

export default async function NewTaskPage() {
    const session = await getSession();
    if (!session?.user) redirect("/sign-in");

    return (
        // Scrollable content area — assumes dashboard layout handles the sidebar
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
            <CreateTaskForm />
        </div>
    );
}