"use client";


import { motion } from "framer-motion";
import type { ReactNode } from "react";

const EASE = [0.25, 0.46, 0.45, 0.94] as const;

export default function TasksSectionGrid({ children }: { children: ReactNode }) {
    const items = Array.isArray(children) ? children : [children];

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
            {items.map((child, i) => (
                <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-60px" }}
                    transition={{ duration: 0.45, delay: i * 0.07, ease: EASE }}
                >
                    {child}
                </motion.div>
            ))}
        </div>
    );
}