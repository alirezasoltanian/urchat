import { tool } from "ai";
import { z } from "zod";
import { db } from "@/db";
import { and, gte, lte } from "drizzle-orm";
import { product } from "@/db/schema/diginext";

export const diginextProductsTool = tool({
  description:
    "Fetch diginext products for selection if dont talk about time dont need endDate and startDate so be undefined",
  inputSchema: z.object({
    startDate: z
      .string()
      .refine(
        (value) => !Number.isNaN(Date.parse(value)),
        "Invalid ISO datetime"
      )
      .optional()
      .describe("ISO datetime to filter products created on/after this date"),
    endDate: z
      .string()
      .refine(
        (value) => !Number.isNaN(Date.parse(value)),
        "Invalid ISO datetime"
      )
      .optional()
      .describe("ISO datetime to filter products created on/before this date"),
  }),
  execute: async ({ startDate, endDate }) => {
    console.log("firstfirstfirst", startDate);

    const start = startDate ? new Date(startDate) : undefined;
    const end = endDate ? new Date(endDate) : undefined;
    const rows = await db
      .select({
        id: product.id,
        name: product.name,
        sku: product.sku,
        priceCents: product.priceCents,
      })
      .from(product)
      .where(
        and(
          start ? gte(product.createdAt, start) : undefined,
          end ? lte(product.createdAt, end) : undefined
        )
      );
    return { products: rows };
  },
});
