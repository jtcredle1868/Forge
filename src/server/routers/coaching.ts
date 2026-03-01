// src/server/routers/coaching.ts
import { z } from "zod";
import { protectedProcedure, createTRPCRouter } from "../trpc";
import { db } from "../db";
import { TRPCError } from "@trpc/server";
import { buildPassageAnalysisPrompt } from "../services/aiCoachingService";
import { analyzePassageWithClaude } from "../services/aiCoachingService";

const focusAreasEnum = z.enum([
  "SENTENCE_RHYTHM",
  "SHOW_VS_TELL",
  "PACING",
  "WORD_ECONOMY",
  "DIALOGUE",
  "DESCRIPTION",
  "VOICE",
  "REVISION",
]);

export const coachingRouter = createTRPCRouter({
  analyzePassage: protectedProcedure
    .input(
      z.object({
        documentId: z.string(),
        selectedText: z.string().min(50).max(2000),
        intensity: z.enum(["LIGHT_TOUCH", "STANDARD", "DEEP_DIVE"]),
        focusAreas: z.array(focusAreasEnum).optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const document = await db.document.findUnique({
        where: { id: input.documentId },
        include: {
          scene: {
            include: {
              chapter: {
                include: {
                  project: {
                    include: {
                      styleProfile: true,
                      user: true,
                    },
                  },
                },
              },
            },
          },
        },
      });

      if (!document) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Document not found",
        });
      }

      if (document.scene.chapter.project.userId !== ctx.user!.id) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Access denied",
        });
      }

      // Check rate limit
      const user = await db.user.findUnique({
        where: { id: ctx.user!.id },
        include: { subscription: true },
      });

      const dailyCount = await db.aIInteraction.count({
        where: {
          userId: ctx.user!.id,
          createdAt: {
            gte: new Date(new Date().setHours(0, 0, 0, 0)),
          },
        },
      });

      if (user?.subscription?.tier === "FREE" && dailyCount >= 50) {
        throw new TRPCError({
          code: "TOO_MANY_REQUESTS",
          message: "Daily coaching limit reached for Free tier",
        });
      }

      // Build prompt and call Claude
      const project = document.scene.chapter.project;
      const prompt = buildPassageAnalysisPrompt({
        selectedText: input.selectedText,
        projectContext: {
          genre: project.genre || "General Fiction",
          pov: project.styleProfile?.pov || "THIRD_LIMITED",
          tense: project.styleProfile?.tense || "PAST",
          formality: project.styleProfile?.formality || "LITERARY",
        },
        intensity: input.intensity,
        focusAreas: input.focusAreas || [],
      });

      const response = await analyzePassageWithClaude(prompt);

      // Log interaction
      const interaction = await db.aIInteraction.create({
        data: {
          userId: ctx.user!.id,
          projectId: project.id,
          documentId: input.documentId,
          requestType: "PASSAGE_ANALYSIS",
          requestText: input.selectedText,
          responseText: response,
          feedbackIntensity: input.intensity,
        },
      });

      return {
        id: interaction.id,
        response,
        timestamp: interaction.createdAt,
      };
    }),

  craftQA: protectedProcedure
    .input(
      z.object({
        projectId: z.string(),
        question: z.string().min(10),
        context: z.string().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const project = await db.project.findUnique({
        where: { id: input.projectId },
      });

      if (!project || project.userId !== ctx.user!.id) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Project not found",
        });
      }

      const prompt = `
You are a prose coach for The Forge writing platform. Answer the author's craft question with observations and guidance.

Project Context:
- Genre: ${project.genre || "General Fiction"}
- Title: ${project.title}

Author's Question:
${input.question}

${input.context ? `Context passage:\n"""${input.context}"""` : ""}

Provide a thoughtful response that helps the author think about their craft. Observe patterns, ask questions that promote thinking, and reference specific craft principles. Never rewrite or generate prose.
      `.trim();

      const response = await analyzePassageWithClaude(prompt);

      await db.aIInteraction.create({
        data: {
          userId: ctx.user!.id,
          projectId: input.projectId,
          requestType: "CRAFT_QA",
          requestText: input.question,
          responseText: response,
          feedbackIntensity: "STANDARD",
        },
      });

      return { response };
    }),

  temperatureCheck: protectedProcedure
    .input(z.object({ chapterId: z.string() }))
    .query(async ({ ctx, input }) => {
      const chapter = await db.chapter.findUnique({
        where: { id: input.chapterId },
        include: {
          project: true,
          scenes: {
            include: {
              document: true,
            },
          },
        },
      });

      if (!chapter || chapter.project.userId !== ctx.user!.id) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Chapter not found",
        });
      }

      // Calculate metrics from all scenes in chapter
      const metrics = {
        totalWords: 0,
        sentenceCount: 0,
        paragraphCount: 0,
      };

      chapter.scenes.forEach((scene) => {
        if (scene.document?.wordCount) {
          metrics.totalWords += scene.document.wordCount;
        }
      });

      return {
        metrics,
        analysis: "Temperature check requires AI analysis - call analyzeTemperature",
      };
    }),

  getInteractions: protectedProcedure
    .input(z.object({ projectId: z.string() }))
    .query(async ({ ctx, input }) => {
      const project = await db.project.findUnique({
        where: { id: input.projectId },
      });

      if (!project || project.userId !== ctx.user!.id) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Project not found",
        });
      }

      return db.aIInteraction.findMany({
        where: {
          projectId: input.projectId,
          userId: ctx.user!.id,
        },
        orderBy: { createdAt: "desc" },
        take: 50,
      });
    }),

  dismissInteraction: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const interaction = await db.aIInteraction.findUnique({
        where: { id: input.id },
      });

      if (!interaction || interaction.userId !== ctx.user!.id) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Interaction not found",
        });
      }

      return db.aIInteraction.update({
        where: { id: input.id },
        data: { dismissed: true },
      });
    }),

  acknowledgeInteraction: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const interaction = await db.aIInteraction.findUnique({
        where: { id: input.id },
      });

      if (!interaction || interaction.userId !== ctx.user!.id) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Interaction not found",
        });
      }

      return db.aIInteraction.update({
        where: { id: input.id },
        data: { acknowledged: true },
      });
    }),

  flagInteraction: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const interaction = await db.aIInteraction.findUnique({
        where: { id: input.id },
      });

      if (!interaction || interaction.userId !== ctx.user!.id) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Interaction not found",
        });
      }

      return db.aIInteraction.update({
        where: { id: input.id },
        data: { flagged: true },
      });
    }),
});
