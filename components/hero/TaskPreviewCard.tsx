// components/hero/TaskPreviewCard.tsx
"use client";

import { motion } from "framer-motion";
import { MapPin, Clock, Users, Star } from "lucide-react";

const TASKS = [
  {
    category: "Home Repair",
    categoryColor: "bg-rose-50 text-rose-700 border-rose-100",
    title: "Fix leaking bathroom tap",
    location: "Koramangala, Bengaluru",
    budget: "₹1,500",
    hours: "2h",
    applicants: 4,
    workerAvatar: "RK",
    workerName: "Rajan K.",
    workerRating: "4.9",
    workerColor: "bg-blue-100 text-blue-700",
    accent: "bg-rose-400",
  },
  {
    category: "Tutoring",
    categoryColor: "bg-violet-50 text-violet-700 border-violet-100",
    title: "Maths tutor for 10th grade",
    location: "Indiranagar, Bengaluru",
    budget: "₹1,200",
    hours: "2h",
    applicants: 7,
    workerAvatar: "SM",
    workerName: "Sneha M.",
    workerRating: "5.0",
    workerColor: "bg-violet-100 text-violet-700",
    accent: "bg-violet-400",
  },
];

export default function TaskPreviewCard() {
  return (
    <motion.div
      className="flex flex-col gap-3 w-72"
      initial={{ opacity: 0, x: -30 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.7, delay: 1.1, ease: [0.25, 0.46, 0.45, 0.94] }}
    >
      {TASKS.map((task, i) => (
        <motion.div
          key={task.title}
          className="bg-white/95 backdrop-blur-md border border-zinc-200/80 rounded-2xl shadow-lg shadow-zinc-900/6 p-4 overflow-hidden relative"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 1.1 + i * 0.15 }}
          whileHover={{ y: -2, boxShadow: "0 12px 40px rgba(0,0,0,0.10)" }}
        >
          {/* Top accent line */}
          <div className={`absolute top-0 left-0 right-0 h-0.5 ${task.accent}`} />

          {/* Category + budget */}
          <div className="flex items-center justify-between mb-2.5">
            <span className={`text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full border ${task.categoryColor}`}>
              {task.category}
            </span>
            <span className="text-sm font-bold text-zinc-900 tabular-nums">{task.budget}</span>
          </div>

          {/* Title */}
          <p className="text-sm font-semibold text-zinc-900 leading-snug mb-2.5 line-clamp-1">
            {task.title}
          </p>

          {/* Meta */}
          <div className="flex items-center gap-3 text-[11px] text-zinc-400 mb-3">
            <span className="flex items-center gap-1">
              <MapPin className="h-2.5 w-2.5" />{task.location}
            </span>
            <span className="flex items-center gap-1">
              <Clock className="h-2.5 w-2.5" />{task.hours}
            </span>
          </div>

          {/* Footer: applicants + worker chip */}
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-1 text-[11px] text-zinc-400 font-medium">
              <Users className="h-2.5 w-2.5" />{task.applicants} applied
            </span>
            <div className={`flex items-center gap-1.5 px-2 py-1 rounded-full text-[10px] font-semibold ${task.workerColor}`}>
              <span>{task.workerAvatar}</span>
              <span className="text-zinc-600">{task.workerName}</span>
              <Star className="h-2 w-2 fill-current" />
              <span>{task.workerRating}</span>
            </div>
          </div>
        </motion.div>
      ))}
    </motion.div>
  );
}