import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { db } from "@/server/db";
import { getSession } from "@/lib/session";
import { Button } from "@/components/ui/button";
import { SceneAIPanel } from "./SceneAIPanel";

function plainTextFromContent(content: unknown): string {
  if (typeof content === "string") return content;
  if (
    content &&
    typeof content === "object" &&
    "content" in content &&
    typeof (content as { content?: unknown }).content === "string"
  ) {
    return (content as { content: string }).content;
  }
  return "";
}

function countWords(value: string): number {
  const words = value.trim().split(/\s+/).filter(Boolean);
  return words.length;
}

export default async function SceneWorkspacePage({
  params,
}: {
  params: { id: string; sceneId: string };
}) {
  const session = await getSession();
  if (!session) redirect("/login");

  const { id: projectId, sceneId } = params;

  const scene = await db.scene.findUnique({
    where: { id: sceneId },
    include: {
      chapter: {
        include: {
          project: true,
        },
      },
      document: {
        include: {
          versions: {
            orderBy: { createdAt: "desc" },
            take: 10,
          },
          annotations: {
            orderBy: { createdAt: "desc" },
            take: 20,
          },
        },
      },
    },
  });

  if (!scene || scene.chapter.project.userId !== session.userId || scene.chapter.projectId !== projectId) {
    notFound();
  }

  let document = scene.document;
  if (!document) {
    document = await db.document.create({
      data: {
        sceneId: scene.id,
        content: { type: "plain", content: "" },
        wordCount: 0,
      },
      include: {
        versions: true,
        annotations: true,
      },
    });
  }

  async function saveDocumentAction(formData: FormData) {
    "use server";
    const activeSession = await getSession();
    if (!activeSession) redirect("/login");

    const freshScene = await db.scene.findUnique({
      where: { id: sceneId },
      include: {
        chapter: {
          include: {
            project: true,
          },
        },
        document: true,
      },
    });
    if (!freshScene || freshScene.chapter.project.userId !== activeSession.userId) return;

    const text = String(formData.get("content") || "");
    const wordCount = countWords(text);
    const existingDocument = freshScene.document;
    if (!existingDocument) return;

    await db.documentVersion.create({
      data: {
        documentId: existingDocument.id,
        content: existingDocument.content as any,
        wordCount: existingDocument.wordCount,
        snapshot: "Manual save",
      },
    });

    await db.document.update({
      where: { id: existingDocument.id },
      data: {
        content: { type: "plain", content: text },
        wordCount,
      },
    });

    revalidatePath(`/dashboard/projects/${projectId}/scenes/${sceneId}`);
  }

  async function restoreVersionAction(formData: FormData) {
    "use server";
    const activeSession = await getSession();
    if (!activeSession) redirect("/login");

    const versionId = String(formData.get("versionId") || "");
    if (!versionId) return;

    const version = await db.documentVersion.findUnique({
      where: { id: versionId },
      include: {
        document: {
          include: {
            scene: {
              include: {
                chapter: {
                  include: {
                    project: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!version || version.document.scene.chapter.project.userId !== activeSession.userId) return;

    await db.document.update({
      where: { id: version.documentId },
      data: {
        content: version.content as any,
        wordCount: version.wordCount,
      },
    });

    revalidatePath(`/dashboard/projects/${projectId}/scenes/${sceneId}`);
  }

  async function addAnnotationAction(formData: FormData) {
    "use server";
    const activeSession = await getSession();
    if (!activeSession) redirect("/login");

    const fromPos = Number(formData.get("fromPos") || 0);
    const toPos = Number(formData.get("toPos") || 0);
    const note = String(formData.get("note") || "").trim();
    if (!note || toPos <= fromPos) return;

    const freshScene = await db.scene.findUnique({
      where: { id: sceneId },
      include: {
        chapter: {
          include: {
            project: true,
          },
        },
        document: true,
      },
    });

    if (!freshScene || freshScene.chapter.project.userId !== activeSession.userId || !freshScene.document) return;

    await db.annotation.create({
      data: {
        documentId: freshScene.document.id,
        fromPos,
        toPos,
        note,
      },
    });

    revalidatePath(`/dashboard/projects/${projectId}/scenes/${sceneId}`);
  }

  const currentText = plainTextFromContent(document.content);

  return (
    <div className="space-y-8">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{scene.title}</h1>
          <p className="text-gray-600 mt-2">
            Chapter: {scene.chapter.title} · Current words: {document.wordCount}
          </p>
        </div>
        <Button asChild variant="outline">
          <Link href={`/dashboard/projects/${projectId}`}>Back to Project</Link>
        </Button>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <div className="space-y-6">
          <div className="bg-white border border-gray-200 rounded-lg p-5">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Scene Draft</h2>
            <form action={saveDocumentAction} className="space-y-3">
              <textarea
                name="content"
                defaultValue={currentText}
                rows={18}
                className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
                placeholder="Write your scene here..."
              />
              <Button type="submit" className="bg-blue-600 hover:bg-blue-700">Save Draft</Button>
            </form>
          </div>

          <div className="bg-white border border-gray-200 rounded-lg p-5">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Version History</h2>
            {document.versions.length === 0 ? (
              <p className="text-sm text-gray-600">No versions yet. Save once to start versioning.</p>
            ) : (
              <div className="space-y-2">
                {document.versions.map((version) => (
                  <form key={version.id} action={restoreVersionAction} className="flex items-center justify-between border border-gray-100 rounded p-2">
                    <div>
                      <p className="text-sm font-medium text-gray-900">{version.snapshot || "Snapshot"}</p>
                      <p className="text-xs text-gray-500">{version.createdAt.toLocaleString()} · {version.wordCount} words</p>
                    </div>
                    <input type="hidden" name="versionId" value={version.id} />
                    <Button type="submit" variant="outline" size="sm">Restore</Button>
                  </form>
                ))}
              </div>
            )}
          </div>

          <div className="bg-white border border-gray-200 rounded-lg p-5">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Annotations</h2>
            <form action={addAnnotationAction} className="grid grid-cols-1 md:grid-cols-4 gap-2 mb-4">
              <input name="fromPos" type="number" min={0} className="border border-gray-300 rounded px-2 py-2 text-sm" placeholder="From" required />
              <input name="toPos" type="number" min={1} className="border border-gray-300 rounded px-2 py-2 text-sm" placeholder="To" required />
              <input name="note" className="md:col-span-2 border border-gray-300 rounded px-2 py-2 text-sm" placeholder="Add annotation note" required />
              <Button type="submit" variant="outline">Add</Button>
            </form>

            {document.annotations.length === 0 ? (
              <p className="text-sm text-gray-600">No annotations yet.</p>
            ) : (
              <div className="space-y-2">
                {document.annotations.map((annotation) => (
                  <div key={annotation.id} className="border border-gray-100 rounded p-2">
                    <p className="text-sm text-gray-800">[{annotation.fromPos}-{annotation.toPos}] {annotation.note}</p>
                    <p className="text-xs text-gray-500 mt-1">{annotation.createdAt.toLocaleString()}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <SceneAIPanel
          projectId={projectId}
          documentId={document.id}
          chapterId={scene.chapterId}
          defaultPassage={currentText}
        />
      </div>
    </div>
  );
}