export interface Task {
    _id: string
    title: string
    description: string
    budget: number
    category?: string
    address: string

    location: {
        type: "Point"
        coordinates: [number, number]
    }

    deadline?: Date

    status: "open" | "in_progress" | "completed" | "cancelled"

    clientId: string
    assignedWorkerId?: string

    applicantsCount: number

    createdAt: Date
    updatedAt: Date
}

export interface Application {
    _id: string

    taskId: string
    workerId: string

    message?: string
    proposedBudget?: number

    status: "pending" | "accepted" | "rejected"

    createdAt: Date
    updatedAt: Date
}

export interface User {
    _id: string

    name: string
    email: string

    role: "client" | "worker" | "both"

    createdAt: Date
    updatedAt: Date
}