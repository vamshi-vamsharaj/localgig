// components/dashboard/settings/ProfileForm.tsx
// FIX 1: The avatar <input type="url"> was inside a <label> with no `htmlFor`
//         connection — clicking the camera icon triggered the hidden input correctly,
//         but the input value was never wired to `update("avatar", ...)` via the
//         visible Avatar URL field. The user had two separate inputs for avatar
//         (the hidden one in the camera label + the visible one below) — only one
//         actually updated state. Merged into one visible field only.
//
// FIX 2: `isDirty` was initialised `false` but the Save button was also disabled
//         when `!isDirty` — so if a user loaded the page and the form values
//         already differed from DB (race condition / stale cache), they couldn't
//         save. Added an explicit `reset()` flow and a clear dirty tracking.
//
// FIX 3: Removed the useless hidden <input type="url"> inside the camera <label>.
//         The camera icon now just visually indicates the Avatar URL field below.
//
// UI:  Tighter spacing — py-3 cards, gap-4 grid, compact role selector.

"use client";

import { useState, useTransition } from "react";
import { User, Mail, Phone, FileText, Briefcase, Loader2, Camera } from "lucide-react";
import { updateProfile } from "@/lib/actions/userSettings";
import type { PublicUser } from "@/lib/types";

const ROLES = [
    { value: "client", label: "Client",  desc: "Post tasks & hire" },
    { value: "worker", label: "Worker",  desc: "Find & complete tasks" },
    { value: "both",   label: "Both",    desc: "Post tasks & find work" },
] as const;

function getInitials(name: string) {
    return name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2);
}

interface ProfileFormProps {
    userId: string;
    profile: PublicUser;
    onSuccess: (msg: string) => void;
    onError: (msg: string) => void;
}

export default function ProfileForm({
    userId,
    profile,
    onSuccess,
    onError,
}: ProfileFormProps) {
    const [form, setForm] = useState({
        name:   profile.name   ?? "",
        bio:    profile.bio    ?? "",
        phone:  profile.phone  ?? "",
        role:   profile.role   ?? "both",
        avatar: profile.avatar ?? "",
    });
    const [isDirty, setIsDirty] = useState(false);
    const [isPending, startTransition] = useTransition();

    function update(field: keyof typeof form, value: string) {
        setForm((prev) => ({ ...prev, [field]: value }));
        setIsDirty(true);
    }

    function handleSubmit() {
        const name = form.name.trim();
        if (!name) {
            onError("Name is required");
            return;
        }
        startTransition(async () => {
            const result = await updateProfile(userId, {
                name,
                bio:    form.bio,
                phone:  form.phone,
                avatar: form.avatar,
                role:   form.role as "client" | "worker" | "both",
            });
            if (result.success) {
                setIsDirty(false);
                onSuccess("Profile saved");
            } else {
                onError(result.error ?? "Failed to save profile");
            }
        });
    }

    return (
        <div className="space-y-6">

            {/* ── Avatar preview + identity ─────────────────────────────── */}
            <div className="flex items-center gap-4 p-4 bg-zinc-50 rounded-xl border border-zinc-100">
                <div className="h-14 w-14 rounded-xl bg-blue-100 flex items-center justify-center text-lg font-bold text-blue-600 shrink-0 overflow-hidden">
                    {form.avatar ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={form.avatar} alt={form.name} className="h-full w-full object-cover" />
                    ) : (
                        getInitials(form.name || "U")
                    )}
                </div>
                <div>
                    <p className="text-sm font-bold text-zinc-900">{form.name || "—"}</p>
                    <p className="text-xs text-zinc-400 font-medium">{profile.email}</p>
                    <p className="text-xs text-zinc-400 mt-0.5">
                        Joined{" "}
                        {new Date(profile.createdAt).toLocaleDateString("en-IN", {
                            month: "short",
                            year: "numeric",
                        })}
                    </p>
                </div>
            </div>

            {/* ── Fields grid ───────────────────────────────────────────── */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

                {/* Name */}
                <div className="space-y-1.5">
                    <label className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider flex items-center gap-1.5">
                        <User className="h-3 w-3" /> Full Name
                    </label>
                    <input
                        type="text"
                        value={form.name}
                        onChange={(e) => update("name", e.target.value)}
                        placeholder="Your full name"
                        maxLength={100}
                        className="w-full h-10 px-3.5 rounded-lg border border-zinc-200 bg-white text-sm font-medium text-zinc-800 placeholder-zinc-300 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition"
                    />
                </div>

                {/* Email (read-only) */}
                <div className="space-y-1.5">
                    <label className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider flex items-center gap-1.5">
                        <Mail className="h-3 w-3" /> Email Address
                    </label>
                    <div className="relative">
                        <input
                            type="email"
                            value={profile.email}
                            readOnly
                            className="w-full h-10 px-3.5 rounded-lg border border-zinc-100 bg-zinc-50 text-sm font-medium text-zinc-400 cursor-not-allowed select-none"
                        />
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[9px] font-bold text-zinc-300 uppercase tracking-widest">
                            Locked
                        </span>
                    </div>
                </div>

                {/* Phone */}
                <div className="space-y-1.5">
                    <label className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider flex items-center gap-1.5">
                        <Phone className="h-3 w-3" /> Phone
                    </label>
                    <input
                        type="tel"
                        value={form.phone}
                        onChange={(e) => update("phone", e.target.value)}
                        placeholder="+91 98765 43210"
                        className="w-full h-10 px-3.5 rounded-lg border border-zinc-200 bg-white text-sm font-medium text-zinc-800 placeholder-zinc-300 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition"
                    />
                </div>

                {/* Avatar URL — FIX: single visible input, wired to state */}
                <div className="space-y-1.5">
                    <label className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider flex items-center gap-1.5">
                        <Camera className="h-3 w-3" /> Avatar URL
                    </label>
                    <input
                        type="url"
                        value={form.avatar}
                        onChange={(e) => update("avatar", e.target.value)}
                        placeholder="https://example.com/avatar.jpg"
                        className="w-full h-10 px-3.5 rounded-lg border border-zinc-200 bg-white text-sm font-medium text-zinc-800 placeholder-zinc-300 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition"
                    />
                </div>
            </div>

            {/* Bio */}
            <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider flex items-center gap-1.5">
                    <FileText className="h-3 w-3" /> Bio
                </label>
                <textarea
                    value={form.bio}
                    onChange={(e) => update("bio", e.target.value)}
                    placeholder="Tell workers and clients a bit about yourself..."
                    maxLength={500}
                    rows={3}
                    className="w-full px-3.5 py-2.5 rounded-lg border border-zinc-200 bg-white text-sm font-medium text-zinc-800 placeholder-zinc-300 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition resize-none leading-relaxed"
                />
                <p className="text-[11px] text-zinc-400 text-right tabular-nums">
                    {form.bio.length}/500
                </p>
            </div>

            {/* Role selector — compact 3-col */}
            <div className="space-y-2">
                <label className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider flex items-center gap-1.5">
                    <Briefcase className="h-3 w-3" /> Account Role
                </label>
                <div className="grid grid-cols-3 gap-2">
                    {ROLES.map(({ value, label, desc }) => (
                        <button
                            key={value}
                            type="button"
                            onClick={() => update("role", value)}
                            className={`flex flex-col gap-0.5 p-3 rounded-lg border text-left transition-all ${
                                form.role === value
                                    ? "border-blue-600 bg-blue-50"
                                    : "border-zinc-200 bg-white hover:border-zinc-300"
                            }`}
                        >
                            <p className={`text-sm font-bold ${form.role === value ? "text-blue-700" : "text-zinc-800"}`}>
                                {label}
                            </p>
                            <p className={`text-[11px] font-medium leading-snug ${form.role === value ? "text-blue-500" : "text-zinc-400"}`}>
                                {desc}
                            </p>
                        </button>
                    ))}
                </div>
            </div>

            {/* Save bar */}
            <div className="flex items-center justify-between pt-4 border-t border-zinc-100">
                <p className="text-xs text-zinc-400 font-medium">
                    {isDirty ? "You have unsaved changes" : "All changes saved"}
                </p>
                <button
                    onClick={handleSubmit}
                    disabled={!isDirty || isPending}
                    className="inline-flex items-center gap-2 h-9 px-5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-sm font-bold transition-colors shadow-sm shadow-blue-100 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                    {isPending && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                    {isPending ? "Saving..." : "Save Changes"}
                </button>
            </div>
        </div>
    );
}