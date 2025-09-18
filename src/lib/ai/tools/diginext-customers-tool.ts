import { tool } from "ai";
import { z } from "zod";
import { db } from "@/db";
import { customer } from "@/db/schema/diginext";

export const diginextCustomersTool = tool({
  description: "Fetch diginext customers for selection",
  inputSchema: z.object({}),
  execute: async () => {
    const rows = await db
      .select({
        id: customer.id,
        fullName: customer.fullName,
        email: customer.email,
      })
      .from(customer);
    return { customers: rows };
  },
});
