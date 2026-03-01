// src/lib/validations.ts
import { z } from "zod";

export const projectSchema = z.object({
  title: z.string().min(1, "Title is required").max(200),
  genre: z.string().optional(),
  targetWordCount: z.number().positive().optional(),
});

export const chapterSchema = z.object({
  title: z.string().min(1).max(200),
  orderIndex: z.number().nonnegative(),
});

export const sceneSchema = z.object({
  title: z.string().min(1).max(200),
  orderIndex: z.number().nonnegative(),
});

export const documentSchema = z.object({
  content: z.unknown(), // TipTap JSON
});

export const styleProfileSchema = z.object({
  pov: z.enum(["FIRST", "SECOND", "THIRD_LIMITED", "THIRD_OMNISCIENT", "MULTIPLE"]),
  tense: z.enum(["PAST", "PRESENT", "MIXED"]),
  formality: z.enum(["LITERARY", "COMMERCIAL", "GENRE", "EXPERIMENTAL"]),
  customRules: z
    .array(
      z.object({
        rule: z.string(),
        example: z.string(),
      }),
    )
    .optional(),
});

export const coachingInputSchema = z.object({
  selectedText: z
    .string()
    .min(50, "Selection must be at least 50 words")
    .max(2000, "Selection cannot exceed 2000 words"),
  intensity: z.enum(["LIGHT_TOUCH", "STANDARD", "DEEP_DIVE"]),
  focusAreas: z
    .array(
      z.enum([
        "SENTENCE_RHYTHM",
        "SHOW_VS_TELL",
        "PACING",
        "WORD_ECONOMY",
        "DIALOGUE",
        "DESCRIPTION",
        "VOICE",
        "REVISION",
      ]),
    )
    .optional(),
});

export const userPreferencesSchema = z.object({
  genre: z.string().optional(),
  feedbackIntensity: z.enum(["LIGHT_TOUCH", "STANDARD", "DEEP_DIVE"]),
});

export type ProjectInput = z.infer<typeof projectSchema>;
export type ChapterInput = z.infer<typeof chapterSchema>;
export type SceneInput = z.infer<typeof sceneSchema>;
export type DocumentInput = z.infer<typeof documentSchema>;
export type StyleProfileInput = z.infer<typeof styleProfileSchema>;
export type CoachingInput = z.infer<typeof coachingInputSchema>;
export type UserPreferences = z.infer<typeof userPreferencesSchema>;
