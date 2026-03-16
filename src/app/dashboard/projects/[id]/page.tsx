import { getSession } from "@/lib/session";
import { db } from "@/server/db";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import {
  BookOpen, Film, Users, Globe, Zap,
  ArrowRight, Plus, Flame, Settings, BarChart3
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";

const STATUS_COLORS: Record<string, string> = {
  DRAFTING: "#3b82f6",
  REVISING: "#f59e0b",
  COMPLETE: "#10b981",
  ON_HOLD: "#5a5a7a",
};

export default async function ProjectPage({ params }: { params: { id: string } }) {
  const session = await getSession();
  if (!session) redirect("/login");

  const project = await db.project.findUnique({
    where: { id: params.id, userId: session.userId },
    include: {
      chapters: {
        orderBy: { orderIndex: "asc" },
        include: {
          scenes: {
            orderBy: { orderIndex: "asc" },
            include: {
              document: { select: { wordCount: true } },
              emotionalScore: { select: { dominantEmotion: true } },
            },
          },
        },
      },
      characters: { select: { id: true, name: true, role: true, avatarColor: true } },
      worldElements: { select: { id: true } },
      _count: { select: { aiInteractions: true } },
    },
  });

  if (!project) notFound();

  const totalWords = project.chapters
    .flatMap((ch) => ch.scenes.map((sc) => sc.document?.wordCount ?? 0))
    .reduce((a, b) => a + b, 0);
  const sceneCount = project.chapters.reduce((a, ch) => a + ch.scenes.length, 0);
  const analyzedScenes = project.chapters.flatMap((ch) => ch.scenes.filter((sc) => sc.emotionalScore)).length;
  const firstScene = project.chapters[0]?.scenes[0];
  const statusColor = STATUS_COLORS[project.status] ?? "#5a5a7a";

  const navCards = [
    { href: firstScene ? `/dashboard/projects/${project.id}/write/${firstScene.id}` : "#", icon: <BookOpen size={22} />, label: "Write", desc: "Open manuscript editor", color: "#3b82f6", stat: `${totalWords.toLocaleString()} words`, cta: "Open Editor" },
    { href: `/dashboard/projects/${project.id}/timeline`, icon: <Film size={22} />, label: "Timeline", desc: "Visual story structure", color: "#f59e0b", stat: `${sceneCount} scenes`, cta: "View Timeline" },
    { href: `/dashboard/projects/${project.id}/characters`, icon: <Users size={22} />, label: "Characters", desc: "Profiles & voice checking", color: "#ec4899", stat: `${project.characters.length} characters`, cta: "Manage Characters" },
    { href: `/dashboard/projects/${project.id}/world`, icon: <Globe size={22} />, label: "World Builder", desc: project.genre ?? "Genre not set", color: "#10b981", stat: `${project.worldElements.length} elements`, cta: "Build World" },
    { href: `/dashboard/projects/${project.id}/arc`, icon: <BarChart3 size={22} />, label: "Emotional Arc", desc: "Scene emotion analysis", color: "#8b5cf6", stat: `${analyzedScenes}/${sceneCount} analyzed`, cta: "View Arc" },
    { href: `/dashboard/projects/${project.id}/coach`, icon: <Zap size={22} />, label: "Coaching", desc: "AI prose coaching history", color: "#f97316", stat: `${project._count.aiInteractions} sessions`, cta: "View Coaching" },
  ];

  return (
    <div className="p-8" style={{ background: "#0c0c14", minHeight: "100%" }}>
      <div className="mb-8">
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <span className="text-xs px-2.5 py-1 rounded-full font-semibold" style={{ background: `${statusColor}15`, color: statusColor }}>{project.status.replace(/_/g, " ")}</span>
              {project.genre && <span className="text-xs px-2.5 py-1 rounded-full" style={{ background: "#1a1a2e", color: "#9898b8", border: "1px solid #2a2a45" }}>{project.genre}</span>}
            </div>
            <h1 className="text-4xl font-bold mb-2" style={{ color: "#f0f0f8" }}>{project.title}</h1>
            {project.synopsis && <p className="max-w-2xl text-sm leading-relaxed" style={{ color: "#9898b8" }}>{project.synopsis}</p>}
            <p className="text-xs mt-2" style={{ color: "#5a5a7a" }}>Updated {formatDistanceToNow(project.updatedAt, { addSuffix: true })}</p>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <Link href={`/dashboard/projects/${project.id}/settings`} className="p-2 rounded-xl" style={{ background: "#1a1a2e", color: "#9898b8", border: "1px solid #2a2a45" }}><Settings size={16} /></Link>
            {firstScene && (
              <Link href={`/dashboard/projects/${project.id}/write/${firstScene.id}`} className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold" style={{ background: "#f59e0b", color: "#0c0c14" }}>
                <Flame size={16} />Continue Writing
              </Link>
            )}
          </div>
        </div>
        {project.targetWordCount && (
          <div className="mt-6 max-w-md">
            <div className="flex justify-between text-xs mb-2" style={{ color: "#9898b8" }}>
              <span>{totalWords.toLocaleString()} words</span>
              <span>Target: {project.targetWordCount.toLocaleString()}</span>
            </div>
            <div className="h-2 rounded-full overflow-hidden" style={{ background: "#1a1a2e" }}>
              <div className="h-full rounded-full" style={{ width: `${Math.min(100, (totalWords / project.targetWordCount) * 100)}%`, background: "linear-gradient(90deg, #f59e0b, #d97706)" }} />
            </div>
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        {navCards.map((card) => (
          <Link key={card.href} href={card.href} className="rounded-2xl p-5 flex flex-col transition-all group" style={{ background: "#1a1a2e", border: "1px solid #2a2a45" }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLAnchorElement).style.border = `1px solid ${card.color}40`; (e.currentTarget as HTMLAnchorElement).style.background = `${card.color}08`; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLAnchorElement).style.border = "1px solid #2a2a45"; (e.currentTarget as HTMLAnchorElement).style.background = "#1a1a2e"; }}
          >
            <div className="flex items-center justify-between mb-4">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: `${card.color}15` }}>
                <span style={{ color: card.color }}>{card.icon}</span>
              </div>
              <ArrowRight size={14} className="opacity-0 group-hover:opacity-100 transition-opacity" style={{ color: card.color }} />
            </div>
            <h3 className="text-base font-bold mb-1" style={{ color: "#f0f0f8" }}>{card.label}</h3>
            <p className="text-xs mb-3" style={{ color: "#9898b8" }}>{card.desc}</p>
            <div className="mt-auto">
              <span className="text-xs font-semibold" style={{ color: card.color }}>{card.stat}</span>
            </div>
          </Link>
        ))}
      </div>

      {project.characters.length > 0 && (
        <div className="rounded-2xl p-6" style={{ background: "#13131f", border: "1px solid #2a2a45" }}>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-semibold" style={{ color: "#f0f0f8" }}>Characters</h2>
            <Link href={`/dashboard/projects/${project.id}/characters`} className="text-xs flex items-center gap-1" style={{ color: "#9898b8" }}>View all <ArrowRight size={12} /></Link>
          </div>
          <div className="flex gap-3 flex-wrap">
            {project.characters.slice(0, 8).map((char) => (
              <Link key={char.id} href={`/dashboard/projects/${project.id}/characters`} className="flex items-center gap-2 px-3 py-2 rounded-xl" style={{ background: "#1a1a2e", border: "1px solid #2a2a45" }}>
                <div className="w-6 h-6 rounded-full flex-shrink-0" style={{ background: char.avatarColor ?? "#35354a" }} />
                <div>
                  <p className="text-xs font-medium" style={{ color: "#f0f0f8" }}>{char.name}</p>
                  <p className="text-xs" style={{ color: "#5a5a7a" }}>{char.role.replace(/_/g, " ")}</p>
                </div>
              </Link>
            ))}
            <Link href={`/dashboard/projects/${project.id}/characters`} className="flex items-center gap-2 px-3 py-2 rounded-xl" style={{ background: "transparent", border: "1px dashed #2a2a45", color: "#5a5a7a" }}>
              <Plus size={14} /><span className="text-xs">Add</span>
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
