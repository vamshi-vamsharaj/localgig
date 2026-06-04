// components/hero/ActivityCard.tsx
"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import { MapPin, Clock, IndianRupee } from "lucide-react";

const ACTIVITIES = [
  {
    avatar: "RS",
    name: "Ravi S.",
    action: "booked",
    task: "Home Repair",
    location: "Koramangala",
    time: "2 min ago",
    budget: "₹1,800",
    color: "bg-blue-100 text-blue-700",
  },
  {
    avatar: "PM",
    name: "Priya M.",
    action: "applied to",
    task: "Event Photography",
    location: "Banjara Hills",
    time: "5 min ago",
    budget: "₹4,500",
    color: "bg-violet-100 text-violet-700",
  },
  {
    avatar: "AK",
    name: "Arjun K.",
    action: "completed",
    task: "Furniture Moving",
    location: "HSR Layout",
    time: "8 min ago",
    budget: "₹2,200",
    color: "bg-emerald-100 text-emerald-700",
  },
  {
    avatar: "SK",
    name: "Sanya K.",
    action: "posted",
    task: "Maths Tutoring",
    location: "Indiranagar",
    time: "11 min ago",
    budget: "₹1,200",
    color: "bg-amber-100 text-amber-700",
  },
];

export default function ActivityCard() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setIndex((i) => (i + 1) % ACTIVITIES.length), 3200);
    return () => clearInterval(id);
  }, []);

  const item = ACTIVITIES[index];

  return (
    <motion.div
      className="bg-white/95 backdrop-blur-md border border-zinc-200/80 rounded-2xl shadow-lg shadow-zinc-900/6 p-4 w-72"
      initial={{ opacity: 0, x: 40, y: -10 }}
      animate={{ opacity: 1, x: 0, y: 0 }}
      transition={{ duration: 0.7, delay: 1.0, ease: [0.25, 0.46, 0.45, 0.94] }}
    >
      {/* Header */}
      <div className="flex items-center gap-1.5 mb-3">
        <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
        <span className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">
          Live Activity
        </span>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={index}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.3 }}
          className="flex items-start gap-3"
        >
          {/* Avatar */}
          <div className={`h-9 w-9 rounded-xl flex items-center justify-center text-xs font-bold shrink-0 ${item.color}`}>
            {item.avatar}
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-zinc-900 leading-tight">
              <span>{item.name}</span>{" "}
              <span className="font-normal text-zinc-500">{item.action}</span>{" "}
              <span className="text-zinc-900">{item.task}</span>
            </p>
            <div className="flex items-center gap-3 mt-1.5">
              <span className="flex items-center gap-1 text-[11px] text-zinc-400">
                <MapPin className="h-2.5 w-2.5" />
                {item.location}
              </span>
              <span className="flex items-center gap-1 text-[11px] text-zinc-400">
                <Clock className="h-2.5 w-2.5" />
                {item.time}
              </span>
            </div>
          </div>

          {/* Budget */}
          <div className="text-sm font-bold text-zinc-900 shrink-0 tabular-nums">
            {item.budget}
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Progress dots */}
      <div className="flex gap-1 mt-3 justify-center">
        {ACTIVITIES.map((_, i) => (
          <motion.div
            key={i}
            className="h-1 rounded-full bg-zinc-200"
            animate={{ width: i === index ? 20 : 6, backgroundColor: i === index ? "rgb(59,130,246)" : "rgb(228,228,231)" }}
            transition={{ duration: 0.3 }}
          />
        ))}
      </div>
    </motion.div>
  );
}
