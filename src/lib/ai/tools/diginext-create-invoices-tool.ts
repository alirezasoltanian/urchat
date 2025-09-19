import { tool } from "ai";
import { z } from "zod";
import { db } from "@/db";
import { eq, inArray } from "drizzle-orm";
import {
  customer,
  invoice,
  invoiceProduct,
  product,
  store,
} from "@/db/schema/diginext";
import { InvoiceStatus } from "@/types";

export const diginextCreateInvoicesTool = tool({
  description:
    "Create invoices given customerIds and productIds. If the user asks for a report or chart, set isChart=true to hint the UI to show charts.",
  inputSchema: z.object({
    storeId: z.string().optional(),
    customerIds: z.array(z.string()).min(1, "at least one customerId"),
    productIds: z.array(z.string()).min(1, "at least one productId"),
    invoices: z
      .array(
        z.object({
          id: z.string().optional(),
          customerId: z.string(),
          productIds: z.array(z.string()).optional(),
          invoiceNumber: z.string().optional(),
          issuedAt: z.iso.date(),
          dueAt: z.iso.date(),
          status: z.enum(["draft", "issued", "paid", "void"]).optional(),
        })
      )
      .optional(),
    isChart: z
      .boolean()
      .default(false)
      .describe("Set true if a chart/report is requested"),
  }),

  execute: async ({ customerIds, productIds, storeId, invoices }) => {
    console.log(
      "customerIdscustomerIds",
      productIds,
      storeId,
      invoices,
      customerIds
    );

    const theStore = storeId
      ? await db.query.store.findFirst({
          where: (tbl, { eq }) => eq(tbl.id, storeId),
        })
      : await db.query.store.findFirst();
    if (!theStore) return { created: [], error: "store_not_found" };

    const customersRows = await db
      .select({ id: customer.id, fullName: customer.fullName })
      .from(customer)
      .where(
        inArray(
          customer.id,
          invoices?.length ? invoices.map((i) => i.customerId) : customerIds
        )
      );
    const productsRows = await db
      .select({ id: product.id, priceCents: product.priceCents })
      .from(product)
      .where(
        inArray(
          product.id,
          invoices?.length
            ? Array.from(new Set(invoices.flatMap((i) => i.productIds ?? [])))
            : productIds
        )
      );

    const idToCustomerEmail = new Map<string, string>();
    // fetch emails
    const customersWithEmail = await db
      .select({ id: customer.id, email: customer.email })
      .from(customer)
      .where(
        inArray(
          customer.id,
          customersRows.map((c) => c.id)
        )
      );
    customersWithEmail.forEach((c) => idToCustomerEmail.set(c.id, c.email));

    const created: Array<{
      id: string;
      invoiceNumber: string;
      customerId: string;
      customerEmail: string | null;
      totalCents: number;
      productsCount: number;
      issuedAt: string;
      status: InvoiceStatus;
    }> = [];
    const updated: Array<{
      id: string;
      invoiceNumber: string;
      customerId: string;
      customerEmail: string | null;
      totalCents: number;
      productsCount: number;
      issuedAt: string;
      status: InvoiceStatus;
    }> = [];
    const errors: string[] = [];

    const ensureSubtotal = (ids: string[]) => {
      const selected = productsRows.filter((p) => ids.includes(p.id));
      const subtotal = selected.reduce((s, p) => s + p.priceCents, 0);
      const tax = Math.round(subtotal * 0.09);
      const total = subtotal + tax;
      return { subtotal, tax, total, count: selected.length };
    };

    if (invoices && invoices.length) {
      // Upsert path (update if id present, else create)
      for (const invInput of invoices) {
        if (!invInput.customerId) {
          errors.push("customerId is required for invoice item");
          continue;
        }
        const productIdsForThis = invInput.productIds ?? productIds;
        if (!productIdsForThis?.length) {
          errors.push("productIds are required for invoice item");
          continue;
        }
        const { subtotal, tax, total, count } =
          ensureSubtotal(productIdsForThis);

        if (invInput.id) {
          // update
          const [invRow] = await db
            .update(invoice)
            .set({
              customerId: invInput.customerId,
              invoiceNumber: invInput.invoiceNumber ?? undefined,
              issuedAt: new Date(invInput.issuedAt) ?? new Date(),
              dueAt: new Date(invInput.dueAt) ?? new Date(),
              status: invInput.status ?? undefined,
              subtotalCents: subtotal,
              taxCents: tax,
              totalCents: total,
            })
            .where(eq(invoice.id, invInput.id!))
            .returning();
          if (!invRow) {
            errors.push(`invoice not found: ${invInput.id}`);
            continue;
          }
          // replace products if provided
          if (invInput.productIds && invInput.productIds.length) {
            // naive replace: delete all and insert new
            await db
              .delete(invoiceProduct)
              .where(eq(invoiceProduct.invoiceId, invRow.id));
            await db.insert(invoiceProduct).values(
              invInput.productIds.map((pid) => ({
                invoiceId: invRow.id,
                productId: pid,
              }))
            );
          }
          updated.push({
            id: invRow.id,
            invoiceNumber: invRow.invoiceNumber,
            customerId: invRow.customerId,
            customerEmail: idToCustomerEmail.get(invRow.customerId) ?? null,
            totalCents: total,
            productsCount: count,
            status: invRow.status,
            issuedAt: (invRow.issuedAt as Date).toISOString(),
          });
        } else {
          // create
          const [inv] = await db
            .insert(invoice)
            .values({
              storeId: theStore.id,
              customerId: invInput.customerId,
              invoiceNumber:
                invInput.invoiceNumber ??
                `AUTO-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
              issuedAt: new Date(invInput.issuedAt) ?? new Date(),
              dueAt: new Date(invInput.dueAt) ?? new Date(),
              subtotalCents: subtotal,
              taxCents: tax,
              totalCents: total,
              status: invInput.status ?? "issued",
            })
            .returning();
          await db.insert(invoiceProduct).values(
            productIdsForThis.map((p) => ({
              invoiceId: inv.id,
              productId: p,
            }))
          );
          created.push({
            id: inv.id,
            status: inv.status,
            invoiceNumber: inv.id,
            customerId: inv.customerId,
            customerEmail: idToCustomerEmail.get(inv.customerId) ?? null,
            totalCents: total,
            productsCount: count,
            issuedAt: (inv.issuedAt as Date).toISOString(),
          });
        }
      }
    } else {
      // Bulk create from customerIds x one product set
      for (const c of customersRows) {
        const { subtotal, tax, total, count } = ensureSubtotal(productIds);
        const [inv] = await db
          .insert(invoice)
          .values({
            storeId: theStore.id,
            customerId: c.id,
            invoiceNumber: `AUTO-${Date.now()}-${Math.floor(
              Math.random() * 1000
            )}`,
            issuedAt: new Date(),
            dueAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
            subtotalCents: subtotal,
            taxCents: tax,
            totalCents: total,
            status: "issued",
          })
          .returning();
        await db
          .insert(invoiceProduct)
          .values(productIds.map((p) => ({ invoiceId: inv.id, productId: p })));
        created.push({
          id: inv.id,
          status: inv.status,
          invoiceNumber: inv.id,
          customerId: c.id,
          customerEmail: idToCustomerEmail.get(c.id) ?? null,
          totalCents: total,
          productsCount: count,
          issuedAt: (inv.issuedAt as Date).toISOString(),
        });
      }
    }

    return { created, updated, errors };
  },
});
