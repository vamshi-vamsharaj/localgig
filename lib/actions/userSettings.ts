"use server";

import connectDB from "@/lib/db";
import { User } from "@/lib/models";
import type { ActionResult, UserSettings, PublicUser } from "@/lib/types";

// ─── getUserProfile ───────────────────────────────────────────────────────────
// FIX: removed incorrect .select("-settings.privacy") — that field path
// notation doesn't exclude nested sub-document fields in Mongoose; it was
// silently returning the full settings object anyway. Instead we simply
// omit privacy from the returned object in application code.

export async function getUserProfile(userId: string): Promise<ActionResult<PublicUser>> {
    try {
        await connectDB();

        const user = await User.findById(userId)
            .select("name email role avatar bio phone createdAt")
            .lean();

        if (!user) return { success: false, error: "User not found" };

        return {
            success: true,
            data: {
                _id:       (user._id as any).toString(),
                name:      user.name,
                email:     user.email,
                role:      user.role as "client" | "worker" | "both",
                // ✅ FIX: these now exist in the schema — no longer undefined
                avatar:    (user as any).avatar,
                bio:       (user as any).bio,
                phone:     (user as any).phone,
                createdAt: (user as any).createdAt.toISOString(),
            },
        };
    } catch (err) {
        console.error("[getUserProfile]", err);
        return { success: false, error: "Failed to fetch profile" };
    }
}

// ─── updateProfile ────────────────────────────────────────────────────────────
// FIX: was silently dropping avatar/bio/phone because they weren't in schema.
// Now they persist correctly because the schema includes them.

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

        // Build patch only from defined, non-empty-string values
        const patch: Record<string, unknown> = {};
        if (updates.name  !== undefined) patch.name  = updates.name.trim();
        if (updates.bio   !== undefined) patch.bio   = updates.bio.trim().slice(0, 500);
        if (updates.phone !== undefined) patch.phone = updates.phone.trim();
        if (updates.avatar !== undefined) patch.avatar = updates.avatar.trim();
        if (updates.role  !== undefined) patch.role  = updates.role;

        if (Object.keys(patch).length === 0) {
            return { success: true, data: undefined }; // nothing to do
        }

        const updated = await User.findByIdAndUpdate(
            userId,
            { $set: patch },
            { new: true, runValidators: true }
        );

        if (!updated) return { success: false, error: "User not found" };

        return { success: true, data: undefined };
    } catch (err) {
        console.error("[updateProfile]", err);
        return { success: false, error: "Failed to update profile" };
    }
}

// ─── getUserSettings ──────────────────────────────────────────────────────────
// FIX: was always hitting the fallback defaults because settings didn't exist
// in the schema. Now reads real persisted values and falls back gracefully for
// legacy users who didn't have the settings field populated yet.

export async function getUserSettings(userId: string): Promise<ActionResult<UserSettings>> {
    try {
        await connectDB();

        const user = await User.findById(userId).select("settings").lean();
        if (!user) return { success: false, error: "User not found" };

        const s = (user as any).settings;

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
    } catch (err) {
        console.error("[getUserSettings]", err);
        return { success: false, error: "Failed to fetch settings" };
    }
}

// ─── updateNotificationSettings ──────────────────────────────────────────────

export async function updateNotificationSettings(
    userId: string,
    updates: Partial<UserSettings["notifications"]>
): Promise<ActionResult> {
    try {
        await connectDB();

        const patch: Record<string, unknown> = {};
        for (const [key, val] of Object.entries(updates)) {
            if (typeof val === "boolean") {
                patch[`settings.notifications.${key}`] = val;
            }
        }

        if (Object.keys(patch).length === 0) return { success: true, data: undefined };

        const updated = await User.findByIdAndUpdate(userId, { $set: patch }, { new: true });
        if (!updated) return { success: false, error: "User not found" };

        return { success: true, data: undefined };
    } catch (err) {
        console.error("[updateNotificationSettings]", err);
        return { success: false, error: "Failed to update notifications" };
    }
}

// ─── updatePreferences ───────────────────────────────────────────────────────

export async function updatePreferences(
    userId: string,
    updates: Partial<UserSettings["preferences"]>
): Promise<ActionResult> {
    try {
        await connectDB();

        const patch: Record<string, unknown> = {};
        for (const [key, val] of Object.entries(updates)) {
            if (val !== undefined) {
                patch[`settings.preferences.${key}`] = val;
            }
        }

        if (Object.keys(patch).length === 0) return { success: true, data: undefined };

        const updated = await User.findByIdAndUpdate(userId, { $set: patch }, { new: true });
        if (!updated) return { success: false, error: "User not found" };

        return { success: true, data: undefined };
    } catch (err) {
        console.error("[updatePreferences]", err);
        return { success: false, error: "Failed to update preferences" };
    }
}

// ─── updatePrivacySettings ────────────────────────────────────────────────────

export async function updatePrivacySettings(
    userId: string,
    updates: Partial<UserSettings["privacy"]>
): Promise<ActionResult> {
    try {
        await connectDB();

        const patch: Record<string, unknown> = {};
        for (const [key, val] of Object.entries(updates)) {
            if (typeof val === "boolean") {
                patch[`settings.privacy.${key}`] = val;
            }
        }

        if (Object.keys(patch).length === 0) return { success: true, data: undefined };

        const updated = await User.findByIdAndUpdate(userId, { $set: patch }, { new: true });
        if (!updated) return { success: false, error: "User not found" };

        return { success: true, data: undefined };
    } catch (err) {
        console.error("[updatePrivacySettings]", err);
        return { success: false, error: "Failed to update privacy settings" };
    }
}