// src/server/routers/billing.ts
import { z } from "zod";
import { protectedProcedure, createTRPCRouter } from "../trpc";
import { db } from "../db";
import { TRPCError } from "@trpc/server";

export const billingRouter = createTRPCRouter({
  getSubscription: protectedProcedure.query(async ({ ctx }) => {
    let subscription = await db.subscription.findUnique({
      where: { userId: ctx.user!.id },
    });

    if (!subscription) {
      subscription = await db.subscription.create({
        data: {
          userId: ctx.user!.id,
          stripeCustomerId: `cus_${ctx.user!.id}`,
          tier: "FREE",
          status: "ACTIVE",
        },
      });
    }

    return subscription;
  }),

  createCheckoutSession: protectedProcedure
    .input(z.object({ tier: z.enum(["PRO", "STUDIO"]) }))
    .mutation(async ({ ctx, input }) => {
      // TODO: Implement Stripe checkout session creation
      return {
        url: `https://checkout.stripe.com/pay/session_${ctx.user!.id}_${input.tier}`,
      };
    }),

  createPortalSession: protectedProcedure.mutation(async ({ ctx }) => {
    // TODO: Implement Stripe billing portal session
    return {
      url: `https://billing.stripe.com/session_${ctx.user!.id}`,
    };
  }),

  getUsage: protectedProcedure.query(async ({ ctx }) => {
    const subscription = await db.subscription.findUnique({
      where: { userId: ctx.user!.id },
    });

    const todayCount = await db.aIInteraction.count({
      where: {
        userId: ctx.user!.id,
        createdAt: {
          gte: new Date(new Date().setHours(0, 0, 0, 0)),
        },
      },
    });

    const monthCount = await db.aIInteraction.count({
      where: {
        userId: ctx.user!.id,
        createdAt: {
          gte: new Date(new Date().setDate(1)),
        },
      },
    });

    return {
      tier: subscription?.tier || "FREE",
      dailyCoachingRequests: todayCount,
      monthlyCoachingRequests: monthCount,
      dailyLimit: subscription?.tier === "FREE" ? 50 : null,
    };
  }),
});
