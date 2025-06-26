import type { InferSelectModel } from "drizzle-orm";
import {
  boolean,
  foreignKey,
  json,
  pgTable,
  primaryKey,
  text,
  timestamp,
  varchar,
} from "drizzle-orm/pg-core";

import { generateId } from "@/lib/id";

import { user } from "./auth";
import { lifecycleDates } from "./utils";

export const chat = pgTable("chat", {
  id: varchar("id", { length: 255 })
    .$defaultFn(() => generateId())
    .primaryKey(),

  title: text("title").notNull(),
  forkId: text("fork_id"),
  userId: varchar("user_id")
    .notNull()
    .references(() => user.id),
  visibility: varchar("visibility", { enum: ["public", "private"] })
    .notNull()
    .default("private"),
  ...lifecycleDates,
});

export type Chat = InferSelectModel<typeof chat>;

export const message = pgTable("message", {
  id: varchar("id", { length: 255 })
    .$defaultFn(() => generateId())
    .primaryKey(),
  chatId: varchar("chat_id")
    .notNull()
    .references(() => chat.id),
  role: varchar("role").notNull(),
  parts: json("parts").notNull(),
  attachments: json("attachments").default([]),
  ...lifecycleDates,
});
export type DBMessage = InferSelectModel<typeof message>;

export type Message = Omit<
  InferSelectModel<typeof message>,
  "id" | "createdAt" | "updatedAt"
>;

export const vote = pgTable(
  "vote",
  {
    chatId: varchar("chat_id")
      .notNull()
      .references(() => chat.id),
    messageId: varchar("message_id")
      .notNull()
      .references(() => message.id),
    isUpvoted: boolean("is_upvoted").notNull(),
  },
  (table) => {
    return {
      pk: primaryKey({ columns: [table.chatId, table.messageId] }),
    };
  }
);

export type Vote = InferSelectModel<typeof vote>;

export const document = pgTable(
  "document",
  {
    id: varchar("id", { length: 255 })
      .$defaultFn(() => generateId())
      .notNull(),
    createdAt: timestamp("created_at").notNull(),
    title: text("title").notNull(),
    content: text("content"),
    kind: varchar("kind", { enum: ["text", "code", "image", "sheet"] })
      .notNull()
      .default("text"),
    userId: varchar("user_id")
      .notNull()
      .references(() => user.id),
  },
  (table) => ({
    pk: primaryKey({ columns: [table.id, table.createdAt] }),
  })
);

export type Document = InferSelectModel<typeof document>;

export const suggestion = pgTable(
  "suggestion",
  {
    id: varchar("id", { length: 255 })
      .$defaultFn(() => generateId())
      .primaryKey(),
    documentId: varchar("document_id").notNull(),
    originalText: text("original_text").notNull(),
    suggestedText: text("suggested_text").notNull(),
    description: text("description"),
    isResolved: boolean("is_resolved").notNull().default(false),
    userId: varchar("user_id")
      .notNull()
      .references(() => user.id),

    documentCreatedAt: timestamp("document_created_at").notNull(),
    ...lifecycleDates,
  },
  (table) => ({
    documentRef: foreignKey({
      columns: [table.documentId, table.documentCreatedAt],
      foreignColumns: [document.id, document.createdAt],
    }),
  })
);

export type Suggestion = InferSelectModel<typeof suggestion>;

export const stream = pgTable(
  "Stream",
  {
    id: varchar("id", { length: 255 }).$defaultFn(() => generateId()),
    chatId: varchar("chatId").notNull(),
    createdAt: timestamp("createdAt").notNull(),
  },
  (table) => ({
    pk: primaryKey({ columns: [table.id] }),
    chatRef: foreignKey({
      columns: [table.chatId],
      foreignColumns: [chat.id],
    }),
  })
);

export type Stream = InferSelectModel<typeof stream>;
