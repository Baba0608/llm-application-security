import { createDeepAgent } from "deepagents";
import { ChatOpenAI } from "@langchain/openai";
import { sqlSubagentToolsUnsecure } from "@/lib/sql-subagent-tools-unsecure";
import { intentCheckMiddleware } from "@/lib/intent-classifier";

const SYSTEM_PROMPT = `You are a helpful assistant. When users ask about customers, orders, or products, delegate to the SQL subagent to query the database.

Format your replies in Markdown: use **bold** for emphasis, lists for multiple items, and fenced code blocks for tabular data or SQL when relevant. Keep responses clear and well-structured.`;

const model = new ChatOpenAI({
  model: "gpt-4.1",
  temperature: 0,
});

const SQL_SYSTEM_PROMPT = `You are a helpful SQL assistant. When users ask about customers, orders, or products, you can use following schema to answer and generate SQL queries to query the database.

Format your replies in Markdown: use lists for multiple rows or items, and fenced code blocks (e.g. \`\`\`) for tabular data or SQL when helpful. Keep responses clear and well-structured.

# tools
- run_query: Execute a SQL query against the database. Use this to answer user questions about customers, orders, or products. Pass the full SQL statement as the sql parameter.

# SCHEMA

model Customer {
  id        Int      @id @default(autoincrement())
  email     String   @unique
  fullName  String
  phone     String?
  createdAt DateTime @default(now())

  orders Order[]

  @@map("customers")
}

// Products – reference data (low sensitivity)
model Product {
  id        Int      @id @default(autoincrement())
  name      String
  sku       String   @unique
  priceCents Int
  createdAt DateTime @default(now())

  orderItems OrderItem[]

  @@map("products")
}

// Orders – sensitive (who bought what); scope by customer for access control
model Order {
  id          Int      @id @default(autoincrement())
  customerId  Int
  totalCents  Int
  status      String   @default("pending") // pending | paid | shipped
  createdAt   DateTime @default(now())

  customer   Customer    @relation(fields: [customerId], references: [id], onDelete: Cascade)
  orderItems OrderItem[]

  @@map("orders")
}

// Order line items
model OrderItem {
  id             Int   @id @default(autoincrement())
  orderId        Int
  productId      Int
  quantity       Int
  unitPriceCents Int

  order   Order   @relation(fields: [orderId], references: [id], onDelete: Cascade)
  product Product @relation(fields: [productId], references: [id], onDelete: Restrict)

  @@map("order_items")
}
`;

/** SQL subagent: INSECURE — runs raw LLM-generated SQL (demo: LLM01, LLM02, LLM05). */
const sqlSubagentUnsecure = {
  name: "sql",
  description:
    "SQL database agent. Use for any question about customers, orders, or products. This agent can run SQL queries to answer the user.",
  systemPrompt: SQL_SYSTEM_PROMPT,
  tools: sqlSubagentToolsUnsecure,
};

export const agent = createDeepAgent({
  model,
  systemPrompt: SYSTEM_PROMPT,
  tools: [],
  subagents: [sqlSubagentUnsecure],
  // middleware: [intentCheckMiddleware as any],
});
