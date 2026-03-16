"use client";

import { useState } from "react";
import { api } from "@/trpc/react";
import { VoiceChecker } from "@/components/characters/VoiceChecker";
import {
  Plus, Users, MessageCircle, ArrowLeft, Loader2, Trash2,
  ChevronDown, ChevronUp, CheckCircle, Circle, Edit2, X, Save
} from "lucide-react";
import Link from "next/link";

const ROLE_COLORS: Record<string, string> = {
  PROTAGONIST: "#3b82f6",
  ANTAGONIST: "#ef4444",
  SUPPORTING: "#f59e0b",
  MINOR: "#5a5a7a",
  MENTOR: "#10b981",
  LOVE_INTEREST: "#ec4899",
};

const AVATAR_COLORS = [
  "#3b82f6", "#ef4444", "#f59e0b", "#10b981", "#ec4899", "#8b5cf6",
  "#f97316", "#06b6d4", "#84cc16", "#e11d48",
];

interface CharacterPageProps {
  params: { id: string };
}

export default function CharactersPage({ params }: CharacterPageProps) {
  const projectId = params.id;
  const [showVoiceChecker, setShowVoiceChecker] = useState(false);
  const [expandedChar, setExpandedChar] = useState<string | null>(null);
  const [showNewForm, setShowNewForm] = useState(false);
  const [newChar, setNewChar] = useState({
    name: "",
    role: "SUPPORTING" as const,
    avatarColor: AVATAR_COLORS[0]!,
    background: "",
    motivation: "",
    speakingStyle: "",
    sampleDialogue: "",
    startingState: "",
    endGoalState: "",
  });

  const { data: characters, refetch } = api.characters.list.useQuery({ projectId });
  const createMutation = api.characters.create.useMutation({
    onSuccess: () => { void refetch(); setShowNewForm(false); resetForm(); },
  });
  const deleteMutation = api.characters.delete.useMutation({
    onSuccess: () => void refetch(),
  });
  const toggleMilestone = api.characters.toggleMilestone.useMutation({
    onSuccess: () => void refetch(),
  });

  const resetForm = () => setNewChar({
    name: "", role: "SUPPORTING", avatarColor: AVATAR_COLORS[0]!,
    background: "", motivation: "", speakingStyle: "", sampleDialogue: "",
    startingState: "", endGoalState: "",
  });

  const handleCreate = () => {
    if (!newChar.name.trim()) return;
    createMutation.mutate({ projectId, data: newChar });
  };

  if (!characters) {
    return (
      <div className="flex items-center justify-center h-screen" style={{ background: "#0c0c14" }}>
        <Loader2 size={24} className="animate-spin" style={{ color: "#35354a" }} />
      </div>
    );
  }

  return (
    <div className="flex h-screen" style={{ background: "#0c0c14" }}>
      {/* Main character list */}
      <div className={`flex-1 flex flex-col overflow-hidden ${showVoiceChecker ? "border-r" : ""}`} style={{ borderColor: "#2a2a45" }}>
        {/* Header */}
        <div className="flex items-center justify-between px-8 py-5 border-b flex-shrink-0" style={{ background: "#13131f", borderColor: "#2a2a45" }}>
          <div className="flex items-center gap-3">
            <Link href={`/dashboard/projects/${projectId}`} className="p-1.5 rounded-lg" style={{ color: "#5a5a7a" }}>
              <ArrowLeft size={16} />
            </Link>
            <Users size={18} style={{ color: "#ec4899" }} />
            <h1 className="text-lg font-bold" style={{ color: "#f0f0f8" }}>Characters</h1>
            <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: "rgba(236,72,153,0.1)", color: "#ec4899" }}>
              {characters.length}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowVoiceChecker(!showVoiceChecker)}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all"
              style={{
                background: showVoiceChecker ? "rgba(245,158,11,0.15)" : "#1a1a2e",
                color: showVoiceChecker ? "#f59e0b" : "#9898b8",
                border: `1px solid ${showVoiceChecker ? "rgba(245,158,11,0.3)" : "#2a2a45"}`,
              }}
            >
              <MessageCircle size={14} />
              Voice Checker
              <span className="wow-badge">WOW</span>
            </button>
            <button
              onClick={() => setShowNewForm(true)}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold"
              style={{ background: "#f59e0b", color: "#0c0c14" }}
            >
              <Plus size={14} />
              Add Character
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-8">
          {/* New Character Form */}
          {showNewForm && (
            <div className="rounded-2xl p-6 mb-6" style={{ background: "#1a1a2e", border: "1px solid #f59e0b40" }}>
              <h3 className="text-base font-bold mb-4" style={{ color: "#f0f0f8" }}>New Character</h3>
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="text-xs font-semibold uppercase tracking-wider mb-1 block" style={{ color: "#9898b8" }}>Name *</label>
                  <input
                    value={newChar.name}
                    onChange={(e) => setNewChar({ ...newChar, name: e.target.value })}
                    placeholder="Character name"
                    className="w-full rounded-xl px-3 py-2.5 text-sm focus:outline-none"
                    style={{ background: "#0c0c14", border: "1px solid #2a2a45", color: "#f0f0f8" }}
                    onFocus={(e) => (e.currentTarget.style.borderColor = "#f59e0b")}
                    onBlur={(e) => (e.currentTarget.style.borderColor = "#2a2a45")}
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold uppercase tracking-wider mb-1 block" style={{ color: "#9898b8" }}>Role</label>
                  <select
                    value={newChar.role}
                    onChange={(e) => setNewChar({ ...newChar, role: e.target.value as typeof newChar.role })}
                    className="w-full rounded-xl px-3 py-2.5 text-sm focus:outline-none"
                    style={{ background: "#0c0c14", border: "1px solid #2a2a45", color: "#f0f0f8" }}
                  >
                    {["PROTAGONIST", "ANTAGONIST", "SUPPORTING", "MINOR", "MENTOR", "LOVE_INTEREST"].map((r) => (
                      <option key={r} value={r}>{r.replace(/_/g, " ")}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Avatar color */}
              <div className="mb-4">
                <label className="text-xs font-semibold uppercase tracking-wider mb-2 block" style={{ color: "#9898b8" }}>Avatar Color</label>
                <div className="flex gap-2">
                  {AVATAR_COLORS.map((color) => (
                    <button
                      key={color}
                      onClick={() => setNewChar({ ...newChar, avatarColor: color })}
                      className="w-7 h-7 rounded-full transition-all"
                      style={{
                        background: color,
                        transform: newChar.avatarColor === color ? "scale(1.3)" : "scale(1)",
                        boxShadow: newChar.avatarColor === color ? `0 0 0 2px #0c0c14, 0 0 0 4px ${color}` : "none",
                      }}
                    />
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 gap-3 mb-4">
                <TextareaField label="Background" value={newChar.background} onChange={(v) => setNewChar({ ...newChar, background: v })} placeholder="Background, history, formative experiences..." />
                <TextareaField label="Core Motivation" value={newChar.motivation} onChange={(v) => setNewChar({ ...newChar, motivation: v })} placeholder="What does this character fundamentally want?" />
                <TextareaField label="Speaking Style" value={newChar.speakingStyle} onChange={(v) => setNewChar({ ...newChar, speakingStyle: v })} placeholder="How do they speak? Formal/casual, verbose/terse, regional quirks..." />
                <TextareaField label="Sample Authentic Dialogue" value={newChar.sampleDialogue} onChange={(v) => setNewChar({ ...newChar, sampleDialogue: v })} placeholder="Write 3-5 lines of dialogue that feel completely authentic to this character..." />
                <div className="grid grid-cols-2 gap-3">
                  <TextareaField label="Starting State" value={newChar.startingState} onChange={(v) => setNewChar({ ...newChar, startingState: v })} placeholder="Where does this character begin emotionally/psychologically?" />
                  <TextareaField label="Goal State" value={newChar.endGoalState} onChange={(v) => setNewChar({ ...newChar, endGoalState: v })} placeholder="Where should they end up?" />
                </div>
              </div>

              <div className="flex gap-2">
                <button onClick={handleCreate} disabled={!newChar.name.trim() || createMutation.isPending}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold"
                  style={{ background: "#f59e0b", color: "#0c0c14" }}>
                  {createMutation.isPending ? <Loader2 size={14} className="animate-spin" /> : <Plus size={14} />}
                  Create Character
                </button>
                <button onClick={() => { setShowNewForm(false); resetForm(); }}
                  className="px-5 py-2.5 rounded-xl text-sm"
                  style={{ background: "transparent", color: "#9898b8", border: "1px solid #2a2a45" }}>
                  Cancel
                </button>
              </div>
            </div>
          )}

          {characters.length === 0 && !showNewForm ? (
            <div className="text-center py-20">
              <Users size={48} className="mx-auto mb-4" style={{ color: "#35354a" }} />
              <h2 className="text-xl font-bold mb-2" style={{ color: "#9898b8" }}>No characters yet</h2>
              <p className="mb-6" style={{ color: "#5a5a7a" }}>Add your cast to unlock voice authenticity checking</p>
              <button onClick={() => setShowNewForm(true)} className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold" style={{ background: "#f59e0b", color: "#0c0c14" }}>
                <Plus size={16} />Add First Character
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {characters.map((char) => {
                const isExpanded = expandedChar === char.id;
                const roleColor = ROLE_COLORS[char.role] ?? "#5a5a7a";
                const completedMilestones = char.arcMilestones.filter((m) => m.isCompleted).length;

                return (
                  <div
                    key={char.id}
                    className="rounded-2xl overflow-hidden"
                    style={{ background: "#13131f", border: "1px solid #2a2a45" }}
                  >
                    <div
                      className="flex items-center gap-4 p-5 cursor-pointer"
                      onClick={() => setExpandedChar(isExpanded ? null : char.id)}
                      style={{ borderBottom: isExpanded ? "1px solid #2a2a45" : "none" }}
                    >
                      <div className="w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold flex-shrink-0"
                        style={{ background: char.avatarColor ?? "#35354a", color: "#0c0c14" }}>
                        {char.name[0]?.toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-bold" style={{ color: "#f0f0f8" }}>{char.name}</h3>
                          <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: `${roleColor}15`, color: roleColor }}>
                            {char.role.replace(/_/g, " ")}
                          </span>
                        </div>
                        <p className="text-xs truncate" style={{ color: "#9898b8" }}>
                          {char.background?.slice(0, 80) ?? "No background defined"}
                          {(char.background?.length ?? 0) > 80 && "..."}
                        </p>
                      </div>
                      <div className="flex items-center gap-4 flex-shrink-0">
                        {char.arcMilestones.length > 0 && (
                          <div className="text-center">
                            <p className="text-sm font-bold" style={{ color: "#f0f0f8" }}>{completedMilestones}/{char.arcMilestones.length}</p>
                            <p className="text-xs" style={{ color: "#5a5a7a" }}>Arc milestones</p>
                          </div>
                        )}
                        {char._count.voiceChecks > 0 && (
                          <div className="text-center">
                            <p className="text-sm font-bold" style={{ color: "#f59e0b" }}>{char._count.voiceChecks}</p>
                            <p className="text-xs" style={{ color: "#5a5a7a" }}>Voice checks</p>
                          </div>
                        )}
                        <div className="flex items-center gap-2">
                          <button onClick={(e) => { e.stopPropagation(); deleteMutation.mutate({ characterId: char.id }); }}
                            className="p-1.5 rounded-lg transition-colors" style={{ color: "#5a5a7a" }}
                            onMouseEnter={(e) => (e.currentTarget.style.color = "#ef4444")}
                            onMouseLeave={(e) => (e.currentTarget.style.color = "#5a5a7a")}
                          >
                            <Trash2 size={13} />
                          </button>
                          {isExpanded ? <ChevronUp size={14} style={{ color: "#5a5a7a" }} /> : <ChevronDown size={14} style={{ color: "#5a5a7a" }} />}
                        </div>
                      </div>
                    </div>

                    {isExpanded && (
                      <div className="p-5 grid grid-cols-2 gap-5">
                        {/* Voice Profile */}
                        <div>
                          <h4 className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: "#9898b8" }}>Voice Profile</h4>
                          {char.speakingStyle ? (
                            <div className="rounded-xl p-3 text-xs leading-relaxed" style={{ background: "#0c0c14", border: "1px solid #2a2a45", color: "#c8c8e0" }}>
                              {char.speakingStyle}
                            </div>
                          ) : (
                            <p className="text-xs" style={{ color: "#5a5a7a" }}>No voice profile yet</p>
                          )}
                          {char.sampleDialogue && (
                            <div className="mt-2 rounded-xl p-3 text-xs italic leading-relaxed" style={{ background: "rgba(245,158,11,0.05)", border: "1px solid rgba(245,158,11,0.15)", color: "#9898b8" }}>
                              &ldquo;{char.sampleDialogue.slice(0, 200)}{char.sampleDialogue.length > 200 ? "..." : ""}&rdquo;
                            </div>
                          )}
                        </div>

                        {/* Character Arc */}
                        <div>
                          <h4 className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: "#9898b8" }}>Character Arc</h4>
                          {char.startingState && (
                            <div className="flex items-start gap-2 mb-2">
                              <div className="w-2 h-2 rounded-full mt-1.5 flex-shrink-0" style={{ background: "#3b82f6" }} />
                              <p className="text-xs" style={{ color: "#9898b8" }}>{char.startingState.slice(0, 100)}</p>
                            </div>
                          )}
                          {char.arcMilestones.length > 0 && (
                            <div className="space-y-1 my-2">
                              {char.arcMilestones.slice(0, 5).map((m) => (
                                <div key={m.id} className="flex items-center gap-2 cursor-pointer"
                                  onClick={() => toggleMilestone.mutate({ milestoneId: m.id, isCompleted: !m.isCompleted })}>
                                  {m.isCompleted ? <CheckCircle size={13} style={{ color: "#10b981" }} /> : <Circle size={13} style={{ color: "#35354a" }} />}
                                  <span className="text-xs" style={{ color: m.isCompleted ? "#f0f0f8" : "#5a5a7a" }}>{m.title}</span>
                                </div>
                              ))}
                            </div>
                          )}
                          {char.endGoalState && (
                            <div className="flex items-start gap-2">
                              <div className="w-2 h-2 rounded-full mt-1.5 flex-shrink-0" style={{ background: "#10b981" }} />
                              <p className="text-xs" style={{ color: "#9898b8" }}>{char.endGoalState.slice(0, 100)}</p>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Voice Checker Panel */}
      {showVoiceChecker && (
        <div className="w-96 flex-shrink-0 overflow-y-auto p-6" style={{ background: "#13131f" }}>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <MessageCircle size={16} style={{ color: "#f59e0b" }} />
              <span className="text-sm font-semibold" style={{ color: "#f0f0f8" }}>Voice Checker</span>
            </div>
            <button onClick={() => setShowVoiceChecker(false)} style={{ color: "#5a5a7a" }}>
              <X size={16} />
            </button>
          </div>
          <VoiceChecker
            characters={characters.map((c) => ({
              id: c.id,
              name: c.name,
              role: c.role,
              avatarColor: c.avatarColor,
              sampleDialogue: c.sampleDialogue,
              speakingStyle: c.speakingStyle,
            }))}
          />
        </div>
      )}
    </div>
  );
}

function TextareaField({
  label, value, onChange, placeholder,
}: {
  label: string; value: string; onChange: (v: string) => void; placeholder: string;
}) {
  return (
    <div>
      <label className="text-xs font-semibold uppercase tracking-wider mb-1 block" style={{ color: "#9898b8" }}>{label}</label>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-xl px-3 py-2.5 text-xs resize-none focus:outline-none"
        style={{ background: "#0c0c14", border: "1px solid #2a2a45", color: "#f0f0f8", minHeight: "70px" }}
        onFocus={(e) => (e.currentTarget.style.borderColor = "#f59e0b")}
        onBlur={(e) => (e.currentTarget.style.borderColor = "#2a2a45")}
      />
    </div>
  );
}
