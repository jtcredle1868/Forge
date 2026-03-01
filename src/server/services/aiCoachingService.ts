// src/server/services/aiCoachingService.ts
import Anthropic from "@anthropic-ai/sdk";
import type { FeedbackIntensity } from "@prisma/client";

const client = new Anthropic();

// CRITICAL: This constraint block must be present in every coaching prompt
const COACH_CONSTRAINT =
  `You are a prose coach for The Forge writing platform. Your role is to observe and comment on writing craft — you do NOT write prose, rewrite sentences, or generate story content under any circumstances.

Your responses must:
- Describe what you observe in the text (patterns, tendencies, effects)
- Ask questions that help the author think about their choices
- Reference specific craft principles (sentence rhythm, show vs. tell, pacing, word economy)
- Never provide a rewritten version of any sentence or passage
- Never complete an unfinished passage or fill in missing content
- Treat the author as the sole author of all prose

If the author explicitly asks you to rewrite something, respond: "The Forge is designed to help you write better, not to write for you. Here's what I observe about this passage: [observation]"`;

interface PassageAnalysisInput {
  selectedText: string;
  projectContext: {
    genre: string;
    pov: string;
    tense: string;
    formality: string;
  };
  intensity: FeedbackIntensity;
  focusAreas: string[];
}

export function buildPassageAnalysisPrompt(
  input: PassageAnalysisInput,
): string {
  const intensityInstructions: Record<FeedbackIntensity, string> = {
    LIGHT_TOUCH:
      "Identify 1-2 the most notable observations. Keep feedback brief and affirming.",
    STANDARD:
      "Identify 2-4 observations across the requested focus areas. Balance affirmation with constructive craft notes.",
    DEEP_DIVE:
      "Provide thorough analysis across all requested focus areas. Be specific about patterns and their effects on the reader experience.",
  };

  return `${COACH_CONSTRAINT}

PASSAGE FOR ANALYSIS:
"""
${input.selectedText}
"""

PROJECT CONTEXT:
- Genre: ${input.projectContext.genre}
- POV: ${input.projectContext.pov}
- Tense: ${input.projectContext.tense}
- Style register: ${input.projectContext.formality}

FOCUS AREAS: ${input.focusAreas.length > 0 ? input.focusAreas.join(", ") : "General prose craft"}
INTENSITY: ${intensityInstructions[input.intensity]}

Provide your coaching observations. Structure your response as:
1. What you observe (2-3 sentences per focus area)
2. A craft question for the author to consider
3. One specific element this passage does well

Remember: observe only, never rewrite.`;
}

export async function analyzePassageWithClaude(prompt: string): Promise<string> {
  try {
    const message = await client.messages.create({
      model: "claude-sonnet-4-6b",
      max_tokens: 1024,
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
    });

    const content = message.content[0];
    if (content.type === "text") {
      return content.text;
    }

    throw new Error("Unexpected response type from Claude API");
  } catch (error) {
    console.error("Error calling Claude API:", error);
    throw new Error("Failed to get coaching response");
  }
}

export interface TemperatureMetrics {
  wordCount: number;
  sentenceCount: number;
  avgWordsPerSentence: number;
  sentenceLengthVariance: number;
  shortSentenceRatio: number;
  longSentenceRatio: number;
  passiveVoiceEstimate: number;
  dialogueRatio: number;
  paragraphCount: number;
  avgWordsPerParagraph: number;
  uniqueWordRatio: number;
}

export function calculateTemperatureMetrics(text: string): TemperatureMetrics {
  // Basic metric calculations - placeholder implementation
  const words = text.trim().split(/\s+/);
  const wordCount = words.length;

  // Estimate sentence count (rough)
  const sentences = text.split(/[.!?]+/).filter((s) => s.trim().length > 0);
  const sentenceCount = sentences.length;

  const paragraphs = text.split(/\n\n+/).filter((p) => p.trim().length > 0);
  const paragraphCount = paragraphs.length;

  const avgWordsPerSentence = sentenceCount > 0 ? wordCount / sentenceCount : 0;
  const avgWordsPerParagraph =
    paragraphCount > 0 ? wordCount / paragraphCount : 0;

  // Estimate sentence length variance
  const sentenceLengths = sentences.map(
    (s) => s.trim().split(/\s+/).length,
  );
  const variance =
    sentenceLengths.length > 0
      ? sentenceLengths.reduce(
          (sum, len) => sum + Math.pow(len - avgWordsPerSentence, 2),
          0,
        ) / sentenceLengths.length
      : 0;
  const sentenceLengthVariance = Math.sqrt(variance);

  const shortSentenceCount = sentenceLengths.filter((len) => len < 8).length;
  const longSentenceCount = sentenceLengths.filter((len) => len > 30).length;
  const shortSentenceRatio = sentenceCount > 0 ? shortSentenceCount / sentenceCount : 0;
  const longSentenceRatio = sentenceCount > 0 ? longSentenceCount / sentenceCount : 0;

  // Estimate passive voice (regex-based)
  const passivePattern = /\b(is|are|was|were|be|been|being)\s+\w+ed\b/gi;
  const passiveMatches = (text.match(passivePattern) || []).length;
  const passiveVoiceEstimate = sentenceCount > 0 ? passiveMatches / sentenceCount : 0;

  // Dialogue ratio
  const dialogueMatch = text.match(/["'].*?["']/g) || [];
  const dialogueChars = dialogueMatch.join("").length;
  const dialogueRatio = text.length > 0 ? dialogueChars / text.length : 0;

  // Unique word ratio (lexical diversity)
  const uniqueWords = new Set(
    words
      .map((w) => w.toLowerCase().replace(/[^a-z0-9]/g, ""))
      .filter((w) => w.length > 0),
  );
  const uniqueWordRatio = wordCount > 0 ? uniqueWords.size / wordCount : 0;

  return {
    wordCount,
    sentenceCount,
    avgWordsPerSentence,
    sentenceLengthVariance,
    shortSentenceRatio,
    longSentenceRatio,
    passiveVoiceEstimate,
    dialogueRatio,
    paragraphCount,
    avgWordsPerParagraph,
    uniqueWordRatio,
  };
}
