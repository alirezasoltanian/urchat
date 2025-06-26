import { env } from "@/env.js";
import { drizzle } from "drizzle-orm/postgres-js";

import * as schema from "./schema";

export const db = drizzle({
  connection: {
    url: env.DATABASE_URL,
  },
  casing: "snake_case",
  logger: true,
  schema,
});
