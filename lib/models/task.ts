import mongoose, { Schema, Document } from "mongoose";

export interface ITask extends Document {
    title: string;
    description: string;
    budget: number;
    category?: string;
    location: {
        type: "Point";
        coordinates: [number, number];
    };
    address: string;
    deadline?: Date;
    status: "open" | "in_progress" | "completed" | "cancelled";
    clientId: mongoose.Types.ObjectId;
    assignedWorkerId?: mongoose.Types.ObjectId;
    applicantsCount: number;
    createdAt: Date;
    updatedAt: Date;
}

const TaskSchema = new Schema<ITask>(
    {
        title: { type: String, required: true },
        description: { type: String, required: true },
        budget: { type: Number, required: true },
        category: { type: String },

        address: { type: String, required: true },

        location: {
            type: {
                type: String,
                enum: ["Point"],
                required: true,
            },
            coordinates: {
                type: [Number],
                required: true,
            },
        },

        deadline: { type: Date },

        status: {
            type: String,
            enum: ["open", "in_progress", "completed", "cancelled"],
            default: "open",
            index: true,
        },

        clientId: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
            index: true,
        },

        assignedWorkerId: {
            type: Schema.Types.ObjectId,
            ref: "User",
        },

        applicantsCount: {
            type: Number,
            default: 0,
        },
    },
    { timestamps: true }
);

TaskSchema.index({ location: "2dsphere" });

export default mongoose.models.Task ||
    mongoose.model<ITask>("Task", TaskSchema);