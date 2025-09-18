import type { InferSelectModel } from "drizzle-orm";
import { relations } from "drizzle-orm";
import {
  integer,
  pgTable,
  primaryKey,
  text,
  timestamp,
  varchar,
} from "drizzle-orm/pg-core";

import { generateId } from "@/lib/id";
import { lifecycleDates } from "./utils";

// Store (shop)
export const store = pgTable("store", {
  id: varchar("id", { length: 255 })
    .$defaultFn(() => generateId())
    .primaryKey(),
  name: text("name").notNull(),
  slug: varchar("slug", { length: 255 }).notNull(),
  description: text("description"),
  ...lifecycleDates,
});
export type Store = InferSelectModel<typeof store>;

// Product
export const product = pgTable("product", {
  id: varchar("id", { length: 255 })
    .$defaultFn(() => generateId())
    .primaryKey(),
  storeId: varchar("store_id", { length: 255 })
    .notNull()
    .references(() => store.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  sku: varchar("sku", { length: 255 }).notNull(),
  priceCents: integer("price_cents").notNull(),
  stock: integer("stock").notNull(),
  ...lifecycleDates,
});
export type Product = InferSelectModel<typeof product>;

// Customer (separate from auth.user)
export const customer = pgTable("customer", {
  id: varchar("id", { length: 255 })
    .$defaultFn(() => generateId())
    .primaryKey(),
  fullName: text("full_name").notNull(),
  email: varchar("email", { length: 255 }).notNull(),
  phone: varchar("phone", { length: 50 }),
  ...lifecycleDates,
});
export type Customer = InferSelectModel<typeof customer>;

// Invoice (acts as the sales document)
export const invoice = pgTable("invoice", {
  id: varchar("id", { length: 255 })
    .$defaultFn(() => generateId())
    .primaryKey(),
  storeId: varchar("store_id", { length: 255 })
    .notNull()
    .references(() => store.id, { onDelete: "cascade" }),
  customerId: varchar("customer_id", { length: 255 })
    .notNull()
    .references(() => customer.id, { onDelete: "restrict" }),

  invoiceNumber: varchar("invoice_number", { length: 255 }).notNull(),
  issuedAt: timestamp("issued_at").notNull().defaultNow(),
  dueAt: timestamp("due_at").defaultNow(),
  subtotalCents: integer("subtotal_cents").notNull().default(0),
  taxCents: integer("tax_cents").notNull().default(0),
  totalCents: integer("total_cents").notNull().default(0),
  status: varchar("status", { enum: ["draft", "issued", "paid", "void"] })
    .notNull()
    .default("issued"),
  ...lifecycleDates,
});
export type Invoice = InferSelectModel<typeof invoice>;

// Join table: many products per invoice
export const invoiceProduct = pgTable(
  "invoice_product",
  {
    invoiceId: varchar("invoice_id", { length: 255 })
      .notNull()
      .references(() => invoice.id, { onDelete: "cascade" }),
    productId: varchar("product_id", { length: 255 })
      .notNull()
      .references(() => product.id, { onDelete: "restrict" }),
  },
  (table) => ({
    pk: primaryKey({ columns: [table.invoiceId, table.productId] }),
  })
);
export type InvoiceProduct = InferSelectModel<typeof invoiceProduct>;

// Relations
export const storeRelations = relations(store, ({ many }) => ({
  products: many(product),
  invoices: many(invoice),
}));

export const productRelations = relations(product, ({ one, many }) => ({
  store: one(store, {
    fields: [product.storeId],
    references: [store.id],
  }),
  invoiceProducts: many(invoiceProduct),
}));

export const customerRelations = relations(customer, ({ many }) => ({
  invoices: many(invoice),
}));

export const invoiceRelations = relations(invoice, ({ one, many }) => ({
  store: one(store, {
    fields: [invoice.storeId],
    references: [store.id],
  }),
  customer: one(customer, {
    fields: [invoice.customerId],
    references: [customer.id],
  }),
  products: many(invoiceProduct),
}));

export const invoiceProductRelations = relations(invoiceProduct, ({ one }) => ({
  invoice: one(invoice, {
    fields: [invoiceProduct.invoiceId],
    references: [invoice.id],
  }),
  product: one(product, {
    fields: [invoiceProduct.productId],
    references: [product.id],
  }),
}));
