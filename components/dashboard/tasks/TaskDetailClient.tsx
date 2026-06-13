"use client";

import { motion } from "framer-motion";
import type { ReactNode } from "react";

const EASE = [0.25, 0.46, 0.45, 0.94] as const;

function Section({ children, delay = 0 }: { children: ReactNode; delay?: number }) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay, ease: EASE }}
        >
            {children}
        </motion.div>
    );
}

interface TaskDetailClientProps {
    header:       ReactNode;
    description:  ReactNode;
    details:      ReactNode;
    map:          ReactNode;
    client:       ReactNode;
    similar:      ReactNode;
}

export default function TaskDetailClient({
    header,
    description,
    details,
    map,
    client,
    similar,
}: TaskDetailClientProps) {
    return (
        <div className="flex flex-col gap-10">
            <Section delay={0.05}>{header}</Section>
            <Section delay={0.12}>{description}</Section>
            <Section delay={0.18}>{details}</Section>
            <Section delay={0.24}>{map}</Section>
            <Section delay={0.30}>{client}</Section>
            {similar && <Section delay={0.36}>{similar}</Section>}
        </div>
    );
}