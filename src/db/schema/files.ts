import { integer, pgTable, serial, text, timestamp } from "drizzle-orm/pg-core";
import { user } from "./auth";

export const files = pgTable("file", {
  id: serial("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  filename: text("filename").notNull(),
  folder: text("folder"),
  mimeType: text("mime_type").notNull(),
  size: integer("size").notNull(),
  s3Key: text("s3_key").notNull().unique(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  chatId: text("chat_id"),
  toolId: text("tool_id"),
});

export const userUsage = pgTable("user_usage", {
  id: serial("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  storageUsedBytes: integer("storage_used_bytes").notNull().default(0),
  bandwidthUsedBytes: integer("bandwidth_used_bytes").notNull().default(0),
  lastUpdated: timestamp("last_updated").defaultNow().notNull(),
});
