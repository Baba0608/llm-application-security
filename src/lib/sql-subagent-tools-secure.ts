/**
 * SECURE SQL tools for LLM security demo.
 *
 * Aligns with OWASP LLM best practices (https://www.stackhawk.com/blog/llm-security/):
 * - No raw SQL from the LLM: only predefined, parameterized operations
 * - Output validation: we control the query shape; Prisma uses parameterized queries
 * - Minimal data exposure: tools return only what each operation is designed to return
 *
 * The LLM can only invoke allowlisted actions (list products, get orders for a customer ID).
 */
import { DynamicStructuredTool } from "@langchain/core/tools";
import { z } from "zod";
import { prisma } from "@/lib/db";

export const listProductsToolSecure = new DynamicStructuredTool({
  name: "list_products",
  description:
    "List all products (id, name, sku, price in cents). Use when the user asks for products or catalog.",
  schema: z.object({}),
  func: async () => {
    const products = await prisma.product.findMany({
      select: { id: true, name: true, sku: true, priceCents: true },
    });
    return JSON.stringify(products, null, 2);
  },
});

export const getOrdersForCustomerToolSecure = new DynamicStructuredTool({
  name: "get_orders_for_customer",
  description:
    "Get orders for a customer by their numeric customer ID. Use when the user asks for orders for a specific customer. You must have the customer id (integer) to call this.",
  schema: z.object({
    customerId: z.number().int().positive().describe("The customer's numeric ID"),
  }),
  func: async ({ customerId }) => {
    const orders = await prisma.order.findMany({
      where: { customerId },
      select: {
        id: true,
        totalCents: true,
        status: true,
        createdAt: true,
        customer: { select: { fullName: true, email: true } },
      },
    });
    return JSON.stringify(orders, null, 2);
  },
});

export const getOrderDetailsToolSecure = new DynamicStructuredTool({
  name: "get_order_details",
  description:
    "Get line items and product info for an order by order ID. Use when the user asks for details of a specific order.",
  schema: z.object({
    orderId: z.number().int().positive().describe("The order's numeric ID"),
  }),
  func: async ({ orderId }) => {
    const order = await prisma.order.findFirst({
      where: { id: orderId },
      select: {
        id: true,
        totalCents: true,
        status: true,
        orderItems: {
          select: {
            quantity: true,
            unitPriceCents: true,
            product: { select: { name: true, sku: true } },
          },
        },
      },
    });
    if (!order) return JSON.stringify({ error: "Order not found" });
    return JSON.stringify(order, null, 2);
  },
});

export const sqlSubagentToolsSecure = [
  listProductsToolSecure,
  getOrdersForCustomerToolSecure,
  getOrderDetailsToolSecure,
];
