import connectDB from "@/lib/db";
import { Task } from "@/lib/models";
import { Task as TaskType } from "@/lib/models/models.types";
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

interface GetTasksParams {
  category?: string;
  location?: string;
  budget?: number;
}

export async function getTasks({
  category,
  location,
  budget,
}: GetTasksParams): Promise<TaskType[]> {

  await connectDB();

  const query: any = {
    status: "open",
  };

  if (category && category !== "all") {
    query.category = category;
  }

  if (location && location !== "all") {
    query.address = { $regex: location, $options: "i" };
  }

  if (budget !== undefined && budget > 0) {
    query.budget = { $gte: budget };
  }


  const tasks = await Task.find(query)
    .sort({ createdAt: -1 })
    .lean();

  return JSON.parse(JSON.stringify(tasks));
}