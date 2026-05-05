// components/dashboard/settings/SettingsClient.tsx
// No logic bugs here. Minor UI improvements:
// - Tighter sidebar (py-3.5 instead of py-4)
// - Account card uses smaller padding
// - Section header uses py-4 instead of py-6 (less wasted space)
// - Content area uses px-6 py-5 instead of px-7 py-6

"use client";

import { useState, useCallback } from "react";
import { User, Bell, Sliders, Lock, ChevronRight } from "lucide-react";
import ProfileForm from "./ProfileForm";
import {
    NotificationSettings,
    PreferencesSettings,
    PrivacySettings,
} from "./SettingsSections";
import { ToastContainer, type ToastMessage } from "./Toast";
import type { PublicUser, UserSettings } from "@/lib/types";

type Tab = "profile" | "notifications" | "preferences" | "privacy";

const TABS: { id: Tab; label: string; icon: React.ElementType; desc: string }[] = [
    { id: "profile",       label: "Profile",       icon: User,    desc: "Personal info & role" },
    { id: "notifications", label: "Notifications", icon: Bell,    desc: "Alerts & updates" },
    { id: "preferences",   label: "Preferences",   icon: Sliders, desc: "Display & language" },
    { id: "privacy",       label: "Privacy",       icon: Lock,    desc: "Visibility controls" },
];

const SECTION_META: Record<Tab, { title: string; subtitle: string }> = {
    profile:       { title: "Profile Information",   subtitle: "Manage your personal details, bio, and account role" },
    notifications: { title: "Notification Settings", subtitle: "Control how and when we notify you" },
    preferences:   { title: "Preferences",           subtitle: "Customize your display language, currency, and theme" },
    privacy:       { title: "Privacy Controls",      subtitle: "Manage what information other users can see" },
};

interface SettingsClientProps {
    userId: string;
    initialProfile: PublicUser;
    initialSettings: UserSettings;
}

export default function SettingsClient({
    userId,
    initialProfile,
    initialSettings,
}: SettingsClientProps) {
    const [activeTab, setActiveTab] = useState<Tab>("profile");
    const [toasts, setToasts] = useState<ToastMessage[]>([]);

    function addToast(type: "success" | "error", message: string) {
        setToasts((prev) => [...prev, { id: Date.now(), type, message }]);
    }

    const dismissToast = useCallback((id: number) => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
    }, []);

    const meta = SECTION_META[activeTab];

    return (
        <>
            <div className="space-y-5">

                {/* Header */}
                <div>
                    <h1 className="text-2xl font-bold text-zinc-900 tracking-tight">Settings</h1>
                    <p className="text-sm text-zinc-400 mt-0.5 font-medium">
                        Manage your account, notifications, and privacy
                    </p>
                </div>

                <div className="flex flex-col lg:flex-row gap-5">

                    {/* ── Sidebar ────────────────────────────────────────── */}
                    <aside className="lg:w-56 shrink-0 space-y-3">
                        <nav className="bg-white rounded-xl border border-zinc-100 shadow-sm overflow-hidden">
                            {TABS.map(({ id, label, icon: Icon, desc }) => {
                                const isActive = activeTab === id;
                                return (
                                    <button
                                        key={id}
                                        onClick={() => setActiveTab(id)}
                                        className={`
                                            w-full flex items-center gap-3 px-4 py-3.5 text-left
                                            border-b border-zinc-50 last:border-0 transition-all duration-150
                                            border-l-2
                                            ${isActive
                                                ? "bg-blue-50 border-l-blue-600 pl-[14px]"
                                                : "border-l-transparent hover:bg-zinc-50"
                                            }
                                        `}
                                    >
                                        <div className={`h-7 w-7 rounded-lg flex items-center justify-center shrink-0 ${
                                            isActive ? "bg-blue-600 text-white" : "bg-zinc-100 text-zinc-500"
                                        }`}>
                                            <Icon className="h-3.5 w-3.5" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className={`text-sm font-bold leading-tight ${isActive ? "text-blue-700" : "text-zinc-800"}`}>
                                                {label}
                                            </p>
                                            <p className="text-[11px] text-zinc-400 font-medium mt-0.5 truncate">{desc}</p>
                                        </div>
                                        <ChevronRight className={`h-3.5 w-3.5 shrink-0 transition-transform ${
                                            isActive ? "text-blue-400 translate-x-0.5" : "text-zinc-200"
                                        }`} />
                                    </button>
                                );
                            })}
                        </nav>

                        {/* Account card */}
                        <div className="bg-white rounded-xl border border-zinc-100 shadow-sm p-3.5 flex items-center gap-3">
                            <div className="h-8 w-8 rounded-full bg-blue-50 flex items-center justify-center text-xs font-bold text-blue-600 shrink-0">
                                {initialProfile.name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)}
                            </div>
                            <div className="min-w-0">
                                <p className="text-sm font-bold text-zinc-900 truncate">{initialProfile.name}</p>
                                <p className="text-xs text-zinc-400 font-medium capitalize">{initialProfile.role}</p>
                            </div>
                        </div>
                    </aside>

                    {/* ── Content panel ──────────────────────────────────── */}
                    <main className="flex-1 min-w-0">
                        <div className="bg-white rounded-xl border border-zinc-100 shadow-sm">
                            {/* Section header */}
                            <div className="px-6 py-4 border-b border-zinc-100">
                                <h2 className="text-base font-bold text-zinc-900">{meta.title}</h2>
                                <p className="text-xs text-zinc-400 font-medium mt-0.5">{meta.subtitle}</p>
                            </div>

                            {/* Section content */}
                            <div className="px-6 py-5">
                                {activeTab === "profile" && (
                                    <ProfileForm
                                        userId={userId}
                                        profile={initialProfile}
                                        onSuccess={(msg) => addToast("success", msg)}
                                        onError={(msg) => addToast("error", msg)}
                                    />
                                )}
                                {activeTab === "notifications" && (
                                    <NotificationSettings
                                        userId={userId}
                                        initial={initialSettings.notifications}
                                        onSuccess={(msg) => addToast("success", msg)}
                                        onError={(msg) => addToast("error", msg)}
                                    />
                                )}
                                {activeTab === "preferences" && (
                                    <PreferencesSettings
                                        userId={userId}
                                        initial={initialSettings.preferences}
                                        onSuccess={(msg) => addToast("success", msg)}
                                        onError={(msg) => addToast("error", msg)}
                                    />
                                )}
                                {activeTab === "privacy" && (
                                    <PrivacySettings
                                        userId={userId}
                                        initial={initialSettings.privacy}
                                        onSuccess={(msg) => addToast("success", msg)}
                                        onError={(msg) => addToast("error", msg)}
                                    />
                                )}
                            </div>
                        </div>
                    </main>

                </div>
            </div>

            <ToastContainer toasts={toasts} onDismiss={dismissToast} />
        </>
    );
}