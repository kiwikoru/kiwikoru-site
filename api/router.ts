import { createRouter, publicQuery } from "./middleware";
import { emailRouter } from "./email";

export const appRouter = createRouter({
  ping: publicQuery.query(() => ({ ok: true, ts: Date.now() })),
  email: emailRouter,
});

export type AppRouter = typeof appRouter;
