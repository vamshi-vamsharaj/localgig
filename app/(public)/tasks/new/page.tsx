import CreateTaskForm from "@/components/dashboard/tasks/CreateTaskForm";

export default function TaskPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 py-12 px-6 flex justify-center">
      <div className="w-full max-w-5xl">
        <CreateTaskForm />
      </div>
    </div>
  );
}
