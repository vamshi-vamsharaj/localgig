import mongoose, { Schema, Document } from "mongoose";

export interface IApplication extends Document {
    taskId: mongoose.Types.ObjectId;
    workerId: string;
    message?: string;
    proposedBudget?: number;
    status: "pending" | "accepted" | "rejected";
    createdAt: Date;
    updatedAt: Date;
}

const ApplicationSchema = new Schema<IApplication>(
    {
        taskId: {
            type: Schema.Types.ObjectId,
            ref: "Task",
            required: true,
            index: true,
        },
        workerId: {
            type: String,
            required: true,
            index: true,
        },
        message: {
            type: String,
        },
        proposedBudget: {
            type: Number,
        },
        status: {
            type: String,
            enum: ["pending", "accepted", "rejected"],
            default: "pending",
            index: true,
        },
    },
    {
        timestamps: true,
    }
);

ApplicationSchema.index(
    { taskId: 1, workerId: 1 },
    { unique: true }
);

export default mongoose.models.Application ||
    mongoose.model<IApplication>("Application", ApplicationSchema);