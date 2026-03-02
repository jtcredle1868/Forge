import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { db } from "@/server/db";

export async function GET() {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await db.user.findUnique({
      where: { id: session.userId },
      select: {
        id: true,
        email: true,
        name: true,
        genre: true,
        writingGoals: true,
        feedbackIntensity: true,
      },
    });

    return NextResponse.json({ user });
  } catch (error) {
    console.error("Profile GET error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { name, genre, writingGoals, feedbackIntensity } = body;

    const updated = await db.user.update({
      where: { id: session.userId },
      data: {
        ...(name !== undefined && { name }),
        ...(genre !== undefined && { genre }),
        ...(writingGoals !== undefined && { writingGoals }),
        ...(feedbackIntensity !== undefined && { feedbackIntensity: feedbackIntensity as any }),
      },
      select: {
        id: true,
        email: true,
        name: true,
        genre: true,
        writingGoals: true,
        feedbackIntensity: true,
      },
    });

    return NextResponse.json({ user: updated });
  } catch (error) {
    console.error("Profile PATCH error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
