"use client";

import { useState } from "react";
import { Target, Eye, AlertTriangle, Zap, Shield, TrendingUp, Trash2, Plus, X } from "lucide-react";
import { api } from "@/trpc/react";

const STAKES_LEVELS = [
  { level: 1, label: "Personal", description: "Character's job, relationship, reputation" },
  { level: 2, label: "Social", description: "Family, community, local impact" },
  { level: 3, label: "National", description: "Political, economic, systemic" },
  { level: 4, label: "Global", description: "Widespread catastrophe, international" },
  { level: 5, label: "Existential", description: "Mass casualties, civilizational threat" },
];

interface WorldElement {
  id: string;
  type: string;
  name: string;
  description: string | null;
  properties: unknown;
}

interface ThrillerWorldBuilderProps {
  projectId: string;
}

export function ThrillerWorldBuilder({ projectId }: ThrillerWorldBuilderProps) {
  const [activeSection, setActiveSection] = useState<"threads" | "clues" | "stakes" | "revelations" | "antagonist">("threads");
  const [isAdding, setIsAdding] = useState(false);
  const [newName, setNewName] = useState("");
  const [newDesc, setNewDesc] = useState("");

  const { data: elements, refetch } = api.worldBuilder.getElements.useQuery({ projectId });
  const createMutation = api.worldBuilder.createElement.useMutation({
    onSuccess: () => { void refetch(); setIsAdding(false); setNewName(""); setNewDesc(""); },
  });
  const deleteMutation = api.worldBuilder.deleteElement.useMutation({
    onSuccess: () => void refetch(),
  });

  const sections = [
    { id: "threads" as const, icon: <Target size={13} />, label: "Plot Threads", color: "#ef4444", type: "PLOT_THREAD" },
    { id: "clues" as const, icon: <Eye size={13} />, label: "Clues", color: "#3b82f6", type: "CLUE" },
    { id: "stakes" as const, icon: <TrendingUp size={13} />, label: "Stakes", color: "#f97316", type: "STAKES" },
    { id: "revelations" as const, icon: <Zap size={13} />, label: "Revelations", color: "#f59e0b", type: "REVELATION" },
    { id: "antagonist" as const, icon: <Shield size={13} />, label: "Antagonist", color: "#8b5cf6", type: "ANTAGONIST_ASSET" },
  ];

  const activeSection_ = sections.find((s) => s.id === activeSection)!;
  const allElements = (elements ?? []) as WorldElement[];
  const filteredElements = allElements.filter((el) => el.type === activeSection_.type);

  const handleAdd = () => {
    if (!newName.trim()) return;
    createMutation.mutate({
      projectId,
      data: {
        type: activeSection_.type as Parameters<typeof createMutation.mutate>[0]["data"]["type"],
        name: newName,
        description: newDesc,
        tags: [],
      },
    });
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-6 border-b" style={{ borderColor: "#2a2a45" }}>
        <div className="flex items-center gap-3 mb-4">
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center"
            style={{ background: "rgba(239,68,68,0.15)" }}
          >
            <Target size={18} style={{ color: "#ef4444" }} />
          </div>
          <div>
            <h2 className="text-base font-bold" style={{ color: "#f0f0f8" }}>Thriller World Builder</h2>
            <p className="text-xs" style={{ color: "#9898b8" }}>Map your plot, clues, and escalating stakes</p>
          </div>
        </div>

        <div className="flex gap-1.5 flex-wrap">
          {sections.map((section) => (
            <button
              key={section.id}
              onClick={() => setActiveSection(section.id)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all"
              style={{
                background: activeSection === section.id ? `${section.color}15` : "transparent",
                color: activeSection === section.id ? section.color : "#9898b8",
                border: `1px solid ${activeSection === section.id ? `${section.color}40` : "#2a2a45"}`,
              }}
            >
              {section.icon}
              {section.label}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6">
        {/* Plot Threads */}
        {activeSection === "threads" && (
          <div>
            <p className="text-xs mb-4" style={{ color: "#9898b8" }}>
              Track parallel plot threads, subplots, and their resolution status.
            </p>
            <ElementCards
              elements={filteredElements}
              color="#ef4444"
              onDelete={(id) => deleteMutation.mutate({ elementId: id })}
              statusOptions={["Active", "Dormant", "Resolved", "Abandoned"]}
            />
            <AddForm isAdding={isAdding} setIsAdding={setIsAdding} name={newName} setName={setNewName}
              desc={newDesc} setDesc={setNewDesc} onAdd={handleAdd} color="#ef4444"
              placeholder="e.g. The missing shipment, The senator's secret, The mole in the agency..." />
          </div>
        )}

        {/* Clues & Red Herrings */}
        {activeSection === "clues" && (
          <div>
            <p className="text-xs mb-4" style={{ color: "#9898b8" }}>
              Plant clues and red herrings — track what readers know vs. what they think they know.
            </p>

            <div className="flex gap-2 mb-4">
              <button
                className="px-3 py-1.5 rounded-lg text-xs font-medium"
                style={{ background: "rgba(59,130,246,0.15)", color: "#3b82f6", border: "1px solid rgba(59,130,246,0.3)" }}
              >
                <Eye size={11} className="inline mr-1" />
                Clues ({allElements.filter((e) => e.type === "CLUE").length})
              </button>
              <button
                className="px-3 py-1.5 rounded-lg text-xs font-medium"
                style={{ background: "#1a1a2e", color: "#9898b8", border: "1px solid #2a2a45" }}
                onClick={() => {
                  createMutation.mutate({
                    projectId,
                    data: { type: "RED_HERRING", name: "New Red Herring", tags: [] },
                  });
                }}
              >
                <AlertTriangle size={11} className="inline mr-1" />
                Red Herrings ({allElements.filter((e) => e.type === "RED_HERRING").length})
              </button>
            </div>

            <ElementCards
              elements={filteredElements}
              color="#3b82f6"
              onDelete={(id) => deleteMutation.mutate({ elementId: id })}
              statusOptions={["Planted", "Encountered", "Revealed"]}
            />
            <AddForm isAdding={isAdding} setIsAdding={setIsAdding} name={newName} setName={setNewName}
              desc={newDesc} setDesc={setNewDesc} onAdd={handleAdd} color="#3b82f6"
              placeholder="e.g. The bloody glove, The anonymous note, The missing hour..." />
          </div>
        )}

        {/* Stakes Escalation */}
        {activeSection === "stakes" && (
          <div>
            <p className="text-xs mb-4" style={{ color: "#9898b8" }}>
              Track how stakes escalate across your thriller. The stakes ladder should climb.
            </p>
            <div className="space-y-3 mb-6">
              {STAKES_LEVELS.map((stake) => {
                const isSet = filteredElements.some(
                  (el) => (el.properties as Record<string, unknown>)?.level === stake.level
                );
                return (
                  <div
                    key={stake.level}
                    className="flex items-center gap-4 rounded-xl p-4"
                    style={{
                      background: isSet ? "rgba(249,115,22,0.08)" : "#1a1a2e",
                      border: `1px solid ${isSet ? "rgba(249,115,22,0.3)" : "#2a2a45"}`,
                    }}
                  >
                    <div className="flex gap-0.5">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <TrendingUp
                          key={i}
                          size={14}
                          style={{ color: i < stake.level ? "#f97316" : "#2a2a45" }}
                        />
                      ))}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-semibold" style={{ color: isSet ? "#f0f0f8" : "#9898b8" }}>
                        Level {stake.level}: {stake.label}
                      </p>
                      <p className="text-xs" style={{ color: "#5a5a7a" }}>{stake.description}</p>
                    </div>
                  </div>
                );
              })}
            </div>
            <ElementCards
              elements={filteredElements}
              color="#f97316"
              onDelete={(id) => deleteMutation.mutate({ elementId: id })}
            />
            <AddForm isAdding={isAdding} setIsAdding={setIsAdding} name={newName} setName={setNewName}
              desc={newDesc} setDesc={setNewDesc} onAdd={handleAdd} color="#f97316"
              placeholder="Describe a specific stake..." />
          </div>
        )}

        {/* Revelations */}
        {activeSection === "revelations" && (
          <div>
            <p className="text-xs mb-4" style={{ color: "#9898b8" }}>
              Plan your reveals — who learns what, when, and what the impact is.
            </p>
            <ElementCards
              elements={filteredElements}
              color="#f59e0b"
              onDelete={(id) => deleteMutation.mutate({ elementId: id })}
              statusOptions={["Planned", "Delivered", "Foreshadowed"]}
            />
            <AddForm isAdding={isAdding} setIsAdding={setIsAdding} name={newName} setName={setNewName}
              desc={newDesc} setDesc={setNewDesc} onAdd={handleAdd} color="#f59e0b"
              placeholder="e.g. The killer is the victim's brother, The agent is double-crossing..." />
          </div>
        )}

        {/* Antagonist Assets */}
        {activeSection === "antagonist" && (
          <div>
            <p className="text-xs mb-4" style={{ color: "#9898b8" }}>
              Track your antagonist&apos;s resources, capabilities, and knowledge — what can they do and what do they know?
            </p>
            <ElementCards
              elements={filteredElements}
              color="#8b5cf6"
              onDelete={(id) => deleteMutation.mutate({ elementId: id })}
            />
            <AddForm isAdding={isAdding} setIsAdding={setIsAdding} name={newName} setName={setNewName}
              desc={newDesc} setDesc={setNewDesc} onAdd={handleAdd} color="#8b5cf6"
              placeholder="e.g. Knows protagonist's identity, Controls the police chief, Has the files..." />
          </div>
        )}
      </div>
    </div>
  );
}

function ElementCards({
  elements, color, onDelete, statusOptions,
}: {
  elements: WorldElement[];
  color: string;
  onDelete: (id: string) => void;
  statusOptions?: string[];
}) {
  if (elements.length === 0) return null;
  return (
    <div className="space-y-2 mb-4">
      {elements.map((el) => (
        <div
          key={el.id}
          className="rounded-xl p-4"
          style={{ background: "#1a1a2e", border: `1px solid ${color}20` }}
        >
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1">
              <p className="text-sm font-medium" style={{ color: "#f0f0f8" }}>{el.name}</p>
              {el.description && (
                <p className="text-xs mt-1" style={{ color: "#9898b8" }}>{el.description}</p>
              )}
              {statusOptions && (
                <div className="flex gap-1.5 mt-2 flex-wrap">
                  {statusOptions.map((opt) => (
                    <span
                      key={opt}
                      className="text-xs px-2 py-0.5 rounded-full cursor-pointer"
                      style={{ background: "#0c0c14", color: "#5a5a7a", border: "1px solid #2a2a45" }}
                    >
                      {opt}
                    </span>
                  ))}
                </div>
              )}
            </div>
            <button
              onClick={() => onDelete(el.id)}
              style={{ color: "#5a5a7a" }}
              onMouseEnter={(e) => (e.currentTarget.style.color = "#ef4444")}
              onMouseLeave={(e) => (e.currentTarget.style.color = "#5a5a7a")}
            >
              <Trash2 size={13} />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

function AddForm({
  isAdding, setIsAdding, name, setName, desc, setDesc, onAdd, color, placeholder,
}: {
  isAdding: boolean; setIsAdding: (v: boolean) => void;
  name: string; setName: (v: string) => void;
  desc: string; setDesc: (v: string) => void;
  onAdd: () => void; color: string; placeholder: string;
}) {
  if (!isAdding) {
    return (
      <button
        onClick={() => setIsAdding(true)}
        className="flex items-center gap-2 text-xs transition-colors"
        style={{ color: "#5a5a7a" }}
        onMouseEnter={(e) => (e.currentTarget.style.color = color)}
        onMouseLeave={(e) => (e.currentTarget.style.color = "#5a5a7a")}
      >
        <Plus size={13} />
        Add element
      </button>
    );
  }

  return (
    <div className="rounded-xl p-4 mt-2" style={{ background: "#1a1a2e", border: `1px solid ${color}30` }}>
      <input
        autoFocus
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-lg px-3 py-2 text-sm mb-2 focus:outline-none"
        style={{ background: "#0c0c14", border: "1px solid #2a2a45", color: "#f0f0f8" }}
        onFocus={(e) => (e.currentTarget.style.borderColor = color)}
        onBlur={(e) => (e.currentTarget.style.borderColor = "#2a2a45")}
        onKeyDown={(e) => e.key === "Enter" && onAdd()}
      />
      <textarea
        value={desc}
        onChange={(e) => setDesc(e.target.value)}
        placeholder="Details (optional)"
        className="w-full rounded-lg px-3 py-2 text-xs mb-3 focus:outline-none resize-none"
        style={{ background: "#0c0c14", border: "1px solid #2a2a45", color: "#f0f0f8", minHeight: "55px" }}
      />
      <div className="flex gap-2">
        <button onClick={onAdd} className="px-4 py-1.5 rounded-lg text-xs font-semibold"
          style={{ background: color, color: "#0c0c14" }}>Add</button>
        <button onClick={() => { setIsAdding(false); setName(""); setDesc(""); }}
          className="px-4 py-1.5 rounded-lg text-xs"
          style={{ background: "transparent", color: "#9898b8", border: "1px solid #2a2a45" }}>Cancel</button>
      </div>
    </div>
  );
}
