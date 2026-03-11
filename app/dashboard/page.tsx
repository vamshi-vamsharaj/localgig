import { SidebarProvider, Sidebar } from "@/components/ui/sidebar";import { getSession } from "@/lib/auth/auth";
import connectDB from "@/lib/db";
import { redirect } from "next/navigation";
import { Suspense } from "react";

export  function DashboardPage() {
  return (
    <div>
      <h1 className="text-3xl font-bold mb-2">Dashboard</h1>
      <p className="text-gray-500">Tuesday, April 23rd, 2024</p>
    </div>
  )
}

export default async function Dashboard() {
    return (
      <div className="flex">

        <main className="flex-1 p-6">
          <h1>Dashboard</h1>
        </main>
      </div>
    );
}