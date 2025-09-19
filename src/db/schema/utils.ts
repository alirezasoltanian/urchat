import { sql } from "drizzle-orm";
import { timestamp } from "drizzle-orm/pg-core";

export const lifecycleDates = {
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .default(sql`current_timestamp`)
    .$onUpdate(() => new Date()),
};
