// src/lib/constants.ts

export const APP_NAME = "The Forge";
export const APP_TAGLINE = "Where Perfect Prose Begins";
export const APP_DESCRIPTION = "AI-powered writing coaching and manuscript management";

export const COACHING_DAILY_LIMITS = {
  FREE: 50,
  PRO: Infinity,
  STUDIO: Infinity,
};

export const MAX_COACHING_SELECTION_LENGTH = 2000;
export const MIN_COACHING_SELECTION_LENGTH = 50;

export const MAX_VERSION_HISTORY = {
  FREE: 30,
  PRO: 100,
  STUDIO: Infinity,
};

export const FOCUS_AREAS = [
  "SENTENCE_RHYTHM",
  "SHOW_VS_TELL",
  "PACING",
  "WORD_ECONOMY",
  "DIALOGUE",
  "DESCRIPTION",
  "VOICE",
  "REVISION",
] as const;

export const POV_OPTIONS = [
  { value: "FIRST", label: "First Person" },
  { value: "SECOND", label: "Second Person" },
  { value: "THIRD_LIMITED", label: "Third Person Limited" },
  { value: "THIRD_OMNISCIENT", label: "Third Person Omniscient" },
  { value: "MULTIPLE", label: "Multiple" },
] as const;

export const TENSE_OPTIONS = [
  { value: "PAST", label: "Past Tense" },
  { value: "PRESENT", label: "Present Tense" },
  { value: "MIXED", label: "Mixed" },
] as const;

export const FORMALITY_OPTIONS = [
  { value: "LITERARY", label: "Literary" },
  { value: "COMMERCIAL", label: "Commercial" },
  { value: "GENRE", label: "Genre" },
  { value: "EXPERIMENTAL", label: "Experimental" },
] as const;

export const PROJECT_STATUS_OPTIONS = [
  { value: "DRAFTING", label: "Drafting" },
  { value: "REVISING", label: "Revising" },
  { value: "COMPLETE", label: "Complete" },
  { value: "ON_HOLD", label: "On Hold" },
] as const;

export const FEEDBACK_INTENSITY_OPTIONS = [
  { value: "LIGHT_TOUCH", label: "Light Touch" },
  { value: "STANDARD", label: "Standard" },
  { value: "DEEP_DIVE", label: "Deep Dive" },
] as const;

export const STRIPE_PRICES = {
  PRO: process.env.NEXT_PUBLIC_STRIPE_PRICE_ID_PRO || "",
  STUDIO: process.env.NEXT_PUBLIC_STRIPE_PRICE_ID_STUDIO || "",
} as const;
