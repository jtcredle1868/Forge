// src/server/routers/documents.ts
import { z } from "zod";
import { protectedProcedure, createTRPCRouter } from "../trpc";
import { db } from "../db";
import { TRPCError } from "@trpc/server";

const countWords = (text: string): number => {
  return text.trim().split(/\s+/).length;
};

export const documentsRouter = createTRPCRouter({
  get: protectedProcedure
    .input(z.object({ sceneId: z.string() }))
    .query(async ({ ctx, input }) => {
      const document = await db.document.findUnique({
        where: { sceneId: input.sceneId },
        include: {
          scene: {
            include: {
              chapter: {
                include: {
                  project: true,
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

      // Verify user owns the project
      if (document.scene.chapter.project.userId !== ctx.user!.id) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Access denied",
        });
      }

      return document;
    }),

  save: protectedProcedure
    .input(
      z.object({
        sceneId: z.string(),
        content: z.unknown(), // TipTap JSON
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const document = await db.document.findUnique({
        where: { sceneId: input.sceneId },
        include: {
          scene: {
            include: {
              chapter: {
                include: {
                  project: true,
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

      // Verify user owns the project
      if (document.scene.chapter.project.userId !== ctx.user!.id) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Access denied",
        });
      }

      // Create version before updating
      await db.documentVersion.create({
        data: {
          documentId: document.id,
          content: document.content as any,
          wordCount: document.wordCount,
        },
      });

      // Update document
      return db.document.update({
        where: { id: document.id },
        data: {
          content: input.content as any,
          wordCount: countWords(JSON.stringify(input.content)),
        },
      });
    }),

  getVersions: protectedProcedure
    .input(z.object({ documentId: z.string() }))
    .query(async ({ ctx, input }) => {
      const document = await db.document.findUnique({
        where: { id: input.documentId },
        include: {
          scene: {
            include: {
              chapter: {
                include: {
                  project: true,
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

      return db.documentVersion.findMany({
        where: { documentId: input.documentId },
        orderBy: { createdAt: "desc" },
      });
    }),

  restoreVersion: protectedProcedure
    .input(z.object({ versionId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const version = await db.documentVersion.findUnique({
        where: { id: input.versionId },
        include: {
          document: {
            include: {
              scene: {
                include: {
                  chapter: {
                    include: {
                      project: true,
                    },
                  },
                },
              },
            },
          },
        },
      });

      if (!version) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Version not found",
        });
      }

      if (version.document.scene.chapter.project.userId !== ctx.user!.id) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Access denied",
        });
      }

      return db.document.update({
        where: { id: version.documentId },
        data: {
          content: version.content as any,
          wordCount: version.wordCount,
        },
      });
    }),

  getWordCount: protectedProcedure
    .input(z.object({ documentId: z.string() }))
    .query(async ({ ctx, input }) => {
      const document = await db.document.findUnique({
        where: { id: input.documentId },
        include: {
          scene: {
            include: {
              chapter: {
                include: {
                  project: true,
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

      return {
        total: document.wordCount,
        session: document.wordCount,
      };
    }),
});
