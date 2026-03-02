import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { db } from "@/server/db";
import { getSession } from "@/lib/session";
import { SceneEditorClient } from "./SceneEditorClient";

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
        include: { project: { include: { styleProfile: true } } },
      },
      document: {
        include: {
          versions: { orderBy: { createdAt: "desc" }, take: 30 },
          annotations: { orderBy: { createdAt: "desc" }, take: 50 },
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
        content: { type: "doc", content: [{ type: "paragraph" }] },
        wordCount: 0,
      },
      include: { versions: true, annotations: true },
    });
  }

  return (
    <div className="flex flex-col" style={{ height: "calc(100vh - 4rem)" }}>
      {/* Breadcrumb header */}
      <div className="flex items-center justify-between mb-3 flex-shrink-0">
        <div className="flex items-center gap-2 text-sm min-w-0">
          <Link href={`/dashboard/projects/${projectId}`} className="text-slate-500 hover:text-slate-300 transition-colors truncate">
            ← {scene.chapter.project.title}
          </Link>
          <span className="text-slate-700">/</span>
          <span className="text-slate-500 truncate">{scene.chapter.title}</span>
          <span className="text-slate-700">/</span>
          <span className="text-white font-semibold truncate">{scene.title}</span>
        </div>
        <span className="text-xs text-slate-500 shrink-0">{document.wordCount.toLocaleString()} words</span>
      </div>

      {/* Editor + Coaching */}
      <div className="flex-1 min-h-0">
        <SceneEditorClient
          sceneId={sceneId}
          documentId={document.id}
          projectId={projectId}
          chapterId={scene.chapterId}
          initialContent={document.content as any}
          initialWordCount={document.wordCount}
        />
      </div>
    </div>
  );
}
