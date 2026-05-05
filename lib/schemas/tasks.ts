
import { z } from "zod";

// ─── Zod schema ───────────────────────────────────────────────────────────────

export const CreateTaskSchema = z.object({
    title: z
        .string()
        .min(5, "Title must be at least 5 characters")
        .max(120, "Title must be under 120 characters"),

    description: z
        .string()
        .min(20, "Description must be at least 20 characters")
        .max(2000, "Description must be under 2000 characters"),

    budget: z
        .number()
        .positive("Budget must be greater than 0")
        .max(1_000_000, "Budget seems too high"),

    category: z
        .string()
        .min(1, "Please select a category"),

    estimatedHours: z
        .number()
        .positive("Hours must be greater than 0")
        .max(1000, "Estimated hours seems too high")
        .optional(),

    deadline: z
        .string()
        .optional()
        .refine(
            (val) => !val || new Date(val) > new Date(),
            "Deadline must be in the future"
        ),

    address: z
        .string()
        .min(5, "Please select a valid location from the map"),

    longitude: z
        .number()
        .min(-180)
        .max(180),

    latitude: z
        .number()
        .min(-90)
        .max(90),
});

export type CreateTaskInput = z.infer<typeof CreateTaskSchema>;