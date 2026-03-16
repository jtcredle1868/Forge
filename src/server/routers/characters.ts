// src/server/routers/characters.ts
import { z } from "zod";
import { router, protectedProcedure } from "../trpc";
import { db } from "../db";
import { TRPCError } from "@trpc/server";
import { checkDialogueVoice, analyzeCharacterArcAlignment } from "../services/characterVoiceService";

const characterInputSchema = z.object({
  name: z.string().min(1).max(100),
  role: z.enum(["PROTAGONIST", "ANTAGONIST", "SUPPORTING", "MINOR", "MENTOR", "LOVE_INTEREST"]).default("SUPPORTING"),
  age: z.number().int().min(0).max(150).optional().nullable(),
  background: z.string().max(2000).optional().nullable(),
  motivation: z.string().max(1000).optional().nullable(),
  internalConflict: z.string().max(1000).optional().nullable(),
  externalConflict: z.string().max(1000).optional().nullable(),
  educationLevel: z.enum(["NONE","ELEMENTARY","HIGH_SCHOOL","SOME_COLLEGE","BACHELORS","GRADUATE","DOCTORAL","SELF_TAUGHT"]).optional().nullable(),
  region: z.string().max(200).optional().nullable(),
  socialClass: z.string().max(200).optional().nullable(),
  speakingStyle: z.string().max(1000).optional().nullable(),
  vocabularyNotes: z.string().max(1000).optional().nullable(),
  verbalTics: z.string().max(500).optional().nullable(),
  sampleDialogue: z.string().max(3000).optional().nullable(),
  startingState: z.string().max(1000).optional().nullable(),
  endGoalState: z.string().max(1000).optional().nullable(),
  arcNotes: z.string().max(2000).optional().nullable(),
  avatarColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional().nullable(),
});

export const charactersRouter = router({
  list: protectedProcedure
    .input(z.object({ projectId: z.string() }))
    .query(async ({ ctx, input }) => {
      const project = await db.project.findUnique({
        where: { id: input.projectId, userId: ctx.user!.id },
      });
      if (!project) throw new TRPCError({ code: "NOT_FOUND" });

      return db.character.findMany({
        where: { projectId: input.projectId },
        include: {
          traits: true,
          arcMilestones: { orderBy: { orderIndex: "asc" } },
          appearances: { include: { scene: { include: { chapter: true } } } },
          _count: { select: { voiceChecks: true } },
        },
        orderBy: [{ role: "asc" }, { name: "asc" }],
      });
    }),

  get: protectedProcedure
    .input(z.object({ characterId: z.string() }))
    .query(async ({ ctx, input }) => {
      const character = await db.character.findUnique({
        where: { id: input.characterId },
        include: {
          traits: true,
          arcMilestones: { orderBy: { orderIndex: "asc" } },
          appearances: {
            include: { scene: { include: { chapter: true } } },
          },
          voiceChecks: { orderBy: { createdAt: "desc" }, take: 10 },
          project: { select: { userId: true } },
        },
      });

      if (!character || character.project.userId !== ctx.user!.id) {
        throw new TRPCError({ code: "NOT_FOUND" });
      }

      return character;
    }),

  create: protectedProcedure
    .input(z.object({ projectId: z.string(), data: characterInputSchema }))
    .mutation(async ({ ctx, input }) => {
      const project = await db.project.findUnique({
        where: { id: input.projectId, userId: ctx.user!.id },
      });
      if (!project) throw new TRPCError({ code: "NOT_FOUND" });

      return db.character.create({
        data: { ...input.data, projectId: input.projectId },
        include: { traits: true, arcMilestones: true },
      });
    }),

  update: protectedProcedure
    .input(z.object({ characterId: z.string(), data: characterInputSchema.partial() }))
    .mutation(async ({ ctx, input }) => {
      const character = await db.character.findUnique({
        where: { id: input.characterId },
        include: { project: { select: { userId: true } } },
      });
      if (!character || character.project.userId !== ctx.user!.id) {
        throw new TRPCError({ code: "NOT_FOUND" });
      }
      return db.character.update({
        where: { id: input.characterId },
        data: input.data,
        include: { traits: true, arcMilestones: true },
      });
    }),

  delete: protectedProcedure
    .input(z.object({ characterId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const character = await db.character.findUnique({
        where: { id: input.characterId },
        include: { project: { select: { userId: true } } },
      });
      if (!character || character.project.userId !== ctx.user!.id) {
        throw new TRPCError({ code: "NOT_FOUND" });
      }
      await db.character.delete({ where: { id: input.characterId } });
    }),

  addTrait: protectedProcedure
    .input(z.object({ characterId: z.string(), trait: z.string(), isStrength: z.boolean().default(true) }))
    .mutation(async ({ ctx, input }) => {
      const character = await db.character.findUnique({
        where: { id: input.characterId },
        include: { project: { select: { userId: true } } },
      });
      if (!character || character.project.userId !== ctx.user!.id) {
        throw new TRPCError({ code: "NOT_FOUND" });
      }
      return db.characterTrait.create({
        data: { characterId: input.characterId, trait: input.trait, isStrength: input.isStrength },
      });
    }),

  removeTrait: protectedProcedure
    .input(z.object({ traitId: z.string() }))
    .mutation(async (_opts) => {
      return db.characterTrait.delete({ where: { id: _opts.input.traitId } });
    }),

  addArcMilestone: protectedProcedure
    .input(z.object({
      characterId: z.string(),
      title: z.string(),
      description: z.string(),
      orderIndex: z.number().int(),
      chapterId: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const character = await db.character.findUnique({
        where: { id: input.characterId },
        include: { project: { select: { userId: true } } },
      });
      if (!character || character.project.userId !== ctx.user!.id) {
        throw new TRPCError({ code: "NOT_FOUND" });
      }
      return db.characterArcMilestone.create({
        data: {
          characterId: input.characterId,
          title: input.title,
          description: input.description,
          orderIndex: input.orderIndex,
          chapterId: input.chapterId,
        },
      });
    }),

  toggleMilestone: protectedProcedure
    .input(z.object({ milestoneId: z.string(), isCompleted: z.boolean() }))
    .mutation(async ({ input }) => {
      return db.characterArcMilestone.update({
        where: { id: input.milestoneId },
        data: { isCompleted: input.isCompleted },
      });
    }),

  // THE WOW FEATURE
  checkDialogueVoice: protectedProcedure
    .input(z.object({
      characterId: z.string(),
      dialogueText: z.string().min(10).max(3000),
      sceneId: z.string().optional(),
      sceneContext: z.string().max(500).optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const character = await db.character.findUnique({
        where: { id: input.characterId },
        include: { project: { select: { userId: true, genre: true } } },
      });
      if (!character || character.project.userId !== ctx.user!.id) {
        throw new TRPCError({ code: "NOT_FOUND" });
      }

      const result = await checkDialogueVoice(
        input.dialogueText,
        {
          name: character.name,
          role: character.role,
          age: character.age,
          background: character.background,
          motivation: character.motivation,
          educationLevel: character.educationLevel,
          region: character.region,
          socialClass: character.socialClass,
          speakingStyle: character.speakingStyle,
          vocabularyNotes: character.vocabularyNotes,
          verbalTics: character.verbalTics,
          sampleDialogue: character.sampleDialogue,
          startingState: character.startingState,
        },
        input.sceneContext
      );

      await db.dialogueVoiceCheck.create({
        data: {
          characterId: input.characterId,
          sceneId: input.sceneId,
          selectedText: input.dialogueText,
          authenticityScore: result.authenticityScore,
          observations: JSON.stringify(result.observations),
          suggestions: JSON.stringify(result.voiceGuidance),
          craftQuestions: JSON.stringify(result.craftQuestions),
          isAuthentic: result.isAuthentic,
        },
      });

      await db.aIInteraction.create({
        data: {
          userId: ctx.user!.id,
          projectId: character.projectId,
          requestType: "VOICE_CHECK",
          requestText: input.dialogueText,
          responseText: JSON.stringify(result),
          feedbackIntensity: "STANDARD",
        },
      });

      return result;
    }),

  checkArcAlignment: protectedProcedure
    .input(z.object({
      characterId: z.string(),
      sceneText: z.string().min(50).max(5000),
      arcPosition: z.string(),
    }))
    .mutation(async ({ ctx, input }) => {
      const character = await db.character.findUnique({
        where: { id: input.characterId },
        include: {
          arcMilestones: { orderBy: { orderIndex: "asc" } },
          project: { select: { userId: true } },
        },
      });
      if (!character || character.project.userId !== ctx.user!.id) {
        throw new TRPCError({ code: "NOT_FOUND" });
      }

      return analyzeCharacterArcAlignment(
        input.sceneText,
        {
          name: character.name,
          role: character.role,
          age: character.age,
          background: character.background,
          motivation: character.motivation,
          educationLevel: character.educationLevel,
          region: character.region,
          socialClass: character.socialClass,
          speakingStyle: character.speakingStyle,
          vocabularyNotes: character.vocabularyNotes,
          verbalTics: character.verbalTics,
          sampleDialogue: character.sampleDialogue,
          startingState: character.startingState,
          endGoalState: character.endGoalState,
        },
        input.arcPosition,
        character.arcMilestones
      );
    }),

  getVoiceHistory: protectedProcedure
    .input(z.object({ characterId: z.string() }))
    .query(async ({ ctx, input }) => {
      const character = await db.character.findUnique({
        where: { id: input.characterId },
        include: { project: { select: { userId: true } } },
      });
      if (!character || character.project.userId !== ctx.user!.id) {
        throw new TRPCError({ code: "NOT_FOUND" });
      }
      return db.dialogueVoiceCheck.findMany({
        where: { characterId: input.characterId },
        orderBy: { createdAt: "desc" },
        take: 20,
      });
    }),

  setAppearance: protectedProcedure
    .input(z.object({
      characterId: z.string(),
      sceneId: z.string(),
      appearanceRole: z.string().optional(),
      notes: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const character = await db.character.findUnique({
        where: { id: input.characterId },
        include: { project: { select: { userId: true } } },
      });
      if (!character || character.project.userId !== ctx.user!.id) {
        throw new TRPCError({ code: "NOT_FOUND" });
      }
      return db.characterAppearance.upsert({
        where: { characterId_sceneId: { characterId: input.characterId, sceneId: input.sceneId } },
        create: { characterId: input.characterId, sceneId: input.sceneId, appearanceRole: input.appearanceRole, notes: input.notes },
        update: { appearanceRole: input.appearanceRole, notes: input.notes },
      });
    }),
});
