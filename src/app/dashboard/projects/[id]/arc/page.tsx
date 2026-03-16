"use client";

import { useState } from "react";
import { api } from "@/trpc/react";
import { EmotionalArcChart } from "@/components/emotional/EmotionalArcChart";
import { ArrowLeft, BarChart3, Loader2, Zap, RefreshCw } from "lucide-react";
import Link from "next/link";

interface ArcPageProps {
  params: { id: string };
}

export default function ArcPage({ params }: ArcPageProps) {
  const projectId = params.id;
  const { data: project } = api.projects.get.useQuery({ id: projectId });
  const { data: arcData, refetch } = api.emotional.getProjectArc.useQuery({ projectId });
  const analyzeAll = api.emotional.analyzeAllUnscored.useMutation({
    onSuccess: () => void refetch(),
  });

  if (!project || !arcData) {
    return (
      <div className="flex items-center justify-center h-screen" style={{ background: "#0c0c14" }}>
        <Loader2 size={24} className="animate-spin" style={{ color: "#35354a" }} />
      </div>
    );
  }

  const unanalyzed = arcData.filter((d) => d.intensity === 0).length;

  return (
    <div className="flex flex-col h-screen" style={{ background: "#0c0c14" }}>
      {/* Header */}
      <div
        className="flex items-center gap-3 px-8 py-4 border-b flex-shrink-0"
        style={{ background: "#13131f", borderColor: "#2a2a45" }}
      >
        <Link
          href={`/dashboard/projects/${projectId}`}
          className="p-1.5 rounded-lg"
          style={{ color: "#5a5a7a" }}
          onMouseEnter={(e) => (e.currentTarget.style.color = "#f59e0b")}
          onMouseLeave={(e) => (e.currentTarget.style.color = "#5a5a7a")}
        >
          <ArrowLeft size={16} />
        </Link>
        <BarChart3 size={18} style={{ color: "#8b5cf6" }} />
        <h1 className="text-lg font-bold" style={{ color: "#f0f0f8" }}>Emotional Arc</h1>
        <span className="text-xs" style={{ color: "#9898b8" }}>— {project.title}</span>

        {unanalyzed > 0 && (
          <span
            className="text-xs px-2.5 py-1 rounded-full ml-2"
            style={{ background: "rgba(245,158,11,0.1)", color: "#f59e0b", border: "1px solid rgba(245,158,11,0.2)" }}
          >
            {unanalyzed} scenes need analysis
          </span>
        )}

        <div className="ml-auto">
          <button
            onClick={() => analyzeAll.mutate({ projectId })}
            disabled={analyzeAll.isPending || unanalyzed === 0}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all"
            style={{
              background: unanalyzed > 0 ? "rgba(139,92,246,0.15)" : "rgba(255,255,255,0.05)",
              color: unanalyzed > 0 ? "#8b5cf6" : "#5a5a7a",
              border: `1px solid ${unanalyzed > 0 ? "rgba(139,92,246,0.3)" : "#2a2a45"}`,
            }}
          >
            {analyzeAll.isPending ? (
              <><Loader2 size={14} className="animate-spin" /> Analyzing...</>
            ) : (
              <><Zap size={14} /> Analyze All Scenes</>
            )}
          </button>
        </div>
      </div>

      {/* Arc Chart */}
      <div className="flex-1 overflow-y-auto p-8">
        <div
          className="rounded-2xl p-6 mb-6"
          style={{ background: "#13131f", border: "1px solid #2a2a45" }}
        >
          <div className="h-[400px]">
            <EmotionalArcChart data={arcData} genre={project.genre ?? undefined} />
          </div>
        </div>

        {/* Scene breakdown */}
        {arcData.length > 0 && (
          <div className="rounded-2xl overflow-hidden" style={{ background: "#13131f", border: "1px solid #2a2a45" }}>
            <div className="px-6 py-4 border-b" style={{ borderColor: "#2a2a45" }}>
              <h2 className="text-sm font-semibold" style={{ color: "#f0f0f8" }}>Scene Breakdown</h2>
            </div>
            <div className="divide-y" style={{ borderColor: "#2a2a45" }}>
              {arcData.map((scene) => (
                <div key={scene.sceneId} className="flex items-center gap-4 px-6 py-3">
                  <span className="text-xs w-6 text-right flex-shrink-0" style={{ color: "#5a5a7a" }}>{scene.sceneIndex}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm truncate" style={{ color: "#f0f0f8" }}>{scene.title}</p>
                    <p className="text-xs" style={{ color: "#5a5a7a" }}>{scene.chapterTitle}</p>
                  </div>
                  {scene.intensity > 0 ? (
                    <>
                      <span
                        className="text-xs px-2 py-0.5 rounded-full capitalize"
                        style={{
                          background: "rgba(139,92,246,0.1)",
                          color: "#8b5cf6",
                          border: "1px solid rgba(139,92,246,0.2)",
                        }}
                      >
                        {scene.dominant}
                      </span>
                      <div className="w-20 h-1.5 rounded-full overflow-hidden" style={{ background: "#2a2a45" }}>
                        <div
                          className="h-full rounded-full"
                          style={{
                            width: `${(scene.intensity / 10) * 100}%`,
                            background: "#8b5cf6",
                          }}
                        />
                      </div>
                      <span className="text-xs w-6" style={{ color: "#9898b8" }}>
                        {scene.intensity.toFixed(1)}
                      </span>
                    </>
                  ) : (
                    <span className="text-xs" style={{ color: "#35354a" }}>Not analyzed</span>
                  )}
                  <Link
                    href={`/dashboard/projects/${projectId}/write/${scene.sceneId}`}
                    className="text-xs px-2 py-1 rounded-lg transition-colors"
                    style={{ color: "#5a5a7a", border: "1px solid #2a2a45" }}
                    onMouseEnter={(e) => (e.currentTarget.style.color = "#f59e0b")}
                    onMouseLeave={(e) => (e.currentTarget.style.color = "#5a5a7a")}
                  >
                    Edit
                  </Link>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
