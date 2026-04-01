"use server";

import connectDB from "@/lib/db";
import { User } from "@/lib/models";
import type { ActionResult, UserSettings, PublicUser } from "@/lib/types";

// ─── Get user profile ─────────────────────────────────────────────────────────

export async function getUserProfile(userId: string): Promise<ActionResult<PublicUser>> {
    try {
        await connectDB();

        const user = await User.findById(userId)
            .select("-settings.privacy") // never leak privacy settings to other users
            .lean();

        if (!user) return { success: false, error: "User not found" };

        return {
            success: true,
            data: {
                _id:       user._id.toString(),
                name:      user.name,
                email:     user.email,
                role:      user.role,
                avatar:    user.avatar,
                bio:       user.bio,
                phone:     user.phone,
                createdAt: user.createdAt.toISOString(),
            },
        };
    } catch {
        return { success: false, error: "Failed to fetch profile" };
    }
}

// ─── Update profile ───────────────────────────────────────────────────────────

export async function updateProfile(
    userId: string,
    updates: {
        name?: string;
        bio?: string;
        phone?: string;
        avatar?: string;
        role?: "client" | "worker" | "both";
    }
): Promise<ActionResult> {
    try {
        await connectDB();

        const allowed: Record<string, unknown> = {};
        if (updates.name   !== undefined) allowed.name   = updates.name.trim();
        if (updates.bio    !== undefined) allowed.bio    = updates.bio.trim().slice(0, 500);
        if (updates.phone  !== undefined) allowed.phone  = updates.phone.trim();
        if (updates.avatar !== undefined) allowed.avatar = updates.avatar;
        if (updates.role   !== undefined) allowed.role   = updates.role;

        await User.findByIdAndUpdate(userId, allowed);
        return { success: true, data: undefined };
    } catch {
        return { success: false, error: "Failed to update profile" };
    }
}

// ─── Get user settings ────────────────────────────────────────────────────────

export async function getUserSettings(userId: string): Promise<ActionResult<UserSettings>> {
    try {
        await connectDB();

        const user = await User.findById(userId).select("settings").lean();
        if (!user) return { success: false, error: "User not found" };

        const s = (user as any).settings;

        // Return with explicit defaults in case legacy user has no settings embedded
        const settings: UserSettings = {
            notifications: {
                email:               s?.notifications?.email               ?? true,
                push:                s?.notifications?.push                ?? true,
                applicationUpdates:  s?.notifications?.applicationUpdates  ?? true,
                newMessages:         s?.notifications?.newMessages          ?? true,
                taskUpdates:         s?.notifications?.taskUpdates          ?? true,
            },
            preferences: {
                darkMode: s?.preferences?.darkMode ?? false,
                language: s?.preferences?.language ?? "en",
                currency: s?.preferences?.currency ?? "INR",
            },
            privacy: {
                showEmail: s?.privacy?.showEmail ?? false,
                showPhone: s?.privacy?.showPhone ?? false,
            },
        };

        return { success: true, data: settings };
    } catch {
        return { success: false, error: "Failed to fetch settings" };
    }
}
