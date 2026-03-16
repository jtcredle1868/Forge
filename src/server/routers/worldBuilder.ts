// src/server/routers/worldBuilder.ts
import { z } from "zod";
import { Prisma } from "@prisma/client";
import { router, protectedProcedure } from "../trpc";
import { db } from "../db";
import { TRPCError } from "@trpc/server";

const worldElementTypes = [
  "SETTING", "RELATIONSHIP_MILESTONE", "TROPE", "CONFLICT",
  "PLOT_THREAD", "CLUE", "RED_HERRING", "REVELATION", "ANTAGONIST_ASSET", "STAKES",
  "MAGIC_RULE", "FACTION", "WORLD_HISTORY", "ARTIFACT",
  "TECHNOLOGY", "POLITICAL_SYSTEM", "SPECIES", "SCIENCE_RULE",
  "LOCATION", "TIMELINE_EVENT", "THEME",
] as const;

const worldElementInput = z.object({
  type: z.enum(worldElementTypes),
  name: z.string().min(1).max(200),
  description: z.string().max(5000).optional().nullable(),
  properties: z.record(z.unknown()).optional().nullable(),
  tags: z.array(z.string()).default([]),
  coverColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional().nullable(),
  orderIndex: z.number().int().default(0),
});

export const worldBuilderRouter = router({
  getElements: protectedProcedure
    .input(z.object({
      projectId: z.string(),
      type: z.enum(worldElementTypes).optional(),
    }))
    .query(async ({ ctx, input }) => {
      const project = await db.project.findUnique({
        where: { id: input.projectId, userId: ctx.user!.id },
      });
      if (!project) throw new TRPCError({ code: "NOT_FOUND" });

      return db.worldElement.findMany({
        where: {
          projectId: input.projectId,
          ...(input.type ? { type: input.type } : {}),
        },
        orderBy: [{ orderIndex: "asc" }, { createdAt: "asc" }],
      });
    }),

  createElement: protectedProcedure
    .input(z.object({ projectId: z.string(), data: worldElementInput }))
    .mutation(async ({ ctx, input }) => {
      const project = await db.project.findUnique({
        where: { id: input.projectId, userId: ctx.user!.id },
      });
      if (!project) throw new TRPCError({ code: "NOT_FOUND" });

      const { properties, ...rest } = input.data;
      return db.worldElement.create({
        data: {
          projectId: input.projectId,
          ...rest,
          ...(properties != null ? { properties: properties as Prisma.InputJsonValue } : {}),
        },
      });
    }),

  updateElement: protectedProcedure
    .input(z.object({ elementId: z.string(), data: worldElementInput.partial() }))
    .mutation(async ({ ctx, input }) => {
      const element = await db.worldElement.findUnique({
        where: { id: input.elementId },
        include: { project: { select: { userId: true } } },
      });
      if (!element || element.project.userId !== ctx.user!.id) {
        throw new TRPCError({ code: "NOT_FOUND" });
      }
      const { properties, ...rest } = input.data;
      return db.worldElement.update({
        where: { id: input.elementId },
        data: {
          ...rest,
          ...(properties != null ? { properties: properties as Prisma.InputJsonValue } : {}),
        },
      });
    }),

  deleteElement: protectedProcedure
    .input(z.object({ elementId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const element = await db.worldElement.findUnique({
        where: { id: input.elementId },
        include: { project: { select: { userId: true } } },
      });
      if (!element || element.project.userId !== ctx.user!.id) {
        throw new TRPCError({ code: "NOT_FOUND" });
      }
      await db.worldElement.delete({ where: { id: input.elementId } });
    }),

  // Relationship dynamics between characters
  getRelationships: protectedProcedure
    .input(z.object({ projectId: z.string() }))
    .query(async ({ ctx, input }) => {
      const project = await db.project.findUnique({
        where: { id: input.projectId, userId: ctx.user!.id },
      });
      if (!project) throw new TRPCError({ code: "NOT_FOUND" });

      return db.relationshipDynamic.findMany({
        where: { projectId: input.projectId },
        include: {
          characterA: { select: { id: true, name: true, role: true, avatarColor: true } },
          characterB: { select: { id: true, name: true, role: true, avatarColor: true } },
        },
      });
    }),

  upsertRelationship: protectedProcedure
    .input(z.object({
      projectId: z.string(),
      characterAId: z.string(),
      characterBId: z.string(),
      relationshipType: z.string(),
      currentStage: z.string().optional(),
      tensionScore: z.number().min(0).max(10).default(5),
      connectionScore: z.number().min(0).max(10).default(5),
      notes: z.string().max(2000).optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const project = await db.project.findUnique({
        where: { id: input.projectId, userId: ctx.user!.id },
      });
      if (!project) throw new TRPCError({ code: "NOT_FOUND" });

      const existing = await db.relationshipDynamic.findFirst({
        where: {
          projectId: input.projectId,
          OR: [
            { characterAId: input.characterAId, characterBId: input.characterBId },
            { characterAId: input.characterBId, characterBId: input.characterAId },
          ],
        },
      });

      if (existing) {
        return db.relationshipDynamic.update({
          where: { id: existing.id },
          data: {
            relationshipType: input.relationshipType,
            currentStage: input.currentStage,
            tensionScore: input.tensionScore,
            connectionScore: input.connectionScore,
            notes: input.notes,
          },
          include: {
            characterA: { select: { id: true, name: true, role: true, avatarColor: true } },
            characterB: { select: { id: true, name: true, role: true, avatarColor: true } },
          },
        });
      }

      return db.relationshipDynamic.create({
        data: {
          projectId: input.projectId,
          characterAId: input.characterAId,
          characterBId: input.characterBId,
          relationshipType: input.relationshipType,
          currentStage: input.currentStage,
          tensionScore: input.tensionScore,
          connectionScore: input.connectionScore,
          notes: input.notes,
        },
        include: {
          characterA: { select: { id: true, name: true, role: true, avatarColor: true } },
          characterB: { select: { id: true, name: true, role: true, avatarColor: true } },
        },
      });
    }),
});
