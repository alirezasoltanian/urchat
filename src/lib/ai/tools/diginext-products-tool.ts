import { tool } from "ai";
import { z } from "zod";
import { db } from "@/db";
import { product } from "@/db/schema/diginext";

export const diginextProductsTool = tool({
  description: "Fetch diginext products for selection",
  inputSchema: z.object({}),
  execute: async () => {
    const rows = await db
      .select({
        id: product.id,
        name: product.name,
        sku: product.sku,
        priceCents: product.priceCents,
      })
      .from(product);
    return { products: rows };
  },
});
