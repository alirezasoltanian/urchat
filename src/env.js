import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

export const env = createEnv({
  server: {
    DATABASE_URL: z.string().optional(),
    REDIS_URL: z.string().optional(),
    REDIS_SECRET: z.string().optional(),
    S3_STORAGE_URL: z.string().optional(),
    S3_ENDPOINT: z.string().optional(),
    S3_BUCKET_NAME: z.string().optional(),
    S3_ACCESS_KEY: z.string().optional(),
    S3_SECRET_KEY: z.string().optional(),
    REGION: z.string().optional(),
    AWS_ACCESS_KEY_ID: z.string().optional(),
    AWS_SECRET_ACCESS_KEY: z.string().optional(),
    NODE_ENV: z
      .enum(["development", "test", "production"])
      .default("development"),
    OPENAI_API_KEY: z.string().optional(),
    GAME_SALT: z.string().min(1).optional(),
    AUTH_SECRET: z.string().optional(),
  },
  client: {
    NEXT_PUBLIC_NOVU_APPLICATION_IDENTIFIER: z.string().optional(),
    NEXT_PUBLIC_APP_URL: z.string().optional(),
    NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: z.string().optional(),
    NEXT_PUBLIC_WEB_PUSH_PUBLIC_KEY: z.string().min(1).optional(),
    NEXT_PUBLIC_GAME_SALT: z.string().min(1).optional(),
    // # Sentry
    NEXT_PUBLIC_SENTRY_DSN: z.string().optional(),
  },

  experimental__runtimeEnv: {
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
    NEXT_PUBLIC_NOVU_APPLICATION_IDENTIFIER:
      process.env.NEXT_PUBLIC_NOVU_APPLICATION_IDENTIFIER,
    NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY:
      process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY,

    NEXT_PUBLIC_GAME_SALT: process.env.NEXT_PUBLIC_GAME_SALT,
    NEXT_PUBLIC_WEB_PUSH_PUBLIC_KEY:
      process.env.NEXT_PUBLIC_WEB_PUSH_PUBLIC_KEY,
    NEXT_PUBLIC_SENTRY_DSN: process.env.NEXT_PUBLIC_SENTRY_DSN,
  },

  skipValidation: !!process.env.SKIP_ENV_VALIDATION,
  emptyStringAsUndefined: true,
});
