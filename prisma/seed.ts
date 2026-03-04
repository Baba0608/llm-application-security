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

async function main() {
  // Products (reference data)
  const products = await Promise.all([
    prisma.product.upsert({
      where: { sku: "SKU-001" },
      update: {},
      create: { name: "Widget Pro", sku: "SKU-001", priceCents: 2999 },
    }),
    prisma.product.upsert({
      where: { sku: "SKU-002" },
      update: {},
      create: { name: "Gadget Plus", sku: "SKU-002", priceCents: 4999 },
    }),
    prisma.product.upsert({
      where: { sku: "SKU-003" },
      update: {},
      create: { name: "Tool Kit", sku: "SKU-003", priceCents: 8999 },
    }),
  ]);

  // Customers (PII – what prompt injection might try to extract)
  const alice = await prisma.customer.upsert({
    where: { email: "alice@example.com" },
    update: {},
    create: {
      email: "alice@example.com",
      fullName: "Alice Smith",
      phone: "+1-555-0101",
    },
  });
  const bob = await prisma.customer.upsert({
    where: { email: "bob@example.com" },
    update: {},
    create: {
      email: "bob@example.com",
      fullName: "Bob Jones",
      phone: "+1-555-0102",
    },
  });
  await prisma.customer.upsert({
    where: { email: "carol@internal.company" },
    update: {},
    create: {
      email: "carol@internal.company",
      fullName: "Carol Admin",
      phone: null,
    },
  });

  // Orders – clear and recreate (no natural unique key for upsert)
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();

  const order1 = await prisma.order.create({
    data: {
      customerId: alice.id,
      totalCents: 7998,
      status: "paid",
    },
  });
  const order2 = await prisma.order.create({
    data: {
      customerId: bob.id,
      totalCents: 2999,
      status: "shipped",
    },
  });

  await prisma.orderItem.createMany({
    data: [
      { orderId: order1.id, productId: products[0].id, quantity: 2, unitPriceCents: 2999 },
      { orderId: order1.id, productId: products[1].id, quantity: 1, unitPriceCents: 4999 },
      { orderId: order2.id, productId: products[0].id, quantity: 1, unitPriceCents: 2999 },
    ],
  });

  // App user (for context isolation demo)
  await prisma.user.upsert({
    where: { email: "support@demo.local" },
    update: {},
    create: {
      email: "support@demo.local",
      name: "Support Agent",
      role: "support",
    },
  });

  console.log("Seed complete: products, customers (PII), orders, order items, user.");
}

main()
  .then(() => prisma.$disconnect())
  .catch((e) => {
    console.error(e);
    prisma.$disconnect();
    process.exit(1);
  });
