// components/hero/HeroSection.tsx
"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  ArrowRight, MapPin, Shield, Zap, Star,
  Wrench, Truck, BookOpen, Camera, Sparkles, Users,
} from "lucide-react";
import HeroBackground from "./HeroBackground";
import ActivityCard from "./ActivityCard";
import TaskPreviewCards from "./TaskPreviewCard";

const EASE = [0.25, 0.46, 0.45, 0.94] as const;

const fadeUp = (delay: number) => ({
  initial: { opacity: 0, y: 22 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6, delay, ease: EASE },
});

const CATEGORIES = [
  { label: "Repair",      icon: Wrench,   bg: "bg-rose-50",   text: "text-rose-700",   border: "border-rose-100" },
  { label: "Delivery",    icon: Truck,    bg: "bg-amber-50",  text: "text-amber-700",  border: "border-amber-100" },
  { label: "Tutoring",    icon: BookOpen, bg: "bg-violet-50", text: "text-violet-700", border: "border-violet-100" },
  { label: "Photography", icon: Camera,   bg: "bg-pink-50",   text: "text-pink-700",   border: "border-pink-100" },
  { label: "& more",      icon: Sparkles, bg: "bg-zinc-50",   text: "text-zinc-500",   border: "border-zinc-200" },
] as const;

const TRUST = [
  { icon: Shield, label: "Verified workers" },
  { icon: Zap,    label: "Instant matching" },
  { icon: Star,   label: "Rated 4.9 / 5" },
] as const;

export default function HeroSection() {
  return (
    <section className="relative min-h-screen flex flex-col overflow-hidden bg-white">
      <HeroBackground />

      <div className="relative z-10 flex-1 flex items-center">
        <div className="max-w-[1450px] mx-auto px-4 sm:px-6 w-full pt-28 pb-20 sm:pt-32 sm:pb-24">

          {/* ── Two-column asymmetric grid ─────────────────────────────────── */}
          <div className="grid lg:grid-cols-[1fr_460px] xl:grid-cols-[1fr_500px] gap-10 xl:gap-16 items-center">

            {/* ════ LEFT: narrative column ═══════════════════════════════════ */}
            <div className="flex flex-col gap-6 max-w-2xl">

              {/* Eyebrow badge */}
              <motion.div {...fadeUp(0.08)} className="inline-flex">
                <span className="inline-flex items-center gap-2 text-xs font-semibold px-3 py-1.5 rounded-full border border-blue-200/80 bg-blue-50 text-blue-700 select-none">
                  <span className="h-1.5 w-1.5 rounded-full bg-blue-500 animate-pulse" />
                  Hyperlocal marketplace
                  <span className="text-blue-300">·</span>
                  Bengaluru · Hyderabad · more
                </span>
              </motion.div>

              {/* Headline */}
              <motion.h1
                {...fadeUp(0.16)}
                className="text-[2.6rem] sm:text-5xl lg:text-[3.25rem] xl:text-[3.6rem] font-bold text-zinc-900 tracking-tight leading-[1.07]"
              >
                Local tasks,{" "}
                <span className="relative inline-block">
                  <span className="relative z-10">real people,</span>
                  <motion.span
                    className="absolute -bottom-1 left-0 right-0 h-[3px] rounded-full bg-blue-600"
                    initial={{ scaleX: 0, originX: 0 }}
                    animate={{ scaleX: 1 }}
                    transition={{ duration: 0.55, delay: 0.72, ease: EASE }}
                  />
                </span>
                <br />
                done nearby.
              </motion.h1>

              {/* Subheadline */}
              <motion.p
                {...fadeUp(0.28)}
                className="text-base sm:text-lg text-zinc-500 leading-relaxed font-normal max-w-[520px]"
              >
                Post any task — repair, tutoring, delivery, or anything else.
                Get matched with trusted local workers in{" "}
                <span className="font-semibold text-zinc-700">minutes, not days.</span>
              </motion.p>

              {/* Category pills */}
              <motion.div {...fadeUp(0.36)} className="flex flex-wrap gap-2">
                {CATEGORIES.map(({ label, icon: Icon, bg, text, border }) => (
                  <span
                    key={label}
                    className={`inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full border ${bg} ${text} ${border} cursor-default select-none`}
                  >
                    <Icon className="h-3 w-3" />
                    {label}
                  </span>
                ))}
              </motion.div>

              {/* CTAs */}
              <motion.div
                {...fadeUp(0.44)}
                className="flex flex-col sm:flex-row gap-3"
              >
                <Link
                  href="/tasks/new"
                  className="group relative inline-flex items-center justify-center gap-2 h-12 px-7 rounded-xl bg-zinc-900 text-white text-sm font-semibold shadow-md shadow-zinc-900/20 hover:bg-zinc-800 active:scale-[0.98] transition-all duration-150 overflow-hidden"
                >
                  <span className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-white/8 to-transparent" />
                  Post a Task
                  <ArrowRight className="h-4 w-4 group-hover:translate-x-0.5 transition-transform duration-150" />
                </Link>
                <Link
                  href="/tasks"
                  className="inline-flex items-center justify-center gap-2 h-12 px-7 rounded-xl border border-zinc-200 bg-white text-zinc-700 text-sm font-semibold hover:border-zinc-300 hover:bg-zinc-50 active:scale-[0.98] transition-all duration-150 shadow-sm"
                >
                  Browse tasks
                </Link>
              </motion.div>

              {/* Trust chips */}
              <motion.div {...fadeUp(0.52)} className="flex flex-wrap gap-4">
                {TRUST.map(({ icon: Icon, label }) => (
                  <span key={label} className="flex items-center gap-1.5 text-xs text-zinc-400 font-medium select-none">
                    <Icon className="h-3.5 w-3.5 text-zinc-400 shrink-0" />
                    {label}
                  </span>
                ))}
              </motion.div>

              {/* Location strip */}
              <motion.div {...fadeUp(0.58)} className="flex items-center gap-2 text-xs text-zinc-400">
                <MapPin className="h-3.5 w-3.5 text-blue-500 shrink-0" />
                Available in Bengaluru · Hyderabad · Chennai · Pune · Mumbai
              </motion.div>
            </div>

            {/* ════ RIGHT: visual proof column (desktop only) ════════════════ */}
            <div className="relative hidden lg:flex items-center justify-center min-h-[540px]">

              {/* Task cards — left side */}
              <div className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4">
                <TaskPreviewCards />
              </div>

              {/* Activity card — top right */}
              <motion.div
                className="absolute right-0 top-6"
                initial={{ opacity: 0, x: 36, y: -8 }}
                animate={{ opacity: 1, x: 0, y: 0 }}
                transition={{ duration: 0.65, delay: 1.0, ease: EASE }}
              >
                <ActivityCard />
              </motion.div>

              {/* Central map orb */}
              <motion.div
                animate={{ y: [0, -9, 0] }}
                transition={{ duration: 5.5, repeat: Infinity, ease: "easeInOut" }}
                className="relative z-10"
              >
                {/* Outer ring */}
                <div className="h-52 w-52 rounded-full bg-gradient-to-br from-blue-100 via-indigo-50 to-blue-50 border border-blue-200/60 shadow-xl shadow-blue-500/10 flex items-center justify-center">
                  {/* Inner circle */}
                  <div className="h-36 w-36 rounded-full bg-white border border-blue-100 shadow-inner flex flex-col items-center justify-center gap-2">
                    <MapPin className="h-7 w-7 text-blue-600" />
                    <span className="text-[11px] font-semibold text-zinc-500">Near you</span>
                    {/* Ping dot */}
                    <span className="relative flex h-3 w-3">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-60" />
                      <span className="relative inline-flex h-3 w-3 rounded-full bg-blue-600" />
                    </span>
                  </div>
                </div>

                {/* Orbiting dots */}
                {[0, 52, 104, 156, 208, 260].map((deg) => (
                  <motion.div
                    key={deg}
                    className="absolute h-2 w-2 rounded-full bg-blue-400/50"
                    style={{
                      top: "50%",
                      left: "50%",
                      translateX: `calc(-50% + ${Math.cos((deg * Math.PI) / 180) * 82}px)`,
                      translateY: `calc(-50% + ${Math.sin((deg * Math.PI) / 180) * 82}px)`,
                    }}
                    animate={{ scale: [1, 1.7, 1], opacity: [0.4, 1, 0.4] }}
                    transition={{ duration: 2.8, repeat: Infinity, delay: (deg / 360) * 2.8 }}
                  />
                ))}
              </motion.div>

              {/* Worker count badge — bottom right */}
              <motion.div
                className="absolute bottom-8 right-0 flex items-center gap-2.5 bg-white/95 backdrop-blur-md border border-zinc-200/80 rounded-xl shadow-md shadow-zinc-900/6 px-3.5 py-2.5"
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.55, delay: 1.3, ease: EASE }}
              >
                {/* Stacked avatars */}
                <div className="flex -space-x-2">
                  {(["#2563eb", "#7c3aed", "#059669"] as const).map((bg, i) => (
                    <div
                      key={i}
                      className="h-7 w-7 rounded-full border-2 border-white flex items-center justify-center text-[9px] font-bold text-white"
                      style={{ background: bg }}
                    >
                      {["RK", "PM", "AK"][i]}
                    </div>
                  ))}
                </div>
                <div>
                  <p className="text-xs font-bold text-zinc-900 leading-none mb-0.5">
                    240+ workers
                  </p>
                  <p className="text-[10px] text-zinc-400 flex items-center gap-1">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 inline-block" />
                    online nearby
                  </p>
                </div>
              </motion.div>
            </div>
          </div>

          {/* ── Stats row (below both columns) ────────────────────────────── */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.72, ease: EASE }}
            className="mt-14 sm:mt-16"
          >
            <StatsRow />
          </motion.div>

          {/* ── Mobile visual stack ───────────────────────────────────────── */}
          <div className="lg:hidden mt-10 flex flex-col gap-4">
            <motion.div {...fadeUp(0.65)} className="w-full">
              <ActivityCard />
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── Stats row (inline — avoids an extra file for a small component) ──────────

const STATS = [
  { value: "12,000+", label: "Tasks completed" },
  { value: "4.9 ★",   label: "Average rating" },
  { value: "< 2 hrs", label: "Avg. response" },
  { value: "50+",     label: "Cities covered" },
] as const;

function StatsRow() {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-px bg-zinc-200/70 rounded-2xl overflow-hidden border border-zinc-200/80 max-w-2xl">
      {STATS.map(({ value, label }) => (
        <div key={label} className="flex flex-col gap-0.5 px-5 py-4 bg-white">
          <span className="text-xl font-bold text-zinc-900 tracking-tight tabular-nums">
            {value}
          </span>
          <span className="text-xs text-zinc-500 font-medium">{label}</span>
        </div>
      ))}
    </div>
  );
}