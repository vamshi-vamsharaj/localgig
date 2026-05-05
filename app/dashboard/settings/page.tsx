
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/auth";
import { getUserProfile, getUserSettings } from "@/lib/actions/userSettings";
import SettingsClient from "@/components/dashboard/settings/SettingsClient";

export default async function SettingsPage() {
    const session = await getSession();
    if (!session?.user) redirect("/sign-in");

    const userId = (session.user as { id: string }).id;
    if (!userId) redirect("/sign-in");

    const [profileResult, settingsResult] = await Promise.all([
        getUserProfile(userId),
        getUserSettings(userId),
    ]);

    // Surface real errors for debugging instead of a silent redirect
    if (!profileResult.success || !settingsResult.success) {
        return (
            <div className="flex flex-col items-center justify-center py-20 gap-3">
                <p className="text-sm font-semibold text-zinc-700">
                    Couldn't load your settings
                </p>
                <p className="text-xs text-zinc-400">
                    {!profileResult.success ? profileResult.error : settingsResult.success ? "" : settingsResult.error}
                </p>
                <a
                    href="/dashboard/settings"
                    className="text-xs font-semibold text-blue-600 hover:underline"
                >
                    Try again
                </a>
            </div>
        );
    }

    return (
        <SettingsClient
            userId={userId}
            initialProfile={profileResult.data}
            initialSettings={settingsResult.data}
        />
    );
}