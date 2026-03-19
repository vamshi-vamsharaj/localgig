"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  LayoutDashboard,
  Briefcase,
  FileText,
  MessageCircle,
  Settings,
  Home, Search,
  PlusCircle,
  Send,
  Bookmark,
  ClipboardList,
  Users,
  MessageSquare,
} from "lucide-react"


const menuItems = [
  {
    title: "Overview",
    icon: LayoutDashboard,
    url: "/dashboard",
  },
  {
    title: "Find Tasks",
    icon: Search,
    url: "/dashboard/tasks",
  },
  {
    title: "Saved Tasks",
    icon: Bookmark,
    url: "/dashboard/saved",
  },
  {
    title: "Post Task",
    icon: PlusCircle,
    url: "/dashboard/post-task",
  },
  {
    title: "My Applications",
    icon: Send,
    url: "/dashboard/applied",
  },
  {
    title: "My Tasks",
    icon: ClipboardList,
    url: "/dashboard/posted",
  },
  {
    title: "Applicants",
    icon: Users,
    url: "/dashboard/applications",
  },
  {
    title: "Messages",
    icon: MessageSquare,
    url: "/dashboard/messages",
  },
  {
    title: "Settings",
    icon: Settings,
    url: "/dashboard/settings",
  },
]

export default function AppSidebar() {
  const pathname = usePathname()

  return (
   <aside className="fixed left-0 top-0 h-screen w-64 bg-white border-r flex flex-col justify-between z-50">
      {/* Logo */}
      <div>
        <div className="flex items-center gap-2 p-6 text-xl font-bold">
          <Home className="text-blue-600" />
          LocalGig
        </div>

        {/* Menu */}
        <nav className="px-4 space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon
            const active = pathname === item.url

            return (
              <Link
                key={item.title}
                href={item.url}
                className={`flex items-center gap-3 px-4 py-2 rounded-lg transition
                ${active
                    ? "bg-blue-600 text-white"
                    : "text-gray-600 hover:bg-gray-100"
                  }`}
              >
                <Icon size={18} />
                {item.title}
              </Link>
            )
          })}
        </nav>
      </div>

      {/* Upgrade Card */}
      <div className="p-4">
        <div className="bg-gradient-to-br from-gray-900 to-gray-700 text-white rounded-xl p-5">
          <p className="font-semibold mb-2">Upgrade Pro</p>

          <p className="text-sm opacity-80 mb-4">
            Access exclusive premium features with Pro Membership
          </p>

          <button className="w-full bg-blue-500 hover:bg-blue-600 transition rounded-lg py-2">
            Upgrade ₹500
          </button>
        </div>
      </div>
    </aside>
  )
}