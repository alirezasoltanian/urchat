import {
  deleteUser,
  getCustomizeChat,
  getUserById,
  updateUser,
} from "@/lib/actions/user";
import { protectedProcedure, publicProcedure, router } from "../lib/trpc";
import { updateUserSchema } from "@/lib/validations/user";
export const userRouter = router({
  userExtraData: protectedProcedure.query(async ({ ctx: { session } }) => {
    return getUserById(session.user.id);
  }),
  userCustomizeChat: protectedProcedure.query(async ({ ctx: { session } }) => {
    return getCustomizeChat(session.user.id);
  }),

  update: protectedProcedure
    .input(updateUserSchema)
    .mutation(async ({ ctx: { session }, input }) => {
      return updateUser(session.user.id, input);
    }),

  delete: protectedProcedure.mutation(async ({ ctx }) => {
    const [data] = await Promise.all([deleteUser(ctx.session.user.id)]);

    return data;
  }),
});
