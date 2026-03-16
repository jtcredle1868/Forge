"use client";

import { api } from "@/trpc/react";
import { WorldBuilder } from "@/components/world/WorldBuilder";
import { ArrowLeft, Globe, Loader2 } from "lucide-react";
import Link from "next/link";

interface WorldPageProps {
  params: { id: string };
}

export default function WorldPage({ params }: WorldPageProps) {
  const projectId = params.id;
  const { data: project } = api.projects.get.useQuery({ id: projectId });

  if (!project) {
    return (
      <div className="flex items-center justify-center h-screen" style={{ background: "#0c0c14" }}>
        <Loader2 size={24} className="animate-spin" style={{ color: "#35354a" }} />
      </div>
    );
  }

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
        <Globe size={18} style={{ color: "#10b981" }} />
        <h1 className="text-lg font-bold" style={{ color: "#f0f0f8" }}>World Builder</h1>
        <span className="text-xs" style={{ color: "#9898b8" }}>— {project.title}</span>
        {project.genre && (
          <span
            className="ml-2 text-xs px-2.5 py-1 rounded-full"
            style={{ background: "rgba(16,185,129,0.1)", color: "#10b981", border: "1px solid rgba(16,185,129,0.2)" }}
          >
            {project.genre}
          </span>
        )}
      </div>

      {/* World Builder */}
      <div className="flex-1 overflow-hidden">
        <WorldBuilder projectId={projectId} genre={project.genre ?? "romance"} />
      </div>
    </div>
  );
}
