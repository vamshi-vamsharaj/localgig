// components/hero/HeroStats.tsx
"use client";

import { motion } from "framer-motion";

const STATS = [
  { value: "12,000+", label: "Tasks completed" },
  { value: "4.9★",    label: "Average rating" },
  { value: "< 2 hrs", label: "Avg. response time" },
  { value: "50+",     label: "Cities covered" },
];

export default function HeroStats() {
  return (
    <motion.div
      className="grid grid-cols-2 sm:grid-cols-4 gap-px bg-zinc-200/60 rounded-2xl overflow-hidden border border-zinc-200/80"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.8, ease: [0.25, 0.46, 0.45, 0.94] }}
    >
      {STATS.map((s, i) => (
        <div
          key={s.label}
          className="flex flex-col gap-0.5 px-5 py-4 bg-white/90 backdrop-blur-sm"
        >
          <span className="text-xl font-bold text-zinc-900 tracking-tight tabular-nums">
            {s.value}
          </span>
          <span className="text-xs text-zinc-500 font-medium">{s.label}</span>
        </div>
      ))}
    </motion.div>
  );
}