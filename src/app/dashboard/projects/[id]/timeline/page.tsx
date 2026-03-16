"use client";

import { api } from "@/trpc/react";
import { TimelineView } from "@/components/timeline/TimelineView";
import { ArrowLeft, Film, Loader2 } from "lucide-react";
import Link from "next/link";

interface TimelinePageProps {
  params: { id: string };
}

export default function TimelinePage({ params }: TimelinePageProps) {
  const projectId = params.id;
  const { data: project } = api.projects.get.useQuery({ id: projectId });

  if (!project) {
    return (
      <div className="flex items-center justify-center h-screen" style={{ background: "#0c0c14" }}>
        <Loader2 size={24} className="animate-spin" style={{ color: "#35354a" }} />
      </div>
    );
  }

  // Transform data for timeline
  const chapters = project.chapters.map((ch) => ({
    id: ch.id,
    title: ch.title,
    orderIndex: ch.orderIndex,
    scenes: ch.scenes.map((sc) => ({
      id: sc.id,
      title: sc.title,
      orderIndex: sc.orderIndex,
      chapterId: ch.id,
      chapterTitle: ch.title,
      chapterOrderIndex: ch.orderIndex,
      sceneType: sc.sceneType,
      wordCount: sc.document?.wordCount ?? 0,
      emotionalScore: sc.emotionalScore ?? null,
      characterAppearances: sc.appearances?.map((app) => ({
        character: {
          id: app.character.id,
          name: app.character.name,
          avatarColor: app.character.avatarColor,
          role: app.character.role,
        },
      })) ?? [],
    })),
  }));

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
        <Film size={18} style={{ color: "#f59e0b" }} />
        <h1 className="text-lg font-bold" style={{ color: "#f0f0f8" }}>Timeline</h1>
        <span className="text-xs" style={{ color: "#9898b8" }}>— {project.title}</span>
      </div>

      {/* Timeline View */}
      <div className="flex-1 overflow-hidden">
        <TimelineView projectId={projectId} chapters={chapters} />
      </div>
    </div>
  );
}
