import { protectedProcedure, publicProcedure, router } from "../lib/trpc";
import { userRouter } from "./user";

export const appRouter = router({
  user: userRouter,
  healthCheck: publicProcedure.query(() => {
    return "OK";
  }),
  privateData: protectedProcedure.query(({ ctx }) => {
    return {
      message: "This is private",
      user: ctx.session.user,
    };
  }),
});
export type AppRouter = typeof appRouter;
