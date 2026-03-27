
import mongoose, { Schema, Document } from "mongoose";


export interface IConversation extends Document {
    taskId: mongoose.Types.ObjectId;
    clientId: mongoose.Types.ObjectId;
    workerId: mongoose.Types.ObjectId;
    lastMessage?: string;
    lastMessageAt?: Date;
    unreadCount: number;
    createdAt: Date;
    updatedAt: Date;
}

const ConversationSchema = new Schema<IConversation>(
    {
        taskId:   { type: Schema.Types.ObjectId, ref: "Task",    required: true, index: true },
        clientId: { type: Schema.Types.ObjectId, ref: "User",    required: true, index: true },
        workerId: { type: Schema.Types.ObjectId, ref: "User",    required: true, index: true },
        lastMessage:   { type: String },
        lastMessageAt: { type: Date },
        unreadCount:   { type: Number, default: 0 },
    },
    { timestamps: true }
);

// One conversation per task+client+worker trio
ConversationSchema.index({ taskId: 1, clientId: 1, workerId: 1 }, { unique: true });

// Fast inbox queries: "all conversations for user X"
ConversationSchema.index({ clientId: 1, updatedAt: -1 });
ConversationSchema.index({ workerId: 1, updatedAt: -1 });

export const Conversation =
    mongoose.models.Conversation ||
    mongoose.model<IConversation>("Conversation", ConversationSchema);

// ─── Message ──────────────────────────────────────────────────────────────────

export interface IMessage extends Document {
    conversationId: mongoose.Types.ObjectId;
    taskId: mongoose.Types.ObjectId;
    senderId: mongoose.Types.ObjectId;
    receiverId: mongoose.Types.ObjectId;
    content: string;
    status: "sent" | "delivered" | "read";
    createdAt: Date;
    updatedAt: Date;
}

const MessageSchema = new Schema<IMessage>(
    {
        conversationId: { type: Schema.Types.ObjectId, ref: "Conversation", required: true, index: true },
        taskId:         { type: Schema.Types.ObjectId, ref: "Task",         required: true, index: true },
        senderId:       { type: Schema.Types.ObjectId, ref: "User",         required: true },
        receiverId:     { type: Schema.Types.ObjectId, ref: "User",         required: true },
        content:        { type: String, required: true, maxlength: 5000 },
        status: {
            type: String,
            enum: ["sent", "delivered", "read"],
            default: "sent",
        },
    },
    { timestamps: true }
);

// Fast thread queries sorted by time
MessageSchema.index({ conversationId: 1, createdAt: 1 });

export const Message =
    mongoose.models.Message ||
    mongoose.model<IMessage>("Message", MessageSchema);