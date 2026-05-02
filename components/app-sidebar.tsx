"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
    LayoutDashboard,
    Search,
    PlusCircle,
    Send,
    Bookmark,
    ClipboardList,
    Users,
    MessageSquare,
    Settings,
    Home,
    Menu,
    X,
    Zap,
    ChevronRight,
} from "lucide-react";

// ─── Menu config ──────────────────────────────────────────────────────────────

const NAV_ITEMS = [
    { title: "Overview",        icon: LayoutDashboard, url: "/dashboard" },
    { title: "Find Tasks",      icon: Search,          url: "/dashboard/tasks" },
    { title: "Saved Tasks",     icon: Bookmark,        url: "/dashboard/saved" },
    { title: "Post Task",       icon: PlusCircle,      url: "/dashboard/post-task" },
    { title: "My Applications", icon: Send,             url: "/dashboard/applied" },
    { title: "My Tasks",        icon: ClipboardList,   url: "/dashboard/posted" },
    { title: "Applicants",      icon: Users,           url: "/dashboard/applicants" },
    { title: "Messages",        icon: MessageSquare,   url: "/dashboard/messages" },
    { title: "Settings",        icon: Settings,        url: "/dashboard/settings" },
] as const;

// ─── Sidebar content (shared between mobile drawer and desktop panel) ─────────

function SidebarContent({
    pathname,
    collapsed,      // true when in tablet icon-only mode
    onLinkClick,    // called on mobile after navigation
}: {
    pathname: string;
    collapsed: boolean;
    onLinkClick?: () => void;
}) {
    return (
        <div className="flex flex-col h-full">

            {/* ── Logo ─────────────────────────────────────────────────────── */}
            <div className={`flex items-center gap-2.5 border-b border-zinc-100 transition-all duration-300 ${
                collapsed ? "px-0 py-5 justify-center" : "px-5 py-5"
            }`}>
                <Link
                    href="/"
                    onClick={onLinkClick}
                    className="flex items-center gap-2.5 min-w-0"
                >
                    <div className="h-8 w-8 rounded-lg bg-blue-600 flex items-center justify-center shrink-0">
                        <Home className="h-4 w-4 text-white" />
                    </div>
                    {!collapsed && (
                        <span className="text-base font-bold text-zinc-900 tracking-tight truncate">
                            LocalGig
                        </span>
                    )}
                </Link>
            </div>

            {/* ── Nav ──────────────────────────────────────────────────────── */}
            <nav className={`flex-1 overflow-y-auto py-3 space-y-0.5 ${
                collapsed ? "px-2" : "px-3"
            }`}>
                {NAV_ITEMS.map((item) => {
                    const Icon = item.icon;
                    // Active if exact match OR starts-with (for nested routes), but
                    // Overview is exact-only to avoid matching all /dashboard/* routes
                    const active =
                        item.url === "/dashboard"
                            ? pathname === "/dashboard"
                            : pathname === item.url || pathname.startsWith(item.url + "/");

                    return (
                        <div key={item.title} className="relative group/nav">
                            <Link
                                href={item.url}
                                onClick={onLinkClick}
                                className={`
                                    flex items-center gap-3 rounded-xl text-sm font-medium
                                    transition-all duration-150 outline-none
                                    focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-1
                                    ${collapsed ? "px-0 py-2.5 justify-center w-full" : "px-3 py-2.5"}
                                    ${active
                                        ? "bg-blue-600 text-white shadow-sm shadow-blue-200"
                                        : "text-zinc-500 hover:bg-zinc-100 hover:text-zinc-900"
                                    }
                                `}
                            >
                                <Icon
                                    size={18}
                                    className={`shrink-0 transition-colors ${
                                        active ? "text-white" : "text-zinc-400 group-hover/nav:text-zinc-700"
                                    }`}
                                />
                                {!collapsed && (
                                    <span className="truncate">{item.title}</span>
                                )}
                                {/* Active indicator arrow — only in full mode */}
                                {!collapsed && active && (
                                    <ChevronRight className="ml-auto h-3.5 w-3.5 text-white/60 shrink-0" />
                                )}
                            </Link>

                            {/* Tooltip — tablet icon-only mode only */}
                            {collapsed && (
                                <div className="
                                    pointer-events-none absolute left-full top-1/2 -translate-y-1/2 ml-3
                                    px-2.5 py-1.5 bg-zinc-900 text-white text-xs font-semibold rounded-lg
                                    opacity-0 group-hover/nav:opacity-100
                                    transition-opacity duration-150 whitespace-nowrap z-[999]
                                    shadow-lg
                                ">
                                    {item.title}
                                    {/* Arrow */}
                                    <div className="absolute right-full top-1/2 -translate-y-1/2 w-0 h-0
                                        border-t-4 border-b-4 border-r-4
                                        border-t-transparent border-b-transparent border-r-zinc-900"
                                    />
                                </div>
                            )}
                        </div>
                    );
                })}
            </nav>

            {/* ── Upgrade card ──────────────────────────────────────────────── */}
            <div className={`shrink-0 border-t border-zinc-100 ${collapsed ? "p-2" : "p-3"}`}>
                {collapsed ? (
                    /* Icon-only upgrade button for tablet */
                    <div className="flex justify-center">
                        <button
                            title="Upgrade to Pro"
                            className="h-9 w-9 flex items-center justify-center rounded-xl bg-blue-600 hover:bg-blue-500 text-white transition-colors shadow-sm shadow-blue-200"
                        >
                            <Zap className="h-4 w-4" />
                        </button>
                    </div>
                ) : (
                    /* Full upgrade card */
                    <div className="rounded-xl bg-gradient-to-br from-zinc-900 to-zinc-700 p-4 text-white">
                        <div className="flex items-center gap-2 mb-1">
                            <Zap className="h-4 w-4 text-blue-400 shrink-0" />
                            <p className="text-sm font-bold">Upgrade Pro</p>
                        </div>
                        <p className="text-xs text-zinc-400 leading-relaxed mb-3">
                            Access exclusive features with Pro Membership
                        </p>
                        <button className="w-full bg-blue-500 hover:bg-blue-400 text-white text-sm font-semibold rounded-lg py-2 transition-colors">
                            Upgrade ₹500
                        </button>
                    </div>
                )}
            </div>

        </div>
    );
}

// ─── Main export ──────────────────────────────────────────────────────────────

export default function AppSidebar() {
    const pathname = usePathname();
    const [mobileOpen, setMobileOpen] = useState(false);

    // ── Close on route change (mobile) ────────────────────────────────────────
    useEffect(() => {
        setMobileOpen(false);
    }, [pathname]);

    // ── ESC closes mobile sidebar ─────────────────────────────────────────────
    const handleKeyDown = useCallback((e: KeyboardEvent) => {
        if (e.key === "Escape") setMobileOpen(false);
    }, []);

    useEffect(() => {
        document.addEventListener("keydown", handleKeyDown);
        return () => document.removeEventListener("keydown", handleKeyDown);
    }, [handleKeyDown]);

    // ── Lock body scroll while mobile drawer is open ──────────────────────────
    useEffect(() => {
        if (mobileOpen) {
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "";
        }
        return () => { document.body.style.overflow = ""; };
    }, [mobileOpen]);

    return (
        <>
            {/* ═══════════════════════════════════════════════════════════════
                MOBILE HAMBURGER — fixed top-left, only on <md screens
            ═══════════════════════════════════════════════════════════════ */}
            <button
                onClick={() => setMobileOpen(true)}
                aria-label="Open navigation"
                className="
                    md:hidden
                    fixed top-3.5 left-4 z-[60]
                    h-9 w-9 flex items-center justify-center
                    rounded-xl border border-zinc-200 bg-white
                    text-zinc-600 hover:text-zinc-900
                    shadow-sm hover:shadow transition-all duration-150
                "
            >
                <Menu className="h-4.5 w-4.5" />
            </button>

            {/* ═══════════════════════════════════════════════════════════════
                MOBILE OVERLAY — dark backdrop, closes sidebar on click
            ═══════════════════════════════════════════════════════════════ */}
            <div
                aria-hidden
                onClick={() => setMobileOpen(false)}
                className={`
                    md:hidden fixed inset-0 z-[58] bg-black/40 backdrop-blur-[2px]
                    transition-opacity duration-300
                    ${mobileOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"}
                `}
            />

            {/* ═══════════════════════════════════════════════════════════════
                MOBILE SIDEBAR DRAWER — slides in from left
            ═══════════════════════════════════════════════════════════════ */}
            <div
                role="dialog"
                aria-modal="true"
                aria-label="Navigation"
                className={`
                    md:hidden
                    fixed left-0 top-0 h-full w-72 z-[59]
                    bg-white border-r border-zinc-100
                    shadow-2xl shadow-black/10
                    transition-transform duration-300 ease-out
                    ${mobileOpen ? "translate-x-0" : "-translate-x-full"}
                `}
            >
                {/* Close button inside drawer */}
                <button
                    onClick={() => setMobileOpen(false)}
                    aria-label="Close navigation"
                    className="
                        absolute top-4 right-4 z-10
                        h-8 w-8 flex items-center justify-center
                        rounded-lg text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100
                        transition-colors
                    "
                >
                    <X className="h-4 w-4" />
                </button>

                <SidebarContent
                    pathname={pathname}
                    collapsed={false}
                    onLinkClick={() => setMobileOpen(false)}
                />
            </div>

            {/* ═══════════════════════════════════════════════════════════════
                DESKTOP / TABLET SIDEBAR — always visible, CSS-driven width
            ═══════════════════════════════════════════════════════════════ */}
            <aside
                className="
                    hidden md:flex flex-col
                    fixed left-0 top-0 h-screen z-50
                    bg-white border-r border-zinc-100

                    /* Tablet: icon-only (w-16) */
                    md:w-16

                    /* Desktop: full (w-64) */
                    lg:w-64

                    transition-[width] duration-300 ease-in-out
                    overflow-hidden
                "
            >
                {/* Tablet view (icon-only) */}
                <div className="lg:hidden w-full h-full">
                    <SidebarContent pathname={pathname} collapsed={true} />
                </div>
                {/* Desktop view (full labels) */}
                <div className="hidden lg:block w-full h-full">
                    <SidebarContent pathname={pathname} collapsed={false} />
                </div>
            </aside>
        </>
    );
}