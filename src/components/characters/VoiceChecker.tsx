"use client";

import { useState } from "react";
import { MessageCircle, CheckCircle2, AlertCircle, Loader2, ChevronDown, ChevronUp, Lightbulb, HelpCircle } from "lucide-react";
import { api } from "@/trpc/react";

interface Character {
  id: string;
  name: string;
  role: string;
  avatarColor: string | null;
  sampleDialogue: string | null;
  speakingStyle: string | null;
}

interface VoiceCheckerProps {
  characters: Character[];
  preSelectedCharacterId?: string;
  preSelectedText?: string;
  sceneId?: string;
}

export function VoiceChecker({
  characters,
  preSelectedCharacterId,
  preSelectedText,
  sceneId,
}: VoiceCheckerProps) {
  const [selectedCharId, setSelectedCharId] = useState(preSelectedCharacterId ?? "");
  const [dialogueText, setDialogueText] = useState(preSelectedText ?? "");
  const [result, setResult] = useState<{
    authenticityScore: number;
    isAuthentic: boolean;
    observations: string[];
    voiceGuidance: string[];
    craftQuestions: string[];
    dominantIssue: string | null;
    summary: string;
  } | null>(null);
  const [showDetails, setShowDetails] = useState(true);

  const checkMutation = api.characters.checkDialogueVoice.useMutation({
    onSuccess: (data) => {
      setResult(data);
      setShowDetails(true);
    },
  });

  const handleCheck = () => {
    if (!selectedCharId || dialogueText.trim().length < 10) return;
    checkMutation.mutate({
      characterId: selectedCharId,
      dialogueText: dialogueText.trim(),
      sceneId,
    });
  };

  const selectedChar = characters.find((c) => c.id === selectedCharId);

  const getScoreColor = (score: number): string => {
    if (score >= 85) return "#10b981";
    if (score >= 70) return "#f59e0b";
    if (score >= 50) return "#f97316";
    return "#ef4444";
  };

  const getScoreLabel = (score: number): string => {
    if (score >= 85) return "Authentic";
    if (score >= 70) return "Mostly Authentic";
    if (score >= 50) return "Questionable";
    return "Off-Voice";
  };

  return (
    <div
      className="rounded-2xl overflow-hidden"
      style={{ background: "#13131f", border: "1px solid #2a2a45" }}
    >
      {/* Header */}
      <div
        className="px-6 py-4 border-b flex items-center justify-between"
        style={{ borderColor: "#2a2a45", background: "#1a1a2e" }}
      >
        <div className="flex items-center gap-3">
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center"
            style={{ background: "linear-gradient(135deg, #f59e0b, #ef4444)" }}
          >
            <MessageCircle size={16} style={{ color: "#0c0c14" }} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold" style={{ color: "#f0f0f8" }}>
                Would They Say That?
              </h3>
              <span className="wow-badge">WOW</span>
            </div>
            <p className="text-xs" style={{ color: "#9898b8" }}>
              Dialogue authenticity analysis
            </p>
          </div>
        </div>
      </div>

      <div className="p-6">
        {/* Character Selector */}
        <div className="mb-4">
          <label className="text-xs font-semibold uppercase tracking-wider mb-2 block" style={{ color: "#9898b8" }}>
            Character Speaking
          </label>
          <div className="flex gap-2 flex-wrap">
            {characters.map((char) => (
              <button
                key={char.id}
                onClick={() => setSelectedCharId(char.id)}
                className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-all"
                style={{
                  background: selectedCharId === char.id ? "rgba(245,158,11,0.15)" : "#0c0c14",
                  border: `1px solid ${selectedCharId === char.id ? "rgba(245,158,11,0.4)" : "#2a2a45"}`,
                  color: selectedCharId === char.id ? "#f59e0b" : "#9898b8",
                }}
              >
                <div
                  className="w-5 h-5 rounded-full flex-shrink-0"
                  style={{ background: char.avatarColor ?? "#35354a" }}
                />
                <span className="font-medium">{char.name}</span>
                <span className="text-xs opacity-60">{char.role.replace(/_/g, " ")}</span>
              </button>
            ))}
          </div>
          {characters.length === 0 && (
            <p className="text-xs py-3" style={{ color: "#5a5a7a" }}>
              Add characters first to use voice checking.
            </p>
          )}
        </div>

        {/* Dialogue Input */}
        <div className="mb-4">
          <label className="text-xs font-semibold uppercase tracking-wider mb-2 block" style={{ color: "#9898b8" }}>
            Dialogue to Check
          </label>
          <textarea
            value={dialogueText}
            onChange={(e) => {
              setDialogueText(e.target.value);
              if (result) setResult(null);
            }}
            placeholder={`Paste ${selectedChar ? selectedChar.name + "'s" : "the character's"} dialogue here...`}
            className="w-full rounded-xl p-4 text-sm resize-none focus:outline-none"
            style={{
              background: "#0c0c14",
              border: "1px solid #2a2a45",
              color: "#f0f0f8",
              minHeight: "120px",
              lineHeight: "1.6",
            }}
            onFocus={(e) => (e.currentTarget.style.borderColor = "#f59e0b")}
            onBlur={(e) => (e.currentTarget.style.borderColor = "#2a2a45")}
          />
          <p className="text-xs mt-1" style={{ color: "#5a5a7a" }}>
            {dialogueText.trim().split(/\s+/).filter(Boolean).length} words
          </p>
        </div>

        {/* Character voice profile preview */}
        {selectedChar?.speakingStyle && (
          <div
            className="rounded-lg p-3 mb-4 text-xs"
            style={{ background: "rgba(245,158,11,0.05)", border: "1px solid rgba(245,158,11,0.1)" }}
          >
            <span className="font-semibold" style={{ color: "#f59e0b" }}>
              {selectedChar.name}&apos;s voice profile:
            </span>{" "}
            <span style={{ color: "#9898b8" }}>{selectedChar.speakingStyle}</span>
          </div>
        )}

        {/* Check Button */}
        <button
          onClick={handleCheck}
          disabled={!selectedCharId || dialogueText.trim().length < 10 || checkMutation.isPending}
          className="w-full py-3 rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-2"
          style={{
            background:
              selectedCharId && dialogueText.trim().length >= 10 && !checkMutation.isPending
                ? "linear-gradient(135deg, #f59e0b, #ef4444)"
                : "rgba(245,158,11,0.15)",
            color:
              selectedCharId && dialogueText.trim().length >= 10 && !checkMutation.isPending
                ? "#0c0c14"
                : "#f59e0b",
            cursor:
              selectedCharId && dialogueText.trim().length >= 10 && !checkMutation.isPending
                ? "pointer"
                : "not-allowed",
          }}
        >
          {checkMutation.isPending ? (
            <><Loader2 size={16} className="animate-spin" /> Analyzing Voice...</>
          ) : (
            <><MessageCircle size={16} /> Check Dialogue Authenticity</>
          )}
        </button>

        {/* Results */}
        {result && (
          <div className="mt-6">
            {/* Score Display */}
            <div
              className="rounded-xl p-5 mb-4"
              style={{
                background: "#0c0c14",
                border: `1px solid ${getScoreColor(result.authenticityScore)}30`,
              }}
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  {result.isAuthentic ? (
                    <CheckCircle2 size={24} style={{ color: getScoreColor(result.authenticityScore) }} />
                  ) : (
                    <AlertCircle size={24} style={{ color: getScoreColor(result.authenticityScore) }} />
                  )}
                  <div>
                    <p
                      className="text-lg font-bold"
                      style={{ color: getScoreColor(result.authenticityScore) }}
                    >
                      {result.authenticityScore}% — {getScoreLabel(result.authenticityScore)}
                    </p>
                    <p className="text-xs" style={{ color: "#9898b8" }}>
                      Voice authenticity for {selectedChar?.name}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setShowDetails(!showDetails)}
                  style={{ color: "#5a5a7a" }}
                >
                  {showDetails ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                </button>
              </div>

              {/* Score bar */}
              <div className="authenticity-bar">
                <div
                  className="authenticity-fill"
                  style={{
                    width: `${result.authenticityScore}%`,
                    background: `linear-gradient(90deg, ${getScoreColor(result.authenticityScore)}, ${getScoreColor(result.authenticityScore)}aa)`,
                  }}
                />
              </div>
            </div>

            {showDetails && (
              <div className="space-y-4">
                {/* Summary */}
                <div
                  className="rounded-xl p-4"
                  style={{ background: "#1a1a2e", border: "1px solid #2a2a45" }}
                >
                  <p className="text-sm leading-relaxed" style={{ color: "#c8c8e0" }}>
                    {result.summary}
                  </p>
                </div>

                {/* Dominant Issue */}
                {result.dominantIssue && (
                  <div
                    className="rounded-xl p-4"
                    style={{ background: "rgba(239,68,68,0.05)", border: "1px solid rgba(239,68,68,0.2)" }}
                  >
                    <p className="text-xs font-semibold mb-1 flex items-center gap-1" style={{ color: "#ef4444" }}>
                      <AlertCircle size={12} />
                      Primary Voice Issue
                    </p>
                    <p className="text-sm" style={{ color: "#f0f0f8" }}>
                      {result.dominantIssue}
                    </p>
                  </div>
                )}

                {/* Observations */}
                {result.observations.length > 0 && (
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wider mb-2 flex items-center gap-1" style={{ color: "#9898b8" }}>
                      <CheckCircle2 size={11} />
                      What I Observe
                    </p>
                    <ul className="space-y-2">
                      {result.observations.map((obs, i) => (
                        <li
                          key={i}
                          className="text-sm rounded-lg px-3 py-2"
                          style={{ background: "#0c0c14", color: "#c8c8e0", border: "1px solid #2a2a45" }}
                        >
                          {obs}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Voice Guidance */}
                {result.voiceGuidance.length > 0 && (
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wider mb-2 flex items-center gap-1" style={{ color: "#9898b8" }}>
                      <Lightbulb size={11} />
                      Voice Direction
                    </p>
                    <ul className="space-y-2">
                      {result.voiceGuidance.map((guide, i) => (
                        <li
                          key={i}
                          className="text-sm rounded-lg px-3 py-2"
                          style={{
                            background: "rgba(245,158,11,0.05)",
                            color: "#c8c8e0",
                            border: "1px solid rgba(245,158,11,0.15)",
                          }}
                        >
                          {guide}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Craft Questions */}
                {result.craftQuestions.length > 0 && (
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wider mb-2 flex items-center gap-1" style={{ color: "#9898b8" }}>
                      <HelpCircle size={11} />
                      Questions to Consider
                    </p>
                    <ul className="space-y-2">
                      {result.craftQuestions.map((q, i) => (
                        <li
                          key={i}
                          className="text-sm rounded-lg px-3 py-2 italic"
                          style={{
                            background: "rgba(59,130,246,0.05)",
                            color: "#9898b8",
                            border: "1px solid rgba(59,130,246,0.15)",
                          }}
                        >
                          &ldquo;{q}&rdquo;
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
