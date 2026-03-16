"use client";

import { useState, useRef } from "react";
import Link from "next/link";
import {
  Play, Film, ZoomIn, ZoomOut, Grid, List,
  ChevronRight, BarChart3, Heart, Zap, Flame, AlertTriangle
} from "lucide-react";
import { EMOTION_COLORS } from "@/server/services/emotionalScoringService";

interface SceneData {
  id: string;
  title: string;
  orderIndex: number;
  chapterId: string;
  chapterTitle: string;
  chapterOrderIndex: number;
  sceneType: string;
  wordCount: number;
  emotionalScore: {
    tensionScore: number;
    romanceScore: number;
    actionScore: number;
    hopeScore: number;
    fearScore: number;
    sadnessScore: number;
    joyScore: number;
    overallIntensity: number;
    dominantEmotion: string;
  } | null;
  characterAppearances: Array<{
    character: { id: string; name: string; avatarColor: string | null; role: string };
  }>;
}

interface TimelineViewProps {
  projectId: string;
  chapters: Array<{
    id: string;
    title: string;
    orderIndex: number;
    scenes: SceneData[];
  }>;
}

const EMOTION_ICON_MAP: Record<string, React.ReactNode> = {
  tension: <AlertTriangle size={10} />,
  romance: <Heart size={10} />,
  action: <Zap size={10} />,
  fear: <Flame size={10} />,
  joy: <BarChart3 size={10} />,
};

export function TimelineView({ projectId, chapters }: TimelineViewProps) {
  const [zoom, setZoom] = useState(1);
  const [viewMode, setViewMode] = useState<"timeline" | "grid">("timeline");
  const [hoveredScene, setHoveredScene] = useState<string | null>(null);
  const timelineRef = useRef<HTMLDivElement>(null);

  const allScenes = chapters.flatMap((ch) =>
    ch.scenes.map((sc) => ({ ...sc, chapterTitle: ch.title, chapterOrderIndex: ch.orderIndex }))
  );

  const maxWords = Math.max(...allScenes.map((s) => s.wordCount), 100);
  const minClipWidth = 80;
  const maxClipWidth = 300;

  const getClipWidth = (wordCount: number) => {
    const ratio = Math.min(wordCount / maxWords, 1);
    return minClipWidth + ratio * (maxClipWidth - minClipWidth) * zoom;
  };

  const getEmotionColor = (scene: SceneData): string => {
    if (!scene.emotionalScore) return "#35354a";
    const emotion = scene.emotionalScore.dominantEmotion;
    return EMOTION_COLORS[emotion as keyof typeof EMOTION_COLORS] ?? EMOTION_COLORS.neutral;
  };

  const getIntensityHeight = (scene: SceneData): number => {
    if (!scene.emotionalScore) return 20;
    return 20 + (scene.emotionalScore.overallIntensity / 10) * 60;
  };

  if (viewMode === "grid") {
    return (
      <GridView
        projectId={projectId}
        chapters={chapters}
        onSwitchToTimeline={() => setViewMode("timeline")}
      />
    );
  }

  return (
    <div className="flex flex-col h-full" style={{ background: "#0c0c14" }}>
      {/* Toolbar */}
      <div
        className="flex items-center gap-3 px-6 py-3 border-b"
        style={{ background: "#13131f", borderColor: "#2a2a45" }}
      >
        <div className="flex items-center gap-2">
          <Film size={16} style={{ color: "#f59e0b" }} />
          <span className="text-sm font-semibold" style={{ color: "#f0f0f8" }}>
            Story Timeline
          </span>
        </div>

        <div className="h-4 w-px mx-2" style={{ background: "#2a2a45" }} />

        {/* Zoom controls */}
        <div className="flex items-center gap-1">
          <button
            onClick={() => setZoom(Math.max(0.5, zoom - 0.25))}
            className="p-1.5 rounded transition-colors"
            style={{ color: "#9898b8" }}
            title="Zoom out"
            onMouseEnter={(e) => (e.currentTarget.style.color = "#f59e0b")}
            onMouseLeave={(e) => (e.currentTarget.style.color = "#9898b8")}
          >
            <ZoomOut size={14} />
          </button>
          <span className="text-xs w-10 text-center" style={{ color: "#5a5a7a" }}>
            {Math.round(zoom * 100)}%
          </span>
          <button
            onClick={() => setZoom(Math.min(3, zoom + 0.25))}
            className="p-1.5 rounded transition-colors"
            style={{ color: "#9898b8" }}
            title="Zoom in"
            onMouseEnter={(e) => (e.currentTarget.style.color = "#f59e0b")}
            onMouseLeave={(e) => (e.currentTarget.style.color = "#9898b8")}
          >
            <ZoomIn size={14} />
          </button>
        </div>

        <div className="ml-auto flex items-center gap-2">
          {/* Emotion legend */}
          <div className="flex items-center gap-3 text-xs" style={{ color: "#5a5a7a" }}>
            {Object.entries(EMOTION_COLORS).slice(0, 5).map(([emotion, color]) => (
              <span key={emotion} className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full" style={{ background: color }} />
                {emotion}
              </span>
            ))}
          </div>

          <div className="h-4 w-px mx-1" style={{ background: "#2a2a45" }} />

          <button
            onClick={() => setViewMode("grid")}
            className="p-1.5 rounded transition-colors"
            title="Grid View"
            style={{ color: "#9898b8" }}
            onMouseEnter={(e) => (e.currentTarget.style.color = "#f59e0b")}
            onMouseLeave={(e) => (e.currentTarget.style.color = "#9898b8")}
          >
            <Grid size={14} />
          </button>
        </div>
      </div>

      {/* Timeline */}
      <div className="flex-1 overflow-auto" ref={timelineRef}>
        <div className="p-6 min-w-max">
          {chapters.map((chapter, chIdx) => (
            <div key={chapter.id} className="mb-8">
              {/* Chapter label */}
              <div className="flex items-center gap-3 mb-3">
                <span
                  className="text-xs font-bold uppercase tracking-wider px-2 py-1 rounded"
                  style={{ background: "#1a1a2e", color: "#9898b8", border: "1px solid #2a2a45" }}
                >
                  Ch {chapter.orderIndex + 1}
                </span>
                <span className="text-sm font-medium" style={{ color: "#f0f0f8" }}>
                  {chapter.title}
                </span>
                <span className="text-xs" style={{ color: "#5a5a7a" }}>
                  {chapter.scenes.reduce((a, s) => a + s.wordCount, 0).toLocaleString()} words
                </span>
              </div>

              {/* Scene clips row */}
              <div className="flex items-end gap-2 relative">
                {/* Timeline track background */}
                <div
                  className="absolute bottom-0 left-0 right-0 h-1 rounded-full"
                  style={{ background: "#1a1a2e" }}
                />

                {chapter.scenes.map((scene, scIdx) => {
                  const width = getClipWidth(scene.wordCount);
                  const height = getIntensityHeight(scene);
                  const color = getEmotionColor(scene);
                  const isHovered = hoveredScene === scene.id;

                  return (
                    <div
                      key={scene.id}
                      className="relative flex-shrink-0"
                      style={{ width }}
                      onMouseEnter={() => setHoveredScene(scene.id)}
                      onMouseLeave={() => setHoveredScene(null)}
                    >
                      {/* Scene clip */}
                      <Link href={`/dashboard/projects/${projectId}/write/${scene.id}`}>
                        <div
                          className="relative rounded-lg overflow-hidden cursor-pointer transition-all duration-150"
                          style={{
                            height: `${height}px`,
                            background: `${color}18`,
                            border: `1px solid ${isHovered ? color : color + "60"}`,
                            transform: isHovered ? "translateY(-4px) scaleY(1.02)" : "translateY(0)",
                            boxShadow: isHovered ? `0 8px 24px ${color}30` : "none",
                          }}
                        >
                          {/* Emotion intensity fill */}
                          <div
                            className="absolute bottom-0 left-0 right-0 opacity-40"
                            style={{
                              background: `linear-gradient(to top, ${color}, transparent)`,
                              height: "60%",
                            }}
                          />

                          {/* Scene info */}
                          <div className="absolute inset-0 p-2 flex flex-col justify-between">
                            <div className="flex items-center justify-between">
                              <span
                                className="text-xs font-semibold truncate flex-1"
                                style={{ color: isHovered ? "#f0f0f8" : "#9898b8", fontSize: "10px" }}
                              >
                                {scene.title}
                              </span>
                              {scene.emotionalScore && (
                                <span style={{ color }}>
                                  {EMOTION_ICON_MAP[scene.emotionalScore.dominantEmotion] ?? null}
                                </span>
                              )}
                            </div>

                            {/* Character dots */}
                            {scene.characterAppearances.length > 0 && (
                              <div className="flex gap-0.5 mt-1">
                                {scene.characterAppearances.slice(0, 4).map((app) => (
                                  <div
                                    key={app.character.id}
                                    className="w-3 h-3 rounded-full border border-[#13131f]"
                                    style={{ background: app.character.avatarColor ?? "#35354a" }}
                                    title={app.character.name}
                                  />
                                ))}
                              </div>
                            )}

                            <div
                              className="text-xs mt-auto"
                              style={{ color: "#5a5a7a", fontSize: "9px" }}
                            >
                              {scene.wordCount.toLocaleString()}w
                            </div>
                          </div>
                        </div>
                      </Link>

                      {/* Hover tooltip */}
                      {isHovered && (
                        <div
                          className="absolute bottom-full mb-2 left-0 z-10 rounded-lg p-3 text-xs shadow-xl"
                          style={{
                            background: "#1a1a2e",
                            border: `1px solid ${color}60`,
                            minWidth: "180px",
                            boxShadow: `0 4px 24px rgba(0,0,0,0.5), 0 0 0 1px ${color}20`,
                          }}
                        >
                          <p className="font-semibold mb-1" style={{ color: "#f0f0f8" }}>
                            {scene.title}
                          </p>
                          <p style={{ color: "#9898b8" }}>{scene.wordCount.toLocaleString()} words</p>
                          {scene.emotionalScore && (
                            <div className="mt-2 space-y-1">
                              <p className="font-semibold" style={{ color }}>
                                {scene.emotionalScore.dominantEmotion}
                              </p>
                              <p style={{ color: "#5a5a7a" }}>
                                Intensity: {scene.emotionalScore.overallIntensity.toFixed(1)}/10
                              </p>
                            </div>
                          )}
                          <p className="mt-2 text-xs flex items-center gap-1" style={{ color: "#f59e0b" }}>
                            <Play size={10} />
                            Click to edit
                          </p>
                        </div>
                      )}
                    </div>
                  );
                })}

                {chapter.scenes.length === 0 && (
                  <div
                    className="px-4 py-2 rounded-lg text-xs border border-dashed"
                    style={{ color: "#35354a", borderColor: "#2a2a45" }}
                  >
                    No scenes
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Stats bar */}
      <div
        className="border-t px-6 py-3 flex items-center gap-6 text-xs"
        style={{ borderColor: "#2a2a45", background: "#13131f", color: "#5a5a7a" }}
      >
        <span>{chapters.length} chapters</span>
        <span>{allScenes.length} scenes</span>
        <span>{allScenes.reduce((a, s) => a + s.wordCount, 0).toLocaleString()} total words</span>
        <span>
          {allScenes.filter((s) => s.emotionalScore).length} scenes analyzed
        </span>
      </div>
    </div>
  );
}

function GridView({
  projectId,
  chapters,
  onSwitchToTimeline,
}: {
  projectId: string;
  chapters: TimelineViewProps["chapters"];
  onSwitchToTimeline: () => void;
}) {
  return (
    <div className="flex flex-col h-full" style={{ background: "#0c0c14" }}>
      <div
        className="flex items-center gap-3 px-6 py-3 border-b"
        style={{ background: "#13131f", borderColor: "#2a2a45" }}
      >
        <div className="flex items-center gap-2">
          <Grid size={16} style={{ color: "#f59e0b" }} />
          <span className="text-sm font-semibold" style={{ color: "#f0f0f8" }}>Scene Grid</span>
        </div>
        <div className="ml-auto">
          <button
            onClick={onSwitchToTimeline}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs transition-colors"
            style={{ color: "#9898b8" }}
            onMouseEnter={(e) => (e.currentTarget.style.color = "#f59e0b")}
            onMouseLeave={(e) => (e.currentTarget.style.color = "#9898b8")}
          >
            <Film size={13} />
            Timeline View
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-auto p-6">
        {chapters.map((chapter) => (
          <div key={chapter.id} className="mb-8">
            <h3 className="text-sm font-semibold mb-4 flex items-center gap-2" style={{ color: "#f0f0f8" }}>
              <ChevronRight size={14} style={{ color: "#f59e0b" }} />
              {chapter.title}
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {chapter.scenes.map((scene) => (
                <Link
                  key={scene.id}
                  href={`/dashboard/projects/${projectId}/write/${scene.id}`}
                  className="rounded-xl p-4 transition-all scene-card"
                  style={{
                    background: "#1a1a2e",
                    border: "1px solid #2a2a45",
                  }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLAnchorElement).style.border = "1px solid #35354a";
                    (e.currentTarget as HTMLAnchorElement).style.background = "#1f1f35";
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLAnchorElement).style.border = "1px solid #2a2a45";
                    (e.currentTarget as HTMLAnchorElement).style.background = "#1a1a2e";
                  }}
                >
                  {scene.emotionalScore && (
                    <div
                      className="h-1 rounded-full mb-3"
                      style={{
                        background: EMOTION_COLORS[scene.emotionalScore.dominantEmotion as keyof typeof EMOTION_COLORS] ?? "#35354a",
                      }}
                    />
                  )}
                  <p className="text-sm font-medium mb-2 truncate" style={{ color: "#f0f0f8" }}>
                    {scene.title}
                  </p>
                  <p className="text-xs" style={{ color: "#5a5a7a" }}>
                    {scene.wordCount.toLocaleString()} words
                  </p>
                  {scene.emotionalScore && (
                    <p className="text-xs mt-1 capitalize" style={{ color: "#9898b8" }}>
                      {scene.emotionalScore.dominantEmotion}
                    </p>
                  )}
                </Link>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
