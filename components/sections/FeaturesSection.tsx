"use client";

import { motion } from "framer-motion";
import {
  MapPin, Zap, MessageCircle, Bookmark,
  LayoutDashboard, ShieldCheck,
} from "lucide-react";

const EASE = [0.25, 0.46, 0.45, 0.94] as const;

const FEATURES = [
  {
    icon: MapPin,
    title: "Hyperlocal Discovery",
    desc: "Tasks surface based on your city and neighbourhood. No nationwide noise — only what's genuinely close to you.",
    accent: "bg-blue-50",
    iconColor: "text-blue-600",
    iconBg: "bg-blue-100",
    border: "border-blue-100",
    highlight: "group-hover:border-blue-200",
  },
  {
    icon: Zap,
    title: "Instant Applications",
    desc: "Apply to any task in seconds. Write your pitch, name your price, and get in front of the client before anyone else.",
    accent: "bg-amber-50",
    iconColor: "text-amber-600",
    iconBg: "bg-amber-100",
    border: "border-amber-100",
    highlight: "group-hover:border-amber-200",
  },
  {
    icon: MessageCircle,
    title: "In-App Messaging",
    desc: "Every accepted application opens a direct chat. Coordinate timing, share details, and confirm everything before showing up.",
    accent: "bg-violet-50",
    iconColor: "text-violet-600",
    iconBg: "bg-violet-100",
    border: "border-violet-100",
    highlight: "group-hover:border-violet-200",
  },
  {
    icon: Bookmark,
    title: "Saved Tasks",
    desc: "Bookmark tasks you like and come back to them. Never lose track of an opportunity while you're thinking it over.",
    accent: "bg-pink-50",
    iconColor: "text-pink-600",
    iconBg: "bg-pink-100",
    border: "border-pink-100",
    highlight: "group-hover:border-pink-200",
  },
  {
    icon: LayoutDashboard,
    title: "Smart Dashboard",
    desc: "See all your tasks, messages, applicants, and activity in a single view. Know what needs your attention at a glance.",
    accent: "bg-emerald-50",
    iconColor: "text-emerald-600",
    iconBg: "bg-emerald-100",
    border: "border-emerald-100",
    highlight: "group-hover:border-emerald-200",
  },
  {
    icon: ShieldCheck,
    title: "Secure Profiles",
    desc: "Workers are verified with ID and reviewed after every task. Clients see ratings, completed work history, and trust scores.",
    accent: "bg-sky-50",
    iconColor: "text-sky-600",
    iconBg: "bg-sky-100",
    border: "border-sky-100",
    highlight: "group-hover:border-sky-200",
  },
] as const;

export default function FeaturesSection() {
  return (
    <section className="bg-zinc-50/50 border-t border-zinc-100 py-20 sm:py-28">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6">

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.55, ease: EASE }}
          className="text-center mb-14"
        >
          <span className="inline-flex items-center gap-2 text-xs font-semibold px-3 py-1.5 rounded-full border border-zinc-200 bg-white text-zinc-600 mb-4">
            Built for the real world
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold text-zinc-900 tracking-tight leading-tight">
            The tools that make it work
          </h2>
          <p className="mt-3 text-sm text-zinc-500 max-w-md mx-auto">
            Every feature on LocalGig exists to solve a real friction point between clients and workers.
          </p>
        </motion.div>

        {/* Features grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {FEATURES.map((feat, i) => {
            const Icon = feat.icon;
            return (
              <motion.div
                key={feat.title}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.5, delay: i * 0.07, ease: EASE }}
                className={`group relative bg-white rounded-2xl border border-zinc-100 ${feat.highlight} p-6 shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden`}
              >
                {/* Subtle background tint on hover */}
                <div className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 ${feat.accent} pointer-events-none rounded-2xl`} style={{ opacity: 0 }} />

                <div className="relative z-10">
                  <div className={`h-11 w-11 rounded-xl flex items-center justify-center mb-4 ${feat.iconBg}`}>
                    <Icon className={`h-5 w-5 ${feat.iconColor}`} />
                  </div>
                  <h3 className="text-base font-bold text-zinc-900 mb-2">{feat.title}</h3>
                  <p className="text-sm text-zinc-500 leading-relaxed">{feat.desc}</p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}