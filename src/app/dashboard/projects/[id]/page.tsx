import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { db } from "@/server/db";
import { getSession } from "@/lib/session";
import { ProjectWorkspaceClient } from "./ProjectWorkspaceClient";

export default async function ProjectWorkspacePage({
  params,
}: {
  params: { id: string };
}) {
  const session = await getSession();
  if (!session) redirect("/login");

  const projectId = params.id;

  const project = await db.project.findUnique({
    where: { id: projectId },
    include: {
      styleProfile: true,
      googleDriveSync: true,
      chapters: {
        include: {
          scenes: {
            include: { document: true },
            orderBy: { orderIndex: "asc" },
          },
        },
        orderBy: { orderIndex: "asc" },
      },
    },
  });

  if (!project || project.userId !== session.userId) notFound();

  const subscription = await db.subscription.findUnique({ where: { userId: session.userId } });
  const dailyUsage = await db.aIInteraction.count({
    where: { userId: session.userId, createdAt: { gte: new Date(new Date().setHours(0,0,0,0)) } },
  });

  async function addChapterAction(formData: FormData) {
    "use server";
    const s = await getSession();
    if (!s) redirect("/login");
    const title = String(formData.get("title") || "").trim();
    if (!title) return;
    const p = await db.project.findUnique({ where: { id: projectId } });
    if (!p || p.userId !== s.userId) return;
    const count = await db.chapter.count({ where: { projectId } });
    await db.chapter.create({ data: { projectId, title, orderIndex: count } });
    revalidatePath(`/dashboard/projects/${projectId}`);
  }

  async function addSceneAction(formData: FormData) {
    "use server";
    const s = await getSession();
    if (!s) redirect("/login");
    const chapterId = String(formData.get("chapterId") || "");
    const title = String(formData.get("title") || "").trim();
    if (!chapterId || !title) return;
    const ch = await db.chapter.findUnique({ where: { id: chapterId }, include: { project: true } });
    if (!ch || ch.project.userId !== s.userId) return;
    const orderIndex = await db.scene.count({ where: { chapterId } });
    const scene = await db.scene.create({ data: { chapterId, title, orderIndex } });
    await db.document.create({ data: { sceneId: scene.id, content: { type: "doc", content: [{ type: "paragraph" }] }, wordCount: 0 } });
    revalidatePath(`/dashboard/projects/${projectId}`);
  }

  async function saveStyleAction(formData: FormData) {
    "use server";
    const s = await getSession();
    if (!s) redirect("/login");
    const p = await db.project.findUnique({ where: { id: projectId } });
    if (!p || p.userId !== s.userId) return;
    const pov = String(formData.get("pov") || "THIRD_LIMITED") as any;
    const tense = String(formData.get("tense") || "PAST") as any;
    const formality = String(formData.get("formality") || "LITERARY") as any;
    const customRulesText = String(formData.get("customRules") || "").trim();
    const customRules = customRulesText ? customRulesText.split("\n").map((l) => l.trim()).filter(Boolean) : undefined;
    await db.styleProfile.upsert({
      where: { projectId },
      create: { projectId, pov, tense, formality, ...(customRules ? { customRules: customRules as any } : {}) },
      update: { pov, tense, formality, ...(customRules ? { customRules: customRules as any } : {}) },
    });
    revalidatePath(`/dashboard/projects/${projectId}`);
  }

  const totalWords = project.chapters.reduce((cs, ch) => cs + ch.scenes.reduce((ss, sc) => ss + (sc.document?.wordCount ?? 0), 0), 0);
  const tier = subscription?.tier ?? "FREE";

  const statusColors: Record<string, string> = {
    DRAFTING: "bg-blue-900/50 text-blue-300 border-blue-800",
    REVISING: "bg-amber-900/50 text-amber-300 border-amber-800",
    COMPLETE: "bg-green-900/50 text-green-300 border-green-800",
    ON_HOLD: "bg-slate-700/50 text-slate-400 border-slate-600",
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start gap-4">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <Link href="/dashboard/projects" className="text-slate-500 hover:text-slate-300 text-sm">Projects</Link>
            <span className="text-slate-700">/</span>
            <h1 className="text-2xl font-black text-white">{project.title}</h1>
            <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${statusColors[project.status] ?? ""}`}>
              {project.status.toLowerCase().replace("_", " ")}
            </span>
          </div>
          <p className="text-slate-400 text-sm">
            {project.genre || "No genre set"} · {totalWords.toLocaleString()} words
            {project.targetWordCount && ` · Target: ${project.targetWordCount.toLocaleString()}`}
          </p>
        </div>

        <ProjectWorkspaceClient projectId={projectId} tier={tier} />
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-4 gap-4">
        {[
          { label: "Chapters", value: project.chapters.length },
          { label: "Scenes", value: project.chapters.reduce((s, ch) => s + ch.scenes.length, 0) },
          { label: "Total Words", value: totalWords.toLocaleString() },
          { label: "AI Calls Today", value: dailyUsage },
        ].map((s) => (
          <div key={s.label} className="bg-slate-800/50 border border-slate-700 rounded-lg p-4">
            <p className="text-xl font-black text-white">{s.value}</p>
            <p className="text-xs text-slate-500 mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Style Profile */}
        <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-5">
          <h2 className="text-base font-bold text-white mb-4">Style Profile</h2>
          <form action={saveStyleAction} className="space-y-3">
            <div>
              <label className="text-xs text-slate-400 font-medium block mb-1">Point of View</label>
              <select name="pov" defaultValue={project.styleProfile?.pov || "THIRD_LIMITED"}
                className="w-full px-3 py-2 bg-slate-700/60 border border-slate-600 rounded-lg text-white text-sm focus:outline-none focus:border-blue-500">
                <option value="FIRST">First Person</option>
                <option value="SECOND">Second Person</option>
                <option value="THIRD_LIMITED">Third Limited</option>
                <option value="THIRD_OMNISCIENT">Third Omniscient</option>
                <option value="MULTIPLE">Multiple POV</option>
              </select>
            </div>
            <div>
              <label className="text-xs text-slate-400 font-medium block mb-1">Tense</label>
              <select name="tense" defaultValue={project.styleProfile?.tense || "PAST"}
                className="w-full px-3 py-2 bg-slate-700/60 border border-slate-600 rounded-lg text-white text-sm focus:outline-none focus:border-blue-500">
                <option value="PAST">Past Tense</option>
                <option value="PRESENT">Present Tense</option>
                <option value="MIXED">Mixed</option>
              </select>
            </div>
            <div>
              <label className="text-xs text-slate-400 font-medium block mb-1">Formality</label>
              <select name="formality" defaultValue={project.styleProfile?.formality || "LITERARY"}
                className="w-full px-3 py-2 bg-slate-700/60 border border-slate-600 rounded-lg text-white text-sm focus:outline-none focus:border-blue-500">
                <option value="LITERARY">Literary</option>
                <option value="COMMERCIAL">Commercial</option>
                <option value="GENRE">Genre</option>
                <option value="EXPERIMENTAL">Experimental</option>
              </select>
            </div>
            <div>
              <label className="text-xs text-slate-400 font-medium block mb-1">Custom Style Rules</label>
              <textarea name="customRules" rows={3}
                defaultValue={Array.isArray(project.styleProfile?.customRules) ? (project.styleProfile?.customRules as string[]).join("\n") : ""}
                className="w-full px-3 py-2 bg-slate-700/60 border border-slate-600 rounded-lg text-white text-sm placeholder-slate-500 focus:outline-none focus:border-blue-500 resize-none"
                placeholder="One rule per line (e.g. No adverbs at end of dialogue tags)" />
            </div>
            <button type="submit" className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded-lg transition-all">Save Style Profile</button>
          </form>
        </div>

        {/* Drive Sync */}
        <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-5">
          <h2 className="text-base font-bold text-white mb-4">Google Drive Sync</h2>
          <div className="flex items-center gap-2 mb-4">
            <div className={`w-2 h-2 rounded-full ${project.googleDriveSync ? "bg-green-400" : "bg-slate-600"}`} />
            <span className="text-sm text-slate-300">
              {project.googleDriveSync?.syncStatus === "IDLE" ? "Connected" : project.googleDriveSync ? project.googleDriveSync.syncStatus : "Not connected"}
            </span>
          </div>
          {project.googleDriveSync?.lastSyncedAt && (
            <p className="text-xs text-slate-500 mb-4">Last sync: {new Date(project.googleDriveSync.lastSyncedAt).toLocaleString()}</p>
          )}
          <div className="space-y-2">
            <p className="text-xs text-slate-500">Google Drive OAuth requires configuring GOOGLE_DRIVE_CLIENT_ID and GOOGLE_DRIVE_CLIENT_SECRET in your .env file.</p>
            <a href={`/api/integrations/google-drive?projectId=${projectId}`}
              className="block w-full py-2 border border-slate-600 hover:border-slate-500 text-slate-300 hover:text-white text-sm font-medium rounded-lg text-center transition-all">
              Connect Google Drive
            </a>
          </div>
        </div>

        {/* Billing */}
        <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-5">
          <h2 className="text-base font-bold text-white mb-4">Subscription</h2>
          <div className={`inline-flex px-3 py-1.5 rounded-lg text-sm font-bold mb-3 ${
            tier === "FREE" ? "bg-slate-700 text-slate-300" :
            tier === "PRO" ? "bg-blue-600 text-white" :
            "bg-purple-600 text-white"
          }`}>{tier}</div>
          <div className="space-y-1 mb-4">
            <p className="text-xs text-slate-400">AI calls today: <strong className="text-white">{dailyUsage}</strong>{tier === "FREE" && " / 50"}</p>
            {tier === "FREE" && <p className="text-xs text-slate-500">Upgrade for unlimited AI, .docx/.pdf export, and Refinery integration</p>}
          </div>
          <Link href="/dashboard/billing" className="block w-full py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded-lg text-center transition-all">
            {tier === "FREE" ? "Upgrade to Pro" : "Manage Plan"}
          </Link>
        </div>
      </div>

      {/* Outline */}
      <div className="bg-slate-800/30 border border-slate-700 rounded-xl p-6">
        <h2 className="text-lg font-black text-white mb-5">Outline — Chapters & Scenes</h2>

        <form action={addChapterAction} className="flex gap-3 mb-6">
          <input name="title" className="flex-1 px-4 py-2.5 bg-slate-700/60 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-blue-500 text-sm" placeholder="New chapter title" required />
          <button type="submit" className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm rounded-lg transition-all">Add Chapter</button>
        </form>

        {project.chapters.length === 0 ? (
          <p className="text-slate-500 text-sm">No chapters yet. Add your first chapter to begin writing.</p>
        ) : (
          <div className="space-y-4">
            {project.chapters.map((chapter) => {
              const chWords = chapter.scenes.reduce((s, sc) => s + (sc.document?.wordCount ?? 0), 0);
              return (
                <div key={chapter.id} className="border border-slate-700 rounded-xl p-5">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-bold text-white">{chapter.title}</h3>
                    <span className="text-xs text-slate-500">{chWords.toLocaleString()} words · {chapter.scenes.length} scenes</span>
                  </div>

                  <div className="space-y-2 mb-4">
                    {chapter.scenes.length === 0 ? (
                      <p className="text-sm text-slate-600">No scenes yet.</p>
                    ) : (
                      chapter.scenes.map((scene) => (
                        <Link key={scene.id} href={`/dashboard/projects/${projectId}/scenes/${scene.id}`}
                          className="flex items-center justify-between p-3 bg-slate-800/50 hover:bg-slate-800 border border-slate-700 rounded-lg transition-all group">
                          <span className="text-sm font-medium text-slate-300 group-hover:text-white">{scene.title}</span>
                          <div className="flex items-center gap-3">
                            <span className="text-xs text-slate-500">{(scene.document?.wordCount ?? 0).toLocaleString()} words</span>
                            <span className="text-blue-500 text-sm">→</span>
                          </div>
                        </Link>
                      ))
                    )}
                  </div>

                  <form action={addSceneAction} className="flex gap-2">
                    <input type="hidden" name="chapterId" value={chapter.id} />
                    <input name="title" className="flex-1 px-3 py-2 bg-slate-700/40 border border-slate-600 rounded-lg text-white text-sm placeholder-slate-500 focus:outline-none focus:border-blue-500" placeholder="New scene title" required />
                    <button type="submit" className="px-4 py-2 border border-slate-600 hover:border-slate-500 text-slate-300 hover:text-white text-sm font-medium rounded-lg transition-all">Add Scene</button>
                  </form>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
