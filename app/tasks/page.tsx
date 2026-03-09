import JobsFilters from "@/components/tasks/TasksFilters";
import JobCard from "@/components/tasks/TaskCard";
import { Task } from "@/lib/models/models.types";
import { getTasks } from "@/lib/actions/tasks";

export default async function ExploreJobsPage() {
    const tasks = await getTasks({});

    return (
        <div className="max-w-7xl mx-auto px-6 py-8 flex gap-8">

            <div className="flex-1">

                <h1 className="text-2xl font-bold mb-6">
                    Explore Jobs
                </h1>

                {tasks.length === 0 ? (
                    <p className="text-gray-500">
                        No jobs match your filters.
                    </p>
                ) : (
                    <div className="grid md:grid-cols-2 gap-6">
                        {tasks.map((task) => (
                            <JobCard key={task._id} task={task} />
                        ))}
                    </div>
                )}

            </div>
        </div>
    );
}