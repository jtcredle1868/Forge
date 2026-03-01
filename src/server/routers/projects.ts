// src/server/routers/projects.ts
import { z } from "zod";
import { protectedProcedure, createTRPCRouter } from "../trpc";
import { db } from "../db";
import { TRPCError } from "@trpc/server";

const projectInputSchema = z.object({
  title: z.string().min(1, "Title is required"),
  genre: z.string().optional(),
  targetWordCount: z.number().optional(),
});

export const projectsRouter = createTRPCRouter({
  list: protectedProcedure.query(async ({ ctx }) => {
    return db.project.findMany({
      where: {
        userId: ctx.user!.id,
        isArchived: false,
      },
      include: {
        chapters: {
          include: {
            scenes: true,
          },
        },
      },
      orderBy: { updatedAt: "desc" },
    });
  }),

  get: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const project = await db.project.findUnique({
        where: { id: input.id },
        include: {
          chapters: {
            include: {
              scenes: {
                include: {
                  document: true,
                },
              },
            },
            orderBy: { orderIndex: "asc" },
          },
          styleProfile: true,
        },
      });

      if (!project || project.userId !== ctx.user!.id) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Project not found",
        });
      }

      return project;
    }),

  create: protectedProcedure
    .input(projectInputSchema)
    .mutation(async ({ ctx, input }) => {
      return db.project.create({
        data: {
          title: input.title,
          genre: input.genre,
          targetWordCount: input.targetWordCount,
          userId: ctx.user!.id,
        },
      });
    }),

  update: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        data: projectInputSchema.partial(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const project = await db.project.findUnique({
        where: { id: input.id },
      });

      if (!project || project.userId !== ctx.user!.id) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Project not found",
        });
      }

      return db.project.update({
        where: { id: input.id },
        data: input.data,
      });
    }),

  archive: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const project = await db.project.findUnique({
        where: { id: input.id },
      });

      if (!project || project.userId !== ctx.user!.id) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Project not found",
        });
      }

      return db.project.update({
        where: { id: input.id },
        data: { isArchived: true },
      });
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const project = await db.project.findUnique({
        where: { id: input.id },
      });

      if (!project || project.userId !== ctx.user!.id) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Project not found",
        });
      }

      await db.project.delete({
        where: { id: input.id },
      });
    }),
});
