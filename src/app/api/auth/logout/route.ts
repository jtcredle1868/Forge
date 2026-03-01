import { NextResponse } from "next/server";
import { destroySession } from "@/lib/session";

export async function POST(request: Request) {
  try {
    await destroySession();
    return NextResponse.redirect(new URL("/login", request.url), 303);
  } catch (error) {
    console.error("Logout error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
