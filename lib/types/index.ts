
export type TaskStatus     = "open" | "in_progress" | "completed" | "cancelled";
export type AppStatus      = "pending" | "accepted" | "rejected";
export type UserRole       = "client" | "worker" | "both";
export type MessageStatus  = "sent" | "delivered" | "read";

// ─── Task ─────────────────────────────────────────────────────────────────────

export interface Task {
    _id: string;
    title: string;
    description: string;
    budget: number;
    category?: string;
    estimatedHours?: number;
    address: string;
    location: { type: "Point"; coordinates: [number, number] };
    deadline?: string;
    status: TaskStatus;
    clientId: string;
    assignedWorkerId?: string;
    applicantsCount: number;
    createdAt: string;
    updatedAt: string;
}

// ─── Application ──────────────────────────────────────────────────────────────

export interface Application {
    _id: string;
    taskId: string;
    workerId: string;
    message?: string;
    proposedBudget?: number;
    status: AppStatus;
    createdAt: string;
    updatedAt: string;
}

export interface PopulatedApplication extends Omit<Application, "taskId" | "workerId"> {
    taskId: Task;
    workerId: PublicUser;
}

// ─── User ─────────────────────────────────────────────────────────────────────

export interface PublicUser {
    _id: string;
    name: string;
    email: string;
    role: UserRole;
    avatar?: string;
    bio?: string;
    phone?: string;
    createdAt: string;
}

export interface UserSettings {
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

// ─── Saved Task ───────────────────────────────────────────────────────────────

export interface SavedTask {
    _id: string;
    userId: string;
    taskId: string | Task;
    createdAt: string;
}

// ─── Message ──────────────────────────────────────────────────────────────────

export interface Message {
    _id: string;
    conversationId: string;
    senderId: string;
    receiverId: string;
    taskId: string;
    content: string;
    status: MessageStatus;
    createdAt: string;
    updatedAt: string;
}

export interface Conversation {
    _id: string;
    taskId: string | Task;
    clientId: string | PublicUser;
    workerId: string | PublicUser;
    lastMessage?: string;
    lastMessageAt?: string;
    unreadCount: number;
    createdAt: string;
    updatedAt: string;
}

// ─── Action Results ───────────────────────────────────────────────────────────

export type ActionResult<T = void> =
    | { success: true; data: T }
    | { success: false; error: string };