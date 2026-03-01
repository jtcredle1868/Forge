import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { db } from "@/server/db";
import { getSession } from "@/lib/session";
import { Button } from "@/components/ui/button";

function startOfToday() {
  const value = new Date();
  value.setHours(0, 0, 0, 0);
  return value;
}

function startOfMonth() {
  const value = new Date();
  value.setDate(1);
  value.setHours(0, 0, 0, 0);
  return value;
}

export default async function ProjectWorkspacePage({
  params,
}: {
  params: { id: string };
}) {
  const session = await getSession();
  if (!session) {
    redirect("/login");
  }

  const projectId = params.id;

  const project = await db.project.findUnique({
    where: { id: projectId },
    include: {
      styleProfile: true,
      googleDriveSync: true,
      chapters: {
        include: {
          scenes: {
            include: {
              document: true,
            },
            orderBy: { orderIndex: "asc" },
          },
        },
        orderBy: { orderIndex: "asc" },
      },
    },
  });

  if (!project || project.userId !== session.userId) {
    notFound();
  }

  const subscription = await db.subscription.findUnique({
    where: { userId: session.userId },
  });

  const dailyUsage = await db.aIInteraction.count({
    where: {
      userId: session.userId,
      createdAt: { gte: startOfToday() },
    },
  });

  const monthlyUsage = await db.aIInteraction.count({
    where: {
      userId: session.userId,
      createdAt: { gte: startOfMonth() },
    },
  });

  async function addChapterAction(formData: FormData) {
    "use server";
    const activeSession = await getSession();
    if (!activeSession) redirect("/login");

    const title = String(formData.get("title") || "").trim();
    if (!title) return;

    const ownedProject = await db.project.findUnique({ where: { id: projectId } });
    if (!ownedProject || ownedProject.userId !== activeSession.userId) return;

    const count = await db.chapter.count({ where: { projectId } });
    await db.chapter.create({
      data: {
        projectId,
        title,
        orderIndex: count,
      },
    });

    revalidatePath(`/dashboard/projects/${projectId}`);
  }

  async function addSceneAction(formData: FormData) {
    "use server";
    const activeSession = await getSession();
    if (!activeSession) redirect("/login");

    const chapterId = String(formData.get("chapterId") || "");
    const title = String(formData.get("title") || "").trim();
    if (!chapterId || !title) return;

    const chapter = await db.chapter.findUnique({
      where: { id: chapterId },
      include: { project: true },
    });
    if (!chapter || chapter.project.userId !== activeSession.userId) return;

    const orderIndex = await db.scene.count({ where: { chapterId } });
    const scene = await db.scene.create({
      data: {
        chapterId,
        title,
        orderIndex,
      },
    });

    await db.document.create({
      data: {
        sceneId: scene.id,
        content: { type: "plain", content: "" },
        wordCount: 0,
      },
    });

    revalidatePath(`/dashboard/projects/${projectId}`);
  }

  async function saveStyleAction(formData: FormData) {
    "use server";
    const activeSession = await getSession();
    if (!activeSession) redirect("/login");

    const ownedProject = await db.project.findUnique({ where: { id: projectId } });
    if (!ownedProject || ownedProject.userId !== activeSession.userId) return;

    const pov = String(formData.get("pov") || "THIRD_LIMITED") as
      | "FIRST"
      | "SECOND"
      | "THIRD_LIMITED"
      | "THIRD_OMNISCIENT"
      | "MULTIPLE";

    const tense = String(formData.get("tense") || "PAST") as
      | "PAST"
      | "PRESENT"
      | "MIXED";

    const formality = String(formData.get("formality") || "LITERARY") as
      | "LITERARY"
      | "COMMERCIAL"
      | "GENRE"
      | "EXPERIMENTAL";

    const customRulesText = String(formData.get("customRules") || "").trim();
    const customRules = customRulesText
      ? customRulesText
          .split("\n")
          .map((line) => line.trim())
          .filter(Boolean)
      : undefined;

    await db.styleProfile.upsert({
      where: { projectId },
      create: {
        projectId,
        pov,
        tense,
        formality,
        ...(customRules ? { customRules: customRules as any } : {}),
      },
      update: {
        pov,
        tense,
        formality,
        ...(customRules ? { customRules: customRules as any } : {}),
      },
    });

    revalidatePath(`/dashboard/projects/${projectId}`);
  }

  async function connectSyncAction() {
    "use server";
    const activeSession = await getSession();
    if (!activeSession) redirect("/login");

    const ownedProject = await db.project.findUnique({ where: { id: projectId } });
    if (!ownedProject || ownedProject.userId !== activeSession.userId) return;

    await db.googleDriveSync.upsert({
      where: { projectId },
      create: {
        projectId,
        driveFileId: `drive-${projectId}`,
        syncStatus: "IDLE",
      },
      update: {
        syncStatus: "IDLE",
      },
    });

    revalidatePath(`/dashboard/projects/${projectId}`);
  }

  async function syncNowAction() {
    "use server";
    const activeSession = await getSession();
    if (!activeSession) redirect("/login");

    const ownedProject = await db.project.findUnique({ where: { id: projectId } });
    if (!ownedProject || ownedProject.userId !== activeSession.userId) return;

    await db.googleDriveSync.updateMany({
      where: { projectId },
      data: {
        syncStatus: "IDLE",
        lastSyncedAt: new Date(),
      },
    });

    revalidatePath(`/dashboard/projects/${projectId}`);
  }

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-start gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{project.title}</h1>
          <p className="text-gray-600 mt-2">
            Genre: {project.genre || "Not set"} · Target words: {project.targetWordCount || "—"}
          </p>
        </div>
        <Button asChild variant="outline">
          <Link href="/dashboard/projects">Back to Projects</Link>
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white border border-gray-200 rounded-lg p-5">
          <h2 className="text-lg font-semibold text-gray-900">Billing / Usage</h2>
          <p className="text-sm text-gray-600 mt-3">Tier: {subscription?.tier || "FREE"}</p>
          <p className="text-sm text-gray-600">Daily AI calls: {dailyUsage}</p>
          <p className="text-sm text-gray-600">Monthly AI calls: {monthlyUsage}</p>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-5">
          <h2 className="text-lg font-semibold text-gray-900">Google Drive Sync</h2>
          <p className="text-sm text-gray-600 mt-3">
            Status: {project.googleDriveSync?.syncStatus || "DISCONNECTED"}
          </p>
          <p className="text-sm text-gray-600">
            Last Sync: {project.googleDriveSync?.lastSyncedAt?.toLocaleString() || "Never"}
          </p>
          <div className="flex gap-2 mt-4">
            <form action={connectSyncAction}>
              <Button type="submit" variant="outline">Connect</Button>
            </form>
            <form action={syncNowAction}>
              <Button type="submit" className="bg-blue-600 hover:bg-blue-700">Sync Now</Button>
            </form>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-5">
          <h2 className="text-lg font-semibold text-gray-900">Style Profile</h2>
          <form action={saveStyleAction} className="space-y-3 mt-3">
            <select name="pov" defaultValue={project.styleProfile?.pov || "THIRD_LIMITED"} className="w-full border border-gray-300 rounded px-3 py-2 text-sm">
              <option value="FIRST">First</option>
              <option value="SECOND">Second</option>
              <option value="THIRD_LIMITED">Third Limited</option>
              <option value="THIRD_OMNISCIENT">Third Omniscient</option>
              <option value="MULTIPLE">Multiple</option>
            </select>
            <select name="tense" defaultValue={project.styleProfile?.tense || "PAST"} className="w-full border border-gray-300 rounded px-3 py-2 text-sm">
              <option value="PAST">Past</option>
              <option value="PRESENT">Present</option>
              <option value="MIXED">Mixed</option>
            </select>
            <select name="formality" defaultValue={project.styleProfile?.formality || "LITERARY"} className="w-full border border-gray-300 rounded px-3 py-2 text-sm">
              <option value="LITERARY">Literary</option>
              <option value="COMMERCIAL">Commercial</option>
              <option value="GENRE">Genre</option>
              <option value="EXPERIMENTAL">Experimental</option>
            </select>
            <textarea
              name="customRules"
              defaultValue={Array.isArray(project.styleProfile?.customRules)
                ? (project.styleProfile?.customRules as string[]).join("\n")
                : ""}
              className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
              rows={3}
              placeholder="One style rule per line"
            />
            <Button type="submit" className="bg-blue-600 hover:bg-blue-700">Save Style Profile</Button>
          </form>
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-lg p-6 space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-semibold text-gray-900">Outline (Chapters & Scenes)</h2>
        </div>

        <form action={addChapterAction} className="flex gap-3">
          <input
            name="title"
            className="flex-1 border border-gray-300 rounded px-3 py-2"
            placeholder="New chapter title"
            required
          />
          <Button type="submit" className="bg-blue-600 hover:bg-blue-700">Add Chapter</Button>
        </form>

        {project.chapters.length === 0 ? (
          <p className="text-gray-600">No chapters yet. Add your first chapter to begin writing.</p>
        ) : (
          <div className="space-y-4">
            {project.chapters.map((chapter) => (
              <div key={chapter.id} className="border border-gray-200 rounded-lg p-4">
                <h3 className="font-semibold text-gray-900 mb-3">{chapter.title}</h3>
                <div className="space-y-2 mb-4">
                  {chapter.scenes.length === 0 ? (
                    <p className="text-sm text-gray-500">No scenes yet.</p>
                  ) : (
                    chapter.scenes.map((scene) => (
                      <Link
                        key={scene.id}
                        href={`/dashboard/projects/${projectId}/scenes/${scene.id}`}
                        className="block border border-gray-100 rounded p-3 hover:bg-gray-50"
                      >
                        <div className="font-medium text-gray-900">{scene.title}</div>
                        <div className="text-xs text-gray-500 mt-1">
                          Words: {scene.document?.wordCount ?? 0}
                        </div>
                      </Link>
                    ))
                  )}
                </div>

                <form action={addSceneAction} className="flex gap-3">
                  <input type="hidden" name="chapterId" value={chapter.id} />
                  <input
                    name="title"
                    className="flex-1 border border-gray-300 rounded px-3 py-2 text-sm"
                    placeholder="New scene title"
                    required
                  />
                  <Button type="submit" variant="outline">Add Scene</Button>
                </form>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}