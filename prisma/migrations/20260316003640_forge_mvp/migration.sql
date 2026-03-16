-- CreateEnum
CREATE TYPE "SceneType" AS ENUM ('NARRATIVE', 'DIALOGUE', 'ACTION', 'INTROSPECTION', 'TRANSITION');

-- CreateEnum
CREATE TYPE "CharacterRole" AS ENUM ('PROTAGONIST', 'ANTAGONIST', 'SUPPORTING', 'MINOR', 'MENTOR', 'LOVE_INTEREST');

-- CreateEnum
CREATE TYPE "EducationLevel" AS ENUM ('NONE', 'ELEMENTARY', 'HIGH_SCHOOL', 'SOME_COLLEGE', 'BACHELORS', 'GRADUATE', 'DOCTORAL', 'SELF_TAUGHT');

-- CreateEnum
CREATE TYPE "WorldElementType" AS ENUM ('SETTING', 'RELATIONSHIP_MILESTONE', 'TROPE', 'CONFLICT', 'PLOT_THREAD', 'CLUE', 'RED_HERRING', 'REVELATION', 'ANTAGONIST_ASSET', 'STAKES', 'MAGIC_RULE', 'FACTION', 'WORLD_HISTORY', 'ARTIFACT', 'TECHNOLOGY', 'POLITICAL_SYSTEM', 'SPECIES', 'SCIENCE_RULE', 'LOCATION', 'TIMELINE_EVENT', 'THEME');

-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "AIRequestType" ADD VALUE 'VOICE_CHECK';
ALTER TYPE "AIRequestType" ADD VALUE 'EMOTIONAL_SCORE';
ALTER TYPE "AIRequestType" ADD VALUE 'CHARACTER_ARC_CHECK';

-- AlterTable
ALTER TABLE "Chapter" ADD COLUMN     "summary" TEXT;

-- AlterTable
ALTER TABLE "Project" ADD COLUMN     "coverColor" TEXT,
ADD COLUMN     "subgenre" TEXT,
ADD COLUMN     "synopsis" TEXT;

-- AlterTable
ALTER TABLE "Scene" ADD COLUMN     "paceRating" INTEGER,
ADD COLUMN     "sceneType" "SceneType" NOT NULL DEFAULT 'NARRATIVE',
ADD COLUMN     "summary" TEXT;

-- CreateTable
CREATE TABLE "Character" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "role" "CharacterRole" NOT NULL DEFAULT 'SUPPORTING',
    "age" INTEGER,
    "background" TEXT,
    "motivation" TEXT,
    "internalConflict" TEXT,
    "externalConflict" TEXT,
    "educationLevel" "EducationLevel",
    "region" TEXT,
    "socialClass" TEXT,
    "speakingStyle" TEXT,
    "vocabularyNotes" TEXT,
    "verbalTics" TEXT,
    "sampleDialogue" TEXT,
    "startingState" TEXT,
    "endGoalState" TEXT,
    "arcNotes" TEXT,
    "avatarColor" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Character_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CharacterTrait" (
    "id" TEXT NOT NULL,
    "characterId" TEXT NOT NULL,
    "trait" TEXT NOT NULL,
    "isStrength" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "CharacterTrait_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CharacterArcMilestone" (
    "id" TEXT NOT NULL,
    "characterId" TEXT NOT NULL,
    "chapterId" TEXT,
    "sceneId" TEXT,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "orderIndex" INTEGER NOT NULL,
    "isCompleted" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CharacterArcMilestone_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CharacterAppearance" (
    "id" TEXT NOT NULL,
    "characterId" TEXT NOT NULL,
    "sceneId" TEXT NOT NULL,
    "appearanceRole" TEXT,
    "notes" TEXT,

    CONSTRAINT "CharacterAppearance_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RelationshipDynamic" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "characterAId" TEXT NOT NULL,
    "characterBId" TEXT NOT NULL,
    "relationshipType" TEXT NOT NULL,
    "currentStage" TEXT,
    "tensionScore" DOUBLE PRECISION NOT NULL DEFAULT 5,
    "connectionScore" DOUBLE PRECISION NOT NULL DEFAULT 5,
    "notes" TEXT,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RelationshipDynamic_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DialogueVoiceCheck" (
    "id" TEXT NOT NULL,
    "characterId" TEXT NOT NULL,
    "sceneId" TEXT,
    "selectedText" TEXT NOT NULL,
    "authenticityScore" DOUBLE PRECISION NOT NULL,
    "observations" TEXT NOT NULL,
    "suggestions" TEXT,
    "craftQuestions" TEXT,
    "isAuthentic" BOOLEAN NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DialogueVoiceCheck_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EmotionalScore" (
    "id" TEXT NOT NULL,
    "sceneId" TEXT NOT NULL,
    "tensionScore" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "romanceScore" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "actionScore" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "hopeScore" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "fearScore" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "sadnessScore" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "joyScore" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "overallIntensity" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "dominantEmotion" TEXT NOT NULL DEFAULT 'neutral',
    "aiSummary" TEXT,
    "analyzedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "EmotionalScore_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WorldElement" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "type" "WorldElementType" NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "properties" JSONB,
    "tags" TEXT[],
    "coverColor" TEXT,
    "orderIndex" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "WorldElement_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "CharacterAppearance_characterId_sceneId_key" ON "CharacterAppearance"("characterId", "sceneId");

-- CreateIndex
CREATE UNIQUE INDEX "EmotionalScore_sceneId_key" ON "EmotionalScore"("sceneId");

-- AddForeignKey
ALTER TABLE "Character" ADD CONSTRAINT "Character_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CharacterTrait" ADD CONSTRAINT "CharacterTrait_characterId_fkey" FOREIGN KEY ("characterId") REFERENCES "Character"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CharacterArcMilestone" ADD CONSTRAINT "CharacterArcMilestone_characterId_fkey" FOREIGN KEY ("characterId") REFERENCES "Character"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CharacterAppearance" ADD CONSTRAINT "CharacterAppearance_characterId_fkey" FOREIGN KEY ("characterId") REFERENCES "Character"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CharacterAppearance" ADD CONSTRAINT "CharacterAppearance_sceneId_fkey" FOREIGN KEY ("sceneId") REFERENCES "Scene"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RelationshipDynamic" ADD CONSTRAINT "RelationshipDynamic_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RelationshipDynamic" ADD CONSTRAINT "RelationshipDynamic_characterAId_fkey" FOREIGN KEY ("characterAId") REFERENCES "Character"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RelationshipDynamic" ADD CONSTRAINT "RelationshipDynamic_characterBId_fkey" FOREIGN KEY ("characterBId") REFERENCES "Character"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DialogueVoiceCheck" ADD CONSTRAINT "DialogueVoiceCheck_characterId_fkey" FOREIGN KEY ("characterId") REFERENCES "Character"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DialogueVoiceCheck" ADD CONSTRAINT "DialogueVoiceCheck_sceneId_fkey" FOREIGN KEY ("sceneId") REFERENCES "Scene"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EmotionalScore" ADD CONSTRAINT "EmotionalScore_sceneId_fkey" FOREIGN KEY ("sceneId") REFERENCES "Scene"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorldElement" ADD CONSTRAINT "WorldElement_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;
