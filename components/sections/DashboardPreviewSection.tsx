"use client";

import { motion } from "framer-motion";
import {
  MessageCircle, CheckCircle2, Clock, Users,
  IndianRupee, Send, Briefcase, Bell, ArrowUpRight,
  MapPin, MoreHorizontal,
} from "lucide-react";

const EASE = [0.25, 0.46, 0.45, 0.94] as const;

// ── Messaging preview data ────────────────────────────────────────────────────

const CONVERSATIONS = [
  {
    initials: "RK",
    name: "Rajan Kumar",
    task: "Fix bathroom tap",
    lastMsg: "I can start tomorrow morning, 9 AM works?",
    time: "2m",
    unread: 2,
    color: "bg-blue-100 text-blue-700",
  },
  {
    initials: "SM",
    name: "Sneha M.",
    task: "Maths Tutoring",
    lastMsg: "Sure, I have the CBSE syllabus covered.",
    time: "1h",
    unread: 0,
    color: "bg-violet-100 text-violet-700",
  },
  {
    initials: "AK",
    name: "Arjun K.",
    task: "Furniture Assembly",
    lastMsg: "Done ✓ Please mark task complete.",
    time: "3h",
    unread: 0,
    color: "bg-emerald-100 text-emerald-700",
  },
];

const MESSAGES = [
  { from: "them", text: "Hi! I saw your task post. I'm a licensed plumber with 6 years of experience.", time: "10:42 AM" },
  { from: "me",   text: "Great! Can you come this weekend?",                                              time: "10:44 AM" },
  { from: "them", text: "I can start tomorrow morning, 9 AM works?",                                     time: "10:45 AM" },
];

// ── Tasks preview data ────────────────────────────────────────────────────────

const APPLICANTS = [
  { initials: "RK", name: "Rajan Kumar", budget: 1800, tag: "Top Match",    tagColor: "bg-blue-50 text-blue-700 ring-1 ring-blue-200",    color: "bg-blue-100 text-blue-700" },
  { initials: "VR", name: "Vikram R.",   budget: 1600, tag: "Under Budget", tagColor: "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200", color: "bg-rose-100 text-rose-700" },
];

const ACTIVITY = [
  { icon: Users,        text: "Priya M. applied to Event Photography",     time: "5m ago",  dot: "bg-pink-400" },
  { icon: CheckCircle2, text: "Furniture Assembly marked as completed",     time: "2h ago",  dot: "bg-emerald-400" },
  { icon: Bell,         text: "New message from Rajan Kumar",               time: "3h ago",  dot: "bg-blue-400" },
];

// ── Sub-components ────────────────────────────────────────────────────────────

function MessagingPanel() {
  return (
    <div className="flex flex-col h-full rounded-2xl border border-zinc-200/80 overflow-hidden bg-white shadow-lg shadow-zinc-900/5">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-100 bg-white">
        <div className="flex items-center gap-2">
          <MessageCircle className="h-4 w-4 text-blue-600" />
          <span className="text-sm font-bold text-zinc-900">Messages</span>
        </div>
        <span className="h-5 w-5 rounded-full bg-blue-600 text-white text-[10px] font-bold flex items-center justify-center">2</span>
      </div>

      <div className="flex flex-1 min-h-0 overflow-hidden">
        {/* Sidebar */}
        <div className="w-40 shrink-0 border-r border-zinc-100 flex flex-col overflow-y-auto">
          {CONVERSATIONS.map((c, i) => (
            <div
              key={i}
              className={`px-3 py-2.5 cursor-pointer border-b border-zinc-50 transition-colors ${i === 0 ? "bg-blue-50 border-l-2 border-l-blue-500" : "hover:bg-zinc-50"}`}
            >
              <div className="flex items-center gap-2">
                <div className={`h-7 w-7 rounded-lg flex items-center justify-center text-[10px] font-bold shrink-0 ${c.color}`}>
                  {c.initials}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-semibold text-zinc-900 truncate">{c.name}</p>
                    {c.unread > 0 && (
                      <span className="h-4 w-4 rounded-full bg-blue-600 text-white text-[9px] font-bold flex items-center justify-center shrink-0">
                        {c.unread}
                      </span>
                    )}
                  </div>
                  <p className="text-[10px] text-zinc-400 truncate">{c.task}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Chat */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Chat header */}
          <div className="flex items-center justify-between px-3 py-2.5 border-b border-zinc-100">
            <div className="flex items-center gap-2">
              <div className="h-7 w-7 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center text-[10px] font-bold">RK</div>
              <div>
                <p className="text-xs font-semibold text-zinc-900">Rajan Kumar</p>
                <p className="text-[10px] text-emerald-500 font-medium flex items-center gap-1">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 inline-block" />
                  Online
                </p>
              </div>
            </div>
            <MoreHorizontal className="h-4 w-4 text-zinc-400" />
          </div>

          {/* Messages */}
          <div className="flex-1 flex flex-col gap-2 p-3 overflow-y-auto bg-zinc-50/40">
            {MESSAGES.map((msg, i) => (
              <div key={i} className={`flex ${msg.from === "me" ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-[80%] rounded-xl px-3 py-2 text-xs leading-relaxed ${
                  msg.from === "me"
                    ? "bg-blue-600 text-white rounded-br-sm"
                    : "bg-white border border-zinc-200 text-zinc-700 rounded-bl-sm"
                }`}>
                  {msg.text}
                </div>
              </div>
            ))}
          </div>

          {/* Input */}
          <div className="flex items-center gap-2 px-3 py-2.5 border-t border-zinc-100 bg-white">
            <div className="flex-1 h-7 rounded-lg bg-zinc-100 px-3 flex items-center text-[11px] text-zinc-400">
              Type a message…
            </div>
            <button className="h-7 w-7 rounded-lg bg-blue-600 flex items-center justify-center shrink-0">
              <Send className="h-3 w-3 text-white" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function TaskManagementPanel() {
  return (
    <div className="flex flex-col gap-4 h-full">
      {/* Applicants card */}
      <div className="bg-white rounded-2xl border border-zinc-200/80 shadow-lg shadow-zinc-900/5 overflow-hidden">
        <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-100">
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-blue-600" />
            <span className="text-sm font-bold text-zinc-900">Applicants</span>
          </div>
          <span className="text-xs text-zinc-400 font-medium">Fix bathroom tap</span>
        </div>
        <div className="p-4 flex flex-col gap-3">
          {APPLICANTS.map((a, i) => (
            <div key={i} className={`flex items-center gap-3 p-3 rounded-xl ${i === 0 ? "bg-blue-50 border border-blue-100" : "bg-zinc-50 border border-zinc-100"}`}>
              <div className={`h-8 w-8 rounded-lg flex items-center justify-center text-xs font-bold shrink-0 ${a.color}`}>
                {a.initials}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-zinc-900">{a.name}</p>
                <div className="flex items-center gap-0.5 text-xs text-zinc-500">
                  <IndianRupee className="h-3 w-3" />
                  <span className="tabular-nums">{a.budget.toLocaleString("en-IN")}</span>
                </div>
              </div>
              <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full shrink-0 ${a.tagColor}`}>{a.tag}</span>
            </div>
          ))}
          <div className="flex gap-2 pt-1">
            <button className="flex-1 h-8 rounded-xl bg-emerald-600 text-white text-xs font-semibold flex items-center justify-center gap-1.5 hover:bg-emerald-500 transition-colors">
              <CheckCircle2 className="h-3.5 w-3.5" />
              Accept Rajan
            </button>
          </div>
        </div>
      </div>

      {/* Activity feed */}
      <div className="bg-white rounded-2xl border border-zinc-200/80 shadow-lg shadow-zinc-900/5 overflow-hidden flex-1">
        <div className="flex items-center gap-2 px-4 py-3 border-b border-zinc-100">
          <Briefcase className="h-4 w-4 text-blue-600" />
          <span className="text-sm font-bold text-zinc-900">Activity</span>
        </div>
        <div className="px-4 py-3 flex flex-col gap-3">
          {ACTIVITY.map((item, i) => {
            const Icon = item.icon;
            return (
              <div key={i} className="flex items-start gap-3">
                <div className={`h-6 w-6 rounded-lg flex items-center justify-center shrink-0 ${item.dot === "bg-emerald-400" ? "bg-emerald-50" : item.dot === "bg-pink-400" ? "bg-pink-50" : "bg-blue-50"}`}>
                  <Icon className={`h-3 w-3 ${item.dot === "bg-emerald-400" ? "text-emerald-600" : item.dot === "bg-pink-400" ? "text-pink-600" : "text-blue-600"}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-zinc-700 leading-relaxed">{item.text}</p>
                  <p className="text-[10px] text-zinc-400 mt-0.5">{item.time}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ── Main section ──────────────────────────────────────────────────────────────

export default function DashboardPreviewSection() {
  return (
    <section className="bg-white border-t border-zinc-100 py-20 sm:py-28">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6">

        <div className="grid lg:grid-cols-2 gap-12 xl:gap-20 items-center">

          {/* ── Left: copy ───────────────────────────────────────────────── */}
          <motion.div
            initial={{ opacity: 0, x: -24 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, ease: EASE }}
            className="flex flex-col gap-6 max-w-lg"
          >
            <div>
              <span className="inline-flex items-center gap-2 text-xs font-semibold px-3 py-1.5 rounded-full border border-blue-200/80 bg-blue-50 text-blue-700 mb-4">
                <span className="h-1.5 w-1.5 rounded-full bg-blue-500" />
                Your dashboard
              </span>
              <h2 className="text-3xl sm:text-4xl font-bold text-zinc-900 tracking-tight leading-tight">
                Everything in one<br />place, always
              </h2>
              <p className="mt-4 text-base text-zinc-500 leading-relaxed">
                Once you sign up, your personal dashboard gives you full visibility — who applied, how much they quoted, and a direct chat channel with every worker.
              </p>
            </div>

            <div className="flex flex-col gap-3">
              {[
                { icon: MessageCircle, label: "In-app messaging",       desc: "Chat directly with workers before hiring." },
                { icon: Users,         label: "Manage applicants",       desc: "See who applied, their bid, and accept instantly." },
                { icon: CheckCircle2,  label: "Track task progress",     desc: "Move tasks from open → in progress → done." },
                { icon: Bell,          label: "Real-time notifications", desc: "Get notified the moment someone applies." },
              ].map(({ icon: Icon, label, desc }) => (
                <div key={label} className="flex items-start gap-3">
                  <div className="h-8 w-8 rounded-xl bg-blue-50 flex items-center justify-center shrink-0 mt-0.5">
                    <Icon className="h-4 w-4 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-zinc-900">{label}</p>
                    <p className="text-xs text-zinc-400 mt-0.5">{desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* ── Right: UI preview ────────────────────────────────────────── */}
          <motion.div
            initial={{ opacity: 0, x: 24 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.65, ease: EASE }}
            className="flex flex-col gap-4"
          >
            {/* Stats strip */}
            <div className="grid grid-cols-3 gap-3">
              {[
                { label: "Tasks Posted", value: "3", color: "text-blue-600" },
                { label: "Active",       value: "2", color: "text-amber-600" },
                { label: "Completed",    value: "1", color: "text-emerald-600" },
              ].map(({ label, value, color }) => (
                <div key={label} className="bg-white rounded-xl border border-zinc-100 px-4 py-3 shadow-sm text-center">
                  <p className={`text-2xl font-bold ${color}`}>{value}</p>
                  <p className="text-[11px] text-zinc-400 font-medium mt-0.5">{label}</p>
                </div>
              ))}
            </div>

            {/* Main panels */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4" style={{ minHeight: 360 }}>
              <MessagingPanel />
              <TaskManagementPanel />
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}