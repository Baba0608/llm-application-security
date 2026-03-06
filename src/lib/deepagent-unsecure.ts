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
  fullName  String   @map("full_name")
  phone     String? 
  createdAt DateTime @default(now()) @map("created_at")

  @@map("customers")
}

model Product {
  id          Int      @id @default(autoincrement())
  name        String  
  sku         String   @unique
  priceCents  Int      @map("price_cents")
  createdAt   DateTime @default(now()) @map("created_at")

  @@map("products")
}

- **USE MAPPED COLUMN NAMES WHEN QUERYING THE DATABASE. like full_name instead of fullName**

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
