"use server";
import { db } from "@/db";
import { user } from "@/db/schema/auth";
import { eq, sql } from "drizzle-orm";
import { auth } from "../auth";
import { headers } from "next/headers";
import type { UpdateUserSchema } from "../validations/user";

export const deleteUser = async (userId: string) => {
  db.delete(user).where(eq(user.id, userId));
};

export const getCustomizeChat = async (userId: string) => {
  const [userData] = await db
    .select({
      customizeChat: user.customizeChat,
    })
    .from(user)
    .where(eq(user.id, userId));
  return userData.customizeChat;
};

export const currentUser = async () => {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  return session ? session.user : null;
};

export const getUserById = async (userId: string) => {
  const [userData] = await db
    .select({
      name: user.name,
      email: user.email,
      chatToken: user.chatToken,
      planId: user.planId,
      image: user.image,
    })
    .from(user)
    .where(eq(user.id, userId));
  return userData;
};

export const updateUser = async (
  userId: string,
  updateData: UpdateUserSchema
) => {
  await db
    .update(user)
    .set({
      ...updateData,
    })
    .where(eq(user.id, userId));
};

export async function decreaseToken(token: number) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  const userId = session?.user?.id;
  if (!userId) {
    return null;
  }
  await db
    .update(user)
    .set({ chatToken: sql`${user.chatToken} - ${token}` })
    .where(eq(user.id, userId));
}
export async function getChatToken() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  const userId = session?.user?.id;

  if (!userId) {
    return null;
  }

  const userChatToken = await db
    .select({
      chatToken: user.chatToken,
    })
    .from(user)
    .where(eq(user.id, userId))
    .then((res) => res[0].chatToken);

  return userChatToken;
}
