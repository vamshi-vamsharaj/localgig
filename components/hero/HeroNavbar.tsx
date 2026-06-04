// components/hero/HeroNavbar.tsx
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Briefcase, Menu, X } from "lucide-react";

const NAV_LINKS = [
  { href: "/tasks",     label: "Browse Tasks" },
  { href: "/dashboard", label: "Dashboard" },
  { href: "/tasks/new", label: "Post a Task" },
];

export default function HeroNavbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <motion.header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-white/80 backdrop-blur-xl border-b border-zinc-200/70 shadow-sm shadow-zinc-900/4"
          : "bg-transparent"
      }`}
      initial={{ y: -16, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
    >
      <div className="max-w-6xl mx-auto px-5 sm:px-8 h-14 flex items-center justify-between">

        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 group">
          <div className="h-7 w-7 rounded-lg bg-zinc-900 flex items-center justify-center group-hover:bg-blue-600 transition-colors duration-200">
            <Briefcase className="h-3.5 w-3.5 text-white" />
          </div>
          <span className="text-sm font-bold text-zinc-900 tracking-tight">LocalGig</span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-7">
          {NAV_LINKS.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className="text-sm font-medium text-zinc-500 hover:text-zinc-900 transition-colors duration-150"
            >
              {label}
            </Link>
          ))}
        </nav>

        {/* Desktop CTAs */}
        <div className="hidden md:flex items-center gap-2">
          <Link
            href="/sign-in"
            className="h-8 px-3.5 text-sm font-medium text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100 rounded-lg transition-colors duration-150 flex items-center"
          >
            Log in
          </Link>
          <Link
            href="/sign-up"
            className="h-8 px-4 text-sm font-semibold text-white bg-zinc-900 hover:bg-zinc-700 rounded-lg transition-colors duration-150 flex items-center shadow-sm"
          >
            Get started
          </Link>
        </div>

        {/* Mobile hamburger */}
        <button
          onClick={() => setMobileOpen((v) => !v)}
          className="md:hidden h-8 w-8 flex items-center justify-center rounded-lg border border-zinc-200 text-zinc-600 hover:bg-zinc-50 transition"
          aria-label={mobileOpen ? "Close menu" : "Open menu"}
        >
          {mobileOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
        </button>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <motion.div
          className="md:hidden bg-white/95 backdrop-blur-xl border-t border-zinc-100 px-5 py-4 flex flex-col gap-2"
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
        >
          {NAV_LINKS.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              onClick={() => setMobileOpen(false)}
              className="text-sm font-medium text-zinc-700 hover:text-zinc-900 py-2 px-3 rounded-lg hover:bg-zinc-50 transition-colors"
            >
              {label}
            </Link>
          ))}
          <div className="flex gap-2 pt-2 border-t border-zinc-100 mt-1">
            <Link href="/sign-in" onClick={() => setMobileOpen(false)}
              className="flex-1 text-center text-sm font-medium text-zinc-700 border border-zinc-200 py-2 rounded-lg hover:bg-zinc-50 transition">
              Log in
            </Link>
            <Link href="/sign-up" onClick={() => setMobileOpen(false)}
              className="flex-1 text-center text-sm font-semibold text-white bg-zinc-900 py-2 rounded-lg hover:bg-zinc-700 transition">
              Get started
            </Link>
          </div>
        </motion.div>
      )}
    </motion.header>
  );
}