"use client";

import { useState } from "react";
import { trpc } from "@/trpc/react";

interface CoachingPanelProps {
  projectId: string;
  documentId: string;
  chapterId: string;
  defaultPassage?: string;
}

type FocusAreaValue = "SENTENCE_RHYTHM" | "SHOW_VS_TELL" | "PACING" | "WORD_ECONOMY" | "DIALOGUE" | "DESCRIPTION" | "VOICE" | "REVISION";

const FOCUS_AREAS: { value: FocusAreaValue; label: string }[] = [
  { value: "SENTENCE_RHYTHM", label: "Sentence Rhythm" },
  { value: "SHOW_VS_TELL", label: "Show vs. Tell" },
  { value: "PACING", label: "Pacing" },
  { value: "WORD_ECONOMY", label: "Word Economy" },
  { value: "DIALOGUE", label: "Dialogue" },
  { value: "DESCRIPTION", label: "Description" },
  { value: "VOICE", label: "Voice" },
];

function InteractionCard({ interaction, onDismiss, onAcknowledge, onFlag }: {
  interaction: { id: string; requestType: string; requestText: string; responseText: string; dismissed: boolean; acknowledged: boolean; flagged: boolean; createdAt: Date | string; };
  onDismiss: (id: string) => void;
  onAcknowledge: (id: string) => void;
  onFlag: (id: string) => void;
}) {
  const [expanded, setExpanded] = useState(false);
  if (interaction.dismissed) return null;
  return (
    <div className={`border rounded-lg p-4 mb-3 transition-all ${interaction.acknowledged ? "border-green-900/50 bg-green-950/20" : interaction.flagged ? "border-amber-900/50 bg-amber-950/20" : "border-blue-900/50 bg-blue-950/20"}`}>
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-bold text-blue-400 uppercase tracking-wider">{interaction.requestType.replace("_", " ")}</span>
        <div className="flex items-center gap-1">
          {interaction.acknowledged && <span className="text-xs text-green-400">✓</span>}
          {interaction.flagged && <span className="text-xs text-amber-400">🔖</span>}
          <button onClick={() => setExpanded(!expanded)} className="text-slate-500 hover:text-slate-300 text-xs ml-2">{expanded ? "▲" : "▼"}</button>
        </div>
      </div>
      {expanded && (
        <p className="text-xs text-slate-500 mb-2 bg-slate-900/50 rounded p-2 line-clamp-3">
          "{interaction.requestText.slice(0, 200)}..."
        </p>
      )}
      <p className="text-sm text-slate-200 leading-relaxed whitespace-pre-wrap">{interaction.responseText}</p>
      <div className="flex items-center gap-2 mt-3 pt-3 border-t border-slate-700/50">
        <button onClick={() => onAcknowledge(interaction.id)} disabled={interaction.acknowledged} className="px-2.5 py-1 text-xs font-medium rounded border border-green-800/50 text-green-400 hover:bg-green-900/20 disabled:opacity-40 transition-all">✓ Acknowledge</button>
        <button onClick={() => onFlag(interaction.id)} disabled={interaction.flagged} className="px-2.5 py-1 text-xs font-medium rounded border border-amber-800/50 text-amber-400 hover:bg-amber-900/20 disabled:opacity-40 transition-all">🔖 Flag</button>
        <button onClick={() => onDismiss(interaction.id)} className="px-2.5 py-1 text-xs font-medium rounded border border-slate-700 text-slate-500 hover:text-slate-300 hover:border-slate-600 transition-all">✕ Dismiss</button>
        <span className="ml-auto text-xs text-slate-600">{new Date(interaction.createdAt).toLocaleTimeString()}</span>
      </div>
    </div>
  );
}

export function CoachingPanel({ projectId, documentId, chapterId, defaultPassage = "" }: CoachingPanelProps) {
  const utils = trpc.useUtils();
  const [activeTab, setActiveTab] = useState<"analysis" | "craftqa" | "temperature" | "history">("analysis");
  const [passage, setPassage] = useState(defaultPassage.slice(0, 2000));
  const [intensity, setIntensity] = useState<"LIGHT_TOUCH" | "STANDARD" | "DEEP_DIVE">("STANDARD");
  const [focusAreas, setFocusAreas] = useState<FocusAreaValue[]>(["SENTENCE_RHYTHM", "PACING"]);
  const [question, setQuestion] = useState("");

  const analyzeMutation = trpc.coaching.analyzePassage.useMutation();
  const craftQAMutation = trpc.coaching.craftQA.useMutation();
  const temperatureQuery = trpc.coaching.temperatureCheck.useQuery({ chapterId });
  const historyQuery = trpc.coaching.getInteractions.useQuery({ projectId });
  const dismissMutation = trpc.coaching.dismissInteraction.useMutation();
  const acknowledgeMutation = trpc.coaching.acknowledgeInteraction.useMutation();
  const flagMutation = trpc.coaching.flagInteraction.useMutation();

  const handleDismiss = async (id: string) => {
    await dismissMutation.mutateAsync({ id });
    void utils.coaching.getInteractions.invalidate();
  };
  const handleAcknowledge = async (id: string) => {
    await acknowledgeMutation.mutateAsync({ id });
    void utils.coaching.getInteractions.invalidate();
  };
  const handleFlag = async (id: string) => {
    await flagMutation.mutateAsync({ id });
    void utils.coaching.getInteractions.invalidate();
  };

  const wordCount = passage.trim().split(/\s+/).filter(Boolean).length;
  const canAnalyze = wordCount >= 50 && wordCount <= 2000;

  const toggleFocusArea = (area: FocusAreaValue) => {
    setFocusAreas((prev) => prev.includes(area) ? prev.filter((a) => a !== area) : prev.length >= 3 ? prev : [...prev, area]);
  };

  const tabs = [
    { id: "analysis", label: "Passage", icon: "◉" },
    { id: "craftqa", label: "Craft Q&A", icon: "?" },
    { id: "temperature", label: "Temp Check", icon: "◦" },
    { id: "history", label: "History", icon: "☰" },
  ] as const;

  return (
    <div className="flex flex-col h-full bg-slate-900 rounded-xl border border-slate-700 overflow-hidden">
      <div className="px-4 py-3 border-b border-slate-700 bg-slate-800/50">
        <h3 className="text-sm font-bold text-white">Prose Coach</h3>
        <p className="text-xs text-slate-500 mt-0.5">AI assists, never replaces. Every word is yours.</p>
      </div>

      <div className="flex border-b border-slate-700 bg-slate-800/30">
        {tabs.map((tab) => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)}
            className={`flex-1 py-2.5 text-xs font-medium transition-all ${activeTab === tab.id ? "text-blue-400 border-b-2 border-blue-400" : "text-slate-500 hover:text-slate-300"}`}>
            {tab.icon} {tab.label}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        {activeTab === "analysis" && (
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Passage ({wordCount} / 2000 words)</label>
              <textarea value={passage} onChange={(e) => setPassage(e.target.value)} rows={8}
                className="w-full px-3 py-2.5 bg-slate-800 border border-slate-700 rounded-lg text-slate-200 text-sm placeholder-slate-500 focus:outline-none focus:border-blue-500 resize-none"
                placeholder="Paste or type at least 50 words for analysis..." />
              {wordCount > 0 && !canAnalyze && (
                <p className="text-xs text-amber-400 mt-1">{wordCount < 50 ? `Need ${50 - wordCount} more words` : "Maximum 2000 words"}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Intensity</label>
              <div className="flex gap-2">
                {(["LIGHT_TOUCH", "STANDARD", "DEEP_DIVE"] as const).map((opt) => (
                  <button key={opt} onClick={() => setIntensity(opt)}
                    className={`flex-1 py-1.5 rounded text-xs font-medium transition-all ${intensity === opt ? "bg-blue-600 text-white" : "border border-slate-700 text-slate-400 hover:text-white hover:border-slate-600"}`}>
                    {opt === "LIGHT_TOUCH" ? "Light" : opt === "STANDARD" ? "Standard" : "Deep"}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Focus Areas (max 3)</label>
              <div className="flex flex-wrap gap-1.5">
                {FOCUS_AREAS.map((area) => (
                  <button key={area.value} onClick={() => toggleFocusArea(area.value)}
                    className={`px-2.5 py-1 rounded-full text-xs font-medium transition-all ${focusAreas.includes(area.value) ? "bg-blue-600 text-white" : "border border-slate-700 text-slate-400 hover:border-slate-600 hover:text-slate-300"}`}>
                    {area.label}
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={() => analyzeMutation.mutate({ documentId, selectedText: passage, intensity, focusAreas })}
              disabled={!canAnalyze || analyzeMutation.isPending}
              className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-40 text-white font-bold text-sm rounded-lg transition-all">
              {analyzeMutation.isPending ? "Analyzing..." : "Analyze Passage"}
            </button>

            {analyzeMutation.data?.response && (
              <div className="border border-blue-900/50 bg-blue-950/20 rounded-lg p-4">
                <p className="text-xs font-bold text-blue-400 uppercase tracking-wider mb-2">Coach Observation</p>
                <p className="text-sm text-slate-200 whitespace-pre-wrap leading-relaxed">{analyzeMutation.data.response}</p>
              </div>
            )}
          </div>
        )}

        {activeTab === "craftqa" && (
          <div className="space-y-4">
            <div className="bg-blue-950/20 border border-blue-900/30 rounded-lg p-3 text-xs text-blue-300">
              Ask a specific craft question. The coach will respond with observations — never rewrites.
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Your Question</label>
              <textarea value={question} onChange={(e) => setQuestion(e.target.value)} rows={4}
                className="w-full px-3 py-2.5 bg-slate-800 border border-slate-700 rounded-lg text-slate-200 text-sm placeholder-slate-500 focus:outline-none focus:border-blue-500 resize-none"
                placeholder="e.g. Does this paragraph have good rhythm? Is my pacing too slow here?" />
            </div>
            <button
              onClick={() => craftQAMutation.mutate({ projectId, question, context: passage.slice(0, 2000) })}
              disabled={question.trim().length < 10 || craftQAMutation.isPending}
              className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-40 text-white font-bold text-sm rounded-lg transition-all">
              {craftQAMutation.isPending ? "Coach is thinking..." : "Ask Coach"}
            </button>
            {craftQAMutation.data?.response && (
              <div className="border border-blue-900/50 bg-blue-950/20 rounded-lg p-4">
                <p className="text-xs font-bold text-blue-400 uppercase tracking-wider mb-2">Coach Response</p>
                <p className="text-sm text-slate-200 whitespace-pre-wrap leading-relaxed">{craftQAMutation.data.response}</p>
              </div>
            )}
          </div>
        )}

        {activeTab === "temperature" && (
          <div className="space-y-4">
            <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-3 text-xs text-slate-400">
              Statistical analysis. No scores — just patterns for you to interpret.
            </div>
            {temperatureQuery.isLoading ? (
              <div className="text-center py-8 text-slate-500">Calculating metrics...</div>
            ) : temperatureQuery.data ? (
              <div className="space-y-2">
                {[
                  { label: "Total Words", value: temperatureQuery.data.metrics.totalWords.toLocaleString() },
                  { label: "Sentences", value: temperatureQuery.data.metrics.sentenceCount },
                  { label: "Paragraphs", value: temperatureQuery.data.metrics.paragraphCount },
                  { label: "Avg Words/Sentence", value: temperatureQuery.data.metrics.avgWordsPerSentence.toFixed(1) },
                  { label: "Short Sentences (<8w)", value: `${(temperatureQuery.data.metrics.shortSentenceRatio * 100).toFixed(0)}%` },
                  { label: "Long Sentences (>30w)", value: `${(temperatureQuery.data.metrics.longSentenceRatio * 100).toFixed(0)}%` },
                  { label: "Passive Voice Est.", value: `${(temperatureQuery.data.metrics.passiveVoiceRatio * 100).toFixed(0)}%` },
                  { label: "Dialogue Ratio", value: `${(temperatureQuery.data.metrics.dialogueRatio * 100).toFixed(0)}%` },
                  { label: "Lexical Diversity", value: `${(temperatureQuery.data.metrics.uniqueWordRatio * 100).toFixed(0)}%` },
                ].map((m) => (
                  <div key={m.label} className="flex items-center justify-between py-2 border-b border-slate-800">
                    <span className="text-sm text-slate-300">{m.label}</span>
                    <span className="text-sm font-bold text-white">{m.value}</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-slate-500 text-sm">No content yet.</div>
            )}
          </div>
        )}

        {activeTab === "history" && (
          <div className="space-y-2">
            <p className="text-xs text-slate-500 mb-3">Past coaching interactions for this project</p>
            {historyQuery.isLoading ? (
              <div className="text-center py-8 text-slate-500">Loading...</div>
            ) : !historyQuery.data || historyQuery.data.length === 0 ? (
              <div className="text-center py-8 text-slate-500 text-sm">No interactions yet. Analyze a passage to begin.</div>
            ) : (
              historyQuery.data.map((interaction) => (
                <InteractionCard key={interaction.id} interaction={interaction}
                  onDismiss={handleDismiss}
                  onAcknowledge={handleAcknowledge}
                  onFlag={handleFlag} />
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}
