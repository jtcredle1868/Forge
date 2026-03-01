// src/lib/auth.ts
import type { User } from "@prisma/client";
import { getSession } from "./session";

export async function auth() {
  return getSession();
}

export async function getCurrentUser(): Promise<User | null> {
  const session = await getSession();
  if (!session) {
    return null;
  }
  return session.user;
}

export async function requireAuth() {
  const user = await getCurrentUser();
  if (!user) {
    throw new Error("Unauthorized - User not found");
  }
  return user;
}
