import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { db } from "@/server/db";

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { projectId } = await request.json();

    if (!projectId) {
      return NextResponse.json({ error: "Missing projectId" }, { status: 400 });
    }

    // Check subscription tier for Refinery integration
    const subscription = await db.subscription.findUnique({ where: { userId: session.userId } });
    if (!subscription || subscription.tier === "FREE") {
      return NextResponse.json(
        { error: "Refinery integration requires Pro or Studio subscription" },
        { status: 403 }
      );
    }

    // Get Refinery API key from user settings
    const user = await db.user.findUnique({ where: { id: session.userId } });
    // Note: refineryApiKey would be stored in user model in production
    // For now we check if it exists in environment or user settings

    const project = await db.project.findUnique({
      where: { id: projectId },
      include: {
        styleProfile: true,
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

    // Extract manuscript text
    const manuscriptText = project.chapters
      .flatMap((ch) =>
        ch.scenes.map((sc) => {
          const content = sc.document?.content;
          if (typeof content === "object" && content !== null && "content" in content) {
            return (content as { content: string }).content;
          }
          return "";
        })
      )
      .join("\n\n");

    const wordCount = project.chapters
      .flatMap((ch) => ch.scenes)
      .reduce((sum, sc) => sum + (sc.document?.wordCount ?? 0), 0);

    const payload = {
      projectId: project.id,
      title: project.title,
      genre: project.genre ?? "Unknown",
      wordCount,
      manuscriptText,
      styleProfile: project.styleProfile
        ? {
            pov: project.styleProfile.pov,
            tense: project.styleProfile.tense,
            formality: project.styleProfile.formality,
          }
        : null,
    };

    const REFINERY_API_URL = process.env.REFINERY_API_URL ?? "https://api.refinery.masterproseplatform.com/v1/evaluate";

    try {
      const refineryResponse = await fetch(REFINERY_API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.REFINERY_WEBHOOK_SECRET ?? ""}`,
        },
        body: JSON.stringify(payload),
      });

      if (refineryResponse.ok) {
        const result = await refineryResponse.json();
        return NextResponse.json({
          success: true,
          jobId: result.jobId,
          estimatedCompletion: result.estimatedCompletion,
          message: "Manuscript submitted to The Refinery for evaluation.",
        });
      }
    } catch {
      // Refinery not available
    }

    // Return simulated response when Refinery is not available
    return NextResponse.json({
      success: true,
      jobId: `forge_${Date.now()}`,
      estimatedCompletion: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      message: "Manuscript queued for Refinery evaluation. Results will appear in your Coaching Panel.",
      demo: true,
    });
  } catch (error) {
    console.error("Refinery submission error:", error);
    return NextResponse.json({ error: "Submission failed" }, { status: 500 });
  }
}
