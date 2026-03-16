"use client";

import { useState } from "react";
import { Plus, Heart, MapPin, Flame, Swords, Star, Clock, Trash2, Edit2, Check, X } from "lucide-react";
import { api } from "@/trpc/react";

const ROMANCE_STAGES = [
  "Meet-Cute / First Encounter",
  "Initial Attraction",
  "Deepening Connection",
  "First Kiss / Physical Spark",
  "Growing Feelings",
  "Misunderstanding / Conflict",
  "Separation / Dark Night",
  "Grand Gesture / Reconciliation",
  "HEA / HFN",
];

const ROMANCE_TROPES = [
  "Enemies to Lovers", "Friends to Lovers", "Second Chance", "Forced Proximity",
  "Fake Dating", "Forbidden Love", "Grumpy/Sunshine", "Age Gap", "Workplace Romance",
  "Small Town", "Sports Romance", "Secret Identity", "Reverse Harem", "Slow Burn",
];

const HEAT_LEVELS = [
  { level: 1, label: "Sweet", description: "Closed door, emotional focus" },
  { level: 2, label: "Warm", description: "Kissing, fade to black" },
  { level: 3, label: "Steamy", description: "Sensual, some explicit content" },
  { level: 4, label: "Spicy", description: "Explicit scenes, open door" },
  { level: 5, label: "Scorching", description: "Very explicit, high frequency" },
];

interface WorldElement {
  id: string;
  type: string;
  name: string;
  description: string | null;
  properties: unknown;
}

interface RomanceWorldBuilderProps {
  projectId: string;
}

export function RomanceWorldBuilder({ projectId }: RomanceWorldBuilderProps) {
  const [activeSection, setActiveSection] = useState<"relationship" | "settings" | "tropes" | "heat" | "conflict">("relationship");
  const [isAdding, setIsAdding] = useState(false);
  const [newElementName, setNewElementName] = useState("");
  const [newElementDesc, setNewElementDesc] = useState("");

  const { data: elements, refetch } = api.worldBuilder.getElements.useQuery({ projectId });
  const createMutation = api.worldBuilder.createElement.useMutation({
    onSuccess: () => { void refetch(); setIsAdding(false); setNewElementName(""); setNewElementDesc(""); },
  });
  const deleteMutation = api.worldBuilder.deleteElement.useMutation({
    onSuccess: () => void refetch(),
  });

  const sections = [
    { id: "relationship" as const, icon: <Heart size={14} />, label: "Relationship Arc", color: "#ec4899" },
    { id: "settings" as const, icon: <MapPin size={14} />, label: "Settings", color: "#10b981" },
    { id: "tropes" as const, icon: <Star size={14} />, label: "Tropes", color: "#f59e0b" },
    { id: "heat" as const, icon: <Flame size={14} />, label: "Heat Level", color: "#ef4444" },
    { id: "conflict" as const, icon: <Swords size={14} />, label: "Conflict", color: "#8b5cf6" },
  ];

  const getElementType = () => {
    const map: Record<string, string> = {
      relationship: "RELATIONSHIP_MILESTONE",
      settings: "SETTING",
      tropes: "TROPE",
      conflict: "CONFLICT",
    };
    return map[activeSection] ?? "SETTING";
  };

  const allElements = (elements ?? []) as WorldElement[];
  const filteredElements = allElements.filter((el) => {
    const typeMap: Record<string, string> = {
      relationship: "RELATIONSHIP_MILESTONE",
      settings: "SETTING",
      tropes: "TROPE",
      conflict: "CONFLICT",
    };
    return el.type === typeMap[activeSection];
  });

  const handleAdd = () => {
    if (!newElementName.trim()) return;
    createMutation.mutate({
      projectId,
      data: {
        type: getElementType() as Parameters<typeof createMutation.mutate>[0]["data"]["type"],
        name: newElementName,
        description: newElementDesc,
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
            style={{ background: "rgba(236,72,153,0.15)" }}
          >
            <Heart size={18} style={{ color: "#ec4899" }} />
          </div>
          <div>
            <h2 className="text-base font-bold" style={{ color: "#f0f0f8" }}>Romance World Builder</h2>
            <p className="text-xs" style={{ color: "#9898b8" }}>Track your love story&apos;s architecture</p>
          </div>
        </div>

        {/* Section tabs */}
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
        {/* Relationship Arc */}
        {activeSection === "relationship" && (
          <div>
            <p className="text-xs mb-4" style={{ color: "#9898b8" }}>
              Track where your romantic leads are in their relationship journey across the story.
            </p>

            {/* Stage tracker */}
            <div className="space-y-2 mb-6">
              {ROMANCE_STAGES.map((stage, i) => {
                const isTracked = filteredElements.some((el) =>
                  el.name === stage || (el.properties as Record<string, unknown>)?.stage === stage
                );
                return (
                  <div
                    key={stage}
                    className="flex items-center gap-3 rounded-xl p-3 transition-all cursor-pointer"
                    style={{
                      background: isTracked ? "rgba(236,72,153,0.08)" : "#1a1a2e",
                      border: `1px solid ${isTracked ? "rgba(236,72,153,0.3)" : "#2a2a45"}`,
                    }}
                    onClick={() => {
                      if (!isTracked) {
                        createMutation.mutate({
                          projectId,
                          data: {
                            type: "RELATIONSHIP_MILESTONE",
                            name: stage,
                            description: "",
                            properties: { stage, stageIndex: i },
                            tags: [],
                          },
                        });
                      } else {
                        const el = filteredElements.find((e) => e.name === stage);
                        if (el) deleteMutation.mutate({ elementId: el.id });
                      }
                    }}
                  >
                    <div
                      className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0"
                      style={{
                        background: isTracked ? "#ec4899" : "#2a2a45",
                        border: `2px solid ${isTracked ? "#ec4899" : "#35354a"}`,
                      }}
                    >
                      {isTracked && <Check size={10} style={{ color: "white" }} />}
                    </div>
                    <span className="text-sm" style={{ color: isTracked ? "#f0f0f8" : "#9898b8" }}>
                      {stage}
                    </span>
                    <span
                      className="ml-auto text-xs px-2 py-0.5 rounded-full"
                      style={{
                        background: "#0c0c14",
                        color: "#5a5a7a",
                        border: "1px solid #2a2a45",
                      }}
                    >
                      Stage {i + 1}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Settings */}
        {activeSection === "settings" && (
          <div>
            <p className="text-xs mb-4" style={{ color: "#9898b8" }}>
              Track the settings where your romance unfolds — time period, location, social context.
            </p>
            <ElementList
              elements={filteredElements}
              color="#10b981"
              onDelete={(id) => deleteMutation.mutate({ elementId: id })}
            />
            <AddElementForm
              isAdding={isAdding}
              setIsAdding={setIsAdding}
              name={newElementName}
              setName={setNewElementName}
              description={newElementDesc}
              setDescription={setNewElementDesc}
              onAdd={handleAdd}
              color="#10b981"
              placeholder="e.g. 1920s Paris, Small coastal town, Corporate New York..."
            />
          </div>
        )}

        {/* Tropes */}
        {activeSection === "tropes" && (
          <div>
            <p className="text-xs mb-4" style={{ color: "#9898b8" }}>
              Select tropes you&apos;re using and track how you&apos;re subverting them.
            </p>
            <div className="flex flex-wrap gap-2 mb-6">
              {ROMANCE_TROPES.map((trope) => {
                const isUsed = filteredElements.some((el) => el.name === trope);
                return (
                  <button
                    key={trope}
                    onClick={() => {
                      if (!isUsed) {
                        createMutation.mutate({
                          projectId,
                          data: { type: "TROPE", name: trope, tags: [] },
                        });
                      } else {
                        const el = filteredElements.find((e) => e.name === trope);
                        if (el) deleteMutation.mutate({ elementId: el.id });
                      }
                    }}
                    className="px-3 py-1.5 rounded-full text-xs font-medium transition-all"
                    style={{
                      background: isUsed ? "rgba(245,158,11,0.15)" : "#1a1a2e",
                      color: isUsed ? "#f59e0b" : "#9898b8",
                      border: `1px solid ${isUsed ? "rgba(245,158,11,0.4)" : "#2a2a45"}`,
                    }}
                  >
                    {trope}
                  </button>
                );
              })}
            </div>

            {filteredElements.length > 0 && (
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: "#5a5a7a" }}>
                  Active Tropes ({filteredElements.length})
                </p>
                <div className="space-y-2">
                  {filteredElements.map((el) => (
                    <div
                      key={el.id}
                      className="flex items-center justify-between rounded-lg px-3 py-2"
                      style={{ background: "#1a1a2e", border: "1px solid rgba(245,158,11,0.2)" }}
                    >
                      <span className="text-sm" style={{ color: "#f59e0b" }}>{el.name}</span>
                      <button
                        onClick={() => deleteMutation.mutate({ elementId: el.id })}
                        style={{ color: "#5a5a7a" }}
                        onMouseEnter={(e) => (e.currentTarget.style.color = "#ef4444")}
                        onMouseLeave={(e) => (e.currentTarget.style.color = "#5a5a7a")}
                      >
                        <X size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Heat Level */}
        {activeSection === "heat" && (
          <div>
            <p className="text-xs mb-4" style={{ color: "#9898b8" }}>
              Set and track the heat level of your romance across scenes.
            </p>
            <div className="space-y-3">
              {HEAT_LEVELS.map((level) => (
                <div
                  key={level.level}
                  className="rounded-xl p-4 flex items-center gap-4"
                  style={{ background: "#1a1a2e", border: "1px solid #2a2a45" }}
                >
                  <div className="flex gap-0.5">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Flame
                        key={i}
                        size={16}
                        style={{ color: i < level.level ? "#ef4444" : "#2a2a45" }}
                      />
                    ))}
                  </div>
                  <div>
                    <p className="text-sm font-semibold" style={{ color: "#f0f0f8" }}>
                      {level.label}
                    </p>
                    <p className="text-xs" style={{ color: "#9898b8" }}>
                      {level.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Conflict */}
        {activeSection === "conflict" && (
          <div>
            <p className="text-xs mb-4" style={{ color: "#9898b8" }}>
              Track the internal and external conflicts keeping your protagonists apart.
            </p>
            <ElementList
              elements={filteredElements}
              color="#8b5cf6"
              onDelete={(id) => deleteMutation.mutate({ elementId: id })}
            />
            <AddElementForm
              isAdding={isAdding}
              setIsAdding={setIsAdding}
              name={newElementName}
              setName={setNewElementName}
              description={newElementDesc}
              setDescription={setNewElementDesc}
              onAdd={handleAdd}
              color="#8b5cf6"
              placeholder="e.g. Class difference, Past trauma, Family feud, Career conflict..."
            />
          </div>
        )}
      </div>
    </div>
  );
}

function ElementList({
  elements,
  color,
  onDelete,
}: {
  elements: WorldElement[];
  color: string;
  onDelete: (id: string) => void;
}) {
  if (elements.length === 0) return null;

  return (
    <div className="space-y-2 mb-4">
      {elements.map((el) => (
        <div
          key={el.id}
          className="rounded-xl p-3"
          style={{ background: "#1a1a2e", border: `1px solid ${color}20` }}
        >
          <div className="flex items-start justify-between gap-2">
            <div>
              <p className="text-sm font-medium" style={{ color: "#f0f0f8" }}>{el.name}</p>
              {el.description && (
                <p className="text-xs mt-1" style={{ color: "#9898b8" }}>{el.description}</p>
              )}
            </div>
            <button
              onClick={() => onDelete(el.id)}
              className="p-1 rounded transition-colors flex-shrink-0"
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

function AddElementForm({
  isAdding, setIsAdding, name, setName, description, setDescription, onAdd, color, placeholder,
}: {
  isAdding: boolean;
  setIsAdding: (v: boolean) => void;
  name: string;
  setName: (v: string) => void;
  description: string;
  setDescription: (v: string) => void;
  onAdd: () => void;
  color: string;
  placeholder: string;
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
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        placeholder="Description (optional)"
        className="w-full rounded-lg px-3 py-2 text-xs mb-3 focus:outline-none resize-none"
        style={{ background: "#0c0c14", border: "1px solid #2a2a45", color: "#f0f0f8", minHeight: "60px" }}
        onFocus={(e) => (e.currentTarget.style.borderColor = color)}
        onBlur={(e) => (e.currentTarget.style.borderColor = "#2a2a45")}
      />
      <div className="flex gap-2">
        <button
          onClick={onAdd}
          className="px-4 py-1.5 rounded-lg text-xs font-semibold transition-all"
          style={{ background: color, color: "#0c0c14" }}
        >
          Add
        </button>
        <button
          onClick={() => { setIsAdding(false); setName(""); setDescription(""); }}
          className="px-4 py-1.5 rounded-lg text-xs transition-all"
          style={{ background: "transparent", color: "#9898b8", border: "1px solid #2a2a45" }}
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
