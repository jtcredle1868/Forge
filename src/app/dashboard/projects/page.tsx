"use client";

import React, { useState } from "react";
import { trpc } from "@/trpc/react";
import Link from "next/link";

const statusColors: Record<string, string> = {
  DRAFTING: "bg-blue-900/50 text-blue-300 border-blue-800",
  REVISING: "bg-amber-900/50 text-amber-300 border-amber-800",
  COMPLETE: "bg-green-900/50 text-green-300 border-green-800",
  ON_HOLD: "bg-slate-700/50 text-slate-400 border-slate-600",
};

export default function ProjectsPage() {
  const { data: projects, isLoading, refetch } = trpc.projects.list.useQuery();
  const archiveMutation = trpc.projects.archive.useMutation();
  const [archiving, setArchiving] = useState<string | null>(null);

  const handleArchive = async (id: string) => {
    if (!confirm("Archive this project? You can restore it from your account settings.")) return;
    setArchiving(id);
    try {
      await archiveMutation.mutateAsync({ id });
      void refetch();
    } finally {
      setArchiving(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-black text-white">Projects</h1>
          <p className="text-slate-400 mt-1">{projects?.length ?? 0} active manuscript{(projects?.length ?? 0) !== 1 ? "s" : ""}</p>
        </div>
        <Link href="/dashboard/projects/new"
          className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg transition-all"
          style={{ boxShadow: "0 0 15px rgba(59,130,246,0.3)" }}>
          + New Project
        </Link>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-slate-800/30 border border-slate-700 rounded-xl p-6 animate-pulse">
              <div className="h-5 bg-slate-700 rounded w-3/4 mb-3" />
              <div className="h-3 bg-slate-700 rounded w-1/2 mb-4" />
              <div className="h-3 bg-slate-700 rounded w-1/3" />
            </div>
          ))}
        </div>
      ) : !projects || projects.length === 0 ? (
        <div className="text-center py-20 bg-slate-800/20 border border-slate-700 rounded-2xl">
          <p className="text-5xl mb-4">✎</p>
          <h2 className="text-xl font-bold text-white mb-2">No projects yet</h2>
          <p className="text-slate-400 mb-6 max-w-sm mx-auto">Create your first manuscript project to start writing with The Forge.</p>
          <Link href="/dashboard/projects/new"
            className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-all">
            Create Your First Project
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {projects.map((project) => {
            const sceneCount = project.chapters.reduce((s: number, ch) => s + ch.scenes.length, 0);

            return (
              <div key={project.id} className="bg-slate-800/40 border border-slate-700 hover:border-slate-600 rounded-xl p-6 transition-all group">
                <div className="flex items-start justify-between mb-3">
                  <Link href={`/dashboard/projects/${project.id}`} className="flex-1 min-w-0">
                    <h3 className="text-lg font-bold text-white group-hover:text-blue-300 transition-colors truncate">
                      {project.title}
                    </h3>
                  </Link>
                  <span className={`text-xs font-semibold px-2 py-0.5 rounded-full border ml-2 flex-shrink-0 ${statusColors[project.status] ?? ""}`}>
                    {project.status.toLowerCase().replace("_", " ")}
                  </span>
                </div>

                {project.genre && (
                  <p className="text-sm text-slate-500 mb-3">{project.genre}</p>
                )}

                <div className="flex items-center gap-4 text-xs text-slate-500 mb-4">
                  <span>{project.chapters.length} ch</span>
                  <span>{sceneCount} scenes</span>
                  {project.chapters.length > 0 && (
                    <span className="text-slate-600">Updated {new Date(project.updatedAt).toLocaleDateString()}</span>
                  )}
                </div>

                <div className="flex gap-2">
                  <Link href={`/dashboard/projects/${project.id}`}
                    className="flex-1 py-2 bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 text-sm font-medium rounded-lg text-center transition-all">
                    Open →
                  </Link>
                  <button
                    onClick={() => handleArchive(project.id)}
                    disabled={archiving === project.id}
                    className="px-3 py-2 border border-slate-700 hover:border-slate-600 text-slate-500 hover:text-slate-300 text-sm rounded-lg transition-all disabled:opacity-40"
                    title="Archive project"
                  >
                    ⊡
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
