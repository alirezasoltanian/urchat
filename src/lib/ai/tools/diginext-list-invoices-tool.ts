import { tool } from "ai";
import { z } from "zod";
import { db } from "@/db";
import { customer, invoice, invoiceProduct } from "@/db/schema/diginext";
import { eq, inArray, sql, gte, lte } from "drizzle-orm";

export const diginextListInvoicesTool = tool({
  description:
    "List invoices with customer email and product count. If the user mentions a report or chart, set isChart=true to hint the UI to show charts.",
  inputSchema: z.object({
    customerIds: z.array(z.string()).optional(),
    statuses: z.array(z.enum(["draft", "issued", "paid", "void"])).optional(),
    limit: z.number().min(1).max(200).default(50),
    startDate: z.coerce
      .date()
      .optional()
      .describe("Date to filter invoices issued on/after this date"),
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
  execute: async ({ customerIds, statuses, limit, startDate, endDate }) => {
    // base invoices
    const invs = await db.query.invoice.findMany({
      where: (tbl, { and }) =>
        and(
          customerIds?.length
            ? inArray(tbl.customerId, customerIds)
            : undefined,
          statuses?.length ? inArray(tbl.status, statuses as any) : undefined,
          startDate ? gte(tbl.issuedAt, startDate) : undefined,
          endDate ? lte(tbl.issuedAt, endDate) : undefined
        ),
      orderBy: (tbl, { desc }) => [desc(tbl.issuedAt)],
      limit,
    });

    if (invs.length === 0) return { created: [], updated: [], errors: [] };

    const invIds = invs.map((i) => i.id);
    const custIds = Array.from(new Set(invs.map((i) => i.customerId)));

    const emails = await db
      .select({ id: customer.id, email: customer.email })
      .from(customer)
      .where(inArray(customer.id, custIds));
    const idToEmail = new Map<string, string | null>();
    emails.forEach((c) => idToEmail.set(c.id, c.email));

    // product counts
    const counts = await db
      .select({
        invoiceId: invoiceProduct.invoiceId,
        cnt: sql<number>`count(*)`,
      })
      .from(invoiceProduct)
      .where(inArray(invoiceProduct.invoiceId, invIds))
      .groupBy(invoiceProduct.invoiceId);
    const idToCount = new Map<string, number>();
    counts.forEach((r) => idToCount.set(r.invoiceId, Number(r.cnt)));

    const created = invs.map((inv) => ({
      id: inv.id,
      status: inv.status,
      invoiceNumber: inv.invoiceNumber,
      customerId: inv.customerId,
      customerEmail: idToEmail.get(inv.customerId) ?? null,
      totalCents: inv.totalCents,
      productsCount: idToCount.get(inv.id) ?? 0,
      issuedAt: (inv.issuedAt as Date).toISOString(),
    }));
    console.log("aaaaa", created);
    return { created, updated: [], errors: [] };
  },
});
