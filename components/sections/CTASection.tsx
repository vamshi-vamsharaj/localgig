"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Briefcase, Search } from "lucide-react";

const EASE = [0.25, 0.46, 0.45, 0.94] as const;

export default function CTASection() {
  return (
    <section className="bg-white border-t border-zinc-100 py-20 sm:py-28">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6">

        <div className="relative rounded-3xl overflow-hidden bg-zinc-900 px-6 py-16 sm:px-12 sm:py-20">

          {/* Background decoration */}
          <div className="absolute inset-0 pointer-events-none" aria-hidden>
            {/* Gradient orbs */}
            <div
              className="absolute rounded-full"
              style={{
                width: 500, height: 500,
                top: -150, left: -100,
                background: "radial-gradient(circle, rgba(59,130,246,0.18) 0%, transparent 70%)",
                filter: "blur(2px)",
              }}
            />
            <div
              className="absolute rounded-full"
              style={{
                width: 400, height: 400,
                bottom: -120, right: -80,
                background: "radial-gradient(circle, rgba(99,102,241,0.15) 0%, transparent 70%)",
                filter: "blur(2px)",
              }}
            />
            {/* Subtle grid */}
            <div
              className="absolute inset-0 opacity-[0.04]"
              style={{
                backgroundImage: `linear-gradient(to right, white 1px, transparent 1px), linear-gradient(to bottom, white 1px, transparent 1px)`,
                backgroundSize: "48px 48px",
              }}
            />
          </div>

          <div className="relative z-10 flex flex-col items-center text-center gap-8">

            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, ease: EASE }}
            >
              <span className="inline-flex items-center gap-2 text-xs font-semibold px-3 py-1.5 rounded-full border border-white/20 bg-white/10 text-white/80 backdrop-blur-sm">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Join 5,000+ people on LocalGig
              </span>
            </motion.div>

            {/* Headline */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.55, delay: 0.08, ease: EASE }}
              className="max-w-2xl"
            >
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white tracking-tight leading-tight">
                Ready to get started?
              </h2>
              <p className="mt-4 text-base sm:text-lg text-white/60 leading-relaxed">
                Whether you need something done or want to earn by helping others — LocalGig connects you to your city's talent.
              </p>
            </motion.div>

            {/* CTAs */}
            <motion.div
              initial={{ opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.18, ease: EASE }}
              className="flex flex-col sm:flex-row gap-4"
            >
              {/* Primary — Post a Task */}
              <Link
                href="/tasks/new"
                className="group relative inline-flex items-center justify-center gap-2.5 h-12 px-8 rounded-xl bg-white text-zinc-900 text-sm font-bold shadow-lg hover:bg-zinc-100 active:scale-[0.98] transition-all duration-150 overflow-hidden"
              >
                <span className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-black/5 to-transparent" />
                <Briefcase className="h-4 w-4" />
                Post a Task
                <ArrowRight className="h-4 w-4 group-hover:translate-x-0.5 transition-transform duration-150" />
              </Link>

              {/* Secondary — Find Work */}
              <Link
                href="/tasks"
                className="group inline-flex items-center justify-center gap-2.5 h-12 px-8 rounded-xl border border-white/20 bg-white/10 text-white text-sm font-semibold backdrop-blur-sm hover:bg-white/20 hover:border-white/30 active:scale-[0.98] transition-all duration-150"
              >
                <Search className="h-4 w-4" />
                Find Work
              </Link>
            </motion.div>

            {/* Social proof strip */}
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.3, ease: EASE }}
              className="flex flex-wrap items-center justify-center gap-6 text-xs text-white/40 font-medium"
            >
              <span>Free to sign up</span>
              <span className="h-1 w-1 rounded-full bg-white/20" />
              <span>No subscription fees</span>
              <span className="h-1 w-1 rounded-full bg-white/20" />
              <span>Pay only when hired</span>
              <span className="h-1 w-1 rounded-full bg-white/20" />
              <span>Verified workers</span>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}