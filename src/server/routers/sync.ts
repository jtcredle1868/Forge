// src/server/routers/sync.ts
import { z } from "zod";
import { protectedProcedure, createTRPCRouter } from "../trpc";
import { db } from "../db";
import { TRPCError } from "@trpc/server";

export const syncRouter = createTRPCRouter({
  connectGoogleDrive: protectedProcedure
    .input(
      z.object({
        projectId: z.string(),
        driveAuthCode: z.string(),
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

      // TODO: Exchange auth code for access token via Google API
      // For now, create a placeholder sync record

      return db.googleDriveSync.upsert({
        where: { projectId: input.projectId },
        create: {
          projectId: input.projectId,
          driveFileId: `drive-${input.projectId}`,
          syncStatus: "IDLE",
        },
        update: {
          syncStatus: "IDLE",
        },
      });
    }),

  syncNow: protectedProcedure
    .input(z.object({ projectId: z.string() }))
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

      const sync = await db.googleDriveSync.findUnique({
        where: { projectId: input.projectId },
      });

      if (!sync) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Google Drive sync not configured",
        });
      }

      // Update sync status to SYNCING
      await db.googleDriveSync.update({
        where: { projectId: input.projectId },
        data: { syncStatus: "SYNCING" },
      });

      // TODO: Implement actual Google Drive sync logic

      return db.googleDriveSync.update({
        where: { projectId: input.projectId },
        data: {
          syncStatus: "IDLE",
          lastSyncedAt: new Date(),
        },
      });
    }),

  getSyncStatus: protectedProcedure
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

      const sync = await db.googleDriveSync.findUnique({
        where: { projectId: input.projectId },
      });

      if (!sync) {
        return null;
      }

      return sync;
    }),

  disconnect: protectedProcedure
    .input(z.object({ projectId: z.string() }))
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

      await db.googleDriveSync.deleteMany({
        where: { projectId: input.projectId },
      });
    }),
});
