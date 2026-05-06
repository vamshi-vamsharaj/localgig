"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Briefcase, Menu, X, ChevronRight, LayoutDashboard, Search, Pen, LogIn, Home } from "lucide-react";
import { useSession } from "@/lib/auth/auth-client";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
    DropdownMenuItem,
} from "./ui/dropdown-menu";
import { Avatar, AvatarFallback } from "./ui/avatar";
import { Sheet, SheetContent, SheetTrigger } from "./ui/sheet";
import SignOutButton from "./sign-out-btn";

// ─── Nav link config ──────────────────────────────────────────────────────────

const NAV_LINKS = [
    { href: "/tasks",      label: "Explore Tasks",  icon: Search },
    { href: "/tasks/new",  label: "Post a Task",   icon: Pen },
    { href: "/dashboard",  label: "Dashboard",     icon: LayoutDashboard },
] as const;

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getInitials(name: string) {
    return name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2);
}

function isActiveRoute(pathname: string, href: string) {
    if (href === "/tasks") {
        return pathname === "/tasks";
    }

    return pathname === href || pathname.startsWith(href + "/");
}

// ─── Desktop Nav Link ─────────────────────────────────────────────────────────

function NavLink({
    href,
    label,
    active,
    onClick,
}: {
    href: string;
    label: string;
    active: boolean;
    onClick?: () => void;
}) {
    return (
        <Link
            href={href}
            onClick={onClick}
            className={`
                relative text-sm font-medium transition-colors duration-150 px-1 py-0.5
                ${active
                    ? "text-zinc-900"
                    : "text-zinc-500 hover:text-zinc-900"
                }
            `}
        >
            {label}
            {/* Active underline — animates in */}
            {active && (
                <span className="absolute -bottom-px left-0 right-0 h-px bg-blue-600 rounded-full" />
            )}
        </Link>
    );
}

// ─── Mobile Drawer Content ────────────────────────────────────────────────────

function MobileNav({
    pathname,
    session,
    onClose,
}: {
    pathname: string;
    session: ReturnType<typeof useSession>["data"];
    onClose: () => void;
}) {
    return (
        <div className="flex flex-col h-full pt-2 pb-6">
            {/* Nav links */}
            <nav className="flex flex-col gap-1 px-2 mt-4">
                {NAV_LINKS.map(({ href, label, icon: Icon }) => {
                    const active = isActiveRoute(pathname, href);
                    return (
                        <Link
                            key={href}
                            href={href}
                            onClick={onClose}
                            className={`
                                flex items-center justify-between gap-3 px-4 py-3 rounded-xl
                                text-sm font-medium transition-all duration-150
                                ${active
                                    ? "bg-blue-600 text-white"
                                    : "text-zinc-600 hover:bg-blue-100 hover:text-zinc-900"
                                }
                            `}
                        >
                            <span className="flex items-center gap-3">
                                <Icon className={`h-4 w-4 ${active ? "text-white" : "text-zinc-400"}`} />
                                {label}
                            </span>
                            <ChevronRight className={`h-3.5 w-3.5 ${active ? "text-white/60" : "text-zinc-300"}`} />
                        </Link>
                    );
                })}
            </nav>

            {/* Auth section at bottom */}
            <div className="mt-auto px-2 pt-4 border-t border-zinc-100 space-y-2">
                {session?.user ? (
                    <>
                        {/* User info */}
                        <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-blue-50">
                            <div className="h-9 w-9 rounded-full bg-blue-600 flex items-center justify-center text-white text-xs font-bold shrink-0">
                                {getInitials(session.user.name)}
                            </div>
                            <div className="min-w-0">
                                <p className="text-sm font-semibold text-zinc-900 truncate">
                                    {session.user.name}
                                </p>
                                <p className="text-xs text-zinc-400 truncate">{session.user.email}</p>
                            </div>
                        </div>
                        <div className="px-4">
                            <SignOutButton />
                        </div>
                    </>
                ) : (
                    <div className="flex flex-col gap-2 px-2">
                        <Link
                            href="/sign-in"
                            onClick={onClose}
                            className="flex items-center justify-center h-10 rounded-xl border border-zinc-200 text-sm font-medium text-zinc-700 hover:bg-zinc-50 transition-colors"
                        >
                            Log In
                        </Link>
                        <Link
                            href="/sign-up"
                            onClick={onClose}
                            className="flex items-center justify-center h-10 rounded-xl bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 transition-colors shadow-sm"
                        >
                            Sign Up
                        </Link>
                    </div>
                )}
            </div>
        </div>
    );
}

// ─── Main Navbar ──────────────────────────────────────────────────────────────

export default function Navbar() {
    const { data: session } = useSession();
    const pathname = usePathname();
    const [mobileOpen, setMobileOpen] = useState(false);
    // Close mobile nav on route change
    useEffect(() => { setMobileOpen(false); }, [pathname]);

    return (
        <header className="sticky top-0 z-50 w-full bg-white/90 backdrop-blur-md border-b border-zinc-100 shadow-[0_1px_0_0_rgba(0,0,0,0.04)]">
            <div className="max-w-[1450px] mx-auto px-4 sm:px-6 h-14 flex items-center justify-between gap-4">

                {/* ── Logo ─────────────────────────────────────────────────── */}
                <Link
                    href="/"
                    className="flex items-center gap-2 shrink-0 group"
                >
                    <div className="h-8 w-8 rounded-lg bg-blue-600 flex items-center justify-center shrink-0">
                        <Home className="h-4 w-4 text-white" />
                    </div>
                  <span className="text-base font-bold text-zinc-900 tracking-tight truncate">
                            LocalGig
                        </span>
                </Link>

                {/* ── Desktop Nav ───────────────────────────────────────────── */}
                <nav className="hidden md:flex items-center gap-6">
                    {NAV_LINKS.map(({ href, label }) => (
                        <NavLink
                            key={href}
                            href={href}
                            label={label}
                            active={isActiveRoute(pathname, href)}
                        />
                    ))}
                </nav>

                {/* ── Desktop Auth ──────────────────────────────────────────── */}
                <div className="hidden md:flex items-center gap-2">
                    {session?.user ? (
                        /* ── Logged-in: avatar dropdown ─────────────────────── */
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <button className="flex items-center gap-2.5 h-8 pl-1 pr-3 rounded-full border border-zinc-200 hover:border-zinc-300 hover:bg-zinc-50 transition-all duration-150 outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-1">
                                    <Avatar className="h-6 w-6">
                                        <AvatarFallback className="bg-blue-600 text-white text-[10px] font-bold">
                                            {getInitials(session.user.name)}
                                        </AvatarFallback>
                                    </Avatar>
                                    <span className="text-xs font-semibold text-zinc-700 max-w-[120px] truncate">
                                        {session.user.name.split(" ")[0]}
                                    </span>
                                </button>
                            </DropdownMenuTrigger>

                            <DropdownMenuContent
                                align="end"
                                sideOffset={8}
                                className="w-56 rounded-xl border border-zinc-100 shadow-lg shadow-black/[0.06] p-1"
                            >
                                {/* User identity */}
                                <DropdownMenuLabel className="px-3 py-2.5">
                                    <div className="flex items-center gap-2.5">
                                        <div className="h-8 w-8 rounded-full bg-blue-600 flex items-center justify-center text-white text-xs font-bold shrink-0">
                                            {getInitials(session.user.name)}
                                        </div>
                                        <div className="min-w-0">
                                            <p className="text-sm font-semibold text-zinc-900 truncate">
                                                {session.user.name}
                                            </p>
                                            <p className="text-xs text-zinc-400 truncate font-normal">
                                                {session.user.email}
                                            </p>
                                        </div>
                                    </div>
                                </DropdownMenuLabel>

                                <DropdownMenuSeparator className="mx-1 bg-blue-100" />

                                {/* Dashboard shortcut */}
                                <DropdownMenuItem asChild>
                                    <Link
                                        href="/dashboard"
                                        className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-zinc-700 hover:bg-zinc-50 cursor-pointer"
                                    >
                                        <LayoutDashboard className="h-4 w-4 text-zinc-400" />
                                        Dashboard
                                    </Link>
                                </DropdownMenuItem>

                                <DropdownMenuSeparator className="mx-1 bg-blue-100" />

                                {/* Sign out */}
                                <div className="px-1 py-0.5">
                                    <SignOutButton asMenuItem />
                                </div>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    ) : (
                        /* ── Logged-out: auth CTAs ───────────────────────────── */
                        <>
                            <Link
                                href="/sign-in"
                                className="h-8 px-3.5 inline-flex items-center rounded-lg text-sm font-medium text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100 transition-colors duration-150"
                            >
                                Log In
                            </Link>
                            <Link
                                href="/sign-up"
                                className="h-8 px-3.5 inline-flex items-center rounded-lg bg-zinc-900 text-white text-sm font-semibold hover:bg-zinc-800 transition-colors duration-150 shadow-sm"
                            >
                                Sign Up
                            </Link>
                        </>
                    )}
                </div>

                {/* ── Mobile: hamburger + Sheet ─────────────────────────────── */}
                <div className="md:hidden flex items-center gap-2">
                    {/* Show avatar pill on mobile even before drawer opens */}
                    {session?.user && (
                        <div className="h-7 w-7 rounded-full bg-blue-600 flex items-center justify-center text-white text-[10px] font-bold shrink-0">
                            {getInitials(session.user.name)}
                        </div>
                    )}

                    <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
                        <SheetTrigger asChild>
                            <button
                                aria-label={mobileOpen ? "Close menu" : "Open menu"}
                                className="h-8 w-8 flex items-center justify-center rounded-lg border border-zinc-200 text-zinc-600 hover:text-zinc-900 hover:bg-zinc-50 transition-all duration-150"
                            >
                                {mobileOpen
                                    ? <X className="h-4 w-4" />
                                    : <Menu className="h-4 w-4" />
                                }
                            </button>
                        </SheetTrigger>

                        <SheetContent
                            side="right"
                            className="w-[280px] sm:w-[320px] p-0 border-l border-zinc-100"
                        >
                            {/* Sheet header */}
                            <div className="flex items-center gap-2 px-5 py-4 border-b border-zinc-100">
                                <div className="h-8 w-8 rounded-lg bg-blue-600 flex items-center justify-center shrink-0">
                        <Home className="h-4 w-4 text-white" />
                    </div>
                  <span className="text-base font-bold text-zinc-900 tracking-tight truncate">
                            LocalGig
                        </span>
                            </div>

                            <MobileNav
                                pathname={pathname}
                                session={session}
                                onClose={() => setMobileOpen(false)}
                            />
                        </SheetContent>
                    </Sheet>
                </div>

            </div>
        </header>
    );
}