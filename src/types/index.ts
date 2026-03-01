// src/types/index.ts
import type { User } from "@prisma/client";

export type UserWithoutPassword = Omit<User, "passwordHash">;

export interface CoachingResponse {
  id: string;
  response: string;
  timestamp: Date;
}

export interface StyleConsistencyReport {
  styleProfile: unknown;
  findings: string[];
  overallScore: number;
}

export interface TemperatureCheckReport {
  metrics: {
    totalWords: number;
    sentenceCount: number;
    paragraphCount: number;
  };
  analysis: string;
}

export interface UsageSummary {
  tier: string;
  dailyCoachingRequests: number;
  monthlyCoachingRequests: number;
  dailyLimit: number | null;
}

export interface SyncResult {
  status: "idle" | "syncing" | "error";
  lastSyncedAt?: Date;
  error?: string;
}
