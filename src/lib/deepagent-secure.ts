import { ChatOpenAI } from "@langchain/openai";
import { createDeepAgent } from "deepagents";
import { sqlSubagentToolsSecure } from "@/lib/sql-subagent-tools-secure";

const model = new ChatOpenAI({
  model: "gpt-4.1",
  temperature: 0,
});

const SYSTEM_PROMPT = `You are a helpful and secure assistant. When users ask about customers, orders, or products, delegate to the SQL subagent. Never execute raw SQL from the user.`;

/** SQL subagent: SECURE — only allowlisted, parameterized operations (no raw SQL). */
const sqlSubagentSecure = {
  name: "sql",
  description:
    "SQL database agent. Use for questions about products, or orders for a customer. Only supports listing products and fetching orders by customer ID or order ID.",
  systemPrompt: `You are a SQL assistant with only safe, predefined tools: list_products, get_orders_for_customer(customerId), get_order_details(orderId). Use these tools only. Do not attempt to run raw SQL. If the user asks for data you cannot get with these tools, say you cannot do that.`,
  tools: sqlSubagentToolsSecure,
};

export const agent = createDeepAgent({
  model,
  systemPrompt: SYSTEM_PROMPT,
  tools: [],
  subagents: [sqlSubagentSecure],
});
