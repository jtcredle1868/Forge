// src/server/routers/emotional.ts
import { z } from "zod";
import { router, protectedProcedure } from "../trpc";
import { db } from "../db";
import { TRPCError } from "@trpc/server";
import { analyzeSceneEmotion, buildEmotionalArcData } from "../services/emotionalScoringService";

export const emotionalRouter = router({
  analyzeScene: protectedProcedure
    .input(z.object({
      sceneId: z.string(),
    }))
    .mutation(async ({ ctx, input }) => {
      const scene = await db.scene.findUnique({
        where: { id: input.sceneId },
        include: {
          document: true,
          chapter: {
            include: {
              project: { select: { userId: true, genre: true } },
            },
          },
        },
      });

      if (!scene || scene.chapter.project.userId !== ctx.user!.id) {
        throw new TRPCError({ code: "NOT_FOUND" });
      }

      if (!scene.document?.content) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Scene has no content to analyze.",
        });
      }

      // Extract plain text from TipTap JSON
      const plainText = extractTextFromTipTap(scene.document.content);
      if (plainText.length < 50) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Scene needs at least 50 characters to analyze.",
        });
      }

      const result = await analyzeSceneEmotion(
        plainText,
        scene.title,
        scene.chapter.project.genre ?? "fiction"
      );

      // Upsert emotional score
      const emotionalScore = await db.emotionalScore.upsert({
        where: { sceneId: input.sceneId },
        create: { sceneId: input.sceneId, ...result },
        update: { ...result, analyzedAt: new Date() },
      });

      return emotionalScore;
    }),

  getSceneScore: protectedProcedure
    .input(z.object({ sceneId: z.string() }))
    .query(async ({ ctx, input }) => {
      const scene = await db.scene.findUnique({
        where: { id: input.sceneId },
        include: {
          emotionalScore: true,
          chapter: { include: { project: { select: { userId: true } } } },
        },
      });
      if (!scene || scene.chapter.project.userId !== ctx.user!.id) {
        throw new TRPCError({ code: "NOT_FOUND" });
      }
      return scene.emotionalScore;
    }),

  getProjectArc: protectedProcedure
    .input(z.object({ projectId: z.string() }))
    .query(async ({ ctx, input }) => {
      const project = await db.project.findUnique({
        where: { id: input.projectId, userId: ctx.user!.id },
        include: {
          chapters: {
            orderBy: { orderIndex: "asc" },
            include: {
              scenes: {
                orderBy: { orderIndex: "asc" },
                include: { emotionalScore: true },
              },
            },
          },
        },
      });

      if (!project) throw new TRPCError({ code: "NOT_FOUND" });

      const scenes = project.chapters.flatMap((ch) =>
        ch.scenes.map((sc) => ({
          id: sc.id,
          title: sc.title,
          orderIndex: sc.orderIndex,
          chapterTitle: ch.title,
          emotionalScore: sc.emotionalScore
            ? {
                tensionScore: sc.emotionalScore.tensionScore,
                romanceScore: sc.emotionalScore.romanceScore,
                actionScore: sc.emotionalScore.actionScore,
                hopeScore: sc.emotionalScore.hopeScore,
                fearScore: sc.emotionalScore.fearScore,
                sadnessScore: sc.emotionalScore.sadnessScore,
                joyScore: sc.emotionalScore.joyScore,
                overallIntensity: sc.emotionalScore.overallIntensity,
                dominantEmotion: sc.emotionalScore.dominantEmotion,
                aiSummary: sc.emotionalScore.aiSummary ?? "",
              }
            : null,
        }))
      );

      return buildEmotionalArcData(scenes);
    }),

  analyzeAllUnscored: protectedProcedure
    .input(z.object({ projectId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const project = await db.project.findUnique({
        where: { id: input.projectId, userId: ctx.user!.id },
      });
      if (!project) throw new TRPCError({ code: "NOT_FOUND" });

      // Find scenes without emotional scores that have content
      const scenes = await db.scene.findMany({
        where: {
          chapter: { projectId: input.projectId },
          emotionalScore: null,
          document: { wordCount: { gt: 10 } },
        },
        include: {
          document: true,
          chapter: { include: { project: { select: { genre: true } } } },
        },
        take: 10, // Process max 10 at a time
      });

      const results = [];
      for (const scene of scenes) {
        if (!scene.document?.content) continue;
        const plainText = extractTextFromTipTap(scene.document.content);
        if (plainText.length < 50) continue;

        const result = await analyzeSceneEmotion(
          plainText,
          scene.title,
          scene.chapter.project.genre ?? "fiction"
        );

        await db.emotionalScore.create({
          data: { sceneId: scene.id, ...result },
        });

        results.push({ sceneId: scene.id, ...result });
      }

      return { analyzed: results.length, results };
    }),
});

// Extract plain text from TipTap JSON content
function extractTextFromTipTap(content: unknown): string {
  if (typeof content === "string") return content;

  const node = content as {
    type?: string;
    text?: string;
    content?: unknown[];
  };

  if (node.type === "text" && node.text) {
    return node.text;
  }

  if (node.content && Array.isArray(node.content)) {
    return node.content.map(extractTextFromTipTap).join(" ");
  }

  return "";
}
