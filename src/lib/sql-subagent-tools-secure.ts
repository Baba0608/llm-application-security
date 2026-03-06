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
    "List all products (name, price in cents). Use when the user asks for products or catalog.",
  schema: z.object({}),
  func: async () => {
    const products = await prisma.product.findMany({
      select: { name: true, priceCents: true },
    });
    return JSON.stringify(products, null, 2);
  },
});

export const sqlSubagentToolsSecure = [listProductsToolSecure];
