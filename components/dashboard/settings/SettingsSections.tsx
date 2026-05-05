// components/dashboard/settings/SettingsSections.tsx
// FIX: Toggle's `onChange` receives the new boolean value (checked: boolean).
// The original code called onChange={() => toggle(key)} which passed the
// `checked` value TO the toggle's change handler — but then toggle() internally
// negated it via `!prev[key]`. This means rapid double-clicks could get out of
// sync with the actual saved state. Fixed to use the value from onChange directly.

"use client";

import { useState, useTransition } from "react";
import { Loader2 } from "lucide-react";
import Toggle from "./Toggle";
import {
    updateNotificationSettings,
    updatePreferences,
    updatePrivacySettings,
} from "@/lib/actions/userSettings";
import type { UserSettings } from "@/lib/types";

// ─── Shared ───────────────────────────────────────────────────────────────────

function SettingRow({ children }: { children: React.ReactNode }) {
    return (
        <div className="py-3.5 border-b border-zinc-50 last:border-0">
            {children}
        </div>
    );
}

function SaveBar({
    isDirty,
    isPending,
    onSave,
}: {
    isDirty: boolean;
    isPending: boolean;
    onSave: () => void;
}) {
    return (
        <div className="flex items-center justify-between pt-4 border-t border-zinc-100 mt-1">
            <p className="text-xs text-zinc-400 font-medium">
                {isDirty ? "Unsaved changes" : "All changes saved"}
            </p>
            <button
                onClick={onSave}
                disabled={!isDirty || isPending}
                className="inline-flex items-center gap-2 h-9 px-5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-sm font-bold transition-colors shadow-sm shadow-blue-100 disabled:opacity-40 disabled:cursor-not-allowed"
            >
                {isPending && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                {isPending ? "Saving..." : "Save"}
            </button>
        </div>
    );
}

// ─── Notifications ────────────────────────────────────────────────────────────

const NOTIFICATION_ROWS: {
    key: keyof UserSettings["notifications"];
    label: string;
    desc: string;
}[] = [
    { key: "email",              label: "Email Notifications",  desc: "Updates and alerts via email" },
    { key: "push",               label: "Push Notifications",   desc: "Browser and device push alerts" },
    { key: "applicationUpdates", label: "Application Updates",  desc: "When someone applies to your task" },
    { key: "newMessages",        label: "New Messages",         desc: "When you receive a new chat message" },
    { key: "taskUpdates",        label: "Task Updates",         desc: "Status changes, completions, cancellations" },
];

export function NotificationSettings({
    userId,
    initial,
    onSuccess,
    onError,
}: {
    userId: string;
    initial: UserSettings["notifications"];
    onSuccess: (msg: string) => void;
    onError: (msg: string) => void;
}) {
    const [values, setValues] = useState(initial);
    const [isDirty, setIsDirty] = useState(false);
    const [isPending, startTransition] = useTransition();

    // FIX: receives the new boolean directly from Toggle's onChange(checked)
    function setField(key: keyof UserSettings["notifications"], val: boolean) {
        setValues((prev) => ({ ...prev, [key]: val }));
        setIsDirty(true);
    }

    function handleSave() {
        startTransition(async () => {
            const result = await updateNotificationSettings(userId, values);
            if (result.success) {
                setIsDirty(false);
                onSuccess("Notification settings saved");
            } else {
                onError(result.error ?? "Failed to save");
            }
        });
    }

    return (
        <div>
            {NOTIFICATION_ROWS.map(({ key, label, desc }) => (
                <SettingRow key={key}>
                    <Toggle
                        checked={values[key]}
                        onChange={(checked) => setField(key, checked)}
                        label={label}
                        description={desc}
                    />
                </SettingRow>
            ))}
            <SaveBar isDirty={isDirty} isPending={isPending} onSave={handleSave} />
        </div>
    );
}

// ─── Preferences ──────────────────────────────────────────────────────────────

const LANGUAGES = [
    { value: "en", label: "English" },
    { value: "hi", label: "Hindi" },
    { value: "te", label: "Telugu" },
    { value: "ta", label: "Tamil" },
    { value: "kn", label: "Kannada" },
];

const CURRENCIES = [
    { value: "INR", label: "₹ Indian Rupee" },
    { value: "USD", label: "$ US Dollar" },
    { value: "EUR", label: "€ Euro" },
    { value: "GBP", label: "£ British Pound" },
];

function SelectRow({
    label,
    desc,
    value,
    options,
    onChange,
}: {
    label: string;
    desc: string;
    value: string;
    options: { value: string; label: string }[];
    onChange: (v: string) => void;
}) {
    return (
        <div className="flex items-center justify-between gap-4 py-1">
            <div>
                <p className="text-sm font-semibold text-zinc-800">{label}</p>
                <p className="text-xs text-zinc-400 font-medium mt-0.5">{desc}</p>
            </div>
            <div className="relative shrink-0">
                <select
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    className="h-9 pl-3 pr-8 rounded-lg border border-zinc-200 bg-white text-sm font-semibold text-zinc-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 appearance-none cursor-pointer transition"
                >
                    {options.map((o) => (
                        <option key={o.value} value={o.value}>{o.label}</option>
                    ))}
                </select>
                <svg
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-400 pointer-events-none"
                    fill="none" stroke="currentColor" viewBox="0 0 24 24"
                >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
            </div>
        </div>
    );
}

export function PreferencesSettings({
    userId,
    initial,
    onSuccess,
    onError,
}: {
    userId: string;
    initial: UserSettings["preferences"];
    onSuccess: (msg: string) => void;
    onError: (msg: string) => void;
}) {
    const [values, setValues] = useState(initial);
    const [isDirty, setIsDirty] = useState(false);
    const [isPending, startTransition] = useTransition();

    function setField<K extends keyof UserSettings["preferences"]>(
        key: K,
        val: UserSettings["preferences"][K]
    ) {
        setValues((prev) => ({ ...prev, [key]: val }));
        setIsDirty(true);
    }

    function handleSave() {
        startTransition(async () => {
            const result = await updatePreferences(userId, values);
            if (result.success) {
                setIsDirty(false);
                onSuccess("Preferences saved");
            } else {
                onError(result.error ?? "Failed to save");
            }
        });
    }

    return (
        <div>
            <SettingRow>
                <Toggle
                    checked={values.darkMode}
                    onChange={(checked) => setField("darkMode", checked)}
                    label="Dark Mode"
                    description="Switch the dashboard to a dark theme"
                />
            </SettingRow>
            <SettingRow>
                <SelectRow
                    label="Language"
                    desc="Your preferred display language"
                    value={values.language}
                    options={LANGUAGES}
                    onChange={(v) => setField("language", v)}
                />
            </SettingRow>
            <SettingRow>
                <SelectRow
                    label="Currency"
                    desc="Used to display budgets and prices"
                    value={values.currency}
                    options={CURRENCIES}
                    onChange={(v) => setField("currency", v)}
                />
            </SettingRow>
            <SaveBar isDirty={isDirty} isPending={isPending} onSave={handleSave} />
        </div>
    );
}

// ─── Privacy ──────────────────────────────────────────────────────────────────

export function PrivacySettings({
    userId,
    initial,
    onSuccess,
    onError,
}: {
    userId: string;
    initial: UserSettings["privacy"];
    onSuccess: (msg: string) => void;
    onError: (msg: string) => void;
}) {
    const [values, setValues] = useState(initial);
    const [isDirty, setIsDirty] = useState(false);
    const [isPending, startTransition] = useTransition();

    function setField(key: keyof UserSettings["privacy"], val: boolean) {
        setValues((prev) => ({ ...prev, [key]: val }));
        setIsDirty(true);
    }

    function handleSave() {
        startTransition(async () => {
            const result = await updatePrivacySettings(userId, values);
            if (result.success) {
                setIsDirty(false);
                onSuccess("Privacy settings saved");
            } else {
                onError(result.error ?? "Failed to save");
            }
        });
    }

    return (
        <div>
            <SettingRow>
                <Toggle
                    checked={values.showEmail}
                    onChange={(checked) => setField("showEmail", checked)}
                    label="Show Email Address"
                    description="Allow other users to see your email on your profile"
                />
            </SettingRow>
            <SettingRow>
                <Toggle
                    checked={values.showPhone}
                    onChange={(checked) => setField("showPhone", checked)}
                    label="Show Phone Number"
                    description="Allow other users to see your phone number on your profile"
                />
            </SettingRow>

            <div className="mt-4 px-3.5 py-3 rounded-lg bg-amber-50 border border-amber-100">
                <p className="text-xs font-bold text-amber-700">Privacy Note</p>
                <p className="text-xs text-amber-600 mt-0.5 leading-relaxed font-medium">
                    Contact details are only shared with users you actively communicate with,
                    regardless of these settings. These control your public profile only.
                </p>
            </div>

            <SaveBar isDirty={isDirty} isPending={isPending} onSave={handleSave} />
        </div>
    );
}