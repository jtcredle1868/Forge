import { cookies } from "next/headers";
import type { User } from "@prisma/client";
import { db } from "@/server/db";

const SESSION_DURATION = 30 * 24 * 60 * 60; // 30 days in seconds

export interface Session {
  userId: string;
  user: User;
}

export async function getSession(): Promise<Session | null> {
  try {
    const cookieStore = await cookies();
    const sessionToken = cookieStore.get("session")?.value;

    if (!sessionToken) return null;

    const user = await db.user.findUnique({
      where: { id: sessionToken },
    });

    if (!user) {
      cookieStore.delete("session");
      return null;
    }

    return { userId: user.id, user };
  } catch {
    return null;
  }
}

export async function createSession(user: User) {
  const cookieStore = await cookies();
  cookieStore.set("session", user.id, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: SESSION_DURATION,
  });
}

export async function destroySession() {
  const cookieStore = await cookies();
  cookieStore.delete("session");
}
