"use client";

import { useState } from "react";
import { ChevronDown, ChevronRight, Plus, FileText, BookOpen, GripVertical } from "lucide-react";
import Link from "next/link";

interface Scene {
  id: string;
  title: string;
  orderIndex: number;
  document?: { wordCount: number } | null;
}

interface Chapter {
  id: string;
  title: string;
  orderIndex: number;
  scenes: Scene[];
}

interface ChapterPanelProps {
  projectId: string;
  chapters: Chapter[];
  activeSceneId?: string;
  onNewChapter?: () => void;
  onNewScene?: (chapterId: string) => void;
}

export function ChapterPanel({
  projectId,
  chapters,
  activeSceneId,
  onNewChapter,
  onNewScene,
}: ChapterPanelProps) {
  const [expanded, setExpanded] = useState<Record<string, boolean>>(
    Object.fromEntries(chapters.map((ch) => [ch.id, true]))
  );

  const toggleChapter = (chapterId: string) => {
    setExpanded((prev) => ({ ...prev, [chapterId]: !prev[chapterId] }));
  };

  const totalWords = chapters.flatMap((ch) => ch.scenes).reduce(
    (acc, sc) => acc + (sc.document?.wordCount ?? 0),
    0
  );

  return (
    <div
      className="h-full flex flex-col"
      style={{ background: "#13131f", borderRight: "1px solid #2a2a45" }}
    >
      {/* Header */}
      <div className="p-4 border-b" style={{ borderColor: "#2a2a45" }}>
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <BookOpen size={14} style={{ color: "#f59e0b" }} />
            <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: "#9898b8" }}>
              Structure
            </span>
          </div>
          <button
            onClick={onNewChapter}
            className="p-1 rounded transition-colors"
            style={{ color: "#5a5a7a" }}
            title="Add Chapter"
            onMouseEnter={(e) => (e.currentTarget.style.color = "#f59e0b")}
            onMouseLeave={(e) => (e.currentTarget.style.color = "#5a5a7a")}
          >
            <Plus size={14} />
          </button>
        </div>
        <p className="text-xs" style={{ color: "#5a5a7a" }}>
          {totalWords.toLocaleString()} total words
        </p>
      </div>

      {/* Chapter List */}
      <div className="flex-1 overflow-y-auto py-2">
        {chapters.length === 0 ? (
          <div className="text-center py-8 px-4">
            <FileText size={24} className="mx-auto mb-3" style={{ color: "#35354a" }} />
            <p className="text-xs" style={{ color: "#5a5a7a" }}>
              No chapters yet
            </p>
            <button
              onClick={onNewChapter}
              className="mt-3 text-xs px-3 py-1.5 rounded-lg transition-all"
              style={{
                background: "rgba(245,158,11,0.1)",
                color: "#f59e0b",
                border: "1px solid rgba(245,158,11,0.2)",
              }}
            >
              Add First Chapter
            </button>
          </div>
        ) : (
          chapters.map((chapter) => (
            <div key={chapter.id}>
              {/* Chapter header */}
              <button
                onClick={() => toggleChapter(chapter.id)}
                className="w-full flex items-center gap-2 px-4 py-2 text-left transition-colors group"
                onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(255,255,255,0.03)")}
                onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
              >
                <span style={{ color: "#5a5a7a" }}>
                  {expanded[chapter.id] ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
                </span>
                <span
                  className="flex-1 text-xs font-semibold truncate"
                  style={{ color: "#f0f0f8" }}
                >
                  {chapter.title}
                </span>
                <span className="text-xs opacity-0 group-hover:opacity-100 transition-opacity" style={{ color: "#5a5a7a" }}>
                  {chapter.scenes.reduce((a, s) => a + (s.document?.wordCount ?? 0), 0).toLocaleString()}w
                </span>
                <button
                  onClick={(e) => { e.stopPropagation(); onNewScene?.(chapter.id); }}
                  className="opacity-0 group-hover:opacity-100 transition-opacity p-0.5 rounded"
                  title="Add Scene"
                  style={{ color: "#9898b8" }}
                  onMouseEnter={(e) => (e.currentTarget.style.color = "#f59e0b")}
                  onMouseLeave={(e) => (e.currentTarget.style.color = "#9898b8")}
                >
                  <Plus size={11} />
                </button>
              </button>

              {/* Scenes */}
              {expanded[chapter.id] && (
                <div className="ml-4">
                  {chapter.scenes.map((scene) => {
                    const isActive = scene.id === activeSceneId;
                    return (
                      <Link
                        key={scene.id}
                        href={`/dashboard/projects/${projectId}/write/${scene.id}`}
                        className="flex items-center gap-2 px-4 py-1.5 text-xs rounded-lg mx-2 mb-0.5 transition-all"
                        style={{
                          background: isActive ? "rgba(245,158,11,0.12)" : "transparent",
                          color: isActive ? "#f59e0b" : "#9898b8",
                          borderLeft: isActive ? "2px solid #f59e0b" : "2px solid transparent",
                        }}
                        onMouseEnter={(e) => {
                          if (!isActive) {
                            (e.currentTarget as HTMLAnchorElement).style.background = "rgba(255,255,255,0.04)";
                            (e.currentTarget as HTMLAnchorElement).style.color = "#f0f0f8";
                          }
                        }}
                        onMouseLeave={(e) => {
                          if (!isActive) {
                            (e.currentTarget as HTMLAnchorElement).style.background = "transparent";
                            (e.currentTarget as HTMLAnchorElement).style.color = "#9898b8";
                          }
                        }}
                      >
                        <FileText size={11} className="flex-shrink-0" />
                        <span className="flex-1 truncate">{scene.title}</span>
                        {scene.document && (
                          <span className="text-xs opacity-60">
                            {scene.document.wordCount}w
                          </span>
                        )}
                      </Link>
                    );
                  })}

                  {chapter.scenes.length === 0 && (
                    <button
                      onClick={() => onNewScene?.(chapter.id)}
                      className="w-full text-left px-6 py-1.5 text-xs transition-colors"
                      style={{ color: "#35354a" }}
                      onMouseEnter={(e) => (e.currentTarget.style.color = "#f59e0b")}
                      onMouseLeave={(e) => (e.currentTarget.style.color = "#35354a")}
                    >
                      + Add scene
                    </button>
                  )}
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
