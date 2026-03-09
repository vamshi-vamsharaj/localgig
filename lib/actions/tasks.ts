import connectDB from "@/lib/db";
import { Task } from "@/lib/models";

interface CreateTaskInput {
  title: string;
  description: string;
  budget: number;
  category?: string;
  estimatedHours?: number;
  location: { type: "Point"; coordinates: [number, number] };
  address: string;
  deadline?: Date | string;
  clientId: string;
}

export async function createTask(data: CreateTaskInput) {
  await connectDB();

  const task = await Task.create({
    ...data,
    status: "open",
    applicantsCount: 0,
  });

  return task;
}

export async function getTasks(filters: {
  category?: string;
  budget?: number;
}) {
  await connectDB();

  const query: Record<string, any> = {
    status: "open",
  };

  if (filters.category) {
    query.category = filters.category;
  }

  if (filters.budget) {
    query.budget = { $gte: filters.budget };
  }
const tasks = await Task.find(query).sort({ createdAt: -1 }).lean();

return tasks.map((task) => ({
  ...task,
  _id: task._id.toString(),
  clientId: task.clientId?.toString(),
}));
}