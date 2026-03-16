"use client";

import { useState } from "react";
import { Plus, Lock, Heart, Target, Map, Clock, Flame, Eye, Sparkles, Cpu, Globe } from "lucide-react";
import { RomanceWorldBuilder } from "./RomanceWorldBuilder";
import { ThrillerWorldBuilder } from "./ThrillerWorldBuilder";

interface WorldBuilderProps {
  projectId: string;
  genre: string;
}

const GENRE_CONFIG = {
  romance: {
    label: "Romance",
    icon: <Heart size={16} />,
    color: "#ec4899",
    available: true,
  },
  thriller: {
    label: "Thriller",
    icon: <Target size={16} />,
    color: "#ef4444",
    available: true,
  },
  mystery: {
    label: "Mystery",
    icon: <Eye size={16} />,
    color: "#8b5cf6",
    available: true, // Uses thriller builder
  },
  fantasy: {
    label: "Fantasy",
    icon: <Sparkles size={16} />,
    color: "#f59e0b",
    available: false,
  },
  "sci-fi": {
    label: "Sci-Fi",
    icon: <Cpu size={16} />,
    color: "#3b82f6",
    available: false,
  },
  "literary fiction": {
    label: "Literary",
    icon: <Globe size={16} />,
    color: "#10b981",
    available: true, // Generic builder
  },
};

export function WorldBuilder({ projectId, genre }: WorldBuilderProps) {
  const normalizedGenre = genre?.toLowerCase() ?? "romance";
  const config = GENRE_CONFIG[normalizedGenre as keyof typeof GENRE_CONFIG];

  const isRomance = ["romance"].includes(normalizedGenre);
  const isThriller = ["thriller", "mystery", "suspense"].includes(normalizedGenre);

  if (!config || !config.available) {
    return <GenrePlaceholder genre={genre} />;
  }

  if (isRomance) {
    return <RomanceWorldBuilder projectId={projectId} />;
  }

  if (isThriller) {
    return <ThrillerWorldBuilder projectId={projectId} />;
  }

  // Generic fallback for other available genres
  return <RomanceWorldBuilder projectId={projectId} />;
}

function GenrePlaceholder({ genre }: { genre: string }) {
  const normalizedGenre = genre?.toLowerCase() ?? "fantasy";
  const isFantasy = normalizedGenre.includes("fantasy");
  const isSciFi = normalizedGenre.includes("sci") || normalizedGenre.includes("science");

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center"
          style={{ background: isFantasy ? "rgba(245,158,11,0.15)" : "rgba(59,130,246,0.15)" }}
        >
          {isFantasy ? (
            <Sparkles size={20} style={{ color: "#f59e0b" }} />
          ) : (
            <Cpu size={20} style={{ color: "#3b82f6" }} />
          )}
        </div>
        <div>
          <h2 className="text-lg font-bold" style={{ color: "#f0f0f8" }}>
            {isFantasy ? "Fantasy" : isSciFi ? "Sci-Fi" : genre} World Builder
          </h2>
          <p className="text-xs" style={{ color: "#9898b8" }}>
            Coming in next release — preview below
          </p>
        </div>
        <span
          className="ml-auto px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1"
          style={{ background: "rgba(245,158,11,0.1)", color: "#f59e0b", border: "1px solid rgba(245,158,11,0.2)" }}
        >
          <Lock size={10} />
          Preview
        </span>
      </div>

      {isFantasy && <FantasyPreview />}
      {isSciFi && <SciFiPreview />}
    </div>
  );
}

function FantasyPreview() {
  const categories = [
    {
      icon: <Sparkles size={16} />,
      title: "Magic System",
      color: "#f59e0b",
      description: "Define the rules, costs, and limits of your magic system",
      preview: [
        { name: "Source", value: "Emotional resonance" },
        { name: "Cost", value: "Physical exhaustion" },
        { name: "Rules", value: "3 defined" },
        { name: "Limitations", value: "2 defined" },
      ],
    },
    {
      icon: <Globe size={16} />,
      title: "World History",
      color: "#10b981",
      description: "Chronicle the events that shaped your world",
      preview: ["The Sundering", "The Age of Silence", "The Ember Wars"],
    },
    {
      icon: <Target size={16} />,
      title: "Factions & Alliances",
      color: "#ec4899",
      description: "Map political alliances, rivalries, and power structures",
      preview: ["The Silver Court", "Ashbound Brotherhood", "The Free Cities"],
    },
    {
      icon: <Map size={16} />,
      title: "Artifacts & Relics",
      color: "#8b5cf6",
      description: "Track magical items, their powers, and their history",
      preview: ["The Ember Crown", "Shadowthreader", "Veil Lens"],
    },
  ];

  return (
    <div className="space-y-4">
      <div
        className="rounded-xl p-4 text-sm"
        style={{ background: "rgba(245,158,11,0.05)", border: "1px dashed rgba(245,158,11,0.3)" }}
      >
        <p style={{ color: "#9898b8" }}>
          The Fantasy World Builder is being developed for the next major release.
          The architecture below shows exactly what you&apos;ll be able to build.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {categories.map((cat) => (
          <div
            key={cat.title}
            className="rounded-xl overflow-hidden opacity-75"
            style={{ background: "#1a1a2e", border: `1px solid ${cat.color}30` }}
          >
            <div
              className="px-4 py-3 flex items-center gap-2"
              style={{ background: `${cat.color}10`, borderBottom: `1px solid ${cat.color}20` }}
            >
              <span style={{ color: cat.color }}>{cat.icon}</span>
              <span className="text-sm font-semibold" style={{ color: "#f0f0f8" }}>
                {cat.title}
              </span>
              <Lock size={11} className="ml-auto" style={{ color: "#35354a" }} />
            </div>
            <div className="p-4">
              <p className="text-xs mb-3" style={{ color: "#9898b8" }}>{cat.description}</p>
              {Array.isArray(cat.preview) && typeof cat.preview[0] === "string" ? (
                <div className="space-y-1">
                  {(cat.preview as string[]).map((item) => (
                    <div
                      key={item}
                      className="text-xs px-3 py-1.5 rounded-lg"
                      style={{ background: "#0c0c14", color: "#5a5a7a", border: "1px solid #2a2a45" }}
                    >
                      {item}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="space-y-2">
                  {(cat.preview as Array<{ name: string; value: string }>).map((item) => (
                    <div key={item.name} className="flex justify-between text-xs">
                      <span style={{ color: "#5a5a7a" }}>{item.name}</span>
                      <span style={{ color: "#9898b8" }}>{item.value}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function SciFiPreview() {
  const categories = [
    {
      icon: <Cpu size={16} />,
      title: "Technology Registry",
      color: "#3b82f6",
      items: ["FTL Drive specs", "AI governance", "Weapons systems", "Medical tech"],
    },
    {
      icon: <Globe size={16} />,
      title: "Political Systems",
      color: "#10b981",
      items: ["Galactic Council", "Corporate Hegemonies", "Resistance cells", "AI States"],
    },
    {
      icon: <Sparkles size={16} />,
      title: "Species & Cultures",
      color: "#8b5cf6",
      items: ["Physiologies", "Belief systems", "Economic models", "Histories"],
    },
    {
      icon: <Clock size={16} />,
      title: "Science Rules",
      color: "#f97316",
      items: ["Physics constraints", "Time mechanics", "Biology limits", "Communication laws"],
    },
  ];

  return (
    <div className="space-y-4">
      <div
        className="rounded-xl p-4 text-sm"
        style={{ background: "rgba(59,130,246,0.05)", border: "1px dashed rgba(59,130,246,0.3)" }}
      >
        <p style={{ color: "#9898b8" }}>
          The Sci-Fi World Builder is designed to enforce internal consistency across your science
          and technology. Coming in the next major release.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {categories.map((cat) => (
          <div
            key={cat.title}
            className="rounded-xl p-4 opacity-70"
            style={{ background: "#1a1a2e", border: `1px solid ${cat.color}25` }}
          >
            <div className="flex items-center gap-2 mb-3">
              <span style={{ color: cat.color }}>{cat.icon}</span>
              <span className="text-xs font-semibold" style={{ color: "#f0f0f8" }}>
                {cat.title}
              </span>
              <Lock size={10} className="ml-auto" style={{ color: "#35354a" }} />
            </div>
            <ul className="space-y-1">
              {cat.items.map((item) => (
                <li key={item} className="text-xs flex items-center gap-2" style={{ color: "#5a5a7a" }}>
                  <div className="w-1 h-1 rounded-full" style={{ background: cat.color }} />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}
