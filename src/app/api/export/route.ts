import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { db } from "@/server/db";
import { exportAsText, exportAsDocx } from "@/server/services/exportService";

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { projectId, format } = await request.json();

    if (!projectId || !format) {
      return NextResponse.json({ error: "Missing projectId or format" }, { status: 400 });
    }

    const project = await db.project.findUnique({
      where: { id: projectId },
      include: {
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

    if (!project || project.userId !== session.userId) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    // Check export permissions by tier
    const subscription = await db.subscription.findUnique({ where: { userId: session.userId } });
    const tier = subscription?.tier ?? "FREE";

    if (format !== "txt" && tier === "FREE") {
      return NextResponse.json(
        { error: "Upgrade to Pro to export as .docx or .pdf" },
        { status: 403 }
      );
    }

    const scenes = project.chapters.flatMap((ch) =>
      ch.scenes.map((sc) => ({
        chapterTitle: ch.title,
        sceneTitle: sc.title,
        content: sc.document?.content ?? { type: "plain", content: "" },
        wordCount: sc.document?.wordCount ?? 0,
      }))
    );

    if (format === "txt") {
      const text = exportAsText(project.title, scenes);
      return new NextResponse(text, {
        headers: {
          "Content-Type": "text/plain; charset=utf-8",
          "Content-Disposition": `attachment; filename="${encodeURIComponent(project.title)}.txt"`,
        },
      });
    }

    if (format === "docx") {
      const buffer = await exportAsDocx(project.title, scenes);
      return new NextResponse(new Uint8Array(buffer), {
        headers: {
          "Content-Type": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
          "Content-Disposition": `attachment; filename="${encodeURIComponent(project.title)}.docx"`,
        },
      });
    }

    return NextResponse.json({ error: "Unsupported format" }, { status: 400 });
  } catch (error) {
    console.error("Export error:", error);
    return NextResponse.json({ error: "Export failed" }, { status: 500 });
  }
}
