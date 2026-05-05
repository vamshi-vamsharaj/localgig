// lib/models/user.ts
// ROOT CAUSE FIX: avatar, bio, phone, and settings were never defined in the
// schema. Mongoose silently ignores fields that aren't in the schema on write,
// and returns undefined on read. That's why updateProfile never persisted and
// getUserProfile always returned undefined for those fields.

import mongoose, { Schema, Document } from "mongoose";

// ─── Settings sub-schema types ────────────────────────────────────────────────

export interface IUserSettings {
    notifications: {
        email: boolean;
        push: boolean;
        applicationUpdates: boolean;
        newMessages: boolean;
        taskUpdates: boolean;
    };
    preferences: {
        darkMode: boolean;
        language: string;
        currency: string;
    };
    privacy: {
        showEmail: boolean;
        showPhone: boolean;
    };
}

// ─── Document interface ───────────────────────────────────────────────────────

export interface IUser extends Document {
    name: string;
    email: string;
    role: "client" | "worker" | "both";
    // ✅ FIXED: these three were missing — causing silent write drops
    avatar?: string;
    bio?: string;
    phone?: string;
    // ✅ FIXED: settings was missing — causing all settings reads to return {}
    settings: IUserSettings;
    createdAt: Date;
    updatedAt: Date;
}

// ─── Settings embedded schema ─────────────────────────────────────────────────

const UserSettingsSchema = new Schema<IUserSettings>(
    {
        notifications: {
            email:               { type: Boolean, default: true },
            push:                { type: Boolean, default: true },
            applicationUpdates:  { type: Boolean, default: true },
            newMessages:         { type: Boolean, default: true },
            taskUpdates:         { type: Boolean, default: true },
        },
        preferences: {
            darkMode:  { type: Boolean, default: false },
            language:  { type: String,  default: "en" },
            currency:  { type: String,  default: "INR" },
        },
        privacy: {
            showEmail: { type: Boolean, default: false },
            showPhone: { type: Boolean, default: false },
        },
    },
    { _id: false } // embedded — no separate _id needed
);

// ─── User schema ──────────────────────────────────────────────────────────────

const UserSchema = new Schema<IUser>(
    {
        name:   { type: String, required: true },
        email:  { type: String, required: true, unique: true, index: true },
        role:   { type: String, enum: ["client", "worker", "both"], default: "both" },
        // ✅ Added missing profile fields
        avatar: { type: String },
        bio:    { type: String, maxlength: 500 },
        phone:  { type: String },
        // ✅ Added missing settings block with full defaults
        settings: {
            type:    UserSettingsSchema,
            default: () => ({}),
        },
    },
    { timestamps: true }
);

export default mongoose.models.User || mongoose.model<IUser>("User", UserSchema);