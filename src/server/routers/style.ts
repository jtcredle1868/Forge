// src/server/routers/style.ts
import { z } from "zod";
import { protectedProcedure, createTRPCRouter } from "../trpc";
import { db } from "../db";
import { TRPCError } from "@trpc/server";

const styleProfileSchema = z.object({
  pov: z.enum(["FIRST", "SECOND", "THIRD_LIMITED", "THIRD_OMNISCIENT", "MULTIPLE"]),
  tense: z.enum(["PAST", "PRESENT", "MIXED"]),
  formality: z.enum(["LITERARY", "COMMERCIAL", "GENRE", "EXPERIMENTAL"]),
  customRules: z.array(
    z.object({
      rule: z.string(),
      example: z.string(),
    }),
  ).optional(),
});

export const styleRouter = createTRPCRouter({
  getProfile: protectedProcedure
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

      let profile = await db.styleProfile.findUnique({
        where: { projectId: input.projectId },
      });

      if (!profile) {
        profile = await db.styleProfile.create({
          data: {
            projectId: input.projectId,
            pov: "THIRD_LIMITED",
            tense: "PAST",
            formality: "LITERARY",
          },
        });
      }

      return profile;
    }),

  upsertProfile: protectedProcedure
    .input(
      z.object({
        projectId: z.string(),
        data: styleProfileSchema,
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

      const customRules = input.data.customRules
        ? { customRules: input.data.customRules }
        : {};

      return db.styleProfile.upsert({
        where: { projectId: input.projectId },
        create: {
          projectId: input.projectId,
          pov: input.data.pov,
          tense: input.data.tense,
          formality: input.data.formality,
          ...customRules,
        },
        update: {
          pov: input.data.pov,
          tense: input.data.tense,
          formality: input.data.formality,
          ...customRules,
        },
      });
    }),

  checkConsistency: protectedProcedure
    .input(
      z.object({
        documentId: z.string(),
        passage: z.string(),
      }),
    )
    .query(async ({ ctx, input }) => {
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
                    },
                  },
                },
              },
            },
          },
        },
      });

      if (!document || document.scene.chapter.project.userId !== ctx.user!.id) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Document not found",
        });
      }

      const styleProfile = document.scene.chapter.project.styleProfile;

      return {
        styleProfile,
        findings: [],
        overallScore: 85, // Placeholder
      };
    }),
});
