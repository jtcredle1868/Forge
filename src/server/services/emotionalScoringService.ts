// src/server/services/emotionalScoringService.ts
// Emotional Scoring Engine — analyzes the emotional landscape of scenes

import Anthropic from "@anthropic-ai/sdk";

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

const EMOTIONAL_SCORING_CONSTRAINT = `
You are an emotional intelligence analyst for The Forge writing platform.
Your role is to analyze the emotional content and impact of prose scenes.

You score scenes across multiple emotional dimensions and identify the dominant emotional experience.
Your analysis helps authors understand the emotional arc and pacing of their manuscript.

Be accurate and nuanced. A love scene with underlying tension should score both romance AND tension.
A thriller scene may have moments of hope amid fear. Capture the full emotional landscape.

Return only valid JSON — no explanatory text outside the JSON.
`.trim();

export interface EmotionalScoreResult {
  tensionScore: number;
  romanceScore: number;
  actionScore: number;
  hopeScore: number;
  fearScore: number;
  sadnessScore: number;
  joyScore: number;
  overallIntensity: number;
  dominantEmotion: string;
  aiSummary: string;
}

export async function analyzeSceneEmotion(
  sceneText: string,
  sceneTitle: string,
  genre: string
): Promise<EmotionalScoreResult> {
  // Don't send full text if too long — use first 1500 words
  const truncated = sceneText.length > 8000 ? sceneText.slice(0, 8000) + "..." : sceneText;

  const prompt = `
SCENE: "${sceneTitle}"
GENRE: ${genre}

SCENE TEXT:
${truncated}

Analyze the emotional content of this scene. Score each dimension from 0-10 where:
- 0 = completely absent
- 5 = moderate presence
- 10 = dominant, overwhelming presence

Consider the full emotional experience a reader would have.

Return ONLY this JSON structure:
{
  "tensionScore": [0-10 float],
  "romanceScore": [0-10 float],
  "actionScore": [0-10 float],
  "hopeScore": [0-10 float],
  "fearScore": [0-10 float],
  "sadnessScore": [0-10 float],
  "joyScore": [0-10 float],
  "overallIntensity": [0-10 float — aggregate emotional weight],
  "dominantEmotion": [single word: "tension", "romance", "action", "hope", "fear", "sadness", "joy", "conflict", "anticipation", "grief", "love", "neutral"],
  "aiSummary": [2-3 sentences describing the emotional landscape and how it serves the story]
}
`.trim();

  const message = await anthropic.messages.create({
    model: process.env.ANTHROPIC_MODEL ?? "claude-sonnet-4-6",
    max_tokens: 512,
    system: EMOTIONAL_SCORING_CONSTRAINT,
    messages: [{ role: "user", content: prompt }],
  });

  const responseText =
    message.content[0].type === "text" ? message.content[0].text : "";

  try {
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error("No JSON");

    const parsed = JSON.parse(jsonMatch[0]) as EmotionalScoreResult;
    return {
      tensionScore: clamp(parsed.tensionScore ?? 0),
      romanceScore: clamp(parsed.romanceScore ?? 0),
      actionScore: clamp(parsed.actionScore ?? 0),
      hopeScore: clamp(parsed.hopeScore ?? 0),
      fearScore: clamp(parsed.fearScore ?? 0),
      sadnessScore: clamp(parsed.sadnessScore ?? 0),
      joyScore: clamp(parsed.joyScore ?? 0),
      overallIntensity: clamp(parsed.overallIntensity ?? 5),
      dominantEmotion: parsed.dominantEmotion ?? "neutral",
      aiSummary: parsed.aiSummary ?? "Emotional analysis complete.",
    };
  } catch {
    return getDefaultEmotionalScore();
  }
}

function clamp(value: number, min = 0, max = 10): number {
  return Math.max(min, Math.min(max, value));
}

function getDefaultEmotionalScore(): EmotionalScoreResult {
  return {
    tensionScore: 5,
    romanceScore: 0,
    actionScore: 3,
    hopeScore: 5,
    fearScore: 3,
    sadnessScore: 2,
    joyScore: 3,
    overallIntensity: 5,
    dominantEmotion: "neutral",
    aiSummary: "Analysis could not be completed. Please try again.",
  };
}

export function buildEmotionalArcData(
  scenes: Array<{
    id: string;
    title: string;
    orderIndex: number;
    chapterTitle: string;
    emotionalScore: EmotionalScoreResult | null;
  }>
) {
  return scenes.map((scene, index) => ({
    sceneIndex: index + 1,
    sceneId: scene.id,
    title: scene.title,
    chapterTitle: scene.chapterTitle,
    tension: scene.emotionalScore?.tensionScore ?? 0,
    romance: scene.emotionalScore?.romanceScore ?? 0,
    action: scene.emotionalScore?.actionScore ?? 0,
    hope: scene.emotionalScore?.hopeScore ?? 0,
    fear: scene.emotionalScore?.fearScore ?? 0,
    sadness: scene.emotionalScore?.sadnessScore ?? 0,
    joy: scene.emotionalScore?.joyScore ?? 0,
    intensity: scene.emotionalScore?.overallIntensity ?? 0,
    dominant: scene.emotionalScore?.dominantEmotion ?? "neutral",
  }));
}

export const EMOTION_COLORS = {
  tension: "#ef4444",     // red
  romance: "#ec4899",     // pink
  action: "#f97316",      // orange
  hope: "#10b981",        // emerald
  fear: "#8b5cf6",        // purple
  sadness: "#3b82f6",     // blue
  joy: "#f59e0b",         // amber
  intensity: "#f0f0f8",   // light (overall)
  neutral: "#6b7280",     // gray
  conflict: "#dc2626",    // dark red
  anticipation: "#d97706", // amber dark
  grief: "#1e40af",       // dark blue
  love: "#be185d",        // deep pink
} as const;
