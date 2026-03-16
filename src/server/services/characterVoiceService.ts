// src/server/services/characterVoiceService.ts
// "Would They Say That?" — Dialogue Authenticity Engine
// The WOW feature of The Forge

import Anthropic from "@anthropic-ai/sdk";

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

const VOICE_CHECK_CONSTRAINT = `
You are a character voice authenticity expert for The Forge writing platform.
Your role is to analyze whether dialogue is authentic to a specific fictional character based on their established profile.

CRITICAL RULES:
- You analyze and observe — you do NOT rewrite dialogue
- You provide voice guidance (what kind of words, rhythms, phrases would feel authentic) — not actual rewrites
- Ask questions that help the author hear their character's true voice
- Treat the author as the sole author of all prose
- Be specific about voice patterns: vocabulary level, sentence rhythm, cultural markers, emotional register
- Score authenticity honestly — a score of 60 is not a failure, it's an invitation to refine

If asked to rewrite dialogue, respond only with voice guidance, never actual substitute text.
`.trim();

export interface CharacterProfile {
  name: string;
  role: string;
  age?: number | null;
  background?: string | null;
  motivation?: string | null;
  educationLevel?: string | null;
  region?: string | null;
  socialClass?: string | null;
  speakingStyle?: string | null;
  vocabularyNotes?: string | null;
  verbalTics?: string | null;
  sampleDialogue?: string | null;
  startingState?: string | null;
  endGoalState?: string | null;
}

export interface VoiceCheckResult {
  authenticityScore: number;
  isAuthentic: boolean;
  observations: string[];
  voiceGuidance: string[];
  craftQuestions: string[];
  dominantIssue: string | null;
  summary: string;
}

export async function checkDialogueVoice(
  dialogueText: string,
  character: CharacterProfile,
  sceneContext?: string
): Promise<VoiceCheckResult> {
  const profileSections: string[] = [
    `CHARACTER: ${character.name} (${character.role})`,
    character.age ? `Age: ${character.age}` : "",
    character.background ? `Background: ${character.background}` : "",
    character.motivation ? `Core Motivation: ${character.motivation}` : "",
    character.educationLevel ? `Education: ${character.educationLevel.replace(/_/g, " ")}` : "",
    character.region ? `Region/Dialect: ${character.region}` : "",
    character.socialClass ? `Social Class: ${character.socialClass}` : "",
    character.speakingStyle ? `Speaking Style: ${character.speakingStyle}` : "",
    character.vocabularyNotes ? `Vocabulary Notes: ${character.vocabularyNotes}` : "",
    character.verbalTics ? `Verbal Tics/Patterns: ${character.verbalTics}` : "",
  ].filter(Boolean);

  const sampleSection = character.sampleDialogue
    ? `\nSAMPLE AUTHENTIC DIALOGUE (written by the author):\n"${character.sampleDialogue}"`
    : "";

  const contextSection = sceneContext
    ? `\nSCENE CONTEXT:\n${sceneContext}`
    : "";

  const prompt = `
${profileSections.join("\n")}
${sampleSection}
${contextSection}

DIALOGUE TO ANALYZE:
"${dialogueText}"

Analyze the authenticity of this dialogue for ${character.name}. Consider:

1. VOCABULARY: Are these the words this person would choose? (education level, region, background)
2. SENTENCE RHYTHM: Does the sentence structure match their established pattern?
3. EMOTIONAL REGISTER: Is this how they would express this particular emotion?
4. CULTURAL/SOCIAL MARKERS: Does it reflect their background and class?
5. VOICE CONSISTENCY: Does it match the sample dialogue if provided?

Return your analysis as a JSON object with EXACTLY this structure:
{
  "authenticityScore": [0-100 integer],
  "isAuthentic": [true if score >= 70],
  "observations": [array of 2-4 specific observations about the dialogue],
  "voiceGuidance": [array of 2-3 specific guidance items about what voice elements would feel more authentic — NOT rewrites, but direction],
  "craftQuestions": [array of 2 questions for the author to consider about this character's voice],
  "dominantIssue": [the single most important voice issue, or null if authentic],
  "summary": [1-2 sentence overall assessment]
}

Respond with ONLY the JSON object, no other text.
`.trim();

  const message = await anthropic.messages.create({
    model: process.env.ANTHROPIC_MODEL ?? "claude-sonnet-4-6",
    max_tokens: 1024,
    system: VOICE_CHECK_CONSTRAINT,
    messages: [{ role: "user", content: prompt }],
  });

  const responseText =
    message.content[0].type === "text" ? message.content[0].text : "";

  // Parse JSON response — fall back gracefully
  try {
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error("No JSON found");

    const parsed = JSON.parse(jsonMatch[0]) as VoiceCheckResult;
    return {
      authenticityScore: Math.max(0, Math.min(100, parsed.authenticityScore ?? 50)),
      isAuthentic: (parsed.authenticityScore ?? 50) >= 70,
      observations: parsed.observations ?? [],
      voiceGuidance: parsed.voiceGuidance ?? [],
      craftQuestions: parsed.craftQuestions ?? [],
      dominantIssue: parsed.dominantIssue ?? null,
      summary: parsed.summary ?? "Analysis complete.",
    };
  } catch {
    return {
      authenticityScore: 50,
      isAuthentic: false,
      observations: ["Analysis could not be fully parsed. Please try again."],
      voiceGuidance: [],
      craftQuestions: ["Does this dialogue sound like how this character would speak?"],
      dominantIssue: null,
      summary: responseText.slice(0, 200),
    };
  }
}

export async function analyzeCharacterArcAlignment(
  sceneText: string,
  character: CharacterProfile,
  arcPosition: string, // e.g., "Chapter 3 - just learned about the betrayal"
  arcMilestones: Array<{ title: string; description: string; isCompleted: boolean }>
): Promise<{
  alignmentScore: number;
  isAligned: boolean;
  observations: string[];
  craftQuestions: string[];
  summary: string;
}> {
  const completedMilestones = arcMilestones.filter((m) => m.isCompleted);
  const upcomingMilestones = arcMilestones.filter((m) => !m.isCompleted);

  const prompt = `
CHARACTER: ${character.name}
Starting State: ${character.startingState ?? "Not defined"}
Goal State: ${character.endGoalState ?? "Not defined"}
Current Arc Position: ${arcPosition}

COMPLETED ARC MILESTONES:
${completedMilestones.map((m) => `✓ ${m.title}: ${m.description}`).join("\n") || "None yet"}

UPCOMING ARC MILESTONES:
${upcomingMilestones.map((m) => `○ ${m.title}: ${m.description}`).join("\n") || "None planned"}

SCENE TEXT (or summary):
${sceneText}

Analyze whether ${character.name}'s behavior, reactions, and dialogue in this scene align with where they should be in their character arc. Return JSON:
{
  "alignmentScore": [0-100],
  "isAligned": [true if score >= 65],
  "observations": [array of 2-3 observations about arc alignment],
  "craftQuestions": [array of 2 questions about the character's development],
  "summary": [1-2 sentence assessment]
}

Respond with ONLY valid JSON.
`.trim();

  const message = await anthropic.messages.create({
    model: process.env.ANTHROPIC_MODEL ?? "claude-sonnet-4-6",
    max_tokens: 768,
    system: VOICE_CHECK_CONSTRAINT,
    messages: [{ role: "user", content: prompt }],
  });

  const responseText =
    message.content[0].type === "text" ? message.content[0].text : "";

  try {
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error("No JSON");
    return JSON.parse(jsonMatch[0]) as {
      alignmentScore: number;
      isAligned: boolean;
      observations: string[];
      craftQuestions: string[];
      summary: string;
    };
  } catch {
    return {
      alignmentScore: 50,
      isAligned: true,
      observations: ["Arc analysis requires more context."],
      craftQuestions: ["Is this character behaving consistently with their development so far?"],
      summary: "Please provide more scene context for detailed arc analysis.",
    };
  }
}
