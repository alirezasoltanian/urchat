import { db } from "../index";
import { and, eq, inArray } from "drizzle-orm";
import {
  customer,
  invoice,
  invoiceProduct,
  product,
  store,
  type Customer,
  type Invoice,
  type Product,
  type Store,
} from "../schema/diginext";

function pad(num: number, size = 4) {
  const s = String(num);
  return s.length >= size ? s : "0".repeat(size - s.length) + s;
}

// پیشفرض‌های فارسی و واقعی‌تر
const DEFAULT_PRODUCTS: Array<{
  name: string;
  sku: string;
  priceCents: number;
  stock: number;
}> = [
  {
    name: "گوشی موبایل سامسونگ A14",
    sku: "SKU-001",
    priceCents: 7800000,
    stock: 25,
  },
  {
    name: "لپ‌تاپ لنوو IdeaPad 3",
    sku: "SKU-002",
    priceCents: 28900000,
    stock: 12,
  },
  {
    name: "هندزفری بلوتوث شیائومی Redmi Buds",
    sku: "SKU-003",
    priceCents: 2200000,
    stock: 60,
  },
  {
    name: "پاوربانک انکر 10000mAh",
    sku: "SKU-004",
    priceCents: 1650000,
    stock: 40,
  },
  {
    name: "ماوس بی‌سیم لاجیتک M185",
    sku: "SKU-005",
    priceCents: 920000,
    stock: 80,
  },
  {
    name: "کیبورد مکانیکی ردراگون Kumara",
    sku: "SKU-006",
    priceCents: 2450000,
    stock: 30,
  },
  {
    name: "مانیتور 24 اینچ ال‌جی IPS",
    sku: "SKU-007",
    priceCents: 8900000,
    stock: 15,
  },
  {
    name: "اسپیکر بلوتوث JBL Flip",
    sku: "SKU-008",
    priceCents: 5200000,
    stock: 22,
  },
  {
    name: "هارد اکسترنال وسترن دیجیتال 1TB",
    sku: "SKU-009",
    priceCents: 3100000,
    stock: 35,
  },
  {
    name: "فلش مموری سن‌دیسک 64GB",
    sku: "SKU-010",
    priceCents: 480000,
    stock: 120,
  },
  {
    name: "شارژر دیواری سامسونگ 25W",
    sku: "SKU-011",
    priceCents: 780000,
    stock: 70,
  },
  {
    name: "قاب گوشی آیفون 13 Silicone",
    sku: "SKU-012",
    priceCents: 350000,
    stock: 90,
  },
  {
    name: "کابل Type‑C باسئوس 1m",
    sku: "SKU-013",
    priceCents: 290000,
    stock: 150,
  },
];

const DEFAULT_CUSTOMERS: Array<{
  fullName: string;
  email: string;
  phone: string;
}> = [
  {
    fullName: "سارا کریمی",
    email: "sara.karimi@example.com",
    phone: "+98-912-000-0001",
  },
  {
    fullName: "علی رضایی",
    email: "ali.rezaei@example.com",
    phone: "+98-912-000-0002",
  },
  {
    fullName: "محمد موسوی",
    email: "m.mousavi@example.com",
    phone: "+98-912-000-0003",
  },
  {
    fullName: "نگار احمدی",
    email: "negar.ahmadi@example.com",
    phone: "+98-912-000-0004",
  },
  {
    fullName: "حسین نصیری",
    email: "hossein.nasiri@example.com",
    phone: "+98-912-000-0005",
  },
  {
    fullName: "مهسا رستمی",
    email: "mahsa.rostami@example.com",
    phone: "+98-912-000-0006",
  },
  {
    fullName: "مهدی جعفری",
    email: "mehdi.jafari@example.com",
    phone: "+98-912-000-0007",
  },
  {
    fullName: "فاطمه حسینی",
    email: "fatemeh.hosseini@example.com",
    phone: "+98-912-000-0008",
  },
  {
    fullName: "رضا کریمی",
    email: "reza.karimi@example.com",
    phone: "+98-912-000-0009",
  },
  {
    fullName: "الهام صادقی",
    email: "elham.sadeghi@example.com",
    phone: "+98-912-000-0010",
  },
  {
    fullName: "پرهام اسدی",
    email: "parham.asadi@example.com",
    phone: "+98-912-000-0011",
  },
  {
    fullName: "نگین مرادی",
    email: "negin.moradi@example.com",
    phone: "+98-912-000-0012",
  },
  {
    fullName: "یاسین توکلی",
    email: "yasin.tavakoli@example.com",
    phone: "+98-912-000-0013",
  },
];

export async function seedDiginextDemo() {
  // Store
  const [shop] = await db
    .insert(store)
    .values({
      name: "فروشگاه دیجی‌نکست",
      slug: "diginext-shop",
      description: "فروشگاه نمایشی برای تست و توسعه",
    })
    .returning();

  // Products (13)
  const productRows: Product[] = DEFAULT_PRODUCTS.map(
    (p) =>
      ({
        id: undefined as unknown as string,
        storeId: shop.id,
        name: p.name,
        sku: p.sku,
        priceCents: p.priceCents,
        stock: p.stock,
        createdAt: undefined as unknown as Date,
        updatedAt: undefined as unknown as Date,
      } as unknown as Product)
  );
  const insertedProducts = await db
    .insert(product)
    .values(productRows)
    .returning();

  // Customers (13)
  const customerRows: Customer[] = DEFAULT_CUSTOMERS.map(
    (c) =>
      ({
        id: undefined as unknown as string,
        fullName: c.fullName,
        email: c.email,
        phone: c.phone,
        createdAt: undefined as unknown as Date,
        updatedAt: undefined as unknown as Date,
      } as unknown as Customer)
  );
  const insertedCustomers = await db
    .insert(customer)
    .values(customerRows)
    .returning();

  // Invoices (13) each with varying products
  const insertedInvoices: Invoice[] = [];
  for (let i = 1; i <= 13; i++) {
    // Pick a rotating subset of products (size 2..5)
    const size = 2 + ((i - 1) % 4); // 2,3,4,5
    const start = (i - 1) % insertedProducts.length;
    const selected = Array.from(
      { length: size },
      (_, k) => insertedProducts[(start + k) % insertedProducts.length]
    );

    const subtotal = selected.reduce((sum, p) => sum + p.priceCents, 0);
    const tax = Math.round(subtotal * 0.09);
    const total = subtotal + tax;

    const issuedAt = new Date();
    issuedAt.setDate(issuedAt.getDate() - (14 - i));
    const dueAt = new Date(issuedAt);
    dueAt.setDate(issuedAt.getDate() + 7);

    const [inv] = await db
      .insert(invoice)
      .values({
        storeId: shop.id,
        customerId: insertedCustomers[i - 1].id,
        invoiceNumber: `FA-${pad(i)}`,
        issuedAt,
        dueAt,
        subtotalCents: subtotal,
        taxCents: tax,
        totalCents: total,
        status: "issued",
      })
      .returning();

    insertedInvoices.push(inv);

    // Link products
    await db.insert(invoiceProduct).values(
      selected.map((p) => ({
        invoiceId: inv.id,
        productId: p.id,
      }))
    );
  }

  return {
    store: shop,
    products: insertedProducts,
    customers: insertedCustomers,
    invoices: insertedInvoices,
  };
}

export default seedDiginextDemo;

// Allow running the file directly with: tsx -r dotenv/config src/db/seed/diginext.ts
(() => {
  try {
    const argPath =
      (typeof process !== "undefined" && process.argv && process.argv[1]) || "";
    if (
      argPath.endsWith("src/db/seed/diginext.ts") ||
      argPath.endsWith("src\\db\\seed\\diginext.ts")
    ) {
      Promise.resolve()
        .then(() => seedDiginextDemo())
        .then(() => {
          // eslint-disable-next-line no-console
          console.log("Seeded ✅");
        })
        .catch((err) => {
          // eslint-disable-next-line no-console
          console.error(err);
          if (typeof process !== "undefined") process.exitCode = 1;
        });
    }
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error(err);
    if (typeof process !== "undefined") process.exitCode = 1;
  }
})();
