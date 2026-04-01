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

