import path from "node:path";
import { config } from "dotenv";
import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";

config({ path: path.resolve(process.cwd(), ".env.local") });
config();

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

const PRODUCTS = [
  { name: "Widget Pro", sku: "SKU-001", priceCents: 2999 },
  { name: "Gadget Plus", sku: "SKU-002", priceCents: 4999 },
  { name: "Tool Kit", sku: "SKU-003", priceCents: 8999 },
  { name: "Power Cable 2m", sku: "SKU-004", priceCents: 1299 },
  { name: "USB Hub 4-Port", sku: "SKU-005", priceCents: 2499 },
  { name: "Wireless Mouse", sku: "SKU-006", priceCents: 3499 },
  { name: "Mechanical Keyboard", sku: "SKU-007", priceCents: 12999 },
  { name: "Monitor Stand", sku: "SKU-008", priceCents: 5999 },
  { name: "Desk Lamp LED", sku: "SKU-009", priceCents: 4299 },
  { name: "Laptop Sleeve", sku: "SKU-010", priceCents: 1899 },
];

const CUSTOMERS = [
  { email: "alice@example.com", fullName: "Alice Smith", phone: "+1-555-0101" },
  { email: "bob@example.com", fullName: "Bob Jones", phone: "+1-555-0102" },
  { email: "carol@internal.company", fullName: "Carol Admin", phone: null },
  { email: "dave@example.com", fullName: "Dave Wilson", phone: "+1-555-0104" },
  { email: "eve@example.com", fullName: "Eve Brown", phone: "+1-555-0105" },
  { email: "frank@example.com", fullName: "Frank Lee", phone: "+1-555-0106" },
  { email: "grace@example.com", fullName: "Grace Kim", phone: "+1-555-0107" },
];

const APP_USERS = [
  { email: "support@demo.local", name: "Support Agent", role: "support" },
  { email: "admin@demo.local", name: "Admin User", role: "admin" },
  { email: "viewer1@demo.local", name: "Viewer One", role: "viewer" },
  { email: "viewer2@demo.local", name: "Viewer Two", role: "viewer" },
  { email: "ops@demo.local", name: "Ops Agent", role: "support" },
];

async function main() {
  // 10 products
  const products = await Promise.all(
    PRODUCTS.map((p) =>
      prisma.product.upsert({
        where: { sku: p.sku },
        update: {},
        create: p,
      })
    )
  );

  // Customers (PII – target of prompt injection / data leakage demo)
  const customers = await Promise.all(
    CUSTOMERS.map((c) =>
      prisma.customer.upsert({
        where: { email: c.email },
        update: {},
        create: c,
      })
    )
  );

  // Clear orders and items (no natural unique key for upsert)
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();

  // At least 5 orders (spread across customers, with multiple line items)
  const orderSpecs: { customerIndex: number; totalCents: number; status: string; items: { productIndex: number; qty: number }[] }[] = [
    { customerIndex: 0, totalCents: 7998, status: "paid", items: [{ productIndex: 0, qty: 2 }, { productIndex: 1, qty: 1 }] },
    { customerIndex: 1, totalCents: 2999, status: "shipped", items: [{ productIndex: 0, qty: 1 }] },
    { customerIndex: 2, totalCents: 14498, status: "paid", items: [{ productIndex: 2, qty: 1 }, { productIndex: 6, qty: 1 }] },
    { customerIndex: 3, totalCents: 5298, status: "pending", items: [{ productIndex: 3, qty: 2 }, { productIndex: 9, qty: 1 }] },
    { customerIndex: 4, totalCents: 16498, status: "shipped", items: [{ productIndex: 5, qty: 1 }, { productIndex: 7, qty: 2 }] },
    { customerIndex: 0, totalCents: 1899, status: "paid", items: [{ productIndex: 9, qty: 1 }] },
    { customerIndex: 5, totalCents: 24999, status: "paid", items: [{ productIndex: 7, qty: 1 }, { productIndex: 6, qty: 1 }] },
    { customerIndex: 6, totalCents: 4299, status: "pending", items: [{ productIndex: 8, qty: 1 }] },
  ];

  for (const spec of orderSpecs) {
    const customerId = customers[spec.customerIndex].id;
    const order = await prisma.order.create({
      data: {
        customerId,
        totalCents: spec.totalCents,
        status: spec.status,
      },
    });
    await prisma.orderItem.createMany({
      data: spec.items.map((item) => ({
        orderId: order.id,
        productId: products[item.productIndex].id,
        quantity: item.qty,
        unitPriceCents: products[item.productIndex].priceCents,
      })),
    });
  }

  // 5 app users (for context isolation / auth demo)
  for (const u of APP_USERS) {
    await prisma.user.upsert({
      where: { email: u.email },
      update: {},
      create: u,
    });
  }

  console.log(
    "Seed complete: %d products, %d customers, %d orders, %d app users.",
    products.length,
    customers.length,
    orderSpecs.length,
    APP_USERS.length
  );
}

main()
  .then(() => prisma.$disconnect())
  .catch((e) => {
    console.error(e);
    prisma.$disconnect();
    process.exit(1);
  });
