import CreateTaskForm from "@/components/tasks/TaskForm";
export default function SavedPage() {
    return (

        <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 py-12 px-6 flex justify-center">
            <div className="w-full max-w-5xl">
                <CreateTaskForm />
            </div>
        </div>

    )
}