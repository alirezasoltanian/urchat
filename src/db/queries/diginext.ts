import { db } from "../index";
import {
  customer,
  invoice,
  invoiceProduct,
  product,
  store,
} from "../schema/diginext";

export type DiginextSnapshot = {
  store: {
    id: string;
    name: string;
    slug: string;
    description: string | null;
  } | null;
  products: Array<{
    id: string;
    name: string;
    sku: string;
    priceCents: number;
    stock: number;
  }>;
  customers: Array<{
    id: string;
    fullName: string;
    email: string;
    phone: string | null;
  }>;
  invoices: Array<{
    id: string;
    invoiceNumber: string;
    issuedAt: Date;
    dueAt: Date | null;
    subtotalCents: number;
    taxCents: number;
    totalCents: number;
    status: string;
    customer: { id: string; fullName: string; email: string };
    products: Array<{
      id: string;
      name: string;
      sku: string;
      priceCents: number;
    }>;
  }>;
};

export async function getDiginextSnapshot(): Promise<DiginextSnapshot> {
  const shop = await db.query.store.findFirst();

  const productsRows = await db
    .select({
      id: product.id,
      name: product.name,
      sku: product.sku,
      priceCents: product.priceCents,
      stock: product.stock,
    })
    .from(product);

  const customersRows = await db
    .select({
      id: customer.id,
      fullName: customer.fullName,
      email: customer.email,
      phone: customer.phone,
    })
    .from(customer);

  const invoicesRows = await db.query.invoice.findMany({
    with: {
      customer: true,
      products: { with: { product: true } },
    },
    orderBy: (tbl, { desc }) => [desc(tbl.issuedAt)],
  });

  const invoices = invoicesRows.map((inv) => ({
    id: inv.id,
    invoiceNumber: inv.invoiceNumber,
    issuedAt: inv.issuedAt,
    dueAt: inv.dueAt,
    subtotalCents: inv.subtotalCents,
    taxCents: inv.taxCents,
    totalCents: inv.totalCents,
    status: inv.status,
    customer: {
      id: inv.customer.id,
      fullName: inv.customer.fullName,
      email: inv.customer.email,
    },
    products: inv.products.map((ip) => ({
      id: ip.product.id,
      name: ip.product.name,
      sku: ip.product.sku,
      priceCents: ip.product.priceCents,
    })),
  }));

  return {
    store: shop
      ? {
          id: shop.id,
          name: shop.name,
          slug: shop.slug,
          description: shop.description,
        }
      : null,
    products: productsRows,
    customers: customersRows,
    invoices,
  };
}
