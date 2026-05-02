import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/auth";
import { getConversations } from "@/lib/actions/messages";
import MessagesClient from "@/components/dashboard/messages/messagesClient";

export default async function MessagesPage() {
    const session = await getSession();
    if (!session?.user) redirect("/login");

    const userId = (session.user as { id: string }).id;

    const conversations = await getConversations(userId);

    return (
        <MessagesClient
            initialConversations={conversations}
            userId={userId}
        />
    );
}