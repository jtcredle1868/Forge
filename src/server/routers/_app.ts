// src/server/routers/_app.ts
import { createTRPCRouter } from "../trpc";
import { projectsRouter } from "./projects";
import { documentsRouter } from "./documents";
import { coachingRouter } from "./coaching";
import { styleRouter } from "./style";
import { syncRouter } from "./sync";
import { billingRouter } from "./billing";
import { charactersRouter } from "./characters";
import { emotionalRouter } from "./emotional";
import { worldBuilderRouter } from "./worldBuilder";

export const appRouter = createTRPCRouter({
  projects: projectsRouter,
  documents: documentsRouter,
  coaching: coachingRouter,
  style: styleRouter,
  sync: syncRouter,
  billing: billingRouter,
  characters: charactersRouter,
  emotional: emotionalRouter,
  worldBuilder: worldBuilderRouter,
});

export type AppRouter = typeof appRouter;
