import { getSession } from "@/lib/session";
import { db } from "@/server/db";
import Link from "next/link";
import { redirect } from "next/navigation";

export default async function DashboardPage() {
  const session = await getSession();
  if (!session) redirect("/login");

  const [projectCount, recentProjects, subscription, dailyAI] = await Promise.all([
    db.project.count({ where: { userId: session.userId, isArchived: false } }),
    db.project.findMany({
      where: { userId: session.userId, isArchived: false },
      orderBy: { updatedAt: "desc" },
      take: 5,
      include: { chapters: { include: { scenes: { include: { document: true } } } } },
    }),
    db.subscription.findUnique({ where: { userId: session.userId } }),
    db.aIInteraction.count({
      where: { userId: session.userId, createdAt: { gte: new Date(new Date().setHours(0,0,0,0)) } },
    }),
  ]);

  const totalWords = recentProjects.reduce((sum, p) =>
    sum + p.chapters.reduce((cs, ch) =>
      cs + ch.scenes.reduce((ss, sc) => ss + (sc.document?.wordCount ?? 0), 0), 0), 0);

  const tier = subscription?.tier ?? "FREE";
  const dailyLimit = tier === "FREE" ? 50 : "∞";
  const remaining = tier === "FREE" ? Math.max(0, 50 - dailyAI) : "∞";

  const statusColors: Record<string, string> = {
    DRAFTING: "bg-blue-900/50 text-blue-300 border-blue-800",
    REVISING: "bg-amber-900/50 text-amber-300 border-amber-800",
    COMPLETE: "bg-green-900/50 text-green-300 border-green-800",
    ON_HOLD: "bg-slate-700/50 text-slate-400 border-slate-600",
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-black text-white">
          Welcome back, {session.user.name ?? "Writer"}
        </h1>
        <p className="text-slate-400 mt-1">Ready to forge your prose?</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Projects", value: projectCount, icon: "◈", color: "text-blue-400" },
          { label: "Total Words", value: totalWords.toLocaleString(), icon: "✎", color: "text-purple-400" },
          { label: "AI Calls Today", value: `${dailyAI} / ${dailyLimit}`, icon: "◉", color: "text-teal-400" },
          { label: "Remaining Today", value: remaining, icon: "✦", color: "text-amber-400" },
        ].map((stat) => (
          <div key={stat.label} className="bg-slate-800/50 border border-slate-700 rounded-xl p-5">
            <div className={`text-2xl mb-2 ${stat.color}`}>{stat.icon}</div>
            <p className="text-2xl font-black text-white">{stat.value}</p>
            <p className="text-xs text-slate-500 font-medium mt-0.5">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Tier badge */}
      {tier === "FREE" && (
        <div className="bg-blue-950/30 border border-blue-800/50 rounded-xl p-4 flex items-center justify-between">
          <div>
            <p className="text-blue-200 font-semibold text-sm">You're on the Free tier</p>
            <p className="text-blue-400 text-xs mt-0.5">2 projects, 50 AI coaching calls/day, .txt export only</p>
          </div>
          <Link href="/dashboard/billing"
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded-lg transition-all">
            Upgrade to Pro
          </Link>
        </div>
      )}

      {/* Recent Projects */}
      <div className="bg-slate-800/30 border border-slate-700 rounded-xl p-6">
        <div className="flex justify-between items-center mb-5">
          <h2 className="text-xl font-black text-white">Recent Projects</h2>
          <Link href="/dashboard/projects"
            className="text-sm text-blue-400 hover:text-blue-300 font-medium">View all →</Link>
        </div>

        {recentProjects.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-4xl mb-4">✎</p>
            <p className="text-slate-400 mb-5">No projects yet. Create your first manuscript to begin.</p>
            <Link href="/dashboard/projects/new"
              className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg transition-all">
              Create First Project
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {recentProjects.map((project) => {
              const words = project.chapters.reduce((cs, ch) =>
                cs + ch.scenes.reduce((ss, sc) => ss + (sc.document?.wordCount ?? 0), 0), 0);
              return (
                <Link key={project.id} href={`/dashboard/projects/${project.id}`}
                  className="flex items-center justify-between p-4 bg-slate-800/50 hover:bg-slate-800 border border-slate-700 rounded-lg transition-all group">
                  <div>
                    <p className="font-semibold text-white group-hover:text-blue-300 transition-colors">{project.title}</p>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {words.toLocaleString()} words · {project.chapters.length} chapters · Updated {new Date(project.updatedAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${statusColors[project.status] ?? "bg-slate-700 text-slate-400 border-slate-600"}`}>
                      {project.status.toLowerCase().replace("_", " ")}
                    </span>
                    <span className="text-slate-600 group-hover:text-slate-400 transition-colors">→</span>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { href: "/dashboard/projects/new", icon: "◈", label: "New Project", desc: "Start a fresh manuscript" },
          { href: "/dashboard/settings", icon: "⚙", label: "Settings", desc: "Profile & Refinery key" },
          { href: "/dashboard/billing", icon: "✦", label: "Billing", desc: "Manage your subscription" },
        ].map((action) => (
          <Link key={action.href} href={action.href}
            className="bg-slate-800/30 border border-slate-700 hover:border-slate-600 rounded-xl p-5 transition-all group">
            <div className="text-2xl text-blue-400 mb-2">{action.icon}</div>
            <p className="font-bold text-white group-hover:text-blue-300 transition-colors">{action.label}</p>
            <p className="text-xs text-slate-500 mt-0.5">{action.desc}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
