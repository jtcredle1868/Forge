// src/server/trpc.ts
import { TRPCError, initTRPC } from "@trpc/server";
import { getCurrentUser } from "@/lib/auth";
import type { Session } from "@/lib/session";

interface CreateTRPCContextOptions {
  session: Session | null;
}

export const createTRPCContext = async (
  opts: CreateTRPCContextOptions,
) => {
  const user = await getCurrentUser();
  return {
    session: opts.session,
    user,
  };
};

type Context = Awaited<ReturnType<typeof createTRPCContext>>;

const t = initTRPC.context<Context>().create();

export const createTRPCRouter = t.router;
export const createCallerFactory = t.createCallerFactory;

export const publicProcedure = t.procedure;

export const protectedProcedure = t.procedure.use(({ ctx, next }) => {
  if (!ctx.user) {
    throw new TRPCError({
      code: "UNAUTHORIZED",
      message: "Not authenticated",
    });
  }
  return next({
    ctx: {
      ...ctx,
      user: ctx.user,
      session: ctx.session,
    },
  });
});
