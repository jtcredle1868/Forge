import { getSession } from "@/lib/session";
import { db } from "@/server/db";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Plus, ArrowRight, BookOpen } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

const STATUS_COLORS: Record<string, string> = {
  DRAFTING: "#3b82f6",
  REVISING: "#f59e0b",
  COMPLETE: "#10b981",
  ON_HOLD: "#5a5a7a",
};

const GENRE_COLORS: Record<string, string> = {
  romance: "#ec4899",
  thriller: "#ef4444",
  mystery: "#8b5cf6",
  fantasy: "#f59e0b",
  "sci-fi": "#3b82f6",
  "literary fiction": "#10b981",
  memoir: "#f97316",
};

export default async function ProjectsPage() {
  const session = await getSession();
  if (!session) redirect("/login");

  const projects = await db.project.findMany({
    where: { userId: session.userId, isArchived: false },
    orderBy: { updatedAt: "desc" },
    include: {
      chapters: {
        include: { scenes: { include: { document: { select: { wordCount: true } } } } },
      },
      characters: { select: { id: true } },
    },
  });

  return (
    <div className="p-8" style={{ background: "#0c0c14", minHeight: "100%" }}>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-1" style={{ color: "#f0f0f8" }}>Projects</h1>
          <p style={{ color: "#9898b8" }}>
            {projects.length} {projects.length === 1 ? "manuscript" : "manuscripts"}
          </p>
        </div>
        <Link
          href="/dashboard/projects/new"
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold"
          style={{ background: "#f59e0b", color: "#0c0c14" }}
        >
          <Plus size={16} />
          New Project
        </Link>
      </div>

      {projects.length === 0 ? (
        <div className="text-center py-24">
          <BookOpen size={48} className="mx-auto mb-4" style={{ color: "#35354a" }} />
          <h2 className="text-xl font-bold mb-2" style={{ color: "#9898b8" }}>No projects yet</h2>
          <p className="mb-8" style={{ color: "#5a5a7a" }}>Start writing your first manuscript</p>
          <Link
            href="/dashboard/projects/new"
            className="inline-flex items-center gap-2 px-8 py-4 rounded-xl text-base font-bold"
            style={{ background: "#f59e0b", color: "#0c0c14" }}
          >
            <Plus size={18} />
            Create First Project
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {projects.map((project) => {
            const projectWords = project.chapters
              .flatMap((ch) => ch.scenes.map((sc) => sc.document?.wordCount ?? 0))
              .reduce((a, b) => a + b, 0);
            const sceneCount = project.chapters.reduce((a, ch) => a + ch.scenes.length, 0);
            const genreColor = GENRE_COLORS[project.genre?.toLowerCase() ?? ""] ?? "#35354a";
            const statusColor = STATUS_COLORS[project.status] ?? "#5a5a7a";

            return (
              <Link
                key={project.id}
                href={`/dashboard/projects/${project.id}`}
                className="rounded-2xl overflow-hidden block transition-all"
                style={{ background: "#1a1a2e", border: "1px solid #2a2a45" }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLAnchorElement).style.border = "1px solid #35354a";
                  (e.currentTarget as HTMLAnchorElement).style.transform = "translateY(-2px)";
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLAnchorElement).style.border = "1px solid #2a2a45";
                  (e.currentTarget as HTMLAnchorElement).style.transform = "translateY(0)";
                }}
              >
                <div className="h-1" style={{ background: `linear-gradient(90deg, ${genreColor}, ${statusColor})` }} />
                <div className="p-5">
                  <div className="flex items-center gap-2 mb-3">
                    <span
                      className="text-xs px-2 py-0.5 rounded-full font-medium"
                      style={{ background: `${statusColor}15`, color: statusColor }}
                    >
                      {project.status.replace(/_/g, " ")}
                    </span>
                    {project.genre && (
                      <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: `${genreColor}12`, color: genreColor }}>
                        {project.genre}
                      </span>
                    )}
                  </div>
                  <h3 className="text-lg font-bold mb-1 truncate" style={{ color: "#f0f0f8" }}>{project.title}</h3>
                  <div className="flex items-center gap-3 text-xs mb-4" style={{ color: "#5a5a7a" }}>
                    <span>{projectWords.toLocaleString()} words</span>
                    <span>·</span>
                    <span>{sceneCount} scenes</span>
                    <span>·</span>
                    <span>{project.characters.length} characters</span>
                  </div>
                  {project.targetWordCount && (
                    <div className="mb-4">
                      <div className="flex justify-between text-xs mb-1" style={{ color: "#5a5a7a" }}>
                        <span>Progress</span>
                        <span>{Math.min(100, Math.round((projectWords / project.targetWordCount) * 100))}%</span>
                      </div>
                      <div className="h-1.5 rounded-full overflow-hidden" style={{ background: "#2a2a45" }}>
                        <div
                          className="h-full rounded-full"
                          style={{
                            width: `${Math.min(100, (projectWords / project.targetWordCount) * 100)}%`,
                            background: `linear-gradient(90deg, ${genreColor}, ${statusColor})`,
                          }}
                        />
                      </div>
                    </div>
                  )}
                  <div className="flex items-center justify-between">
                    <span className="text-xs" style={{ color: "#5a5a7a" }}>
                      {formatDistanceToNow(project.updatedAt, { addSuffix: true })}
                    </span>
                    <ArrowRight size={14} style={{ color: "#f59e0b" }} />
                  </div>
                </div>
              </Link>
            );
          })}

          <Link
            href="/dashboard/projects/new"
            className="rounded-2xl p-5 flex flex-col items-center justify-center text-center min-h-[200px]"
            style={{ background: "transparent", border: "1px dashed #2a2a45" }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLAnchorElement).style.border = "1px dashed #f59e0b";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLAnchorElement).style.border = "1px dashed #2a2a45";
            }}
          >
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center mb-3" style={{ background: "rgba(245,158,11,0.1)" }}>
              <Plus size={24} style={{ color: "#f59e0b" }} />
            </div>
            <p className="text-sm font-semibold mb-1" style={{ color: "#9898b8" }}>New Project</p>
            <p className="text-xs" style={{ color: "#5a5a7a" }}>Start a new manuscript</p>
          </Link>
        </div>
      )}
    </div>
  );
}
