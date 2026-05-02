
import AppSidebar from "@/components/app-sidebar";
import { SidebarProvider } from "@/components/ui/sidebar";

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <SidebarProvider>
            <div className="flex min-h-screen w-full ">
                <AppSidebar />

                <main
                    className="
                        flex-1 overflow-y-auto min-h-screen

                        /* Mobile: no left margin (sidebar hidden), top padding for hamburger */
                        ml-0 pt-14 px-4 pb-6

                        /* Tablet: sidebar is 64px icon-only */
                        md:ml-16 md:pt-6 md:px-5

                        /* Desktop: sidebar is 256px */
                        lg:ml-64 lg:px-6

                        will-change-scroll
                    "
                >
                    {/* Max-width container — keeps content readable on large screens */}
                    <div className="max-w-7xl mx-auto">
                        {children}
                    </div>
                </main>
            </div>
        </SidebarProvider>
    );
}