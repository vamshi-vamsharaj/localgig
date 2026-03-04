import mongoose, { Schema, Document } from "mongoose";

export interface IUser extends Document {
    name: string;
    email: string;
    role: "client" | "worker" | "both";
    createdAt: Date;
    updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
    {
        name: {
            type: String,
            required: true,
        },
        email: {
            type: String,
            required: true,
            unique: true,
            index: true,
        },
        role: {
            type: String,
            enum: ["client", "worker", "both"],
            default: "both",
        },
    },
    {
        timestamps: true,
    }
);

export default mongoose.models.User ||
    mongoose.model<IUser>("User", UserSchema);