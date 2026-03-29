import mongoose, { Schema, Document } from "mongoose";

export interface ISavedTask extends Document {
    userId: mongoose.Types.ObjectId;
    taskId: mongoose.Types.ObjectId;
    createdAt: Date;
    updatedAt: Date;
}

const SavedTaskSchema = new Schema<ISavedTask>(
    {
        userId: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
            index: true,
        },
        taskId: {
            type: Schema.Types.ObjectId,
            ref: "Task",
            required: true,
            index: true,
        },
    },
    { timestamps: true }
);


SavedTaskSchema.index({ userId: 1, taskId: 1 }, { unique: true });

export default mongoose.models.SavedTask ||
    mongoose.model<ISavedTask>("SavedTask", SavedTaskSchema);