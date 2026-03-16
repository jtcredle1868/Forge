import { getSession } from "@/lib/session";
import { db } from "@/server/db";
import Link from "next/link";
import { redirect } from "next/navigation";
import { FolderOpen, Plus, ArrowRight, Flame, TrendingUp, BookOpen, Zap } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

const STATUS_COLORS: Record<string, string> = {
  DRAFTING: "#3b82f6",
  REVISING: "#f59e0b",
  COMPLETE: "#10b981",
  ON_HOLD: "#5a5a7a",
};

export default async function DashboardPage() {
  const session = await getSession();
  if (!session) redirect("/login");

  const [projectCount, recentProjects, totalWords] = await Promise.all([
    db.project.count({ where: { userId: session.userId, isArchived: false } }),
    db.project.findMany({
      where: { userId: session.userId, isArchived: false },
      orderBy: { updatedAt: "desc" },
      take: 5,
      include: {
        chapters: {
          include: {
            scenes: { include: { document: { select: { wordCount: true } } } },
          },
        },
        characters: { select: { id: true } },
        _count: { select: { aiInteractions: true } },
      },
    }),
    db.document.aggregate({
      _sum: { wordCount: true },
      where: { scene: { chapter: { project: { userId: session.userId } } } },
    }),
  ]);

  const wordCount = totalWords._sum.wordCount ?? 0;

  return (
    <div className="p-8" style={{ background: "#0c0c14", minHeight: "100%" }}>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-1" style={{ color: "#f0f0f8" }}>
          Welcome back, {session.user.name?.split(" ")[0] ?? "Writer"}
        </h1>
        <p style={{ color: "#9898b8" }}>Ready to forge your perfect prose?</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4 mb-8">
        {[
          {
            icon: <FolderOpen size={20} />,
            label: "Projects",
            value: projectCount,
            color: "#3b82f6",
          },
          {
            icon: <BookOpen size={20} />,
            label: "Total Words",
            value: wordCount.toLocaleString(),
            color: "#10b981",
          },
          {
            icon: <Zap size={20} />,
            label: "AI Sessions",
            value: recentProjects.reduce((a, p) => a + p._count.aiInteractions, 0),
            color: "#f59e0b",
          },
          {
            icon: <TrendingUp size={20} />,
            label: "Characters",
            value: recentProjects.reduce((a, p) => a + p.characters.length, 0),
            color: "#ec4899",
          },
        ].map((stat) => (
          <div
            key={stat.label}
            className="rounded-2xl p-5"
            style={{ background: "#1a1a2e", border: "1px solid #2a2a45" }}
          >
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center mb-3"
              style={{ background: `${stat.color}15` }}
            >
              <span style={{ color: stat.color }}>{stat.icon}</span>
            </div>
            <p className="text-2xl font-bold mb-1" style={{ color: "#f0f0f8" }}>
              {stat.value}
            </p>
            <p className="text-xs" style={{ color: "#5a5a7a" }}>{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Recent Projects */}
      <div
        className="rounded-2xl overflow-hidden"
        style={{ background: "#13131f", border: "1px solid #2a2a45" }}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b" style={{ borderColor: "#2a2a45" }}>
          <div className="flex items-center gap-2">
            <Flame size={16} style={{ color: "#f59e0b" }} />
            <h2 className="text-base font-semibold" style={{ color: "#f0f0f8" }}>
              Recent Projects
            </h2>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/dashboard/projects"
              className="text-xs flex items-center gap-1 transition-colors"
              style={{ color: "#9898b8" }}
            >
              View all <ArrowRight size={12} />
            </Link>
            <Link
              href="/dashboard/projects/new"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all"
              style={{ background: "#f59e0b", color: "#0c0c14" }}
            >
              <Plus size={12} />
              New Project
            </Link>
          </div>
        </div>

        {recentProjects.length === 0 ? (
          <div className="py-16 text-center">
            <FolderOpen size={40} className="mx-auto mb-4" style={{ color: "#35354a" }} />
            <p className="text-sm font-medium mb-1" style={{ color: "#9898b8" }}>No projects yet</p>
            <p className="text-xs mb-6" style={{ color: "#5a5a7a" }}>
              Start writing your first manuscript
            </p>
            <Link
              href="/dashboard/projects/new"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold transition-all"
              style={{ background: "#f59e0b", color: "#0c0c14" }}
            >
              <Plus size={16} />
              Create First Project
            </Link>
          </div>
        ) : (
          <div className="divide-y" style={{ borderColor: "#2a2a45" }}>
            {recentProjects.map((project) => {
              const projectWords = project.chapters.flatMap((ch) =>
                ch.scenes.map((sc) => sc.document?.wordCount ?? 0)
              ).reduce((a, b) => a + b, 0);

              const sceneCount = project.chapters.reduce((a, ch) => a + ch.scenes.length, 0);

              return (
                <Link
                  key={project.id}
                  href={`/dashboard/projects/${project.id}`}
                  className="flex items-center gap-4 px-6 py-4 transition-all group"
                  style={{ display: "flex" }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLAnchorElement).style.background = "rgba(255,255,255,0.02)";
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLAnchorElement).style.background = "transparent";
                  }}
                >
                  {/* Project color indicator */}
                  <div
                    className="w-1 h-12 rounded-full flex-shrink-0"
                    style={{
                      background: STATUS_COLORS[project.status] ?? "#35354a",
                    }}
                  />

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold truncate" style={{ color: "#f0f0f8" }}>
                        {project.title}
                      </h3>
                      <span
                        className="text-xs px-2 py-0.5 rounded-full flex-shrink-0"
                        style={{
                          background: `${STATUS_COLORS[project.status] ?? "#35354a"}20`,
                          color: STATUS_COLORS[project.status] ?? "#5a5a7a",
                        }}
                      >
                        {project.status.replace(/_/g, " ")}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 text-xs" style={{ color: "#5a5a7a" }}>
                      <span>{project.genre ?? "Genre not set"}</span>
                      <span>·</span>
                      <span>{projectWords.toLocaleString()} words</span>
                      <span>·</span>
                      <span>{sceneCount} scenes</span>
                      <span>·</span>
                      <span>{project.characters.length} characters</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 flex-shrink-0">
                    <p className="text-xs" style={{ color: "#5a5a7a" }}>
                      {formatDistanceToNow(project.updatedAt, { addSuffix: true })}
                    </p>
                    <ArrowRight
                      size={14}
                      className="opacity-0 group-hover:opacity-100 transition-opacity"
                      style={{ color: "#f59e0b" }}
                    />
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>

      {/* Quick actions */}
      <div className="grid grid-cols-3 gap-4 mt-6">
        {[
          {
            href: "/dashboard/projects",
            icon: <FolderOpen size={18} />,
            label: "All Projects",
            desc: "Manage your manuscripts",
            color: "#3b82f6",
          },
          {
            href: "/dashboard/settings",
            icon: <Zap size={18} />,
            label: "AI Settings",
            desc: "Configure coaching preferences",
            color: "#f59e0b",
          },
          {
            href: "/dashboard/billing",
            icon: <TrendingUp size={18} />,
            label: "Upgrade Plan",
            desc: "Unlock unlimited coaching",
            color: "#10b981",
          },
        ].map((action) => (
          <Link
            key={action.href}
            href={action.href}
            className="rounded-2xl p-4 flex items-center gap-3 transition-all group"
            style={{ background: "#1a1a2e", border: "1px solid #2a2a45" }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLAnchorElement).style.border = "1px solid #35354a";
              (e.currentTarget as HTMLAnchorElement).style.background = "#1f1f35";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLAnchorElement).style.border = "1px solid #2a2a45";
              (e.currentTarget as HTMLAnchorElement).style.background = "#1a1a2e";
            }}
          >
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ background: `${action.color}15` }}
            >
              <span style={{ color: action.color }}>{action.icon}</span>
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold" style={{ color: "#f0f0f8" }}>{action.label}</p>
              <p className="text-xs truncate" style={{ color: "#5a5a7a" }}>{action.desc}</p>
            </div>
            <ArrowRight size={14} className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity" style={{ color: "#f59e0b" }} />
          </Link>
        ))}
      </div>
    </div>
  );
}
