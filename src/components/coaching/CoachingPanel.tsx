"use client";

import { useState } from "react";
import {
  Zap, MessageSquare, ThermometerSun, Check, X, Bookmark,
  ChevronDown, ChevronUp, Loader2, BookOpen, AlertCircle
} from "lucide-react";
import { api } from "@/trpc/react";

type PanelTab = "analysis" | "qa" | "temperature";

interface CoachingPanelProps {
  projectId: string;
  documentId?: string;
  selectedText?: string;
  chapterId?: string;
}

export function CoachingPanel({
  projectId,
  documentId,
  selectedText,
  chapterId,
}: CoachingPanelProps) {
  const [activeTab, setActiveTab] = useState<PanelTab>("analysis");
  const [craftQuestion, setCraftQuestion] = useState("");
  const [intensity, setIntensity] = useState<"LIGHT_TOUCH" | "STANDARD" | "DEEP_DIVE">("STANDARD");
  const [expandedCards, setExpandedCards] = useState<Set<string>>(new Set());

  const { data: interactions, refetch: refetchInteractions } = api.coaching.getInteractions.useQuery(
    { projectId },
    { enabled: !!projectId }
  );

  const analyzeMutation = api.coaching.analyzePassage.useMutation({
    onSuccess: () => void refetchInteractions(),
  });

  const craftQAMutation = api.coaching.craftQA.useMutation({
    onSuccess: () => {
      setCraftQuestion("");
      void refetchInteractions();
    },
  });

  const [runTemperature, setRunTemperature] = useState(false);
  const temperatureQuery = api.coaching.temperatureCheck.useQuery(
    { chapterId: chapterId ?? "" },
    { enabled: runTemperature && !!chapterId }
  );
  const dismissMutation = api.coaching.dismissInteraction.useMutation({
    onSuccess: () => void refetchInteractions(),
  });
  const acknowledgeMutation = api.coaching.acknowledgeInteraction.useMutation({
    onSuccess: () => void refetchInteractions(),
  });
  const flagMutation = api.coaching.flagInteraction.useMutation({
    onSuccess: () => void refetchInteractions(),
  });

  const handleAnalyze = () => {
    if (!selectedText || selectedText.trim().split(/\s+/).length < 10) return;
    analyzeMutation.mutate({
      documentId: documentId ?? "",
      selectedText,
      intensity,
      focusAreas: [],
    });
  };

  const handleCraftQA = () => {
    if (!craftQuestion.trim()) return;
    craftQAMutation.mutate({ projectId, question: craftQuestion });
  };

  const handleTemperatureCheck = () => {
    if (!chapterId) return;
    setRunTemperature(true);
    void temperatureQuery.refetch();
  };

  const toggleCard = (id: string) => {
    setExpandedCards((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const recentInteractions = interactions?.filter((i) => !i.dismissed).slice(0, 8) ?? [];

  return (
    <div
      className="h-full flex flex-col"
      style={{ background: "#13131f", borderLeft: "1px solid #2a2a45" }}
    >
      {/* Header */}
      <div className="p-4 border-b" style={{ borderColor: "#2a2a45" }}>
        <div className="flex items-center gap-2 mb-3">
          <Zap size={14} style={{ color: "#f59e0b" }} />
          <span className="text-sm font-semibold" style={{ color: "#f0f0f8" }}>
            Prose Coach
          </span>
        </div>
        <div className="flex gap-1 rounded-lg p-1" style={{ background: "#0c0c14" }}>
          {([
            { id: "analysis" as const, icon: <BookOpen size={12} />, label: "Analyze" },
            { id: "qa" as const, icon: <MessageSquare size={12} />, label: "Q&A" },
            { id: "temperature" as const, icon: <ThermometerSun size={12} />, label: "Temp" },
          ]).map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className="flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded text-xs font-medium transition-all"
              style={{
                background: activeTab === tab.id ? "#1a1a2e" : "transparent",
                color: activeTab === tab.id ? "#f59e0b" : "#5a5a7a",
                border: activeTab === tab.id ? "1px solid #2a2a45" : "1px solid transparent",
              }}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {/* Intensity Selector */}
        <div className="px-4 pt-4 pb-2">
          <div className="flex gap-1">
            {(["LIGHT_TOUCH", "STANDARD", "DEEP_DIVE"] as const).map((lvl) => {
              const labels = { LIGHT_TOUCH: "Light", STANDARD: "Standard", DEEP_DIVE: "Deep" };
              return (
                <button
                  key={lvl}
                  onClick={() => setIntensity(lvl)}
                  className="flex-1 py-1 text-xs rounded transition-all"
                  style={{
                    background: intensity === lvl ? "rgba(245,158,11,0.15)" : "transparent",
                    color: intensity === lvl ? "#f59e0b" : "#5a5a7a",
                    border: `1px solid ${intensity === lvl ? "rgba(245,158,11,0.3)" : "#2a2a45"}`,
                  }}
                >
                  {labels[lvl]}
                </button>
              );
            })}
          </div>
        </div>

        {activeTab === "analysis" && (
          <div className="px-4 pb-4">
            {selectedText ? (
              <>
                <div
                  className="rounded-lg p-3 mb-3 text-xs italic"
                  style={{ background: "rgba(245,158,11,0.05)", border: "1px solid rgba(245,158,11,0.15)", color: "#9898b8" }}
                >
                  <span style={{ color: "#f59e0b" }}>Selected: </span>
                  &ldquo;{selectedText.slice(0, 120)}{selectedText.length > 120 ? "..." : ""}&rdquo;
                </div>
                <button
                  onClick={handleAnalyze}
                  disabled={analyzeMutation.isPending}
                  className="w-full py-2.5 rounded-lg text-sm font-semibold flex items-center justify-center gap-2 transition-all"
                  style={{
                    background: analyzeMutation.isPending ? "rgba(245,158,11,0.3)" : "#f59e0b",
                    color: "#0c0c14",
                  }}
                >
                  {analyzeMutation.isPending ? (
                    <><Loader2 size={14} className="animate-spin" /> Analyzing...</>
                  ) : (
                    <><Zap size={14} /> Analyze Passage</>
                  )}
                </button>
              </>
            ) : (
              <div className="text-center py-6">
                <AlertCircle size={24} className="mx-auto mb-2" style={{ color: "#35354a" }} />
                <p className="text-xs" style={{ color: "#5a5a7a" }}>
                  Highlight text in the editor to request coaching
                </p>
              </div>
            )}
          </div>
        )}

        {activeTab === "qa" && (
          <div className="px-4 pb-4">
            <textarea
              value={craftQuestion}
              onChange={(e) => setCraftQuestion(e.target.value)}
              placeholder="Ask a craft question... e.g. 'Does this paragraph have good rhythm?'"
              className="w-full rounded-lg p-3 text-xs resize-none mb-3 focus:outline-none"
              style={{
                background: "#0c0c14", border: "1px solid #2a2a45",
                color: "#f0f0f8", minHeight: "90px",
              }}
              onFocus={(e) => (e.currentTarget.style.borderColor = "#f59e0b")}
              onBlur={(e) => (e.currentTarget.style.borderColor = "#2a2a45")}
            />
            <button
              onClick={handleCraftQA}
              disabled={!craftQuestion.trim() || craftQAMutation.isPending}
              className="w-full py-2.5 rounded-lg text-sm font-semibold flex items-center justify-center gap-2"
              style={{
                background: craftQuestion.trim() && !craftQAMutation.isPending ? "#f59e0b" : "rgba(245,158,11,0.2)",
                color: craftQuestion.trim() && !craftQAMutation.isPending ? "#0c0c14" : "#f59e0b",
              }}
            >
              {craftQAMutation.isPending ? (
                <><Loader2 size={14} className="animate-spin" /> Thinking...</>
              ) : (
                <><MessageSquare size={14} /> Ask Coach</>
              )}
            </button>
          </div>
        )}

        {activeTab === "temperature" && (
          <div className="px-4 pb-4">
            <p className="text-xs mb-3 leading-relaxed" style={{ color: "#9898b8" }}>
              Statistical analysis of sentence patterns, dialogue ratio, passive voice, and pacing.
            </p>
            <button
              onClick={handleTemperatureCheck}
              disabled={!chapterId || temperatureQuery.isFetching}
              className="w-full py-2.5 rounded-lg text-sm font-semibold flex items-center justify-center gap-2"
              style={{
                background: chapterId && !temperatureQuery.isFetching ? "#3b82f6" : "rgba(59,130,246,0.2)",
                color: chapterId && !temperatureQuery.isFetching ? "white" : "#3b82f6",
              }}
            >
              {temperatureQuery.isFetching ? (
                <><Loader2 size={14} className="animate-spin" /> Analyzing...</>
              ) : (
                <><ThermometerSun size={14} /> Run Temperature Check</>
              )}
            </button>
          </div>
        )}

        {/* Interaction History */}
        {recentInteractions.length > 0 && (
          <div className="border-t px-4 pt-4 pb-4" style={{ borderColor: "#2a2a45" }}>
            <p className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: "#5a5a7a" }}>
              Recent Coaching
            </p>
            <div className="space-y-2">
              {recentInteractions.map((interaction) => {
                const isExpanded = expandedCards.has(interaction.id);
                return (
                  <div
                    key={interaction.id}
                    className="rounded-lg overflow-hidden"
                    style={{ background: "#0c0c14", border: "1px solid #2a2a45" }}
                  >
                    <button
                      onClick={() => toggleCard(interaction.id)}
                      className="w-full p-3 text-left flex items-center justify-between"
                    >
                      <div className="flex-1 min-w-0">
                        <p className="text-xs truncate" style={{ color: "#9898b8" }}>
                          {interaction.requestType.replace(/_/g, " ")}
                        </p>
                        <p className="text-xs mt-0.5 truncate" style={{ color: "#5a5a7a" }}>
                          {interaction.requestText.slice(0, 55)}...
                        </p>
                      </div>
                      <span style={{ color: "#5a5a7a" }}>
                        {isExpanded ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                      </span>
                    </button>

                    {isExpanded && (
                      <div className="px-3 pb-3">
                        <div
                          className="text-xs rounded-lg p-3 mb-3 leading-relaxed whitespace-pre-wrap"
                          style={{ background: "#13131f", color: "#c8c8e0" }}
                        >
                          {interaction.responseText}
                        </div>
                        <div className="flex gap-2">
                          <ActionBtn
                            onClick={() => acknowledgeMutation.mutate({ id: interaction.id })}
                            icon={<Check size={11} />} label="Got it" color="#10b981"
                            active={interaction.acknowledged}
                          />
                          <ActionBtn
                            onClick={() => flagMutation.mutate({ id: interaction.id })}
                            icon={<Bookmark size={11} />} label="Save" color="#3b82f6"
                            active={interaction.flagged}
                          />
                          <ActionBtn
                            onClick={() => dismissMutation.mutate({ id: interaction.id })}
                            icon={<X size={11} />} label="Dismiss" color="#ef4444"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function ActionBtn({
  onClick, icon, label, color, active,
}: {
  onClick: () => void; icon: React.ReactNode; label: string; color: string; active?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-1 px-2 py-1 rounded text-xs transition-all"
      style={{
        background: active ? `${color}20` : "transparent",
        color: active ? color : "#5a5a7a",
        border: `1px solid ${active ? `${color}40` : "#2a2a45"}`,
      }}
    >
      {icon}
      {label}
    </button>
  );
}
