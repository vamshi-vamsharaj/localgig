import AppSidebar from "@/components/app-sidebar"
import { SidebarProvider } from "@/components/ui/sidebar"

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <SidebarProvider>
            <div className="flex min-h-screen w-full">
                <AppSidebar />

           <main className="flex-1 ml-64 p-6 overflow-y-auto h-screen will-change-scroll">
                    
                    {children}
                </main>
            </div>
        </SidebarProvider>
    )
}